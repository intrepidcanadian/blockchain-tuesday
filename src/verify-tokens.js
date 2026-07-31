// Check the hand-maintained token table against the actual chains.
//
//   node src/verify-tokens.js
//
// This is the "canonical token registry" line from the integration spec, made
// executable. It is also the fastest way to see the point of the whole talk:
// the decimals are not uniform, and nothing warns you.

import { CHAINS, USDC } from './config.js';
import {
  ethCall, SELECTOR, decodeUint, decodeString, withRetry,
} from './lib/rpc.js';

async function check(key) {
  const chain = CHAINS[key];
  const token = USDC[key];

  const [symHex, decHex] = await Promise.all([
    withRetry(() => ethCall(chain.rpc, token.address, SELECTOR.symbol)),
    withRetry(() => ethCall(chain.rpc, token.address, SELECTOR.decimals)),
  ]);

  const onChain = { symbol: decodeString(symHex), decimals: Number(decodeUint(decHex)) };
  return {
    key,
    label: chain.label,
    ...onChain,
    ok: onChain.decimals === token.decimals,
    declared: token.decimals,
  };
}

async function main() {
  console.log('\n  Verifying the token table against live chains\n');

  const rows = await Promise.all(Object.keys(USDC).map(check));

  for (const r of rows) {
    const flag = r.ok ? ' ' : '!';
    console.log(
      `  ${flag} ${r.label.padEnd(16)} ${String(r.symbol).padEnd(6)} ` +
      `${String(r.decimals).padStart(2)} decimals` +
      (r.ok ? '' : `   MISMATCH — config says ${r.declared}`),
    );
  }

  const decimals = [...new Set(rows.map((r) => r.decimals))].sort((a, b) => a - b);
  console.log(`\n  Distinct decimals across ${rows.length} chains: ${decimals.join(', ')}`);

  if (decimals.length > 1) {
    console.log(
      '\n  Same ticker. Same logo. Different decimals.\n' +
      '  Hardcode one value and your balances are wrong by orders of magnitude —\n' +
      '  silently, with no error thrown and every test still green.\n',
    );
  }

  const bad = rows.filter((r) => !r.ok);
  if (bad.length) {
    console.error(`  ${bad.length} entr${bad.length === 1 ? 'y is' : 'ies are'} stale. Fix src/config.js.\n`);
    process.exit(1);
  }
  console.log('  Table matches the chains.\n');
}

main().catch((err) => {
  console.error('\n  failed:', err.message, '\n');
  process.exit(1);
});
