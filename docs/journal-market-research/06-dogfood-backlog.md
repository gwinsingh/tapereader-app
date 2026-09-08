# Dogfood Backlog

**Status:** written 2026-09-01 · Persona: product manager, optimising for *our own
trading*, not for a sellable product.

The filter for everything below is: **would having this make us a better trader
in the next three months?** Commercial appeal is explicitly not the ranking
criterion — see `04-product-thesis.md` for that argument.

The ordering exploits one structural fact: **we already store far more than we
report on.** The 76-column sheet and the enrichment pipeline mean several
category-leading features are a rendering job for us and a data-collection job
for everyone else.

Effort: **S** ≤ 1 day · **M** ≈ 2–5 days · **L** ≈ 1–3 weeks · **XL** > 3 weeks.

---

## Tier 0 — Do first, regardless of anything else

These are not features. Two are live defects, one is the measurement that
governs the whole strategy.

| # | Item | Effort | Why |
|---|---|---|---|
| 0.1 | **Measure the Morning Plan fill rate** | S | Gate 1 of the thesis. What fraction of trading days since the plan shipped have a saved plan, and is the trend rising or falling? Everything in Tier 3 depends on this answer, and we have never looked. Run it before building anything else. |
| 0.2 | **Add auth to the 14 journal API routes** | S–M | No middleware exists and no route checks any key. Live on tapereader.us, proxying service-account access to the sheet, with mutating `PATCH`/`POST` endpoints open. Follow the existing `WRITE_KEY` pattern from the 4-Week Challenge KV route. |
| 0.3 | **Fix position-flip mis-grouping** | M | The grouper mis-handles a position that flips through zero (long → short in one sequence). This silently corrupts trades, which corrupts every statistic downstream. |
| 0.4 | **Fix comma-split Setup/Catalyst double-counting** | S | Multi-value cells are comma-split and the trade's full P&L is attributed to *each* value, inflating breakdown totals. Anything we conclude from setup breakdowns today is wrong by an unknown amount. |
| 0.5 | **Golden-file tests for the trade grouper** | M | There are zero tests in the journal code. 0.3 and 0.4 cannot be fixed safely without them, and the build plan puts the trade engine's long tail as the top schedule risk. Capture the current DAS CSVs as fixtures with expected round-trips. |

> **0.1 is the highest-value 20 minutes in this entire study.** If the fill rate
> is low and falling, Tier 3 is dead and we save ourselves months.

---

## Tier 1 — Free wins: the data is already in the sheet

Highest value-per-hour in the backlog. Every item here is a reporting layer over
columns we already compute and store and have never once looked at.

| # | Item | Effort | Source | Why it matters to us |
|---|---|---|---|---|
| 1.1 | **Market Behavior reports** — performance sliced by %Gap band, RVOL, ATR, TR/ATR, distance from 20/50 SMA, prior-close location, day type | M | Tradervue ships 11 of these | We store **every one of these inputs** in the enrichment columns and report on **none** of them. This is the single largest gap between data we hold and insight we extract. It directly answers "which market conditions is my edge actually in?" — the question the phase-1 review was built to ask. |
| 1.2 | **Exit Analysis** — float the last exit group to max P&L *bounded by the actual or stated risk*, yielding Best Exit P&L and an efficiency % | M | Tradervue; strictly better-formed than our Capture Tracker | Our Capture Tracker measures against a *fixed* 2.5R target. Tradervue's version measures against what was actually available on that trade. It is the better question, uses the same bar walk we already run, and would replace a metric we currently over-trust. |
| 1.3 | **Missed Trades** — surface Daily Plan rows that never became a trade | S | Edgewonk | We currently **discard** unmatched plan rows. They are free data about planned-but-not-taken setups, and the comparison (planned-and-taken vs. planned-and-skipped) is exactly the hesitation signal a discretionary trader needs. |
| 1.4 | **Sample-size gating on every statistic** | M | Nobody in the category does this | Show a Wilson confidence interval and an explicit "not enough data yet" band rather than a confident win rate on n=6. We already surface denominators, so we are most of the way there. With 47% of journals dead inside 60 days, most stats anyone looks at are noise — including ours. |
| 1.5 | **Page-level unit toggle** — one control re-denominating everything to $ / % / R / ticks | S | TradeZella | We already have this *inside* the calendar. Promoting it to govern the whole page is cheap and materially changes how the numbers read. |
| 1.6 | **Entry-quality decomposition** — how much of the outcome came from the entry vs. the management | M | Absent from all 8 columns of the matrix | The category's biggest blind spot, and we hold the inputs (order-aware MFE, MAE, the open, 30mATR). Splitting "was the idea right" from "did I trade it well" is the whole point of the skill funnel we already started. |

---

## Tier 2 — Worth real effort

| # | Item | Effort | Source | Why |
|---|---|---|---|---|
| 2.1 | **Pre-rated behaviour tags** — author a comment library bucketed by trade stage (pre-trade / entry / management / exit), assign each string a positive/negative/neutral valence **once, at definition time**; at journaling time you only pick | M | Edgewonk's central mechanism | This is the best single idea found in the study. It decouples the moral judgement from the emotional state being measured — the hardest problem in self-reported psych data — and it turns journaling into selection rather than confession. Our `Process Followed?` is this idea collapsed to one bit. Every Edgewonk metric downstream (Efficiency, Tiltmeter, Edge Leak) is a projection of that one table, so building the table gets several metrics at once. **It also matches the shape the voice-of-customer research says actually survives: bounded and scored, not free-text.** |
| 2.2 | **Deterministic behavioural detectors** — revenge trading, size-up-after-loss, cold-start, worst day×hour, loss concentration; each gated behind a two-proportion z-test, ranked by dollar impact, capped at ~4 findings | M–L | TradesViz AI Coach (16–18 detectors, published) | The most stealable thing in the category, and the design is the point: the detectors are deterministic and statistically gated, and the LLM only narrates — it cannot invent findings. Near-zero run cost. Implementable verbatim on our stack, and far more trustworthy than "dump trades into an LLM". |
| 2.3 | **Commissions and fees in P&L** | M | Table stakes everywhere; we are gross-only | Every number we compute is currently optimistic by an unknown amount. For a high-frequency intraday equity trader this is not a rounding error. DAS CSV lacks commissions, so this needs a per-account fee model. |
| 2.4 | **Day-level journal object** — notes, market conditions, and a session retro separate from per-trade notes | S–M | Table stakes; we lack it entirely | We have day-level *fields* but no day-level *narrative*. The daily retro is where discretionary traders actually learn, and it is the natural home for the psych check-in we already collect. |
| 2.5 | **Trade-annotated chart** via **Lightweight Charts** (Apache 2.0) | L | Category table stakes; TradesViz rents TradingView, which we must not | Replaces the manual screenshot workflow with rendered entries/exits, MFE/MAE lines and the stop level on 1-minute bars we already fetch. Use Lightweight Charts — **not** TradingView Advanced Charts, whose licence restricts free use to free offerings and carries $50,000 liquidated damages per breach. |
| 2.6 | **Rules engine with sample sets** — named rules grouped into market-condition / entry / exit, and cohorts requiring N≥25 before reporting | L | Chartlog, which taught the N≥25 norm and then did not enforce it | Turns "setups" from a free-text label into a testable definition. Pairs naturally with 1.4. |

---

## Tier 3 — The wedge, gated on Tier 0.1

**Do not start these until the fill-rate measurement (0.1) comes back.** They all
assume the Morning Plan gets filled in, and the red team rates that assumption
UNRESOLVED, leaning against.

| # | Item | Effort | Why |
|---|---|---|---|
| 3.1 | **Forecast calibration scoring** — grade the timestamped pre-market MTF read against what the session actually did; Brier-style, per timeframe, tracked over time | L | The genuine white space: every incumbent reconstructs plan adherence *after* the fact from configured rules; nobody grades a timestamped forecast. Converts review from "was I disciplined?" to "was I right?". The mechanism is well-established outside trading (TipRanks, betting CLV), so this is porting, not inventing. |
| 3.2 | **Conviction-vs-outcome calibration** — did size track being right? | M | The natural second half of 3.1, and the more actionable one: a trader who is right but sizes flat has a different problem than one who is wrong. |
| 3.3 | **Plan-to-execution reconciliation** — traded-the-plan vs. drifted, scored | M | Depends on 1.3 (Missed Trades) and 3.1. |

**Before building 3.1, shrink the input.** The per-symbol MTF forecast plus
thesis is the unbounded, narrative shape that abandoners specifically name, and
it is authored at the busiest minute of the day. If the fill rate is marginal,
the right move is to make the plan *smaller and more bounded* (direction +
conviction only, two symbols, thirty seconds) and re-measure, rather than to
build scoring on top of an input that is decaying.

---

## Deliberately not doing

Recorded with reasons so they are not silently reconsidered.

| Item | Why not |
|---|---|
| **Broker auto-sync** | The DAS/Sterling/Lightspeed stack is CSV-only at *every* vendor. DAS's own API is $100–1,500/mo per trader. Chartlog's near-live ingest is an unsigned binary tailing debug logs. For a single user, the CSV upload we have is the correct answer. |
| **Prop-firm rule tracking** | TradesViz already ships 20 firms × 65 configs at C$19.99/mo. We do not trade a funded account. Two of the four drawdown algorithms are not even computable from the closed round-trips our grouper produces. |
| **Multi-asset (options/futures)** | Genuinely hard money-math (rolls, multipliers, leg-level scaling — the category's oldest unsolved request, open since 2012). We trade US equities. |
| **Mobile app** | The plausible mobile job is *capture*, not analysis, and our capture is a CSV upload after the close. Revisit only if 3.x ships and the morning plan needs to be authored from a phone. |
| **Market replay / backtesting** | Tick data licensing and storage. TradeZella's real advantage is that replayed trades land in the same analytics engine — the unified data model, not the replay. |
| **Conversational LLM chat over trade history** | Roughly half the AI cost line, and Edgewonk's critique holds: traders do not know which questions to ask. 2.2's proactive detectors are the better shape. |
| **Unrealized P&L / live open risk** | The category's top unserved request `[R]`, but it is a *live* feature and we are deliberately end-of-day. Noted as the strongest commercial signal found, and out of scope for us. |

---

## Suggested order

```
0.1 fill-rate measurement        ← 20 minutes, gates Tier 3
0.2 auth                         ← live exposure
0.5 golden-file tests            ← unblocks 0.3/0.4 safely
0.3 position flips  0.4 setup double-count
─────────────────────────────────────────────
1.1 market behavior reports      ← biggest data-to-insight gap
1.2 exit analysis                ← replaces a metric we over-trust
1.3 missed trades   1.5 unit toggle
1.4 sample-size gating           ← pairs with everything above
1.6 entry-quality decomposition
─────────────────────────────────────────────
2.1 pre-rated behaviour tags     ← best single idea in the study
2.2 deterministic detectors
2.3 commissions   2.4 daily journal
2.5 lightweight charts  2.6 rules engine
─────────────────────────────────────────────
Tier 3 only if 0.1 says the plan is being filled in
```

Tier 0 + Tier 1 is roughly **three to four weeks** of part-time work and
produces most of the trading value in this document. Everything after that is
optional.
