// Chain #6 — the seam.
//
//   node src/add-conflux.js
//
// In src/aggregated.js, adding a chain is one array entry. Uniblock does not
// route Conflux nodes today, so here is what that one array entry actually
// costs when the aggregator cannot do it for you.
//
// Everything below is work someone has to do once per chain, forever. It is not
// hard. It is just not free — and it is the difference between "flat" and
// "linear" in how your codebase grows.

import { CHAINS, USDC, AGGREGATED_CHAINS, DEMO_WALLET } from './config.js';
import { getUsdcBalances as byHand } from './by-hand.js';
import {
  ethCall, SELECTOR, encodeAddress, decodeUint, decodeString, formatUnits, withRetry,
} from './lib/rpc.js';

/**
 * Step 1 — an endpoint. Public, unmetered, no SLA, no fallback. In production
 * you would want a paid provider and at least one backup, which is a
 * relationship, a bill and a rotation.
 */
const RPC = CHAINS.conflux.rpc;

/**
 * Step 2 — the token entry. You find the address, you confirm it is the one
 * people actually use, and you write down its decimals.
 *
 * This is where it bites. USDC is 6 decimals on all five aggregated chains.
 * On Conflux eSpace it is 18. Copy your existing constant across and every
 * number you print is wrong by 10^12, with no error and no failing test.
 */
const TOKEN = USDC.conflux;

/** Step 3 — normalization. Same shape the other five chains return. */
async function confluxUsdcBalance(wallet) {
  const data = SELECTOR.balanceOf + encodeAddress(wallet);
  const raw = await withRetry(() => ethCall(RPC, TOKEN.address, data));
  return {
    chain: CHAINS.conflux.label,
    balance: formatUnits(decodeUint(raw), TOKEN.decimals),
    decimals: TOKEN.decimals,
  };
}

/** Step 4 — a health check, so you know when it breaks before your users do. */
async function health() {
  const [sym, dec] = await Promise.all([
    ethCall(RPC, TOKEN.address, SELECTOR.symbol),
    ethCall(RPC, TOKEN.address, SELECTOR.decimals),
  ]);
  const decimals = Number(decodeUint(dec));
  return {
    reachable: true,
    symbol: decodeString(sym),
    decimals,
    matchesConfig: decimals === TOKEN.decimals,
  };
}

async function main() {
  const wallet = DEMO_WALLET;

  console.log('\n  Adding chain #6 by hand, because the aggregator cannot.\n');

  const h = await health();
  console.log(`    endpoint      ${new URL(RPC).host}`);
  console.log(`    token         ${h.symbol} at ${TOKEN.address.slice(0, 10)}…`);
  console.log(`    decimals      ${h.decimals}  ${h.matchesConfig ? '(config agrees)' : '(CONFIG IS WRONG)'}`);

  const rows = await byHand(wallet, AGGREGATED_CHAINS);
  const conflux = await confluxUsdcBalance(wallet);

  console.log(`\n  USDC for ${wallet}\n`);
  for (const r of [...rows, conflux]) {
    const val = r.error ? `!  ${r.error}` : `${Number(r.balance).toLocaleString('en-US')} USDC`;
    const tag = r.decimals === 18 ? '   ← 18 decimals' : '';
    console.log(`    ${r.chain.padEnd(16)} ${val}${tag}`);
  }

  // The decimals trap, made concrete.
  //
  // Uses total supply rather than the demo wallet's balance, so this always
  // demonstrates something regardless of who holds what today.
  const supplyHex = await withRetry(() => ethCall(RPC, TOKEN.address, SELECTOR.totalSupply));
  const supply = decodeUint(supplyHex);
  const right = formatUnits(supply, TOKEN.decimals);
  const wrong = formatUnits(supply, 6);
  const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });

  console.log(
    `\n  The trap, using total supply so it always shows up:\n\n` +
    `    read with ${TOKEN.decimals} decimals (correct)   ${fmt(right).padStart(24)} USDC\n` +
    `    read with  6 decimals (copied)     ${fmt(wrong).padStart(24)} USDC\n\n` +
    `  Off by a factor of a trillion. No exception, no failing test —\n` +
    `  just a wrong number on a dashboard that nobody catches for a week.\n`,
  );

  console.log('  That is what one array entry costs when nobody routes it for you.');
  console.log('  See docs/chain-integration-spec.md for the full list.\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('\n  failed:', err.message, '\n');
    process.exit(1);
  });
}
