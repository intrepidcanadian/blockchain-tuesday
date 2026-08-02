# Blockchain Tuesday — one endpoint, every chain

Workshop repo for **Blockchain Tuesday, September 2026**, Toronto — hosted at the
Uniblock offices, with Uniblock and Conflux.

Read one token balance across five chains two ways, then add a sixth chain by
hand and watch what it costs.

**No dependencies. No build step. No install.** Node 18+ and a network
connection is the whole setup — because forty people running `npm install` on
office wifi is its own kind of demo.

```bash
git clone https://github.com/intrepidcanadian/blockchain-tuesday.git
cd blockchain-tuesday
node src/by-hand.js
```

If that printed balances, you are ready.

---

## The three commands

### 1. By hand — no key needed

```bash
node src/by-hand.js
```

Five chains, five RPC endpoints, a token address table, a decimals table, and a
retry policy you wrote yourself. Roughly fifty lines, none of which are about
your product.

### 2. Aggregated — needs a free key

```bash
cp .env.example .env    # add your Uniblock key
node src/aggregated.js
```

The same result through one endpoint. The tables and the retry loop did not get
simpler — they moved.

> **Endpoint contract**, verified against a live key:
> `GET https://api.uniblock.dev/uni/v1/scan/token-balance?chainId=&address=&contractAddress=`,
> auth via the `X-API-KEY` header. The docs show the response as `"123.4567"`,
> but `balance` is a **raw integer** — `50810846175` at 6 decimals is
> `50810.846`, which matches the chain exactly.

**Three things this endpoint will do to you**, all found by running it:

1. **A 200 is not a success.** When an upstream provider refuses a chain, the
   router still returns HTTP 200 with an `error` object in the body. Trust
   `res.ok` and you read `undefined` and report it as zero.
2. **`/token/balance` is paginated.** Listing a wallet's tokens returns ~70–90
   rows plus a cursor. USDC was not on page one for any large wallet we tried,
   so a single-page read says "no USDC" for an address holding $50k of it.
3. **Match the contract address, never the symbol.** A symbol match on Optimism
   found a token labelled USDC holding 20.807553 while canonical USDC was zero —
   it had matched the bridged variant.

Which is the fragmentation problem from the talk, turning up inside the tool
meant to abstract it away.

### Are the two paths telling the same story?

```bash
node src/compare.js
```

Runs both and diffs them against on-chain truth. This is the script that keeps
the talk honest — every bug listed above was caught here, and none of them threw
an exception. They all just looked plausible.

```
Ethereum     50,810.846       50,810.846       match  [direct]
Arbitrum One 37.014           37.014           match  [direct]
Base         104.382          unverified       ?  provider gap — list truncated
OP Mainnet   0                0                match  [list, USDC absent]
Polygon PoS  50.075           50.075           match  [direct]
```

`unverified` is deliberate. Free-tier provider coverage cannot answer for Base,
and saying so is correct — printing a zero there would be a confident lie.

### 3. Chain #6 — the seam

```bash
node src/add-conflux.js
```

Uniblock does not route Conflux nodes today, so this is what one array entry
actually costs when the aggregator cannot do it for you: an endpoint, a token
entry, normalization, and a health check.

And a live trap. USDC is 6 decimals on all five aggregated chains and **18** on
Conflux eSpace. Copy the constant across and every number is wrong by a factor
of a trillion — no exception thrown, no test failing:

```
read with 18 decimals (correct)                 944,981.24 USDC
read with  6 decimals (copied)      944,981,237,227,346,800 USDC
```

### The one that actually argues for a unified API

```bash
node src/agent-scan.js
```

An agent's pre-trade scan across three venues on **one key**: on-chain balances,
Hyperliquid perp funding and tick premium, and Polymarket implied probabilities.

```
1. Where is my capital?          Ethereum 50,810.85 USDC · Arbitrum 37.01 · ...
2. Where is the carry?           CFX -50.20% annualised, premium -0.0958%
3. What is the crowd pricing?    Putin out by Dec 2026 — 8.5%, $778k liquidity
4. Decision                      long perp / short spot; collateral sits on Ethereum
```

**Why this demo and not `balanceOf`.** When you already know the chain, the
contract, the wallet and the decimals, raw RPC is the shortest path by
definition — and our own numbers prove it: by-hand runs in ~140ms and gets 5/5
chains right, while the aggregated path took 5.4s and got 4/5. An aggregator
cannot win that benchmark and should not be asked to.

An agent is not in that position. It does not know what it holds, what anything
is worth, or where the edge is. Two of those questions have no RPC method at
all:

```
eth_getTokenBalances          -> the method does not exist
"what is this worth in USD"   -> not on-chain in readable form
Hyperliquid funding/premium   -> not on an EVM chain you can eth_call
```

Not slow. **Impossible.** That is the structural argument, and it is the one a
balance lookup never makes.

One honest note: Hyperliquid comes through the unified schema; Polymarket comes
through Uniblock's direct-provider passthrough, so the response is Polymarket's
own shape. Same key, same bill, unnormalized data.

### Cross-venue: do two markets agree?

```bash
node src/cross-venue.js
```

Joins Polymarket's crowd odds against Hyperliquid's price and realised
volatility, then asks whether they are consistent — a calculation **neither
venue can perform**, because neither holds both halves.

```
Will Bitcoin hit $150k by December 31, 2026?
   Polymarket   3.3% implied  ·  $185,698 liquidity  ·  152d to resolve
   Hyperliquid  BTC at $63,423  ·  needs +137%  ·  realised vol 36%
   For 3.3% to be right, forward vol must be ~85%.
   BTC has actually realised 36% over 120 days.
   the crowd is pricing far MORE volatility than has been realised (2.37x)
```

It inverts the crowd's probability through a driftless lognormal to get the
volatility that would justify it, then compares that to realised vol from
Hyperliquid daily candles.

Note the two sources arrive by different routes — Hyperliquid through the
unified schema, Polymarket through the direct-provider passthrough. One key,
one bill, two very different response shapes. That is the argument.

**Not trading advice.** A disagreement between two markets is a question, not
an edge: realised vol is backward-looking, lognormal is a poor model of crypto
tails, and prediction markets carry a known premium on lottery-shaped payoffs.

### Bonus — check the table yourself

```bash
node src/verify-tokens.js
```

Calls `symbol()` and `decimals()` on every configured address and tells you if
`src/config.js` has drifted. This is the "canonical token registry" line from
the spec, made executable.

---

## Tests

```bash
npm test
```

Node's built-in runner, still zero dependencies. Every case is a bug that
actually shipped here — including a `decodeString` that returned `""` for any
bytes32 symbol ending in a zero nibble (`"P"`, `"AP"`), because it stripped
trailing zero *nibbles* instead of zero *bytes*.

## What the talk actually argues

Not "be everywhere." Chain count does not predict volume. Measured on cumulative
DEX volume (DefiLlama):

| Protocol | Chains | Cumulative volume | Off-home share, 3yr |
|---|---|---|---|
| Uniswap | 47 | $3.78T | 30% → 47% |
| PancakeSwap | 12 | $2.06T | 4% → 23% |
| Raydium | 1 | $720B | single-chain |
| Aerodrome | 1 | $411B | single-chain |
| Curve | 20 | $345B | 11% → 5% |
| SushiSwap | 20 | $252B | 56% → 37% |

Aerodrome on **one** chain has out-traded Curve on twenty. Curve and Sushi both
expanded to 20 chains and their off-home share *fell*. And over $2.8B has been
stolen through bridges, roughly 40% of all value ever stolen in crypto.

But the direction is unambiguous where it counts. Non-Ethereum went from **0% to
roughly half** of Uniswap's volume in five years, and outpaced Ethereum in four
of the last five quarters — measured in volume rather than TVL, so no price move
or protocol incident flatters it.

The distinction that resolves it:

|  | Deploying to a chain | Reading from a chain |
|---|---|---|
| Cost | Audit, on-call, permanent attack surface | An endpoint |
| Risk | Funds can be drained | None — holds nothing, signs nothing |
| Strategy | **Consolidate** | **Spread** |

**Deploy few. Read many.** Consolidate the risky half, spread the cheap half.
An aggregator sells you the cheap half — which is why "one endpoint, many
chains" and "deploy on fewer chains" are the same strategy, not opposing ones.

---

## Contributing

Three things worth doing, in rough order of usefulness:

1. **Verify the Uniblock adapter.** Run it with a real key, fix
   `callUniblock` if the shape differs, open a PR.
2. **Add a chain.** Pick one, work through
   [`docs/chain-integration-spec.md`](docs/chain-integration-spec.md), add it to
   `src/config.js`, and make `verify-tokens` pass.
3. **Contribute to the spec itself** — the checklist for what adding a chain to
   a unified API requires. There is an "Add a chain" issue template.

Bring what you built to the next Blockchain Tuesday. Demo slots are open.

---

## Layout

```
src/
  config.js          the hand-maintained tables — this file IS the talk
  by-hand.js         five chains, owning every step
  aggregated.js      the same thing through one endpoint
  add-conflux.js     chain #6, and what it costs
  verify-tokens.js   check the table against the live chains
  lib/rpc.js         minimal JSON-RPC + ABI helpers, so there are no deps
docs/
  chain-integration-spec.md    what adding a chain actually requires
```

Every address in `src/config.js` was verified live against its chain before
being committed. They drift — run `verify-tokens` rather than trusting them.
