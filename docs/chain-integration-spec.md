# What it takes to add a chain to a unified API

This is the artifact from the September 2026 Blockchain Tuesday. It is not
rhetorical: everything below is real work somebody does, once per chain,
forever, before an aggregator can say "we support that chain."

The list is the same whether the chain is Conflux or anything else.

## The checklist

### 1. Endpoints

- At least one reliable RPC endpoint, and at least one independent fallback.
  A single public endpoint is a demo, not an integration.
- Rate limits documented. Ideally a paid relationship with an SLA.
- Archive access, separately, if you want anything other than latest state.
- Known quirks: does the chain support `eth_getLogs` over wide ranges? Batch
  requests? What is the actual finality assumption?

### 2. Canonical token registry

- Address, symbol, **decimals**, per token, per chain.
- Decimals are not uniform and nothing warns you. USDC is 6 decimals on
  Ethereum, Arbitrum, Base, Optimism and Polygon — and **18** on Conflux
  eSpace. Run `node src/verify-tokens.js` and watch it come back off the live
  chains.
- Which deployment is the "real" one when several exist — native vs bridged vs
  a wrapped variant. This is a judgement call and it has to be made by a human.

### 3. Response normalization

- Map the chain's responses into whatever the unified schema is.
- Decide what happens to fields the chain does not have. Null, omitted, or a
  documented default — pick one and be consistent, because consumers will
  depend on whichever you chose.

### 4. Health checks and failover

- What does "this provider is down" mean, concretely? Timeout, error rate,
  stale block height?
- Thresholds for cutting over to the fallback, and for cutting back.
- Alerting, so somebody knows before users do.

### 5. Explorer and price sources

- Explorer URL patterns for transactions, addresses and tokens.
- A price source for the chain's assets, and a policy for what to do when the
  asset has no reliable price.

### 6. Test vectors

- Known wallets with known balances, so a regression is detectable.
- Edge cases: zero balance, very large balance, a token with unusual decimals,
  a self-destructed contract, an address that is a contract rather than an EOA.

## Read versus deploy

Worth separating, because these get lumped together and carry very different
costs:

|  | Deploying to a chain | Reading from a chain |
|---|---|---|
| What it is | Contracts, bridged liquidity | Balance and state queries |
| Cost | Audit, on-call, permanent attack surface | An endpoint |
| Risk | Funds can be drained | None — holds nothing, signs nothing |
| Right strategy | **Consolidate.** Be deliberate | **Spread.** Follow liquidity |

Over $2.8B has been stolen through cross-chain bridges — close to 40% of all
value ever stolen in this industry. That is a real argument for consolidating
where you *deploy*.

It is not an argument for reading fewer chains. This checklist is about the
read path, which is why it is worth doing well and worth sharing the work on.

## Contributing

If you want a chain routed, this checklist is the shape of the contribution.
Open an issue using the "Add a chain" template and fill in what you know — a
partial answer with real endpoints and a verified token table is far more
useful than a request with none.
