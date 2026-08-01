// Run both paths and diff them.
//
//   node src/compare.js
//
// This is the script that actually keeps the talk honest. The by-hand path
// reads the chain directly, so it is ground truth. The aggregated path goes
// through a vendor. If they disagree, one of them is wrong and you want to know
// that at your desk, not on stage.
//
// Every discrepancy this repo has found so far was found here:
//
//   · the aggregated path reported a bridged USDC.e balance on Optimism while
//     the canonical USDC balance was zero — a symbol match instead of an
//     address match
//   · it reported "no USDC" on three chains because the token list is paginated
//     and USDC was not on page one
//   · it reported `undefined` on two chains because the provider returned an
//     error inside an HTTP 200
//
// None of those threw. All of them looked plausible.

import { loadEnv } from './lib/env.js';

loadEnv();

const { AGGREGATED_CHAINS, CHAINS } = await import('./config.js');
const { getUsdcBalances: byHand } = await import('./by-hand.js');
const { getUsdcBalances: aggregated } = await import('./aggregated.js');

/** Compare to the cent — floating point and string formatting both lie a little. */
function agrees(a, b) {
  if (a === null || b === null) return false;
  return Math.abs(Number(a) - Number(b)) < 0.01;
}

async function main() {
  console.log('\n  Comparing both paths against the same wallet\n');

  const wallet = process.env.WALLET || (await import('./config.js')).DEMO_WALLET;

  const [chainRows, apiRows] = await Promise.all([
    byHand(wallet, AGGREGATED_CHAINS),
    aggregated(wallet, AGGREGATED_CHAINS).catch((e) => ({ fatal: e.message })),
  ]);

  if (apiRows.fatal) {
    console.error(`  aggregated path unavailable: ${apiRows.fatal}\n`);
    process.exit(1);
  }

  console.log(`    ${'chain'.padEnd(12)} ${'on-chain'.padEnd(16)} ${'via API'.padEnd(16)} verdict`);
  console.log(`    ${'-'.repeat(12)} ${'-'.repeat(16)} ${'-'.repeat(16)} -------`);

  let mismatches = 0;
  let unverified = 0;

  AGGREGATED_CHAINS.forEach((key, i) => {
    const truth = chainRows[i]?.error ? null : chainRows[i]?.balance;
    const api = apiRows[i];

    const truthStr = truth === null || truth === undefined ? 'rpc failed' : Number(truth).toLocaleString('en-US');

    let apiStr;
    let verdict;

    if (api?.error) {
      apiStr = 'error';
      verdict = `!  ${api.error.split('\n')[0].slice(0, 46)}`;
      unverified += 1;
    } else if (api?.unverified) {
      apiStr = 'unverified';
      verdict = `?  ${api.via}`;
      unverified += 1;
    } else if (agrees(truth, api?.balance)) {
      apiStr = Number(api.balance).toLocaleString('en-US');
      verdict = `match  [${api.via}]`;
    } else {
      apiStr = api?.balance === null ? 'null' : Number(api?.balance ?? NaN).toLocaleString('en-US');
      verdict = `*** MISMATCH ***  [${api?.via}]`;
      mismatches += 1;
    }

    console.log(`    ${CHAINS[key].label.slice(0, 12).padEnd(12)} ${truthStr.padEnd(16)} ${apiStr.padEnd(16)} ${verdict}`);
  });

  const agreed = AGGREGATED_CHAINS.length - mismatches - unverified;
  console.log(`\n  ${agreed}/${AGGREGATED_CHAINS.length} agree · ${unverified} unverified · ${mismatches} mismatched\n`);

  if (mismatches) {
    console.log('  A mismatch means the API and the chain disagree about a real balance.');
    console.log('  Do not present this until it is explained.\n');
    process.exit(1);
  }
  if (unverified) {
    console.log('  Unverified means the API could not answer — usually free-tier provider');
    console.log('  coverage. Not a correctness bug, but say so rather than showing a zero.\n');
  }
}

main().catch((err) => {
  console.error('\n  failed:', err.message, '\n');
  process.exit(1);
});
