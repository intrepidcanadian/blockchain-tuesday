// The hand-maintained tables. This file IS the talk.
//
// Every entry below is something a human typed and has to keep correct. When an
// aggregator says it "supports a chain", roughly this is what it means: someone
// did this work, tested it, and now owns it forever.
//
// Every address here was verified live against its chain before being committed
// — run `npm run verify` to check them again yourself. They drift.

/** Chains reachable without an API key. Good enough for a workshop. */
export const CHAINS = {
  ethereum: {
    label: 'Ethereum',
    rpc: 'https://ethereum-rpc.publicnode.com',
    explorer: 'https://etherscan.io',
  },
  arbitrum: {
    label: 'Arbitrum One',
    rpc: 'https://arbitrum-one-rpc.publicnode.com',
    explorer: 'https://arbiscan.io',
  },
  base: {
    label: 'Base',
    rpc: 'https://base-rpc.publicnode.com',
    explorer: 'https://basescan.org',
  },
  optimism: {
    label: 'OP Mainnet',
    rpc: 'https://optimism-rpc.publicnode.com',
    explorer: 'https://optimistic.etherscan.io',
  },
  polygon: {
    label: 'Polygon PoS',
    rpc: 'https://polygon-bor-rpc.publicnode.com',
    explorer: 'https://polygonscan.com',
  },

  // Chain #6. Not routed by the aggregator today — see src/add-conflux.js.
  conflux: {
    label: 'Conflux eSpace',
    rpc: 'https://evm.confluxrpc.com',
    explorer: 'https://evm.confluxscan.io',
  },
};

/**
 * USDC, per chain.
 *
 * Note the decimals column, and note that it is NOT uniform.
 *
 * USDC is 6 decimals on all five of the chains people usually demo with — which
 * is exactly why so much code hardcodes `6` and gets away with it for a year.
 * On Conflux eSpace the same ticker is **18 decimals**. Hardcode 6 there and
 * every balance you print is wrong by a factor of a trillion, silently, with no
 * error and no exception. Your tests pass. Your dashboard lies.
 *
 * This is not a hypothetical we invented for the slide. Run `npm run verify`
 * and watch it come back off the live chains.
 */
export const USDC = {
  ethereum: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  arbitrum: { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
  base: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  optimism: { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6 },
  polygon: { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6 },

  // ↓ eighteen. not six.
  conflux: { address: '0x6963efed0ab40f6c3d7bda44a05dcf1437c44372', decimals: 18 },
};

/**
 * Numeric chain IDs, which is what the aggregated API takes.
 *
 * Note this is a third hand-maintained table — but it is the only one the
 * aggregated path needs. The addresses and decimals above exist purely for the
 * by-hand path.
 */
export const CHAIN_IDS = {
  ethereum: 1,
  optimism: 10,
  polygon: 137,
  base: 8453,
  arbitrum: 42161,
  conflux: 1030, // eSpace
};

/** The five chains the aggregated path covers today. */
export const AGGREGATED_CHAINS = ['ethereum', 'arbitrum', 'base', 'optimism', 'polygon'];

/**
 * Demo wallet: Binance 14, an exchange hot wallet.
 *
 * Chosen because it holds balances on every chain here, so the scripts always
 * print something. Two things follow from that, and both matter if you are
 * presenting:
 *
 *   - It is NOT idle capital. Seventeen million transactions have gone through
 *     it. Do not describe its balances as money sitting around doing nothing;
 *     a hot wallet is exactly where that money belongs.
 *   - Balances move constantly, so your numbers will differ from any figure
 *     quoted in the talk or this repo.
 *
 * Set WALLET in .env to point at your own address instead.
 */
export const DEMO_WALLET =
  process.env.WALLET || '0x28C6c06298d514Db089934071355E5743bf21d60';
