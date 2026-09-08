# Product Thesis

**Status:** written 2026-09-01 from completed research · Persona: product manager
**Depends on:** `01-landscape.md`, `02-feature-matrix.md`, `_theme-business-model.md`,
`_theme-red-team.md`, `_theme-voice-of-customer.md`, `_theme-data-integration.md`

---

## The recommendation, up front

**Do not build a commercial trading journal. Build the features into our own
journal, and gate any commercial move behind two cheap tests that we have not
yet run.**

This is not a hedge. The research produced a real wedge and a real technical
advantage, and it also produced an economic picture in which those are not
enough. Both halves are load-bearing, and the second half is the one that
decides.

---

## 1. What the evidence actually says

### The market is small and the money is thin

| Fact | Value | Source |
|---|---|---|
| Category revenue (top-down cross-check) | **$40M–$180M/yr, central ~$90M** | `_theme-business-model.md` |
| Paying subscribers worldwide | 25k–400k, central 100–150k | ibid. |
| Modal entry price | **$29.95/mo**, ceiling $99 | `01-landscape.md` |
| Realized ARPU after annual discounts | $24–30 | `_theme-business-model.md` |
| Monthly churn | **7–10%**, with a ~6.6% floor from traders quitting trading | ibid. |
| LTV | $170–215 | ibid. |
| Affiliate commission (the dominant channel) | **20–30%, recurring, often lifetime** | ibid. |
| Resulting gross margin | **~53%** (84–92% on infrastructure alone, walked down by affiliate share, LLM COGS and support) | ibid., `05-build-plan.md` |

A ~$90M category split a dozen ways is one mid-sized vertical SaaS. That is not
disqualifying on its own — a one-person product taking 0.5% of it would be a
good outcome. What is disqualifying is the combination of that ceiling with a
53% gross margin, a 7–10% monthly churn floor set by customers *leaving the
activity*, and 56–81 person-weeks of build (`05-build-plan.md`) before the first
dollar.

### Distribution, not product, is the barrier

This is the finding that should change the decision. Acquisition in this
category runs through trading-educator affiliates at 20–30% recurring and often
lifetime commissions. The review and comparison SEO layer is funded by the same
commissions — the study had to exclude six "review" publishers that sell rival
journals (`00-method.md` §4a). TradeZella's founder had a 750k-subscriber
YouTube channel *before* launch.

That is the category's actual business model. A better product with no audience
does not win here; it does not even get evaluated. We have no audience, no
educator relationships, and no plan to acquire either.

The red team sharpened this into the explanation for the whole competitive
picture: **equity intraday has no prop-style affiliate channel.** That, not
market size, is the most plausible reason the specialists vacated.

### The segment is growing — that part survived

The counter-hypothesis (the segment was abandoned because it is dying) failed
outright:

- Retail engagement drove a **+44% YoY rise in US equity volume in 2025** `[V]`
- **FINRA 26-10 abolished the PDT rule and the $25k minimum, effective
  2026-06-04** `[V]` — removing the single largest structural barrier to entry
  for new US equity day traders

So the demand side is genuinely improving. But "vacated" was an overstatement:
five multi-asset incumbents serve this trader today and one shipped DAS
auto-sync in 2026. What is vacant is **specialists**, and Chartlog — the closest
positional match — looks like founder attrition rather than segment death.

### Our supposed technical moat is not one

The red team falsified it. Our enrichment substrate (order-aware Max R, MAE,
gap-free ADR, 30-minute ATR, bracket counterfactual) is 983 lines. TradesViz
ships MFE/MAE at *finer* resolution, plus EOD-exit counterfactuals and ATR/gap
context, z-test-gated, at $20–27/mo. Chartlog gives MFE/MAE away at $14.99.

Worse, Polygon's terms forbid serving that data to anyone but ourselves, so the
substrate as built is not shippable to a second user at all without a display
licence.

**Treat the substrate as a personal asset, not a competitive one.**

---

## 2. The wedge is real, and it is smaller than it first looked

The one thing this study found genuinely unserved, from three independent
directions:

> **Every schema in the category starts at "a fill happened."** Journals compete
> on exit quality — five vendors ship real, differently-architected exit
> analytics — and *not one* ships entry-quality decomposition. Exit quality is
> computable from bars alone. Entry quality requires knowing what you intended.
> Platforms have the mirror-image gap: they start at the order ticket.
> **The pre-trade half of the loop is unserved by journals and platforms alike.**

Our Morning Plan sits exactly there: a timestamped, per-symbol, pre-market
record of intended direction, conviction, thesis, catalyst, multi-timeframe read
and psychological state, captured before P&L exists. It converts review from
*"was I disciplined?"* (self-scored, self-serving) into *"was I right, and did I
size in proportion to being right?"* (falsifiable).

**But three qualifications, all established by the red team:**

1. **The container is not novel.** Edgewonk ships Trading Plans and Missed
   Trades (2022), TradesViz ships Trade Plans and Day Plans — including a Sleep
   Score field applied day-wide — and TradeZella scores the session against the
   morning plan. We are not first to pre-commitment.
2. **The grading mechanism is not novel either.** Forecast calibration is
   industrialised in TipRanks, in Discord call-scoring, and mass-market in
   sports-betting CLV trackers. This is an **unported mechanism, not an
   invention**. Worth building; worth approximately zero as a moat.
3. **The demand for it is unproven.** See §3.

What remains genuinely ours is the *combination*: pre-trade intent captured in
structured form, joined to bar-derived market context and order-aware execution
metrics, on the same row. Nobody joins those three. That is a real product idea.
It is not a defensible one.

### The second unoccupied position: intellectual honesty

Three tracks landed on this independently. **Nobody in the category gates
ordinary statistics on sample size.** TradesViz z-test-gates its AI detectors
and markets that as a differentiator; no vendor applies the same rigour to the
dashboard. Chartlog *teaches* an N≥25 norm and then does not enforce it.

Meanwhile the measured base rate is that **47% of public trading journals are
dead inside 60 days** (`_theme-voice-of-customer.md`) — so most users are
looking at confident statistics computed on samples that cannot support them.

A journal that says "you don't have enough trades to know that yet" would be
alone. It is also a hard thing to sell, because it delivers less-satisfying
numbers than every competitor's demo.

---

## 3. The assumption that has to be tested before anything else

**Will anyone other than the founder author a per-symbol multi-timeframe
pre-market forecast, on most days, for six months?**

Everything above rests on this, and the red team returned **UNRESOLVED, leaning
against**:

- The measured abandonment base rate is brutal: **47% of public journals dead
  inside 60 days, 33% inside 14.**
- What survives is **bounded, scored** input. One trader sustained 12-criteria
  1–5 discipline scoring for 41 sessions. Across hundreds of reviews, **not one
  praised a free-text mood field**, and abandonment quotes name narrative
  capture specifically as what got heavy.
- Our Morning Plan's psych check-in matches the shape that survives. **Its
  per-symbol MTF forecast plus thesis does not** — it is unbounded and
  narrative, authored at the busiest minute of the trading day, and it pays off
  in six to twelve months.
- Most damning: **our own trader already abandoned a lighter version of exactly
  this.** Per-trade conviction went unrated because logging at the open was
  infeasible — that abandonment is why the Morning Plan exists at all
  (`docs/trade-journal/phase-1-spec.md`).

The founder is always the unrepresentative user. We have a sample of one, and
that one has a prior abandonment on record.

---

## 4. Segment recommendation

The brief left the segment open and asked for an argued answer.

**If we were to build commercially: US equity discretionary intraday traders —
the segment we already are.** Reasoning:

- It is the only segment where our existing pipeline (DAS CSV, Polygon
  enrichment, gap-free ADR, 30mATR) transfers at all.
- It is growing (PDT abolished, +44% volume) and specialist-free.
- The DAS/Sterling/Lightspeed/Cobra stack is **CSV-only at every vendor**, so
  incumbent auto-sync advantages largely evaporate here.
- Trademetria's "Verified Trading Results" badge is tied to broker auto-sync,
  which permanently marks every DAS and prop trader *Unverified* — a small,
  real, addressable indignity.

**Explicitly rejected: prop-firm / funded-trader.** The adjacency study returned
a qualified no. TradesViz already ships 20 firms × 65 account configs with
retroactive evaluation at C$19.99/mo; the growth is futures on
Rithmic/Tradovate where none of our pipeline transfers; most buyers never get
funded. It is the tempting segment and it is already taken.

**Explicitly rejected: broad multi-asset retail.** Options rolls and futures
leg-level scaling are the category's oldest unsolved requests (open since 2012)
because they are genuinely hard money-math problems, and TraderSync's five
straight years of currency-base bugs show what happens to small teams that try.

But note the tension: the recommended segment is the one with **no affiliate
channel**, which is precisely why it is empty. Choosing it means choosing to
solve distribution some other way, and we do not currently have that answer.

---

## 5. Why not build it, stated plainly

| | |
|---|---|
| Build to sellable v1 | **56–81 person-weeks** = **18–24 months solo** (`05-build-plan.md`) |
| Table-stakes features currently missing | **34** (20 absent, 14 partial) |
| Gross margin after affiliate commissions | ~53% |
| LTV | $170–215 |
| Monthly churn floor | ~6.6%, from customers quitting trading |
| Our distribution | none |
| Our moat, after red-teaming | the substrate: falsified · the wedge: real but unportable to a moat |
| Core demand assumption | untested, leaning against |

The honest reading: this is an **18–24 month build for one person** (the
9–12 month figure assumes two), **into a small category, at half margin, against
incumbents with bought distribution, resting on an unproven behavioural
assumption.**

Three things get qualitatively worse solo, not just slower: no second reviewer on
the row-level-scoping surface, non-delegable broker-auth support, and licence
negotiation that cannot be parallelised.

The expected value is poor. Recommending otherwise would require ignoring at
least three of the rows above.

---

## 6. What we recommend instead

**Build the backlog into our own journal.** See `06-dogfood-backlog.md`.

The case for this is strong and independent of everything above:

- The best ideas found are cheap for us specifically, because we already store
  the inputs. Tradervue's 11 Market Behavior reports map 1:1 onto enrichment
  columns we compute and never surface. Their Exit Analysis is better-formed
  than our Capture Tracker and uses data we have. TradesViz's 16 deterministic
  detectors are implementable verbatim.
- Edgewonk's marquee execution metrics are gated behind **hand-ticked booleans
  we derive automatically from bars**. We can have Edgewonk-class execution
  analytics with zero extra data entry. That is a genuine, if narrow, advantage
  — and it accrues to us as a *user* whether or not we ever sell anything.
- It is the only way to resolve §3. Using the thing is the experiment.

**And fix the defects regardless of strategy.** Three items in the missing-34
are not gaps but bugs, and one is live: **no authentication on any of the 14
journal API routes**, on a public domain, proxying service-account access to the
sheet, with mutating endpoints. Also: position flips silently mis-grouped,
comma-split Setup double-counting P&L in breakdowns, gross-only P&L, and zero
tests anywhere in the journal code.

---

## 7. The gates that would flip this decision

Written so each can be abandoned cheaply.

**Gate 1 — the fill-rate test (cost: ~20 minutes).**
Query our own sheet: what fraction of trading days since the Morning Plan
shipped have a saved plan, and is the trend rising or falling? Below ~60% and
falling, the wedge is dead and §3 is answered — stop here. This is the single
highest-value unrun experiment in the study.

**Gate 2 — the second-user test (cost: weeks, not months).**
One or two traders who are not us, using it for a full month, with fill-rate
measured. The founder's own usage proves nothing. This also surfaces every
multi-tenancy assumption cheaply.

**Gate 3 — a distribution answer (cost: unknown, and that is the point).**
Not "we'll do content marketing." A specific, named channel: an educator
relationship, a community, an existing audience, or a wedge that spreads without
paid affiliates. **No engineering should start on a commercial v1 before this
exists**, because the research says this is what determines the outcome.

Only if all three clear does `05-build-plan.md` §b become worth executing.

---

## 8. What we might be wrong about

Recorded so a future reader can check us rather than trust us.

1. **We may be underrating the "unverified" indignity.** Trademetria ties
   credibility to auto-sync, which structurally excludes DAS/prop traders. If
   verified performance credentials matter more than we think, there is a
   sharper product there than a journal.
2. **The PDT abolition (2026-06-04) is three months old.** Its effect on the
   population of US equity day traders is genuinely unknown, and it removes the
   single biggest barrier to entry. The segment could be materially larger in
   twelve months than any number in this study.
3. **We assumed distribution must be bought.** The category's incumbents all
   bought it, but they were also all launched before AI-assisted product
   development compressed build times. A product that costs one person three
   months instead of a funded team two years can survive a much worse
   acquisition channel.
4. **The voice-of-customer evidence has a hole in it.** Reddit was unreachable
   by every permitted route. The abandonment base rate comes from Elite Trader,
   which skews toward a serious, self-selecting minority. The true base rate for
   casual traders is probably *worse*, which strengthens the recommendation —
   but we did not verify it.
5. **We are one person's read of a market we are inside.** That is worth
   something as domain knowledge and it is also exactly the position from which
   founders overrate their own workflow's generality.
