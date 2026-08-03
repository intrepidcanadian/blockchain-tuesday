# Talk materials — Blockchain Tuesday, September 2026

**"Observability Is All You Need"** — why unified APIs are becoming useful.

## `deck.html`

The talk itself, **24 slides**. Open it in a browser — no build step, and no
server needed, because the deck makes no network requests at all:

```bash
open talk/deck.html
```

That matters on the night: you can present straight from the file with no server
and no wifi.

- **arrow keys / space** — move
- **N** — speaker notes (every slide has them, and they carry the caveats)
- **F** — fullscreen

Speaker notes are the source of truth for what to *say*, including the places
where a number needs qualifying out loud. Read them before presenting.

### The shape

| | |
|---|---|
| **1–2** | Title, and the question the economics half answers |
| **3–9** | *The economics.* Fragmentation, CCTP, Uniswap volume share, eight DEXes, the 147-launch event study, deploy few / read many, Conflux |
| **10–21** | *The code.* By hand vs aggregated, what an agent asks, the cross-venue join, the six layers, the scorecard, adding Conflux |
| **22–24** | *The artifact.* The nanobot harness, the integration spec, and the close |

### If you are editing it and want to preview

Use the bundled server rather than `python -m http.server`:

```bash
python3 talk/nocache_server.py 4830
```

`http.server` sends no `Cache-Control`, so a browser will keep serving the old
deck after you have edited it — which looks exactly like "my changes did not
save". This one sends `no-store`.

## `proposal.md`

The event proposal: the idea, date reasoning, run of show, venue, and who covers
what.

## Raw data

`event-study.json`, `event-split.json`, `hacks.json` and `chain-growth.json` are
the aggregates behind the economics slides, committed so the analysis is
reproducible.

## Before presenting

1. **Re-pull every figure.** All market data came from APIs and moves. The
   Uniswap volume-share chart, the eight-DEX table, the event study and the
   ether.fi migration numbers all need refreshing the week of the event.
2. **Run the demos live once.** `npm run compare`, `npm run agent` and
   `npm run cross` all need a working Uniblock key with providers connected —
   see the root README.
3. **Do not soften the concessions.** The deck states on stage that raw RPC beats
   the aggregator on a plain balance lookup, that Blockscout beats it free on one
   chain, and that a figure quoted from a blog turned out to be wrong. Those are
   what make the rest of the argument credible to this audience.
