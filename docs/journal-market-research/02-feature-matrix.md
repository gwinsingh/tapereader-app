# Feature Matrix — canonical taxonomy

**Status:** taxonomy defined 2026-09-01; vendor columns filled during synthesis.

This is the join point of the whole study. Vendor files feed it; the gap
analysis and the dogfood backlog read from it. When a vendor file changes, this
must be re-derived.

## How to read it

Each feature is scored per vendor:

| Mark | Meaning |
|---|---|
| ● | Full, first-class implementation |
| ◐ | Partial — present but limited, or gated behind an awkward workflow |
| ○ | Absent |
| ? | Could not establish from public sources |

The **TR** column is TapeReader's journal as it exists today (from the internal
audit in `03-gap-analysis.md`), so the matrix doubles as our gap list.

Each feature also carries a **class**, which is the judgment that actually
drives the backlog:

- **Table stakes** — everyone has it; absence is disqualifying; building it wins nothing.
- **Differentiator** — some have it, it is visibly valued, it can win a user.
- **Frontier** — few or none have it well; the interesting ground.
- **Vitamin** — demoed well, rarely used in practice. Cheap to skip.

---

## 1. Data in — import, sync, and coverage

- 1.1 Manual trade entry (single trade form)
- 1.2 CSV / file import from broker exports
- 1.3 Breadth of broker file-format support
- 1.4 True automatic broker sync (credentialed or API, unattended)
- 1.5 Third-party aggregator use (SnapTrade / Plaid Investments / similar)
- 1.6 Multi-account support, and aggregation across accounts
- 1.7 Multi-currency / non-US market support
- 1.8 Asset classes: equities · options · futures · forex · crypto
- 1.9 Import of historical backfill at signup
- 1.10 Handling of corporate actions (splits, symbol changes)
- 1.11 Duplicate detection and idempotent re-import
- 1.12 Data export / portability out

## 2. Trade construction & data model

- 2.1 Fill-to-round-trip grouping (position tracking)
- 2.2 Scaling in/out and partial fills
- 2.3 Short handling
- 2.4 Overnight / multi-day position handling
- 2.5 Multi-leg options structures (spreads, expiry, assignment)
- 2.6 Futures contract multipliers, rollovers
- 2.7 Commissions, fees, borrow, slippage accounting
- 2.8 User-defined custom fields
- 2.9 Trade-level vs. day-level vs. account-level data separation

## 3. Core analytics & statistics

- 3.1 P&L, win rate, expectancy, profit factor
- 3.2 R-multiple analysis (requires per-trade risk)
- 3.3 MFE / MAE (favorable and adverse excursion)
- 3.4 Distribution/histogram views rather than just averages
- 3.5 Breakdown by setup / strategy / tag
- 3.6 Breakdown by time of day, day of week, hold duration
- 3.7 Breakdown by symbol, sector, price band, volatility regime
- 3.8 Drawdown, streaks, Kelly / risk-of-ruin
- 3.9 Position sizing analysis
- 3.10 Entry vs. exit quality decomposition
- 3.11 Statistical significance / sample-size honesty
- 3.12 Custom user-defined metrics
- 3.13 Benchmarking against market conditions on the trade date

## 4. Charts & visual review

- 4.1 Trade-annotated price chart (entries/exits plotted on bars)
- 4.2 Intraday granularity of that chart (1m and below)
- 4.3 Multi-timeframe view of the same trade
- 4.4 Market replay / bar-by-bar playback
- 4.5 Screenshot upload and attachment
- 4.6 Screenshot auto-matching to trades
- 4.7 Drawing / annotation on charts
- 4.8 Side-by-side comparison of multiple trades

## 5. Journaling, notes & tagging

- 5.1 Free-text notes per trade
- 5.2 Daily / session journal separate from per-trade notes
- 5.3 Tagging, and tag-based analytics
- 5.4 Templates for structured reflection
- 5.5 Rich media in notes (images, links)
- 5.6 Search across journal history
- 5.7 Retrospective re-tagging workflow

## 6. Psychology, discipline & process

- 6.1 Emotion / state capture per trade or per day
- 6.2 Rule-adherence ("did I follow my process?") tracking
- 6.3 Tilt / behavioural-degradation detection
- 6.4 Pre-market conviction capture
- 6.5 Physiological inputs (sleep, readiness, energy)
- 6.6 Correlation of psychological inputs with performance
- 6.7 Discipline scoring over time
- 6.8 Streak / habit mechanics

## 7. Planning & pre-market

- 7.1 Watchlist / daily plan capture
- 7.2 Thesis and catalyst recorded before the trade
- 7.3 Multi-timeframe bias recorded pre-open
- 7.4 Plan-vs-execution reconciliation (did I trade my plan?)
- 7.5 Idea-origin classification (own watchlist vs. callout vs. impulse)
- 7.6 Scanner / idea generation integrated with the journal

## 8. Risk & money management

- 8.1 Per-trade risk (R) capture
- 8.2 Daily loss limits and monitoring
- 8.3 Drawdown / trailing-drawdown tracking
- 8.4 Prop-firm rule compliance
- 8.5 Position-size calculator
- 8.6 Risk-unit schedule over time (risk changing as account grows)
- 8.7 Exposure and correlation across open positions

## 9. Playbooks, setups & rules engine

- 9.1 Named setups / strategies with definitions
- 9.2 Playbook documents with criteria checklists
- 9.3 Automatic classification of trades into setups
- 9.4 Per-setup performance with enough sample to be meaningful
- 9.5 Rule violations detected automatically
- 9.6 Backtesting / manual replay to build a setup's sample

## 10. Simulation & counterfactuals

- 10.1 "What if I had used a different exit" analysis
- 10.2 Partial-taking / scaling strategy simulation
- 10.3 Fixed-bracket counterfactual vs. discretionary management
- 10.4 Monte Carlo / sequence-risk simulation
- 10.5 Optimal stop / target discovery from own data

## 11. AI & automation

- 11.1 LLM summary of statistics
- 11.2 Conversational query over own trade history
- 11.3 Pattern detection beyond stated tags
- 11.4 Vision analysis of chart screenshots
- 11.5 Coaching against the trader's own stated plan and rules
- 11.6 Automatic tagging / setup classification
- 11.7 Generated periodic review documents

## 12. Reporting, sharing & social

- 12.1 Periodic (daily/weekly/monthly) review reports
- 12.2 Shareable public trade links
- 12.3 Mentor / coach access with permissions
- 12.4 Team / group / trading-room dashboards
- 12.5 Community feed, leaderboards
- 12.6 Tax / accounting export

## 13. Platform, UX & trust

- 13.1 Mobile app (native) / mobile web quality
- 13.2 Offline capability
- 13.3 Speed with large trade histories
- 13.4 Onboarding time to first insight
- 13.5 Data privacy posture, security claims, and hosting jurisdiction
- 13.6 API for the user's own data
- 13.7 Pricing transparency and free-tier generosity

---

## Matrix

*(Filled during synthesis once vendor files land. One table per taxonomy
section, vendors as columns, plus a `Class` column and a `TR` column.)*
