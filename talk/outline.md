# Why Omnichain Matters — and What It Costs You to Build

**Sample presentation · Blockchain Tuesday, September 2026 · ~20 min + 5 Q&A**
Speaker: Tony Lau

> ## ⚠︎ THIS FILE IS SUPERSEDED
>
> The talk is now the **17-slide deck**, which carries its own speaker notes —
> press **N** while presenting. Build from the deck, not from this file. The
> deck adds three slides this outline never had: a Uniswap volume-share worked
> example, an eight-DEX case-study table,
> the consolidation counter-argument, and the "deploy few, read many"
> resolution &mdash; and drops the old Stargate stats slide, whose figures came
> from a web summary rather than an API.
>
> Keep this file only for the pre-stage checklist and the Q&A prep below, both
> of which are current. Every "Slide N" heading further down refers to the old
> 14-slide outline and no longer matches the deck &mdash; ignore the numbering.
>
> **Before this goes on stage:** two things need verification. (1) Every TVL figure
> marked ⚠︎ needs a current source pulled the week of the event — DefiLlama for
> protocol TVL and DEX volume. (2) The Uniblock code
> on the two code slides ("One balance. Five chains." and "The same thing,
> through one endpoint.") is written from their published API surface but **the exact endpoint
> names and response shapes must be checked against Uniblock's docs**, ideally by
> someone at Uniblock on the pre-call. Nothing lands worse than a live demo whose
> code doesn't compile in front of the company that makes the API.

---

## Arc of the talk

Three moves, in this order, because the third only pays off if the first two land:

1. **Omnichain isn't a feature, it's where the money is** — the economic case
2. **But it's historically been miserable to build** — the code case
3. **So here's what the abstraction actually does** — Uniblock, and what's still missing

---

## Slide 1 — Title

> **Why Omnichain Matters**
> And what it costs you to build
>
> Blockchain Tuesday · September 2026
> With Uniblock and Conflux

**Say:** "Two halves tonight. First: why every serious app ends up multi-chain whether
it planned to or not. Second: the code, because that's where the promise usually dies."

---

## Slide 2 — Start with the uncomfortable question

> **Your app is live on one chain.**
> **How much of the market can it see?**

**Say:** Let it sit. Then: your contract is fine, your UX is fine, but your addressable
liquidity is whatever happens to sit on your chain today. Every user on every other
chain is someone who'd have to bridge, pay a fee, wait, and trust something — before
they can even try you.

That's not a marketing problem. That's a structural cap on your TVL.

---

## Slide 3 — Liquidity is fragmented by default

> Same asset. Many chains. **None of it pooled.**
>
> USDC on Ethereum · USDC on Arbitrum · USDC on Base · USDC on Polygon · Bridged
> USDC.e · Wrapped variants…

**Say:** This is the actual state of the world. The "same" token exists in a dozen
incompatible forms. Every wrapped variant is a separate pool with separate depth,
separate slippage, and separate risk. Fragmentation is the default state of crypto
liquidity, and it is expensive for everyone.

**Speaker note:** This is the slide that makes the room nod. Don't rush it — the rest
of the economic argument is just consequences of this picture.

---

## Slide 4 — Four reasons omnichain lifts TVL

> 1. **Addressable users** — every chain you support is a user base that doesn't
>    have to bridge before trying you. Bridging is the highest-drop-off step in
>    all of crypto UX
> 2. **Unified liquidity** — one deep pool beats six shallow ones. Less slippage
>    attracts bigger flow, which deepens the pool. It compounds
> 3. **Capital efficiency** — LPs stop having to choose a chain. Idle capital on
>    the wrong chain earns nothing
> 4. **Survivorship** — chain-specific incentives dry up. Being on one chain means
>    your TVL is a bet on that chain's emissions schedule

**Say:** Note the direction of the argument. It isn't "omnichain is a magic TVL
multiplier." It's that single-chain deployment imposes a *ceiling*, and each of these
four is a different way that ceiling binds. The mechanism is the argument.

**Speaker note — be careful here.** If someone asks for a hard number on omnichain
TVL uplift, the honest answer is that clean causal data is scarce: protocols that go
omnichain also tend to be the ones with the resources and momentum to grow anyway. Say
that. It buys you more credibility than a stat would.

---

## Slide 5 — What the numbers do support ⚠︎  *(CUT — replaced by the Uniswap volume slide)*

> **Stargate** — unified liquidity pools across chains
> · $60B+ in cumulative cross-chain transfers since 2022
> · TVL sustained above $500M
> · Multi-billion monthly volume through OFT routes
>
> **The OFT standard** — burn on source, mint on destination.
> One canonical supply. No wrapping, no custodial bridge, no fragmented pool.

**Say:** What this shows isn't "omnichain makes number go up." It's that there is
real, sustained, multi-billion-dollar demand for moving value across chains. That
demand is the market your app is either serving or ignoring.

**⚠︎ Refresh all four figures the week of the event.** Sources: DefiLlama, LayerZero
and Stargate docs, LlamaRisk's OFT analysis.

---

## Slide 6 — And Conflux is already living this

> · **USDT0 / CNHT0** — omnichain stablecoins
> · **Stargate integration** — omnichain liquidity routing
> · **Core Space** — Asia-focused RWAs, regulatory-aligned stablecoins
> · **eSpace** — EVM, global DeFi
> · In-wallet Core ↔ eSpace bridge, single signature

**Say:** Conflux is a useful case because it's *internally* multi-space before it's
even multi-chain — and it's built its 2026 story around omnichain stablecoin rails
into Asia. Hand off to the Conflux speaker here if they're following, or reference
their talk if they preceded you.

---

## Slide 7 — Part two: so why doesn't everyone do it?

> **Because this is what "support one more chain" actually means.**

**Say:** Everything so far has been the pitch. Here's the bill.

---

## Slide 8 — The status quo

```ts
// Reading one token balance across five chains, by hand.
import { createPublicClient, http, erc20Abi, formatUnits } from 'viem'
import { mainnet, arbitrum, base, optimism, polygon } from 'viem/chains'

// 1. A client per chain. Each needs its own RPC URL, its own key,
//    its own rate limit, its own billing relationship.
const clients = {
  ethereum: createPublicClient({ chain: mainnet,  transport: http(process.env.ETH_RPC!)  }),
  arbitrum: createPublicClient({ chain: arbitrum, transport: http(process.env.ARB_RPC!)  }),
  base:     createPublicClient({ chain: base,     transport: http(process.env.BASE_RPC!) }),
  optimism: createPublicClient({ chain: optimism, transport: http(process.env.OP_RPC!)   }),
  polygon:  createPublicClient({ chain: polygon,  transport: http(process.env.POLY_RPC!) }),
}

// 2. The same token has a different address on every chain.
//    This table is maintained by hand and goes stale silently.
const USDC = {
  ethereum: '0xA0b8...eB48',
  arbitrum: '0xaf88...6831',
  base:     '0x8335...2913',
  optimism: '0x0b2C...5Ff85',
  polygon:  '0x3c49...3359',
} as const

// 3. Decimals differ per chain for some tokens. Assume nothing.
const DECIMALS = { ethereum: 6, arbitrum: 6, base: 6, optimism: 6, polygon: 6 }

// 4. Your own retry logic, because free-tier RPCs fail and
//    nobody ships this without it after the first 2 AM page.
async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  for (let i = 0; i < tries; i++) {
    try { return await fn() }
    catch (err) {
      if (i === tries - 1) throw err
      await new Promise(r => setTimeout(r, 2 ** i * 250))
    }
  }
  throw new Error('unreachable')
}

// 5. Finally, the thing you actually wanted.
export async function getUsdcBalances(wallet: `0x${string}`) {
  const entries = await Promise.all(
    Object.entries(clients).map(async ([chain, client]) => {
      const raw = await withRetry(() => client.readContract({
        address: USDC[chain as keyof typeof USDC],
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [wallet],
      }))
      return [chain, formatUnits(raw, DECIMALS[chain as keyof typeof DECIMALS])]
    })
  )
  return Object.fromEntries(entries)
}
```

**Say, while scrolling:** Count what's here that has nothing to do with your product.
Five RPC relationships. A hand-maintained address table. A decimals table. Retry
logic. And this is the *easy* version — one token, one call, no prices, no NFTs, no
historical data, and no failover when a provider goes down. Chain six is another
config block and another API key. Chain ten and you have a part-time job.

---

## Slide 9 — The same thing, aggregated

```ts
// Same five chains. One endpoint.
import { Uniblock } from '@uniblock/sdk'

const uniblock = new Uniblock({ apiKey: process.env.UNIBLOCK_KEY! })

export async function getUsdcBalances(wallet: string) {
  return uniblock.balances.getTokenBalances({
    address: wallet,
    chains: ['ethereum', 'arbitrum', 'base', 'optimism', 'polygon'],
    token: 'USDC',
  })
}
```

> ⚠︎ **Verify against Uniblock's docs before stage.** Written from their published
> API surface; exact method names and response shape to be confirmed.

**Say:** Same result. The address table, the decimals table, the five RPC
relationships, and the retry loop didn't get simpler — they moved. They're someone
else's problem now, and that someone runs intelligent routing across 50+ providers
with automatic failover, which is strictly better than the `withRetry` you wrote at
2 AM.

**Speaker note:** Pause here. This is the beat the whole talk is built toward. Let
them look at the two slides.

---

## Slide 10 — The scorecard

| | By hand | Aggregated |
|---|---|---|
| RPC relationships | 5 keys, 5 bills, 5 rate limits | 1 |
| Token address table | You maintain it | Handled |
| Decimals / metadata | You maintain it | Normalized |
| Provider outage | Your pager | Automatic failover |
| Adding chain #6 | New config, new key, new test | One array entry |
| Response shape | Different per provider | One schema |
| Lines of code | ~50 and growing | ~8, flat |

**Say:** The row that matters is the second-to-last one. Not "fewer lines" — *flat*.
The cost of your eleventh chain is the same as your second. That's what an abstraction
layer is actually selling you.

---

## Slide 11 — Now the honest part

> **Add Conflux eSpace to that array today.**
>
> ```ts
> chains: ['ethereum', 'arbitrum', 'base', 'optimism', 'polygon', 'conflux']
> //                                                              ^^^^^^^^^
> //                                                              not routed yet
> ```

**Say:** It doesn't work. Uniblock doesn't route Conflux nodes today. So to add it,
you go back to slide 8 — a viem client, an RPC URL, the eSpace USDT0 address, the
decimals, your own retry. Forty lines and a config file, for chain number six.

**Speaker note:** Deliver this straight, no smirk. This is not a dunk on either
partner — it's the clearest possible demonstration of what the abstraction was worth,
because the room just watched it get removed. Live-code this if the wifi holds.

---

## Slide 12 — So what does adding a chain actually take?

> **The spec — tonight's artifact**
>
> · Reliable RPC endpoints, with at least one fallback provider
> · Canonical token registry — addresses, symbols, decimals, per chain
> · Response normalization into the unified schema
> · Health checks and failover thresholds
> · Historical / archive access if you want more than latest state
> · Explorer and price-source mapping
> · Test vectors: known wallets, known balances, known edge cases

**Say:** This isn't rhetorical. Everything on this list is real work someone has to do
for every chain in a unified API — and it's the same list whether the chain is Conflux
or anything else. We're publishing it as an open issue tonight. If you want to see a
chain routed, this is the shape of the contribution.

---

## Slide 13 — What to do with this

> **Tonight**
> · Clone the starter repo · Get a free Uniblock key · Run it
>
> **This month**
> · Add a chain to the demo and open a PR
> · Contribute to the integration spec
>
> **Next Blockchain Tuesday**
> · Bring what you built — demo slots are open

> ```
> [ QR: starter repo ]     [ QR: integration spec ]
> ```

---

## Slide 14 — Close

> **Fragmented liquidity is a tax.**
> **Fragmented tooling is why we keep paying it.**
>
> Thanks to Uniblock for the space, and to Conflux.
> See you in October.

---

## Q&A — the four you will get

**"Isn't this just centralizing RPC access again?"**
Fair, and worth answering honestly: you're trading direct provider relationships for
one aggregator relationship. The mitigation is that the aggregator routes across many
providers, so provider-level failure is handled — but you should still be able to fall
back to raw RPC, and the starter repo shows exactly how. Don't pretend the tradeoff
isn't real.

**"What's the latency cost of the extra hop?"**
Real question, and the honest answer is measure it for your use case. Note the offset:
intelligent routing to the fastest available provider can beat a single hardcoded RPC
having a bad day. Offer to benchmark it live in the social half.

**"Isn't the trend consolidation? Fewer chains, less attack surface."** ← MOST LIKELY
This is the sharpest objection, and the two slides "More chains does not mean
more volume" and "Deploy few. Read many." exist to meet it head on. The strongest
facts to have ready: Aerodrome runs on one chain and has out-traded Curve on
twenty ($411B vs $345B); Raydium on one chain has done nearly as much cumulative
volume as Curve, Sushi and Balancer combined across fifty-three; and Curve and
Sushi both went multichain and saw their off-home share *fall*. Agree
with it: chain count is a vanity metric, three of the six largest DeFi protocols
are single-chain, and $2.8B has been stolen through bridges. Then draw the
distinction that resolves it &mdash; deploying to a chain and reading from one are
different acts with different costs. Consolidate the deploys; spread the reads.
Do not argue the objection down; it is correct as far as it goes.

**"Does omnichain actually raise TVL, or do good protocols just do both?"**
The sharp version of the question, and the answer is that the causality is genuinely
hard to isolate. Fall back to the mechanism argument on slide 4 — the ceiling is real
even where the uplift is hard to attribute.

**"When will Conflux be supported?"**
Straight to the Uniblock speaker. Don't answer it for them.
