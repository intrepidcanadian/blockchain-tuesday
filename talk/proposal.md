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

## 4. Venue — the Uniblock offices

Hosting in Uniblock's own space is the right call. It removes the single largest
budget line, it makes the wifi and AV a known quantity instead of a gamble, and an
office is a better room for the social half of the night than a lecture hall — people
linger, laptops come out, conversations keep going past 8:30.

Two things to manage, neither difficult.

**Capacity sets the plan, not the other way around.** Confirm the real number early —
not the fire-code number, the number where people can still hear the speaker and get
to the food. Every downstream decision (Luma cap, pizza count, chair rental, promo
intensity) keys off it. If the room holds 30, that's a good Blockchain Tuesday; don't
oversell it into a bad one.

**Neutrality.** Blockchain Tuesday is a community brand, and being in a sponsor's
office nudges it toward reading as a Uniblock event. Cheap fixes: keep the Blockchain
Tuesday name first on the Luma page and the signage, give Conflux the closing speaker
slot rather than the opener (last speaker is the one people remember), and have Tony —
not a Uniblock employee — do the welcome and the close. Uniblock gets the hosting
credit, which is worth more than top billing anyway.

### Confirm with Uniblock on the pre-call

- Seated and standing capacity for the presentation area
- After-hours building access — does the front door lock at 6? Is there a security
  desk, a sign-in sheet, an elevator fob, a freight elevator for the food?
- Who from Uniblock is on-site until 9:00 and holds the keys at the end
- Screen or projector: resolution, HDMI vs USB-C, whether there's sound
- Guest wifi — network name, password, and whether it throttles at 30+ devices
- Food policy: is hot food fine, where does the garbage go, is there a kitchen or
  fridge, who takes out the trash
- Alcohol: allowed or not. Assume not unless told otherwise, and don't buy any until
  it's explicitly cleared — it's a liability question for their landlord, not a
  preference question
- Accessibility: step-free entrance, accessible washroom, elevator. This goes on the
  Luma page verbatim
- Anything in the office that shouldn't be photographed — whiteboards, monitors,
  roadmap docs on walls. Ask before the photographer arrives, not after

---

## 5. Budget — $1,000 CAD

With the venue donated, the $150 venue line is gone. It goes to content and to a
larger contingency, plus a small line for the things an office host shouldn't have to
absorb.

| Line | Amount | Detail |
|---|---:|---|
| Food | $480 | Pizza for ~45 (approx. 16–18 large @ ~$26 delivered). Scale to confirmed capacity. Includes vegetarian and halal options — non-negotiable, roughly a third of the order |
| Drinks | $110 | Pop, sparkling water, still water, ice, cups, napkins |
| Venue extras | $70 | Garbage bags, paper towel, disinfectant wipes, table cover for the food surface, folding chairs if the office is short. Leave the office cleaner than you found it — this is what gets you invited back |
| Supplies | $60 | Name tags, markers, HDMI + USB-C adapters, power bar, extension cord |
| Print & signage | $50 | Lobby/door wayfinding sign (important in an office — people get lost), sponsor cards for the food table, QR standees for the repo and Luma |
| Photo / content | $150 | Community photographer stipend plus clip editing, so the demo becomes a shareable video. Every past event that got photographed still earns you reach — the cheapest marketing line on the list |
| Contingency | $80 | Someone always needs a cable, and an unfamiliar building always costs you something |
| **Total** | **$1,000** | |

**Not in this budget, by design:** no prizes. The $1,000 buys turnout and repeat
attendance, which is the actual goal. A bounty or prize pool, if either sponsor wants
one, sits on top as separate sponsor spend — and is the natural upgrade for an
October or November follow-up.

---

## 6. What each partner gets

Neither partner presents separately this time, so what they get is different —
and in one respect better.

**Uniblock**
- **Hosting credit** — "hosted at the Uniblock offices" on the Luma page, the
  signage, the recap post and every photo taken that night. Forty developers
  spend three hours inside their office and leave with a physical sense of the
  company. No sponsor line item buys that
- **Their product is the spine of the technical half**, demonstrated live by
  someone who is not on their payroll, for roughly thirty minutes — considerably
  more airtime than a twenty-minute slot of their own would have given them
- A chair in Q&A, which is where roadmap questions belong anyway
- A concrete signal on Conflux integration demand, generated by the room
- Logo on Luma, signage, slides, and the recap post
- Attendee funnel: the starter repo needs a free Uniblock key

> **Set this expectation on the pre-call.** The talk is an honest-broker one. It
> concedes on stage, with measurements, that raw RPC beats Uniblock on a plain
> balance lookup and that a free explorer beats it on single-chain discovery. It
> then argues the real case — spanning chains *and* exchange venues in one loop,
> which no node or explorer can do. That concession is what makes the rest
> credible to this audience, but a sponsor should hear it from Tony first.

**Conflux**
- The **decimals finding** is theirs and it is the sharpest technical detail in
  the deck — eSpace USDC at 18 decimals against 6 everywhere else, read on-chain
- Positioned to Toronto developers as an omnichain and Asia-RWA story rather
  than a generic L1
- A documented public case for inclusion in a major aggregator
- A chair in Q&A
- Continuity with work already in market — the ETH Toronto agentic economy panel,
  the x402 Hackfest workshop, the eSpace tutorials
- Same logo and recap placement

**Both**
- A recap post with photos, the recording and the repo — evergreen, and the asset
  that makes the next sponsor conversation easy

## 7. Timeline

**4 weeks out (Aug 18)**
Partner pre-call. Confirm speakers, confirm the demo framing, get logos and bios, and
walk the full venue checklist above — capacity, building access, AV, wifi, food and
alcohol policy, accessibility. **Visit the office in person if you can**; ten minutes
standing in the room answers questions a call won't. Set the Luma cap to the confirmed
capacity and put the page live — invite to roughly 1.5× the cap, since Luma
show-rate runs 65–70%.

**3 weeks out (Aug 25)**
Announcement post with the accessibility and building-access details on it. Both
partners cross-post. Starter repo skeleton pushed public.

**2 weeks out (Sept 1)**
Speaker abstracts and slide deadline. Second promo push — student groups (UofT,
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

## 8. Risks and the plan for each

| Risk | Plan |
|---|---|
| **Office capacity caps the event** | Confirm the real number 4 weeks out and cap Luma to it. A full room of 30 reads better in photos and in the room than a half-empty 60 |
| **People can't get into the building** | Lobby greeter from 5:45, building instructions in the reminder email and on the Luma page, a phone number on the door sign. This is the #1 way an office event loses attendees who already showed up |
| **Venue evaporates if the partnership shifts** | Have one backup space loosely identified before you announce. You don't need it booked — you need to know who to call |
| Wifi can't carry a live RPC demo | Much lower risk now that you can test on the real network a week out. Still record the demo in advance as a fallback and narrate over it if needed. Never live-code without an escape hatch |
| Sponsor framing friction over the integration gap | Settle on the pre-call, 4 weeks out. Generic-6th-chain fallback ready |
| Event reads as a Uniblock ad | Blockchain Tuesday branding first, Tony opens and closes, Conflux takes the later slot. Covered above |
| Low turnout | Over-invite to ~1.5× capacity. Student group outreach is the highest-yield channel in September |
| Room splits — devs bored, beginners lost | The no-code segment is placed early and deliberately; the deep material is in the demo, which is watchable even if you can't follow every line |
| Speaker drops | Tony covers with an extended demo plus the omnichain-stablecoin material |

---

## 9. What success looks like

- Room at 80%+ of the confirmed office capacity, with people staying past 8:30
- Uniblock offers the space again for a future event — the clearest signal you ran it well
- 15+ clones or forks of the starter repo in the week after
- The integration spec exists as a public artifact with more than one contributor
- Both partners publicly amplify the recap
- A committed date and at least one confirmed partner for October before the room
  empties on the night
