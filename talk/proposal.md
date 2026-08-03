# Blockchain Tuesday — September 2026

## "Observability Is All You Need"

*Why unified APIs are becoming useful*

**Presented with Uniblock and Conflux Network**
Hosted at the Uniblock offices, Toronto · Tuesday, September 15, 2026 · 6:00–9:00 PM
Host: Tony Lau · Budget: $1,000 CAD

---

## 1. The idea

**"Observability Is All You Need"** — why unified APIs are becoming useful.

The talk opens on a concession, because that is what makes the rest credible to
a room of developers. Unified APIs are *slower* than talking to a node directly:
268ms against 5.5 seconds, measured. On a single chain, a free open-source
explorer returns more data than the paid aggregator, faster, with no key. If the
pitch were "this is faster", someone disproves it with curl inside a minute.

So the question worth an evening is not whether unified APIs are good. It is
**why they are becoming useful now, when they were not before** — and the thing
that changed is not the APIs.

It is that agents ask different questions. "What is the balance of this token"
has a node method and always did. "What do I hold, what is it worth, where is
the edge" does not — `eth_getTokenBalances` does not exist, prices are not
on-chain in readable form, and neither Hyperliquid's funding nor Polymarket's
odds live on a chain at all. Those are the questions an agent has to answer
before it can do anything, and no node can be asked them at any speed.

The evening is in two halves:

- **The economics.** Is being on more chains even worth it? Measured across 147
  chain launches, the answer depends entirely on what you are building — lending
  protocols beat the market on 87% of their launches, DEXes on 24%.
- **The code.** One area where it is becoming more valuable is reading across
  multiple chains and venues — and that is where a unified API earns its place,
  for the simplicity and the speed of building alongside an agent.

Everything is demonstrated live from a repo the room can clone, ending on a
cross-venue scan that joins on-chain balances, Hyperliquid funding and Polymarket
odds through one key.

## 2. Date

| Option | Date | Assessment |
|---|---|---|
| **Recommended** | **Tue Sept 15** | Students back two weeks, past the Labour Day dead zone, clear runway to promote. |
| Backup | Tue Sept 22 | Equally fine. Slightly more competition from fall conference season. |
| Avoid | Tue Sept 1 | Pre-Labour Day, half the city is away. |
| Avoid | Tue Sept 8 | Day after Labour Day. Attendance historically drops. |
| Marginal | Tue Sept 29 | End of month, competes with quarter-end and travel. |

---

## 3. Run of show

Tony delivers the whole talk. Both partners join for Q&A rather than presenting
separately — one voice through the argument, and the deck already carries their
material where it belongs.

| Time | Segment | Notes |
|---|---|---|
| 5:45 | Lobby greeter in place | Essential in an office building — one person at the door or elevator bank with a sign, texting the group chat if anyone is stuck at security |
| 6:00 | Doors, food, name tags | Food out immediately; people arrive hungry and leave early otherwise |
| 6:30 | Welcome + community update | 5 min. What Blockchain Tuesday is, what's coming, who wants to announce they are hiring |
| 6:30 – 7:30 | **Presentation and Q&A** | Tony, with a chair each for Uniblock and Conflux on questions |
| 7:30 – 8:30 | Social | The part people actually stay for |
| 8:45 | Cleanup starts quietly | Bags, surfaces, chairs back. Don't leave it to the Uniblock team |
| 9:00 | Out, hard stop | Someone from Uniblock has to lock up and go home |

**On the timing.** Roughly 45 minutes of presentation with Q&A.

---

## 4. Venue

**Uniblock offices — 20 Bay Street, 11th Floor, Toronto, ON M5J 2N8**

**Target: 20–40 people.**

---

## 5. Who covers what

### Uniblock

The venue and everything attached to it.

- The office, from 5:30 until the 9:00 hard stop
- AV: screen or projector, HDMI and USB-C, sound
- Guest wifi that holds up with 40 devices on it
- Building access — door codes, security desk, elevator, a named on-site contact
  who holds the keys at the end

### Conflux — food and drinks, ~$800

| Line | Detail |
|---|---|
| Food | Pizza or other catered food (wraps / sandwiches) |
| Drinks | Pop, sparkling water, still water, ice, cups, napkins |

### Other — ~$200

Photography, signage, name tags, adapters and the small things an office host
shouldn't have to absorb — bags, wipes, a table cover for the food surface.

**Total: $1,000 CAD.** Venue and AV are in kind on top of that.

---
