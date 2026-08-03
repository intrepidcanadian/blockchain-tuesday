# Talk materials — Blockchain Tuesday, September 2026

**"Observability Is All You Need"** — why unified APIs are becoming useful.

## `deck.html`

The talk itself, 19 slides. Open it in a browser — no build step, and no server
needed, because the deck makes no network requests at all:

```bash
open talk/deck.html
```

That matters on the night: you can present straight from the file with no
server and no wifi.

### If you are editing it and want to preview

Use the bundled server rather than `python -m http.server`:

```bash
python3 talk/nocache_server.py 4830
```

`http.server` sends no `Cache-Control`, so a browser will keep serving the old
deck after you have edited it — which looks exactly like "my changes did not
save". This one sends `no-store`.

- **arrow keys / space** — move
- **N** — speaker notes (every slide has them, and they carry the caveats)
- **F** — fullscreen

Speaker notes are the source of truth for what to *say*, including the places
where a number needs qualifying out loud. Read them before presenting.

## `proposal.md`

The event proposal: date reasoning, $1,000 CAD budget, run of show, venue
checklist for hosting at the Uniblock offices, risks, and success criteria.

## `outline.md`

**Superseded** by the deck for slide content — its "Slide N" headings refer to
an older 14-slide version. Kept for two things that are still current: the
pre-stage verification checklist, and the Q&A preparation.

## Before presenting

1. **Re-pull every figure.** All market data came from the DefiLlama API and
   moves. The Uniswap volume-share chart, the eight-DEX table and the ether.fi
   migration numbers all need refreshing the week of the event.
2. **Run `node src/agent-scan.js` live once.** It depends on a working Uniblock
   key with providers connected — see the root README.
3. **Read the notes on the scorecard slide.** It concedes that raw RPC beats the
   aggregator on a plain balance lookup. That concession is deliberate and it is
   what makes the rest of the argument credible. Do not soften it.
