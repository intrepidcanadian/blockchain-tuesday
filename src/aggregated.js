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
import { withRetry } from './lib/rpc.js';

loadEnv(); // before config.js is read, so WALLET from .env is picked up

const { AGGREGATED_CHAINS, CHAIN_IDS, DEMO_WALLET } = await import('./config.js');

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
    throw new Error(`Uniblock HTTP ${res.status} on ${path}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

/**
 * USDC balance per chain, through the unified endpoint.
 *
 * Compare against src/by-hand.js. This still loops over chains — but look at
 * what is NOT here:
 *
 *   · no per-chain RPC URLs, keys, bills or rate limits
 *   · no token address table
 *   · no decimals table  (the response carries `decimals` and
 *     `formattedBalance`, normalized, from whichever provider answered)
 *   · no ABI encoding, no hand-rolled retry against provider flakiness
 *
 * That is the actual trade: you swapped five provider relationships and three
 * hand-maintained tables for one key and one schema. The request count is the
 * same. The thing that grows per chain is one line in CHAIN_IDS instead of a
 * config block, an address, a decimals entry and a test.
 */
export async function getUsdcBalances(wallet, chains = AGGREGATED_CHAINS) {
  requireKey(); // once, up front — not once per chain after retrying each

  const results = await Promise.allSettled(
    chains.map((key) =>
      withRetry(() =>
        callUniblock('/token/balance', {
          chainId: CHAIN_IDS[key],
          walletAddress: wallet,
          includeMetadata: true,
        }),
      ).then((res) => ({ key, balances: res.balances ?? [] })),
    ),
  );

  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { key: chains[i], error: r.reason.message },
  );
}

/** Pull just the USDC row out of a chain's token list. */
function usdcRow(balances) {
  return balances.find((b) => (b.symbol || '').toUpperCase() === 'USDC');
}

async function main() {
  const wallet = DEMO_WALLET;
  console.log(`\n  USDC balances for ${wallet}`);
  console.log('  read through the unified endpoint\n');

  const t0 = Date.now();
  const rows = await getUsdcBalances(wallet);
  const ms = Date.now() - t0;

  for (const r of rows) {
    if (r.error) {
      console.log(`    ${r.key.padEnd(12)} !  ${r.error.slice(0, 90)}`);
      continue;
    }
    const usdc = usdcRow(r.balances);
    const val = usdc
      ? `${Number(usdc.formattedBalance ?? 0).toLocaleString('en-US')} USDC  (${usdc.decimals} decimals, from the API)`
      : `no USDC position (${r.balances.length} other tokens)`;
    console.log(`    ${r.key.padEnd(12)} ${val}`);
  }

  const ok = rows.filter((r) => !r.error).length;
  console.log(`\n  ${ok}/${rows.length} chains in ${ms}ms`);
  console.log('  1 key · 1 schema · 0 tables you maintain\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('\n  failed:', err.message, '\n');
    process.exit(1);
  });
}
