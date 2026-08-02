// Cross-venue agent: does the prediction market agree with the derivatives market?
//
//   node src/cross-venue.js
//
// This is the sharpest illustration of why an agent wants one key across many
// venues. Polymarket will tell you the crowd's probability that BTC reaches a
// strike. Hyperliquid will tell you what BTC is doing and how volatile it has
// been. Neither venue can tell you whether those two views are consistent —
// that calculation only exists once something holds both at the same time.
//
// It is also a fair test of the aggregator, because the two sources arrive by
// different routes: Hyperliquid through the unified schema, Polymarket through
// the direct-provider passthrough. One key, one bill, two very different shapes.
//
// NOT TRADING ADVICE. This prints a disagreement between two markets. A
// disagreement is not an edge — it is a question. Vol surfaces are not
// lognormal, realised vol is a backward-looking estimate of a forward-looking
// quantity, and prediction markets carry well-documented premiums on
// lottery-shaped payoffs. Treat the output as a research prompt, nothing more.

import { loadEnv } from './lib/env.js';

loadEnv();

const KEY = () => process.env.UNIBLOCK_KEY;
const UNI = 'https://api.uniblock.dev/uni/v1';
const DIRECT = 'https://api.uniblock.dev/direct/v1';

async function hyperliquid(body) {
  const res = await fetch(`${UNI}/hyperliquid/info?chainId=999`, {
    method: 'POST',
    headers: { 'X-API-KEY': KEY(), 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Hyperliquid ${body.type}: HTTP ${res.status}`);
  return res.json();
}

async function polymarket(path) {
  const res = await fetch(`${DIRECT}/Polymarket${path}`, {
    headers: { 'x-api-key': KEY(), accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Polymarket: HTTP ${res.status}`);
  return res.json();
}

// ── maths ──────────────────────────────────────────────────────────────────

/** Standard normal CDF (Abramowitz & Stegun 7.1.26 via erf). */
function normCdf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-(x * x) / 2);
  return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

/**
 * P(S_T >= K) under driftless geometric Brownian motion.
 * d2 = [ln(S/K) - sigma^2 T / 2] / (sigma sqrt(T))
 */
function probAbove(S, K, sigma, T) {
  if (sigma <= 0 || T <= 0) return S >= K ? 1 : 0;
  const d2 = (Math.log(S / K) - (sigma * sigma * T) / 2) / (sigma * Math.sqrt(T));
  return normCdf(d2);
}

/**
 * Invert the above: what volatility would make the market's probability correct?
 *
 * Bisection rather than a closed form. The relationship is not monotonic across
 * the whole domain — past a point, more vol drags the median down faster than it
 * fattens the tail — so we search the low branch, which is the economically
 * meaningful one.
 */
function impliedVol(S, K, target, T, lo = 0.01, hi = 3.0) {
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (probAbove(S, K, mid, T) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Annualised realised vol from daily closes. */
function realisedVol(closes) {
  const r = closes.slice(1).map((p, i) => Math.log(p / closes[i]));
  const mean = r.reduce((a, b) => a + b, 0) / r.length;
  const varr = r.reduce((a, b) => a + (b - mean) ** 2, 0) / (r.length - 1);
  return Math.sqrt(varr) * Math.sqrt(365);
}

// ── the join ───────────────────────────────────────────────────────────────

/** Pull out "$150k" / "$150,000" / "150k" from a market question. */
function strikeFrom(question) {
  const m = question.match(/\$?\s?([\d,]+(?:\.\d+)?)\s?([km])?\b/i);
  if (!m) return null;
  let n = Number(m[1].replace(/,/g, ''));
  if (/k/i.test(m[2] || '')) n *= 1e3;
  if (/m/i.test(m[2] || '')) n *= 1e6;
  return n > 1000 ? n : null;
}

const COINS = [
  { sym: 'BTC', re: /\bbitcoin|btc\b/i },
  { sym: 'ETH', re: /\bethereum|eth\b/i },
  { sym: 'SOL', re: /\bsolana|sol\b/i },
];

async function main() {
  if (!KEY()) {
    console.error('\n  Needs UNIBLOCK_KEY in .env.\n');
    process.exit(1);
  }

  console.log('\n  CROSS-VENUE CHECK');
  console.log('  Polymarket says the odds. Hyperliquid says the price and the vol.');
  console.log('  Only something holding both can ask whether they agree.\n');

  // 1. every liquid Polymarket question that names a crypto and a level
  // Sequential, and failures are printed rather than swallowed.
  //
  // The first version did `.catch(() => [])` around six parallel calls, and the
  // path was wrong — so every page 404'd and the script cheerfully reported
  // "no markets exist". A silent catch turned a typo into a finding. Print what
  // actually failed; a wrong path and an empty market are not the same answer.
  const byId = new Map();
  let failures = 0;
  for (const off of [0, 100, 200, 300, 400, 500]) {
    try {
      const page = await polymarket(
        `/gamma/markets?limit=100&offset=${off}&active=true&closed=false&liquidity_num_min=5000`,
      );
      for (const m of Array.isArray(page) ? page : []) if (m && m.question) byId.set(m.id, m);
    } catch (err) {
      failures += 1;
      console.log(`     (page ${off} failed: ${err.message})`);
    }
  }
  const markets = [...byId.values()];
  console.log(`  scanned ${markets.length} liquid Polymarket questions${failures ? ` (${failures} pages failed)` : ''}\n`);

  const candidates = [];
  for (const m of markets) {
    const coin = COINS.find((c) => c.re.test(m.question));
    if (!coin) continue;
    if (!/\$|reach|hit|above|below|price/i.test(m.question)) continue;
    const K = strikeFrom(m.question);
    if (!K) continue;
    let prices;
    try { prices = JSON.parse(m.outcomePrices || '[]').map(Number); } catch { continue; }
    if (prices.length !== 2 || !Number.isFinite(prices[0])) continue;
    if (prices[0] <= 0.001 || prices[0] >= 0.999) continue;
    const end = new Date(m.endDate);
    const T = (end - Date.now()) / (365 * 24 * 3600 * 1000);
    if (!(T > 0.01)) continue;
    candidates.push({ q: m.question, coin: coin.sym, K, p: prices[0], T, liq: Number(m.liquidity || 0), end: m.endDate });
  }

  if (!candidates.length) {
    console.log('  No liquid Polymarket market currently names a crypto and a price level.');
    console.log(`  (${markets.length} scanned, ${failures} pages failed — a non-zero second`);
    console.log('   number means this is a request problem, not an absent market.)\n');
    return;
  }

  candidates.sort((a, b) => b.liq - a.liq);
  const mids = await hyperliquid({ type: 'allMids' });

  for (const c of candidates.slice(0, 4)) {
    const spot = Number(mids[c.coin]);
    if (!Number.isFinite(spot)) continue;

    const end = Date.now();
    const candles = await hyperliquid({
      type: 'candleSnapshot',
      req: { coin: c.coin, interval: '1d', startTime: end - 120 * 24 * 3600 * 1000, endTime: end },
    });
    const closes = (Array.isArray(candles) ? candles : []).map((x) => Number(x.c)).filter(Number.isFinite);
    if (closes.length < 30) continue;

    const rv = realisedVol(closes);
    const iv = impliedVol(spot, c.K, c.p, c.T);
    const move = (c.K / spot - 1) * 100;
    const days = Math.round(c.T * 365);

    console.log(`  ${c.q}`);
    console.log(`     Polymarket   ${(c.p * 100).toFixed(1)}% implied   ·  $${Math.round(c.liq).toLocaleString('en-US')} liquidity  ·  ${days}d to resolve`);
    console.log(`     Hyperliquid  ${c.coin} at $${spot.toLocaleString('en-US')}  ·  needs ${move > 0 ? '+' : ''}${move.toFixed(0)}%  ·  realised vol ${(rv * 100).toFixed(0)}%`);
    console.log(`     ------------------------------------------------------------`);
    console.log(`     For ${(c.p * 100).toFixed(1)}% to be right, forward vol must be ~${(iv * 100).toFixed(0)}%.`);
    console.log(`     BTC has actually realised ${(rv * 100).toFixed(0)}% over 120 days.`);

    const ratio = iv / rv;
    const verdict =
      ratio > 1.35 ? 'the crowd is pricing far MORE volatility than has been realised'
      : ratio < 0.74 ? 'the crowd is pricing far LESS volatility than has been realised'
      : 'the two venues are roughly consistent';
    console.log(`     ${verdict} (${ratio.toFixed(2)}x)\n`);
  }

  console.log('  Neither venue can produce that last line. Polymarket does not know the');
  console.log('  price history; Hyperliquid does not know the crowd\'s odds. The agent is');
  console.log('  the only thing holding both — and it got them from one key.\n');
  console.log('  Not advice. A disagreement between two markets is a question, not an edge:');
  console.log('  realised vol looks backward, lognormal is a poor model of crypto tails, and');
  console.log('  prediction markets carry a known premium on lottery-shaped payoffs.\n');
}

main().catch((err) => {
  console.error('\n  failed:', err.message, '\n');
  process.exit(1);
});
