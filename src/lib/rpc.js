// Minimal JSON-RPC + ABI helpers.
//
// This file exists so the rest of the repo has ZERO dependencies. Normally you
// would reach for viem or ethers here and you absolutely should in real code —
// but `npm install` on conference wifi with forty people is its own kind of
// demo, and we would rather you spend the workshop reading the other files.
//
// Everything below is the boring part of talking to a chain. That is the point.

/** One JSON-RPC round trip. */
export async function rpc(url, method, params, { timeoutMs = 10_000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
    const json = await res.json();
    if (json.error) throw new Error(`RPC ${json.error.code}: ${json.error.message}`);
    return json.result;
  } finally {
    clearTimeout(timer);
  }
}

/** eth_call against a contract. */
export function ethCall(url, to, data) {
  return rpc(url, 'eth_call', [{ to, data }, 'latest']);
}

// --- the ABI encoding you would otherwise get for free -----------------------

/** Function selectors we need. Real code reads these from an ABI. */
export const SELECTOR = {
  balanceOf: '0x70a08231',
  decimals: '0x313ce567',
  symbol: '0x95d89b41',
  totalSupply: '0x18160ddd',
};

/** Left-pad an address into a 32-byte ABI word. */
export function encodeAddress(addr) {
  return addr.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

/** Decode a uint return value. Returns a BigInt. */
export function decodeUint(hex) {
  if (!hex || hex === '0x') return 0n;
  return BigInt(hex);
}

/**
 * Decode a string return value.
 *
 * Handles both the ABI-correct dynamic encoding and the older bytes32 style
 * that some long-lived tokens still use. You would not write this by hand
 * either — but somebody has to, once per chain, before an aggregator can
 * hand you a clean `symbol` field.
 */
export function decodeString(hex) {
  if (!hex || hex === '0x') return null;
  const body = hex.slice(2);
  if (body.length <= 64) {
    // bytes32-style: right-padded with zero BYTES.
    //
    // Strip `(00)+`, not `0+`. Trimming individual nibbles corrupts any symbol
    // whose final character has a low nibble of zero — "P" (0x50) became "",
    // and "AP" (0x4150) became "A", because the leftover hex was odd-length.
    return Buffer.from(body.replace(/(00)+$/, ''), 'hex').toString().trim();
  }
  const len = parseInt(body.slice(64, 128), 16);
  return Buffer.from(body.slice(128, 128 + len * 2), 'hex').toString();
}

/** Format a raw integer balance using its decimals. */
export function formatUnits(raw, decimals) {
  const s = raw.toString().padStart(decimals + 1, '0');
  const whole = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : whole;
}

/**
 * Retry with exponential backoff.
 *
 * Every multi-chain app grows one of these. It is never in the first draft and
 * always in the second, written the morning after a free-tier RPC went down.
 */
export async function withRetry(fn, { tries = 3, baseMs = 250 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Some failures are settled facts, not blips — a bad key, or a project
      // with no providers enabled. Retrying those just multiplies the wait
      // before the user sees the message that would have helped immediately.
      if (err.retryable === false) break;
      if (i === tries - 1) break;
      // An error may ask for a longer pause than our default curve (a 429).
      await new Promise((r) => setTimeout(r, Math.max(err.backoffMs || 0, 2 ** i * baseMs)));
    }
  }
  throw lastErr;
}

/** Mark an error as not worth retrying. */
export function permanent(err) {
  err.retryable = false;
  return err;
}
