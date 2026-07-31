// The aggregated path — the same five chains through one endpoint.
//
//   UNIBLOCK_KEY=... node src/aggregated.js
//
// ─────────────────────────────────────────────────────────────────────────────
//  READ THIS BEFORE THE WORKSHOP
//
//  The request shape below is written from Uniblock's published API surface and
//  has NOT been verified against a live key. Treat `callUniblock` as the one
//  place that needs confirming — if the real endpoint differs, this is a
//  single-function change and nothing else in the repo moves.
//
//  If you have a key and it works: open a PR and delete this notice. That is a
//  genuinely useful first contribution.
// ─────────────────────────────────────────────────────────────────────────────

import { AGGREGATED_CHAINS, DEMO_WALLET } from './config.js';
import { withRetry } from './lib/rpc.js';

const BASE_URL = process.env.UNIBLOCK_URL || 'https://api.uniblock.dev/v1';

/** The single adapter. Everything provider-specific lives in this function. */
async function callUniblock(path, params) {
  const key = process.env.UNIBLOCK_KEY;
  if (!key) {
    throw new Error(
      'No UNIBLOCK_KEY set. Copy .env.example to .env and add a free key, ' +
      'or run `node src/by-hand.js` which needs no key at all.',
    );
  }

  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }

  const res = await fetch(url, { headers: { 'x-api-key': key } });
  if (!res.ok) {
    throw new Error(`Uniblock HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

/**
 * The whole thing.
 *
 * Compare this to src/by-hand.js. The address table, the decimals table, the
 * five RPC relationships and the retry loop did not get simpler — they moved,
 * behind an endpoint that routes across many providers and fails over on its
 * own. That is the trade, stated plainly: you swapped five provider
 * relationships for one aggregator relationship.
 *
 * Note what this does NOT cost you: any smart-contract attack surface. This is
 * a read. It holds no funds and signs nothing. Spreading reads across twenty
 * chains is not the same act as deploying contracts to twenty chains — see
 * docs/chain-integration-spec.md.
 */
export async function getUsdcBalances(wallet, chains = AGGREGATED_CHAINS) {
  return withRetry(() =>
    callUniblock('/balances/tokens', { address: wallet, chains, token: 'USDC' }),
  );
}

async function main() {
  const wallet = DEMO_WALLET;
  console.log(`\n  USDC balances for ${wallet}`);
  console.log('  read through one aggregated endpoint\n');

  const t0 = Date.now();
  const out = await getUsdcBalances(wallet);
  console.log(JSON.stringify(out, null, 2));
  console.log(`\n  ${AGGREGATED_CHAINS.length} chains in ${Date.now() - t0}ms`);
  console.log('  1 endpoint · 1 key · 0 tables you maintain\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('\n  failed:', err.message, '\n');
    process.exit(1);
  });
}
