# Blockchain Tuesday — September 2026

## "Why Unified APIs Are Becoming Useful"

**Presented with Uniblock and Conflux Network**
Hosted at the Uniblock offices, Toronto · Tuesday, September 15, 2026 · 6:00–9:00 PM
Host: Tony Lau · Budget: $1,000 CAD

---

## 1. The idea

Most builders in the room have hit the same wall: the app works on one chain, and
then the second chain doubles the code. Different RPC providers, different rate
limits, different token metadata shapes, different failure modes at 2 AM.

Uniblock's whole product is the answer to that — one endpoint, 160+ chains, 50+
RPC providers, with routing that picks the fastest/cheapest source and fails over
automatically. Conflux is the case study on the other side of the glass: a dual-space
chain (Core Space for Asia-focused RWAs and regulatory-aligned stablecoins, eSpace
for global EVM DeFi) that is already omnichain in practice through USDT0/CNHT0 and
Stargate liquidity.

So the night has a spine, not just two sponsor decks: **what does it actually take
to treat many chains as one?** Uniblock answers from the aggregator side. Conflux
answers from the chain side. Then we build something live in front of everyone.

### The honest part, used deliberately

Uniblock does not currently route Conflux nodes. Rather than paper over that, it
becomes the most interesting fifteen minutes of the evening — and the reason people
come back in October.

**The title is a question, and the honest answer starts with a concession.**

Unified APIs are *slower* than talking to a node directly — measured, 268ms
against 5.5 seconds. On a single chain a free open-source explorer (Blockscout)
returns more data than the paid aggregator, faster, with no key. If the pitch
were "this is faster", someone in that room disproves it with curl inside a
minute.

So the talk is not "unified APIs are good". It is **why they are becoming useful
now, when they were not before** — and the thing that changed is not the APIs.
It is that agents ask different questions. "What is the balance of this token"
has a node method. "What do I hold, what is it worth, where is the edge" does
not — `eth_getTokenBalances` does not exist, prices are not on-chain, and
Hyperliquid's funding and Polymarket's odds are not on a chain at all.

That reframe is what makes the evidence land instead of sounding like a pitch.

**This section was rewritten after building the talk, because the original plan
did not survive contact with the API.**

The original idea was: read balances across five chains in one Uniblock call,
then add Conflux by hand and watch six lines become forty. It does not work.
Uniblock's `chainId` parameter is singular, so the aggregated path loops exactly
like the by-hand one — and measured head to head, **raw RPC won**: 268ms and five
of five chains, against 5.5 seconds and four of five. An aggregator cannot beat a
node at a lookup you already know how to make, and pretending otherwise in a room
of developers loses it in thirty seconds.

So the demo moved to the question an aggregator genuinely answers. An agent does
not know what it holds, what it is worth, or where the edge is, and **two of those
have no RPC method at all** — `eth_getTokenBalances` does not exist, and prices
are not on-chain in readable form. Nor is Hyperliquid's funding, or Polymarket's
odds.

The live demo is now a cross-venue scan: where is the capital, what are perps
paying, what is the crowd pricing — three venues, one key — ending on a
calculation neither venue can perform alone. Then Conflux, which nothing routes,
comes back by hand.

The room sees the abstraction's value where it actually exists: not in speed, but
in reaching things a node cannot be asked about at all.

And the closing slide is a real call to action: here is the spec for what adding a
chain to a unified API requires. That's a public artifact the community can work on,
and a natural agenda item for the next event.

> **Framing note:** agree this angle with both partners on the pre-call. It only
> works if it reads as *roadmap*, not *gap* — Uniblock gets to talk about how chains
> get onboarded, Conflux gets to make the case for why it should be next. If either
> side is uncomfortable, the fallback is a generic 6th chain for the contrast and
> Conflux stays purely on the omnichain-stablecoin story.

### Why this room, this month

- **Mixed audience is handled.** The Uniblock segment includes the no-code path, so
  students and non-devs build a working multi-chain dashboard in the same session
  where the senior devs are reading routing logic. Nobody is stranded.
- **September is a recruiting month.** Students are back, hackathon season is
  starting. An event that ends with "here's a repo you can clone" converts better in
  September than any other month of the year.
- **It continues your existing arc.** ERC-20 & omni-tokens via LayerZero (Nov 2024),
  Build a Blockchain AI Agent (Jan 2025), x402, Prediction Markets & APIs (Apr 2026).
  This is the same thread — APIs and payments across chains — pulled one step further.

---

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

| Time | Segment | Who | Notes |
|---|---|---|---|
| 5:45 | Lobby greeter in place | Volunteer | In an office building this is essential — one person at the front door or elevator bank with a sign, texting the group chat if anyone gets stuck at security |
| 6:00 | Doors, food, name tags | — | Food out immediately; people arrive hungry and leave early otherwise |
| 6:30 | Welcome + community update | Tony | 5 min. What Blockchain Tuesday is, what's coming, who's hiring |
| 6:35 | **The multi-chain problem** | Uniblock | 20 min + 5 Q. Unified API, intelligent routing, failover. Include the no-code dashboard path for the newer half of the room |
| 7:00 | **A chain worth integrating** | Conflux | 20 min + 5 Q. Core Space vs eSpace, USDT0/CNHT0 omnichain stablecoins, Stargate liquidity, what Asia-facing RWA rails look like |
| 7:25 | **Live build: the cross-venue agent** | Tony | 35 min &mdash; see the timing note below. Ends on the "what a chain integration needs" spec |
| 8:00 | Open Q&A / three chairs | All | 15 min. Both sponsors + Tony, audience questions |
| 8:15 | Call to action + close | Tony | Repo QR, next event, how to get involved |
| 8:20 | Social, laptops open | — | The part people actually stay for |
| 8:45 | Cleanup starts quietly | Volunteers | Garbage bagged, surfaces wiped, chairs back. Don't leave this to the Uniblock team |
| 9:00 | Out, hard stop | — | Respect the hard stop absolutely. Someone from Uniblock has to lock up and go home |

### Timing — this needs a decision before the pre-call

The deck is **28 slides**. At a realistic pace that is 35–40 minutes, not the 20
originally planned. Three ways out, in order of preference:

1. **Give Tony 35 minutes and trim the sponsor slots to 15 each.** The run of show
   above assumes this. It ends at 8:15 rather than 8:00, which still leaves 45
   minutes of social before the hard stop. Needs both sponsors to agree on the
   pre-call — do not spring it on them.
2. **Keep 20 minutes and cut the deck to ~16 slides.** The economics section
   carries four worked examples where one would do, and three of the demo-output
   slides make the same "here is proof" point. A 16-slide cut exists and is
   straightforward.
3. **Split it.** Run the economics half in September and the agent half in
   October, which gives the next event a spine rather than a blank page.

Option 1 is the recommendation, but it is a conversation with two sponsors about
their own stage time, so have it early.

**Target:** capacity-dependent — see the venue section below. Set the Luma cap at the
office's real seated-plus-standing number, and invite to roughly 1.5× that (Luma
show-rate runs 65–70%).

---

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

**Uniblock**
- Hosting credit — "hosted at the Uniblock offices" on the Luma page, the signage,
  the recap post and every photo taken that night. Forty developers spend three hours
  inside their office and leave with a physical sense of the company. No sponsor line
  item buys that
- 20-minute technical stage slot to the exact audience that buys developer infra
- A live demo where a third party — not their own marketing — shows what their
  abstraction reaches, in code, in real time
- **Set this expectation on the pre-call:** the talk is an honest-broker one. It
  concedes on stage that raw RPC beats Uniblock on a plain balance lookup, with
  measurements, and that Blockscout beats it on single-chain discovery — for free.
  It then argues the aggregator's real case, which is spanning chains *and*
  exchange venues in one loop, something no explorer or node can do. That
  concession is what makes the rest credible to this audience, but a sponsor
  should hear it from Tony before they hear it from the stage
- A concrete signal on Conflux integration demand, generated by the room
- Logo on Luma, signage, slides, and the recap post
- Attendee sign-up funnel: the starter repo needs a free Uniblock key

**Conflux**
- The later speaking slot — last voice before the demo, which is the one the room
  remembers. Deliberate counterweight to Uniblock hosting the room
- 20-minute slot positioning Conflux to Toronto developers as an omnichain and
  Asia-RWA story, not a generic L1
- A documented case for inclusion in a major aggregator, made publicly
- Continuity with the Conflux work already in market — the ETH Toronto agentic
  economy panel, the x402 Hackfest workshop, the eSpace tutorials
- Same logo and recap placement

**Both**
- A recap post with photos, the recording, and the repo — evergreen, and it's the
  asset that makes the *next* sponsor conversation easy

---

## 7. Timeline

**4 weeks out (Aug 18)**
Partner pre-call. Confirm speakers, confirm the demo framing, get logos and bios, and
walk the full venue checklist above — capacity, building access, AV, wifi, food and
alcohol policy, accessibility. **Visit the office in person if you can**; ten minutes
standing in the room answers questions a call won't. Set the Luma cap to the confirmed
capacity and put the page live.

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
