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
  protocols beat the market on 87% of their launches, DEXes on 24%. For a lot of
  the room the honest answer is no.
- **The code.** If deploying to more chains mostly does not pay, then whatever is
  worth doing across chains is not deployment. It is reading — and that is where
  a unified API earns its place.

Everything is demonstrated live from a repo the room can clone, ending on a
cross-venue scan that joins on-chain balances, Hyperliquid funding and Polymarket
odds through one key.

### Where Conflux comes in

Conflux is the worked example for what integrating a new chain actually costs.
eSpace USDC is **18 decimals** against 6 on every other chain in the demo — read
from the contract, not a doc. Copy the constant across and every number is wrong
by a factor of a trillion, silently, with every test still green.

That is the most useful integration lesson in the talk, it is specific to
Conflux, and it is flattering in the way that matters to a developer audience.
Uniblock does not route Conflux today, so the demo adds it by hand — which is
also the setup for the closing artifact: a public spec for what adding a chain
to a unified API requires.

> **Framing note:** walk both partners through this on the pre-call. It reads as
> roadmap, not gap — Uniblock gets a concrete signal on integration demand,
> Conflux gets the case for being next. If either is uncomfortable, the fallback
> is a generic sixth chain for the contrast.

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
| 6:30 | Welcome + community update | 5 min. What Blockchain Tuesday is, what's coming, who's hiring |
| 6:35 | **Part 1 — the economics** | 20 min. Is being on more chains even worth it? Fragmentation, the event study, and why the answer depends on what you are building |
| 6:55 | Questions, hands up | 10 min. Deliberately mid-talk — it resets attention before the technical half |
| 7:05 | **Part 2 — the code** | 30 min. Live from the repo: raw RPC versus the aggregator, what an agent asks, the cross-venue scan, and adding Conflux by hand |
| 7:35 | **Q&A — three chairs** | 20 min. Tony plus one voice each from Uniblock and Conflux. This is where partners answer for their own roadmaps |
| 7:55 | Call to action + close | 5 min. Repo QR, integration spec, next event, demo slots for October |
| 8:00 | Social, laptops open | The part people actually stay for |
| 8:45 | Cleanup starts quietly | Bags, surfaces, chairs back. Don't leave it to the Uniblock team |
| 9:00 | Out, hard stop | Someone from Uniblock has to lock up and go home |

**On the timing.** Roughly 45 minutes of presentation across the two halves, with
the mid-talk question slot as a natural buffer if part 1 runs long.

## 4. Venue

**Uniblock offices — 20 Bay Street, 11th Floor, Toronto, ON M5J 2N8**

**Target: 20–40 people.**

Hosting in Uniblock's own space removes the single largest budget line, makes the
wifi and AV a known quantity rather than a gamble, and gives the social half a
better room than a lecture hall — people linger, laptops come out, conversations
keep going past 8:30.

**Neutrality.** Blockchain Tuesday is a community brand, and being in a sponsor's
office nudges it toward reading as a Uniblock event. Cheap fixes: Blockchain
Tuesday name first on the Luma page and the signage, Tony does the welcome and
the close, and Conflux gets food sponsor credit alongside Uniblock's hosting
credit. Hosting credit is worth more than top billing anyway.

**Wayfinding matters more than it sounds.** An 11th-floor office at 6pm means a
locked lobby, a security desk or a fob, and an elevator. The single biggest way
an office event loses people is that they arrive and cannot get in — hence the
greeter from 5:45 and building instructions on the Luma page rather than just an
address.

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

**No prizes, by design.** The money buys turnout and repeat attendance. A bounty
or prize pool sits on top as separate spend, and is the natural upgrade for an
October or November follow-up.

---

## 6. Timeline

**4 weeks out (Aug 18)**
Partner pre-call. Confirm the framing and the concessions, agree the food budget and who pays the vendor, get logos, and
confirm building access, AV, wifi, food policy and accessibility with Uniblock. **Visit the office in person if you can**; ten minutes
standing in the room answers questions a call won't. Set the Luma cap to the confirmed
capacity and put the page live — invite to roughly 1.5× the cap, since Luma
show-rate runs 65–70%.

**3 weeks out (Aug 25)**
Announcement post with the accessibility and building-access details on it. Both
partners cross-post. Starter repo skeleton pushed public.

**2 weeks out (Sept 1)**
Slides locked. Second promo push — student groups (UofT,
TMU, Waterloo Blockchain), Toronto dev Discords and Telegrams. Confirm photographer,
and confirm the office is comfortable being photographed.

**1 week out (Sept 8)**
Demo rehearsed end to end **on the office's actual guest wifi** — the whole point of
hosting there is that you can test this for real. Food ordered with the delivery
address, buzzer code and a phone number that will be answered. Print signage.
Reminder email with building entry instructions, not just an address.

**Day of (Sept 15)**
Arrive 4:30. AV test by 5:00 — HDMI, adapters, sound, screen resolution, guest wifi
under load. Confirm the lobby greeter and the Uniblock on-site contact. Food arrives
5:45 (make sure someone can meet the delivery downstairs). Doors 6:00.

**Week after**
Recap post, photos, recording, repo link. Ask both partners to amplify. Open the
"what a chain integration needs" spec as a public issue. Announce October.

---

## 7. Risks and the plan for each

| Risk | Plan |
|---|---|
| **Room fills or it doesn't** | Cap Luma at 40 and invite ~60. A full room of 25 reads better in photos and in the room than a half-empty 50 |
| **People can't get into the building** | Lobby greeter from 5:45, building instructions in the reminder email and on the Luma page, a phone number on the door sign. This is the #1 way an office event loses attendees who already showed up |
| **Venue evaporates if the partnership shifts** | Have one backup space loosely identified before you announce. You don't need it booked — you need to know who to call |
| Wifi can't carry a live RPC demo | Much lower risk now that you can test on the real network a week out. Still record the demo in advance as a fallback and narrate over it if needed. Never live-code without an escape hatch |
| Sponsor framing friction over the honest framing | Settle on the pre-call, 4 weeks out. Both partners should hear the concessions from Tony before the room does. Generic-6th-chain fallback ready |
| Event reads as a Uniblock ad | Blockchain Tuesday branding first, Tony delivers throughout, Conflux credited on food. Covered above |
| Low turnout | Over-invite to ~1.5× capacity. Student group outreach is the highest-yield channel in September |
| Room splits — devs bored, beginners lost | Part 1 is economics and needs no code to follow. The deep material is in part 2, which is watchable even if you can't follow every line |
| A partner can't make Q&A | Tony answers for the room and defers roadmap questions to a follow-up. The talk itself does not depend on either of them being present |

---

## 8. What success looks like

- Room at 80%+ of the confirmed office capacity, with people staying past 8:30
- Uniblock offers the space again for a future event — the clearest signal you ran it well
- 15+ clones or forks of the starter repo in the week after
- The integration spec exists as a public artifact with more than one contributor
- Both partners publicly amplify the recap
- A committed date and at least one confirmed partner for October before the room
  empties on the night
