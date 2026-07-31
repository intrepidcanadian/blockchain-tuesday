---
name: Add a chain
about: Propose a chain for the unified read path
title: 'Add a chain: '
labels: chain-integration
---

See `docs/chain-integration-spec.md` for what each section means. A partial
answer with real endpoints and a verified token table is far more useful than a
request with none — fill in what you know and leave the rest.

**Chain**

<!-- Name, chain ID, EVM-compatible? -->

**1. Endpoints**

- Primary RPC:
- Fallback RPC (independent provider):
- Archive access:
- Rate limits / known quirks:

**2. Token registry**

<!-- Address AND decimals. Do not assume 6 — verify on-chain. -->

| Token | Address | Decimals | Native or bridged? |
|---|---|---|---|
|  |  |  |  |

**3. Explorer**

- Transaction URL pattern:
- Address URL pattern:

**4. Test vectors**

<!-- A wallet with a known non-zero balance, so regressions are detectable. -->

**5. Anything that will surprise an integrator**

<!-- Non-standard decimals, unusual finality, log range limits, a dual-space
     architecture, anything you had to learn the hard way. -->
