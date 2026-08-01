// Regression tests for the decode helpers.
//
//   node --test src/
//
// Node's built-in test runner, so still zero dependencies. Every case here is
// a bug that actually shipped in this repo and got caught later, which is the
// only reason a workshop starter has tests at all.

import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeString, decodeUint, formatUnits, withRetry, permanent } from './rpc.js';

const bytes32 = (s) => '0x' + Buffer.from(s).toString('hex').padEnd(64, '0');

test('decodeString handles bytes32 symbols ending in a zero nibble', () => {
  // The original stripped trailing zero NIBBLES, leaving odd-length hex.
  // "P" (0x50) decoded to "" and "AP" (0x4150) decoded to "A".
  for (const sym of ['USDC', 'DAI', 'MKR', 'WETH', 'P', 'AP', 'Op', 'ZZZ0']) {
    assert.equal(decodeString(bytes32(sym)), sym, `bytes32 symbol ${sym}`);
  }
});

test('decodeString handles dynamic (ABI string) encoding', () => {
  const dynamic =
    '0x' +
    '0'.repeat(62) + '20' +
    '0'.repeat(62) + '04' +
    Buffer.from('USDC').toString('hex').padEnd(64, '0');
  assert.equal(decodeString(dynamic), 'USDC');
});

test('decodeString is safe on empty responses', () => {
  assert.equal(decodeString('0x'), null);
  assert.equal(decodeString(null), null);
});

test('decodeUint treats empty as zero rather than throwing', () => {
  assert.equal(decodeUint('0x'), 0n);
  assert.equal(decodeUint(null), 0n);
  assert.equal(decodeUint('0x0de0b6b3a7640000'), 1000000000000000000n);
});

test('formatUnits matches on-chain truth', () => {
  assert.equal(formatUnits(0n, 6), '0');
  assert.equal(formatUnits(1n, 6), '0.000001');
  assert.equal(formatUnits(1000000n, 6), '1');
  assert.equal(formatUnits(123456789n, 6), '123.456789');
  assert.equal(formatUnits(5n, 0), '5');
  assert.equal(formatUnits(10n ** 18n, 18), '1');
  // The real Ethereum reading that the aggregated path has to reproduce.
  assert.equal(formatUnits(50810846175n, 6), '50810.846175');
});

test('formatUnits at 18 decimals does not silently agree with 6', () => {
  // The Conflux eSpace trap: same ticker, different decimals.
  const raw = 944981237227346800000000n;
  assert.notEqual(formatUnits(raw, 18), formatUnits(raw, 6));
  assert.equal(formatUnits(raw, 18), '944981.2372273468');
});

test('withRetry stops immediately on a permanent error', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(async () => {
      calls += 1;
      throw permanent(new Error('bad key'));
    }, { tries: 3, baseMs: 1 }),
  );
  assert.equal(calls, 1, 'permanent errors must not be retried');
});

test('withRetry does retry transient errors, then succeeds', async () => {
  let calls = 0;
  const out = await withRetry(async () => {
    calls += 1;
    if (calls < 3) throw new Error('flaky');
    return 'ok';
  }, { tries: 3, baseMs: 1 });
  assert.equal(out, 'ok');
  assert.equal(calls, 3);
});
