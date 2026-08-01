// An agent's pre-trade scan.
//
//   node src/agent-scan.js
//
// This is the demo that actually argues for a unified API, and it is worth
// being precise about why.
//
// `balanceOf` is the wrong benchmark. When you already know the chain, the
// contract, the wallet and the decimals, a raw RPC call is the shortest path to
// the answer by definition — no abstraction beats asking the node. Our own
// numbers say so: by-hand runs in ~140ms and gets 5/5 chains right.
//
// An agent is not in that position. It does not know what it holds, what
// anything is worth, or where the edge is. It has to *discover* all three, and
// two of those questions have no RPC method at all:
//
//     eth_getTokenBalances        -> does not exist
//     "what is this worth in USD" -> not on-chain in readable form
//     Hyperliquid funding/premium -> not on an EVM chain you can eth_call
//
// So the agent needs to join on-chain position data against exchange state.
// Those are two different worlds, and the value of the aggregator is that they
// arrive through one key and one schema. That is a structural argument, not a
// convenience one.

import { loadEnv } from './lib/env.js';

loadEnv();

const { AGGREGATED_CHAINS, CHAINS, DEMO_WALLET } = await import('./config.js');
const { getUsdcBalances } = await import('./aggregated.js');

const BASE_URL = process.env.UNIBLOCK_URL || 'https://api.uniblock.dev/uni/v1';
const HL_CHAIN = 999; // Hyperliquid mainnet, per Uniblock's enum

/** Hyperliquid's info endpoint is a POST with a typed body. */
async function hyperliquid(body) {
  const res = await fetch(`${BASE_URL}/hyperliquid/info?chainId=${HL_CHAIN}`, {
    method: 'POST',
    headers: { 'X-API-KEY': process.env.UNIBLOCK_KEY, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Hyperliquid ${body.type}: HTTP ${res.status}`);
  return res.json();
}

/** Polymarket via Uniblock's direct passthrough — same key, unnormalized shape. */
async function polymarket(path) {
  const res = await fetch(`https://api.uniblock.dev/direct/v1/Polymarket${path}`, {
    headers: { 'x-api-key': process.env.UNIBLOCK_KEY, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Polymarket: HTTP ${res.status}`);
  return res.json();
}

/**
 * Funding on Hyperliquid pays hourly. Annualising it is what turns a number
 * nobody can read into a number an agent can rank on.
 *
 * A positive rate means longs pay shorts, so the carry trade is short-perp
 * against long-spot. Negative flips it. `premium` is the perp's deviation from
 * the index — the tick premium or discount itself.
 */
const HOURS_PER_YEAR = 24 * 365;
const annualise = (hourlyRate) => Number(hourlyRate) * HOURS_PER_YEAR * 100;

async function carryTable(coins) {
  const since = Date.now() - 3 * 60 * 60 * 1000;

  const rows = await Promise.all(
    coins.map(async (coin) => {
      try {
        const hist = await hyperliquid({ type: 'fundingHistory', coin, startTime: since });
        const last = Array.isArray(hist) && hist.length ? hist[hist.length - 1] : null;
        if (!last) return null;
        return {
          coin,
          funding: Number(last.fundingRate),
          apr: annualise(last.fundingRate),
          premium: Number(last.premium) * 100,
        };
      } catch {
        return null;
      }
    }),
  );

  return rows.filter(Boolean).sort((a, b) => Math.abs(b.apr) - Math.abs(a.apr));
}

async function main() {
  if (!process.env.UNIBLOCK_KEY) {
    console.error('\n  Needs UNIBLOCK_KEY in .env — this demo is entirely off-chain data.\n');
    process.exit(1);
  }

  const wallet = DEMO_WALLET;
  console.log('\n  AGENT PRE-TRADE SCAN');
  console.log(`  ${wallet}\n`);

  // ─── 1. What do I have, and where? ────────────────────────────────────────
  console.log('  1. Where is my capital?');
  const positions = await getUsdcBalances(wallet, AGGREGATED_CHAINS);
  let total = 0;
  for (const p of positions) {
    if (p.error || p.balance === null || p.balance === undefined) {
      console.log(`       ${CHAINS[p.key].label.padEnd(16)} unavailable`);
      continue;
    }
    total += Number(p.balance);
    console.log(`       ${CHAINS[p.key].label.padEnd(16)} ${Number(p.balance).toLocaleString('en-US').padStart(12)} USDC`);
  }
  console.log(`       ${'—'.repeat(16)} ${total.toLocaleString('en-US').padStart(12)} USDC deployable\n`);

  // ─── 2. Where is the edge? ────────────────────────────────────────────────
  console.log('  2. Where is the carry?   (Hyperliquid perps — funding and tick premium)');
  const mids = await hyperliquid({ type: 'allMids' });
  const meta = await hyperliquid({ type: 'meta' });
  const universe = (meta.universe || []).map((u) => u.name).slice(0, 24);

  const carry = await carryTable(universe);
  console.log(`       ${'market'.padEnd(8)}${'mid'.padStart(12)}${'funding/1h'.padStart(14)}${'annualised'.padStart(13)}${'premium'.padStart(11)}`);
  for (const r of carry.slice(0, 6)) {
    const mid = mids[r.coin] ? Number(mids[r.coin]).toLocaleString('en-US') : '—';
    const side = r.apr >= 0 ? 'longs pay' : 'shorts pay';
    console.log(
      `       ${r.coin.padEnd(8)}${mid.padStart(12)}${r.funding.toExponential(2).padStart(14)}` +
      `${(r.apr.toFixed(2) + '%').padStart(13)}${(r.premium.toFixed(4) + '%').padStart(11)}   ${side}`,
    );
  }

  // ─── 3. The other venue ───────────────────────────────────────────────────
  //
  // Polymarket comes through Uniblock's direct-provider passthrough rather than
  // the unified schema — same key and same bill, but the response is
  // Polymarket's own shape, not a normalized one. Worth being precise about
  // that distinction rather than implying everything is unified.
  //
  // Note what this endpoint can and cannot tell you. `outcomePrices` are
  // normalized to sum to 1.00 by construction, so computing "spread" from them
  // returns 0.00% for every market — a column that looks like data and is
  // actually an artifact. Real bid/ask spread needs the CLOB order book. What
  // gamma does give you honestly is the implied probability and the depth
  // behind it, which is what decides whether a signal is tradeable at size.
  console.log('\n  3. What is the crowd pricing?   (Polymarket — implied probability and depth)');
  // The `order` param is not honoured by this passthrough — asking for
  // liquidity-descending returned untraded $100 sports books at a default 50%.
  // Filter server-side on a liquidity floor, then rank client-side, and never
  // trust a sort you have not verified.
  const pm = await polymarket(
    '/gamma/markets?limit=100&active=true&closed=false&liquidity_num_min=50000',
  );

  const books = (Array.isArray(pm) ? pm : [])
    .map((m) => {
      let prices;
      try { prices = JSON.parse(m.outcomePrices || '[]').map(Number); } catch { return null; }
      if (prices.length !== 2 || !prices.every(Number.isFinite)) return null;
      return {
        q: String(m.question || '').slice(0, 46),
        yes: prices[0],
        liq: Number(m.liquidity || 0),
        vol: Number(m.volume || 0),
      };
    })
    .filter(Boolean)
    .filter((b) => b.liq >= 50_000 && b.yes > 0.01 && b.yes < 0.99)
    .sort((a, b) => b.liq - a.liq)
    .slice(0, 5);

  if (books.length) {
    console.log(`       ${'market'.padEnd(48)}${'implied'.padStart(9)}${'liquidity'.padStart(13)}`);
    for (const b of books) {
      console.log(
        `       ${b.q.padEnd(48)}${(b.yes * 100).toFixed(1).padStart(8)}%` +
        `${('$' + Math.round(b.liq).toLocaleString('en-US')).padStart(13)}`,
      );
    }
    console.log('       (bid/ask spread needs the CLOB book — gamma normalizes prices to 1.00)');
  } else {
    console.log('       no binary markets returned');
  }

  // ─── 4. What would an agent do with that? ─────────────────────────────────
  const best = carry[0];
  console.log('\n  4. Decision');
  if (!best) {
    console.log('       no funding data returned — stand down\n');
    return;
  }

  const richest = positions
    .filter((p) => !p.error && p.balance !== null && Number(p.balance) > 0)
    .sort((a, b) => Number(b.balance) - Number(a.balance))[0];

  const direction = best.apr >= 0 ? 'short the perp, long spot' : 'long the perp, short spot';
  console.log(`       richest carry   ${best.coin} at ${best.apr.toFixed(2)}% annualised`);
  console.log(`       tick premium    ${best.premium.toFixed(4)}%  (perp vs index)`);
  console.log(`       implied trade   ${direction}`);
  console.log(`       capital sits on ${richest ? CHAINS[richest.key].label : 'nowhere reachable'}`);
  console.log(`       collateral for Hyperliquid must be bridged from there\n`);

  console.log('  Every number above except the balances is impossible to get from an RPC node.');
  console.log('  Not slow — impossible. That is the argument for a unified API, and it is not');
  console.log('  the argument a balanceOf demo makes.\n');
}

main().catch((err) => {
  console.error('\n  failed:', err.message, '\n');
  process.exit(1);
});
