# The blockchain data layer, and where a router sits in it

"Is Uniblock like Blockscout?" came up while preparing this talk, and the honest
answer is no — they are different layers, and Blockscout is one of the *kinds of
thing* a router forwards to. This is the map.

Six categories. Most tools are in exactly one, and confusing them is how you end
up paying for something you already have.

---

## 1. RPC providers — raw node access

**Alchemy · Infura · QuickNode · Ankr · Chainstack · dRPC · BlockPI · Tenderly**

You get `eth_call`, `eth_getLogs`, `eth_getBalance`. Ground truth, fast, cheap.

What you do **not** get is discovery. There is no `eth_getTokenBalances` — a node
stores state by address and cannot enumerate what an address owns. If your
question is "balance of a token I can already name", this is the shortest path
and nothing beats it. We measured it: 5 chains in ~140ms, no key.

## A note on "the same asset"

USDC is **natively issued by Circle on 40+ mainnets** — Ethereum, Arbitrum, Base,
Optimism, Polygon, Solana and the rest. These are not copies of an Ethereum
original; each is a genuine Circle issuance, and none of it is fungible with any
other without bridging or CCTP.

Where Circle arrived after a bridge did, the legacy bridged token still
circulates alongside. On Optimism, read on-chain:

| Contract | `symbol()` | Supply |
|---|---|---|
| `0x0b2C…Ff85` — Circle native | **USDC** | $153.7M |
| `0x7F5c…1607` — legacy bridged | **USDC** | $21.4M |

**Both answer `symbol()` with "USDC".** The bridged one does not call itself
USDC.e on chain — that name exists only in interfaces. This repo's aggregated
path matched on symbol at one point and returned the bridged balance while the
canonical balance was zero. Address is identity; a ticker is a label anyone can
write.

## 2. Explorers and per-chain indexers

**Blockscout (open source) · Etherscan family · Routescan · Otterscan**

These index a chain and serve it. This is the layer that answers "what does this
wallet hold", because someone built an index.

Measured for this talk, same wallet, no key:

| | Result | Latency |
|---|---|---|
| Blockscout, Ethereum | **2,138 tokens** | 1.6s |
| Blockscout, Arbitrum | 81 tokens | 418ms |
| Blockscout — Base, Optimism, Polygon, Gnosis | no response | — |
| Routescan, Ethereum | 25 holdings | 365ms |
| Routescan — the other five chains | no items | — |

Two things follow. **Blockscout on Ethereum beat every paid option we tried**,
free and keyless. And the free options disagree wildly with each other — 2,138
against 25 for the same address, because "holdings" means different things to
different indexers.

The structural catch is deployment: Blockscout is one instance per chain. Six
chains is six hostnames, six uptimes, six schemas. Two of six answered when we
asked.

## 3. Multichain data APIs — pre-indexed, one schema

**Alchemy enhanced APIs · Moralis · Covalent/GoldRush · Zerion · Bitquery ·
Chainbase · Nodereal**

Same job as category 2, but many chains behind one schema and one key. Covalent
claims 200+ networks through a single interface; Moralis covers 19+ EVM chains
plus Solana.

All of these need a key — we confirmed Covalent and Moralis both return 401
unauthenticated. You are trading "free but N hostnames" for "paid but one
contract".

## 4. Routers and aggregators — index nothing, route everything

**Uniblock · dRPC · Pocket/Grove · Lava**

These sit in front of categories 1–3 and pick a provider per call. Uniblock's own
provider list includes Alchemy, Moralis, GoldRush, Etherscan, QuickNode,
CoinGecko, Birdeye and more, plus non-chain venues — Hyperliquid, Polymarket,
Kraken, LunarCrush.

That last part is the real differentiator, and it is not "blockchain data" at
all. No explorer will tell you a perp funding rate or a prediction-market
probability. If your agent needs on-chain balances *and* exchange state in one
loop, this is the only category that spans it.

What you pay: a network hop. We measured Hyperliquid at 161ms direct against
854ms through the router, and Polymarket at 52ms against 145ms.

## 5. Custom indexing frameworks — you define it, you run it

**The Graph · Ponder · Envio · Subsquid/SQD · Goldsky · Shovel**

For when no pre-built schema fits: you write the mapping, they handle ingestion.
Maximum flexibility, maximum operational load. Envio and Ponder in particular
assume you have DevOps.

Reach for this when your question is protocol-specific — "every position ever
opened in *our* contract" — not when it is generic.

## 6. Analytics warehouses — SQL over history

**Dune · Flipside · Allium · Nansen**

Ad-hoc analysis, dashboards, research. Not a runtime dependency. Every market
figure in this talk came from DefiLlama's API, which is the free end of this
category.

---

## Choosing

| Your question | Use |
|---|---|
| Balance of a token I can name, one chain | **Raw RPC** (1) |
| What does this wallet hold, one chain | **Blockscout** (2) — free, and it won our benchmark |
| Same, across many chains, one schema | **Multichain API** (3) or **router** (4) |
| On-chain *and* exchange/market state together | **Router** (4) — only category that spans both |
| Something specific to my contracts | **Custom indexer** (5) |
| Research, a chart, a one-off number | **Warehouse** (6) |

The pattern from the talk holds here too: **go direct in a hot path, aggregate
while you are still finding out what you need.** If you are on one chain and know
which token you want, categories 1 and 2 cover you for free — and you should say
so out loud before recommending anyone pay for a router.

---

*Latency and completeness figures measured 3 Aug 2026 against the same wallet.
Re-run before quoting; free endpoints in particular move.*
