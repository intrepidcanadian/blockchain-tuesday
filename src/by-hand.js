// The "by hand" path — read one token across five chains, owning every step.
//
//   node src/by-hand.js
//
// Nothing here is clever. That is the point: count how much of this file is
// about your product (none of it) versus plumbing (all of it).

import { CHAINS, USDC, AGGREGATED_CHAINS, DEMO_WALLET } from './config.js';
import {
  ethCall, SELECTOR, encodeAddress, decodeUint, formatUnits, withRetry,
} from './lib/rpc.js';

/** Read one wallet's USDC balance on one chain. */
async function balanceOn(chainKey, wallet) {
  const chain = CHAINS[chainKey];
  const token = USDC[chainKey];

  // You encode the call yourself, or a library does it for you. Either way
  // someone has to know that balanceOf takes one left-padded address word.
  const data = SELECTOR.balanceOf + encodeAddress(wallet);

  // ...and you own the retry policy, because public RPCs are public RPCs.
  const raw = await withRetry(() => ethCall(chain.rpc, token.address, data));

  return {
    chain: chain.label,
    balance: formatUnits(decodeUint(raw), token.decimals),
    decimals: token.decimals,
  };
}

export async function getUsdcBalances(wallet, chainKeys = AGGREGATED_CHAINS) {
  const settled = await Promise.allSettled(
    chainKeys.map((k) => balanceOn(k, wallet)),
  );

  // And you own the partial-failure policy too. One chain being down should not
  // take the whole dashboard with it — which is a decision you now have to make
  // and keep making.
  return settled.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { chain: CHAINS[chainKeys[i]].label, error: r.reason.message },
  );
}

async function main() {
  const wallet = DEMO_WALLET;
  console.log(`\n  USDC balances for ${wallet}`);
  console.log('  read by hand, one RPC per chain\n');

  const t0 = Date.now();
  const rows = await getUsdcBalances(wallet);
  const ms = Date.now() - t0;

  for (const r of rows) {
    const val = r.error ? `!  ${r.error}` : `${Number(r.balance).toLocaleString('en-US')} USDC`;
    console.log(`    ${r.chain.padEnd(16)} ${val}`);
  }

  const ok = rows.filter((r) => !r.error).length;
  console.log(`\n  ${ok}/${rows.length} chains in ${ms}ms`);
  console.log('  5 RPC endpoints · 2 hand-maintained tables · 1 retry policy you wrote\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('\n  failed:', err.message, '\n');
    process.exit(1);
  });
}
