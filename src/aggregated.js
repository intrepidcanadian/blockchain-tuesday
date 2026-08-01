// The aggregated path — the same five chains through one endpoint.
//
//   node src/aggregated.js
//
// Request shape below matches Uniblock's published API reference for
// `GET /token/balance`. If a response comes back shaped differently, the fix is
// contained to `callUniblock` and `getUsdcBalances` — nothing else moves.
//
// One honest note, because the talk depends on being straight about this:
// `chainId` is singular, so this is one request per chain, not one request for
// all five. What the aggregator collapses is the *maintenance*, not the request
// count — see the comment on getUsdcBalances below.

import { loadEnv } from './lib/env.js';
import { withRetry, permanent, formatUnits } from './lib/rpc.js';

loadEnv(); // before config.js is read, so WALLET from .env is picked up

const { AGGREGATED_CHAINS, CHAIN_IDS, USDC, DEMO_WALLET } = await import('./config.js');

const BASE_URL = process.env.UNIBLOCK_URL || 'https://api.uniblock.dev/uni/v1';

/**
 * Fail fast on a missing key.
 *
 * Checked once, before the fan-out. Left inside callUniblock it surfaced as
 * five identical per-chain errors after fifteen pointless retries, which reads
 * like a network problem rather than "you forgot the key."
 */
function requireKey() {
  const key = process.env.UNIBLOCK_KEY;
  if (!key) {
    throw new Error(
      'No UNIBLOCK_KEY set. Copy .env.example to .env and add your key, ' +
      'or run `node src/by-hand.js` which needs no key at all.',
    );
  }
  return key;
}

/** The single adapter. Everything provider-specific lives in this function. */
async function callUniblock(path, params) {
  const key = requireKey();

  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url, { headers: { 'X-API-KEY': key } });

  if (!res.ok) {
    const body = await res.text();

    // 503 "no providers were available" is not a bug in this repo and not a
    // bad key — it means the Uniblock project has no data providers enabled,
    // so there is nothing for the router to route to. Fresh accounts hit this,
    // which makes it the single most likely thing to derail a workshop.
    if (res.status === 503 && /no providers/i.test(body)) {
      throw permanent(new Error(
        'Uniblock has no data providers enabled for this project, so the ' +
        'router had nothing to call.\n' +
        '           Your key is valid — this is account configuration, not code.\n' +
        '           Fix: dashboard.uniblock.dev → your project → connect at least one\n' +
        '           provider (Alchemy, Ankr, Moralis, GoldRush…) for each chain you want.\n' +
        '           Meanwhile `node src/by-hand.js` needs no key and always works.',
      ));
    }

    if (res.status === 401) {
      throw permanent(new Error('Uniblock rejected the key (401). Check UNIBLOCK_KEY in .env.'));
    }

    if (res.status === 429) {
      // Retryable, but only with a real pause — the default 250ms backoff is
      // far too eager for a rate limiter and just burns the next attempt.
      const err = new Error('Uniblock rate limit (429).');
      err.backoffMs = 2000;
      throw err;
    }

    throw new Error(`Uniblock HTTP ${res.status} on ${path}: ${body.slice(0, 300)}`);
  }

  const json = await res.json();

  // A 200 is not a success here.
  //
  // When an upstream provider refuses — say Etherscan's free tier not covering
  // Base or Optimism — the router still answers 200 and puts the failure in the
  // body. Code that trusts `res.ok` reads `undefined` for the balance and
  // reports it as zero. That is the worst possible failure mode: no throw, no
  // log, a confident wrong number.
  if (json && json.error) {
    const e = json.error;
    const detail = e.data?.result || e.data?.message || e.message || JSON.stringify(e).slice(0, 200);
    throw permanent(new Error(
      `Provider ${e.service || 'unknown'} refused this chain (HTTP 200 with an error body): ${detail}`,
    ));
  }

  return json;
}

/**
 * USDC balance per chain, through the unified endpoint.
 *
 * Compare against src/by-hand.js. What is genuinely gone:
 *
 *   · no per-chain RPC URLs, keys, bills or rate limits — one key, one host
 *   · no ABI encoding, no selectors, no hex decoding
 *   · no hand-rolled retry policy against provider flakiness
 *   · one response schema instead of one per provider
 *
 * What is NOT gone, and the earlier version of this comment wrongly claimed
 * was: the token address table and the decimals table. The direct route needs
 * you to pass `contractAddress` and hands back a raw integer, so both tables
 * stay. The list route does normalize them away — but only if you page through
 * every dust token in the wallet first, which on real addresses is hundreds.
 *
 * So the saving is real but narrower than "no tables you maintain". It is:
 * five provider relationships and a pile of encoding/retry code collapse into
 * one key and one schema. Adding chain #11 is a line in CHAIN_IDS plus a token
 * entry — rather than a client, an endpoint, a key, a bill and a retry path.
 */
export async function getUsdcBalances(wallet, chains = AGGREGATED_CHAINS) {
  requireKey(); // once, up front — not once per chain after retrying each

  const results = await Promise.allSettled(chains.map((key) => readUsdc(key, wallet)));

  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? { key: chains[i], ...r.value }
      : { key: chains[i], error: r.reason.message },
  );
}

/**
 * Ask for the one token we actually want, and fall back to scanning if the
 * provider behind that route will not serve this chain.
 *
 * `/scan/token-balance` takes a contractAddress and returns just that token —
 * the right shape for this question. `/token/balance` lists the whole wallet
 * and has to be paged through, which on any real address means hundreds of dust
 * tokens before the one you asked for. No wallet we tested resolved USDC on
 * page one across all five chains.
 *
 * The honest trade, worth saying out loud in the talk: the direct route hands
 * back a RAW integer, so you supply the contract address AND the decimals
 * yourself. The list route normalizes both for you but makes you page. Either
 * way you are not writing ABI encoding, managing five RPC keys, or owning a
 * retry policy — that is the real saving, and it is narrower than "no tables."
 */
async function readUsdc(chainKey, wallet) {
  const token = USDC[chainKey];

  try {
    const res = await withRetry(() =>
      callUniblock('/scan/token-balance', {
        chainId: CHAIN_IDS[chainKey],
        address: wallet,
        contractAddress: token.address,
      }),
    );

    // Raw integer despite the docs example showing a decimal string — verified
    // against on-chain truth: 50810846175 / 10^6 == 50810.846 on Ethereum.
    if (res && res.balance !== undefined) {
      return { balance: formatUnits(BigInt(res.balance), token.decimals), via: 'direct' };
    }
    throw new Error('no balance field in response');
  } catch (err) {
    if (!/refused this chain/i.test(err.message)) throw err;

    // That provider will not serve this chain. Try the list route, which is
    // backed by a different provider set.
    const found = await findToken(chainKey, wallet, token.address.toLowerCase(), 4);
    if (found.hit) {
      return {
        balance: String(found.formattedBalance ?? found.hit.formattedBalance),
        via: `list, ${found.pages}p`,
      };
    }
    // "Not found" and "not verifiable" are different answers and must not be
    // printed the same way. A complete list with no USDC row means the balance
    // really is zero. A truncated list means we simply could not see far
    // enough — reporting that as zero would be a confident lie.
    return found.truncated
      ? { balance: null, unverified: true, via: `provider gap — list truncated at ${found.scanned} tokens` }
      : { balance: '0', via: `list, ${found.scanned} tokens, USDC absent` };
  }
}

/**
 * Walk a chain's token list until the exact contract turns up.
 *
 * Two things this has to get right, both learned the hard way against the live
 * API:
 *
 * 1. **Follow the cursor.** The first page is not the whole wallet. Ethereum,
 *    Base and Polygon all returned ~70-90 rows plus a cursor, and USDC was not
 *    on page one for any of them — so a single-page read reported "no USDC" for
 *    a wallet holding fifty thousand of it. Silent, plausible, wrong.
 *
 * 2. **Match the address, never the symbol.** On Optimism a symbol match found
 *    a token labelled USDC holding 20.807553 — while the canonical USDC balance
 *    is zero. It had matched the bridged variant. A symbol is a label anyone can
 *    write; the contract address is the identity. If the canonical address is
 *    not in the list, the honest answer is "not found", never a lookalike.
 *
 * Which is the fragmentation problem from earlier in the talk, showing up
 * inside the tooling that was supposed to abstract it away.
 */
async function findToken(chainKey, wallet, wantAddress, maxPages = 12) {
  let cursor;
  let pages = 0;
  let scanned = 0;

  do {
    const res = await withRetry(() =>
      callUniblock('/token/balance', {
        chainId: CHAIN_IDS[chainKey],
        walletAddress: wallet,
        includeMetadata: true,
        ...(cursor ? { cursor } : {}),
      }),
    );

    const rows = res.balances ?? [];
    scanned += rows.length;
    pages += 1;

    const hit = rows.find((b) => (b.contractAddress || '').toLowerCase() === wantAddress);
    if (hit) return { hit, scanned, pages };

    cursor = res.cursor;
  } while (cursor && pages < maxPages);

  // Say so rather than implying a confident zero.
  return { hit: null, scanned, pages, truncated: Boolean(cursor) };
}

async function main() {
  const wallet = DEMO_WALLET;
  console.log(`\n  USDC balances for ${wallet}`);
  console.log('  read through the unified endpoint\n');

  const t0 = Date.now();
  const rows = await getUsdcBalances(wallet);
  const ms = Date.now() - t0;

  // When every chain fails the same way, the cause is one thing, not five.
  // Print it once and in full — truncating it per row is how the actionable
  // part of the message gets lost.
  const errs = rows.filter((r) => r.error);
  const shared = errs.length === rows.length && new Set(errs.map((e) => e.error)).size === 1;

  if (shared) {
    console.log(`    all ${rows.length} chains failed identically:\n`);
    console.log(`    ${errs[0].error}\n`);
  } else {
    for (const r of rows) {
      if (r.error) {
        console.log(`    ${r.key.padEnd(12)} !  ${r.error.split('\n')[0]}`);
        continue;
      }
      const val = r.balance !== null && r.balance !== undefined
        ? `${Number(r.balance).toLocaleString('en-US')} USDC`
        : 'UNVERIFIED';
      console.log(`    ${r.key.padEnd(12)} ${val.padEnd(22)} [${r.via}]`);
    }
  }

  const ok = rows.length - errs.length;
  console.log(`  ${ok}/${rows.length} chains in ${ms}ms`);
  if (ok) console.log('  1 key · 1 host · 1 schema · no ABI encoding, no retry policy of your own');
  console.log();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('\n  failed:', err.message, '\n');
    process.exit(1);
  });
}
