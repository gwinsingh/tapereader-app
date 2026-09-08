# Open Questions

**Status:** written 2026-09-01 · What this study could NOT settle, ranked by how
much it matters and how cheaply it could be settled.

Recorded so that a future reader knows exactly where the thin ice is, rather
than inheriting a document that reads as uniformly confident.

---

## Ranked by (load-bearing × unverified)

### 1. Will anyone but the founder fill in a pre-market forecast? 🔴 CRITICAL

**Why it matters:** the entire wedge in `04-product-thesis.md` rests on it.
**Status:** UNRESOLVED, leaning against (red team). Zero instances found either
way in public sources — nobody documents six-month adherence to structured
pre-market forecasting.
**What we know:** 47% of public trading journals die inside 60 days, 33% inside
14. Bounded scored inputs survive; unbounded narrative inputs are what
abandoners name. Our own trader abandoned a *lighter* version of this (per-trade
conviction, unrated due to open-pace friction).
**How to settle it — cheap:** query our own sheet. Fraction of trading days
since the Morning Plan shipped that have a saved plan, plotted over time. Below
~60% and falling answers the question. **This is Tier 0.1 of the backlog and the
highest-value unrun experiment in the study.**
**How to settle it properly:** two non-founder traders for one month, fill rate
measured (Gate 2).

### 2. What is the real distribution channel for equity intraday? 🔴 CRITICAL

**Why it matters:** the research says distribution — not product — decides
outcomes in this category, and the recommended segment is empty *because* it
lacks the affiliate channel the others have.
**Status:** unanswered. We identified the problem and not the solution.
**How to settle it:** not desk research. Naming a specific channel — an educator
relationship, a community, an existing audience — and testing whether it
converts. Gate 3.

### 3. Does quantified psych → P&L linkage actually change behaviour? 🟠 HIGH

**Why it matters:** it is where our journal is most differentiated (physiological
inputs, energy/tension, discipline %).
**Status:** unresolved. Across hundreds of reviews, **nobody credits quantified
psych-to-money linkage with improving results** — while several credit bounded
rule-adherence scoring. Correction on record: TradesViz *does* ship a Sleep Score
field, so sleep capture is not unprecedented as this study first reported.
**How to settle it:** our own data, once there are enough sessions. Does
readiness/sleep actually correlate with discipline % or with prediction accuracy,
at a sample size that survives 1.4's gating?

### 4. How large is the US equity intraday population after FINRA 26-10? 🟠 HIGH

**Why it matters:** the PDT rule and its $25k minimum were abolished effective
**2026-06-04**, removing the largest structural barrier to entry. Retail equity
volume was already +44% YoY in 2025.
**Status:** three months of data exist and we found no analysis of them. Every
market-size number in this study predates the change.
**How to settle it:** FINRA/SEC data releases, broker account-opening disclosures
and MEMX/exchange retail-participation reports over the next 2–3 quarters. Worth
revisiting this study's sizing in mid-2027.

### 5. Why did Chartlog actually stop? 🟡 MEDIUM

**Why it matters:** it is the closest positional match to us, it served exactly
our recommended segment, and its failure mode is the most relevant precedent
available.
**Status:** looks like founder attrition — two people, no acquisition found,
still billing, still listed Active — rather than segment death. Not confirmed.
**How to settle it:** the founders are named and findable; a direct conversation
would settle it. That is outreach, not research.

### 6. Do the "verified results" credentials matter? 🟡 MEDIUM

**Why it matters:** Trademetria ties credibility to broker auto-sync, which
permanently marks every DAS and prop trader *Unverified*. If verified
performance credentials matter to traders, there is a sharper product there than
a journal.
**Status:** identified, not investigated. Nobody asked traders whether they care.

### 7. Is the trade-grouper's error rate material? 🟡 MEDIUM — and it is *our* data

**Why it matters:** position flips are mis-grouped and comma-split Setup values
double-count P&L in breakdowns. Every conclusion we have drawn from our own
journal — including the phase-1 edge-cluster finding that drives current
strategy — inherits these errors.
**How to settle it:** backlog items 0.3–0.5. Quantify the error before fixing it,
so we know how much of what we believe was wrong.

---

## Evidence gaps in the research itself

These limit how far the study should be trusted, and are recorded in
`00-method.md` §4a.

| Gap | Effect |
|---|---|
| **Reddit unreachable by every permitted route** | The largest trader community contributed nothing directly. Voice-of-customer rests on Elite Trader, NexusFi, Trade2Win, Trustpilot, app stores and Hacker News — which skew toward a serious, self-selecting minority. The true abandonment base rate for casual traders is probably *worse*, which would strengthen the recommendation, but we did not verify it. |
| **Web-search quota exhausted mid-study** | Later agents (red team, data-integration, UX) worked partly from direct fetches. Some claims are thinner than they would otherwise be. |
| **Review SERP is vendor-owned** | Six "review" publishers sell rival journals. Used for discovery only, and excluded from evidence — but this means less independent third-party assessment exists than the search results suggest. |
| **No trial accounts** | Every feature claim is from documentation, demos and reviews rather than hands-on use. Vendors' actual UX quality is inferred, not experienced. |
| **Pricing moves fast** | All prices verified 2026-09-01. Re-verify anything older than ~6 months before it drives a decision. |

---

## Things we deliberately did not research

- Non-US markets and non-US-centric vendors.
- Backtesting platforms, charting platforms, signal services, copy-trading.
- Trading psychology and coaching products as a standalone category (scoped out
  at the start; the psych *features* of journals were covered).
- Tax/accounting tools, beyond noting tax export as a feature row.
- Any vendor's actual financials beyond the two public datapoints found
  (Tradervue's EBITDA under SureSwift; TradeZella being bootstrapped).
