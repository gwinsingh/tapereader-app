# Adjacency — Prop Firms / Funded Traders

**Tier:** adjacent · **As of:** 2026-09-01 · **Researcher:** prop-firm adjacency agent
**Question asked:** is the funded-trader segment an attractive wedge for a trading journal?
**Short answer:** **Qualified no.** See "Wedge attractiveness" at the end.

**Source-quality warning.** This space is dominated by affiliate-funded SEO content. Prop-firm
"review" sites, "best journal" listicles and "statistics 2026" pages are almost all monetised by
firm referral codes, and several are published *by* prop firms or journals. Affiliate pollution is *worse* in
this corner than in the journal market proper: most "best prop firm" rankings are paid placement.
Accordingly, **every rule mechanic in section 2 was taken from a firm rulebook wherever one was
reachable**, and rankings/recommendations are treated as marketing throughout. Firm-owned pages
(`ftmo.com`, `topstep.com`, `tradethepool.com`) and vendor pricing pages are `[V]`. Everything
routed through an affiliate intermediary is `[R]` at best and is flagged where it matters.

**Reddit could not be reached.** Direct `WebFetch` on `reddit.com`, `old.reddit.com` and the
`.json` thread endpoint were all blocked by the crawler, and the session's WebSearch quota was
exhausted before `site:reddit.com` snippet searching could be attempted. Prop-firm subreddits were
a named part of this brief and they are simply missing from the evidence base. First-hand trader
sentiment here therefore rests on Trustpilot (which does fetch, and yields well for prop firms),
Elite Trader, and third-party writeups. **This gap is material for section 2's "what traders
complain is missing" and should be closed manually** — logged in `07-open-questions`.

---

## 1. The prop firms' own dashboards

### What "prop firm" means here

Two structurally different populations get lumped together:

1. **Retail evaluation firms** (the growth story) — Apex, Topstep, Take Profit Trader,
   Earn2Trade, MyFundedFutures, Tradeify, Bulenox, TradeDay for futures; FTMO, FundedNext,
   The5%ers, FXIFY, FundedTradingPlus for FX/CFD; Trade The Pool for US equities. Trader pays a
   fee, trades a simulated account against rules, gets a profit split. `[V]` across firm sites.
2. **Licensed US equity prop desks** — T3 Trading Group, SMB Capital, Seven Points Capital,
   Vortex Capital Group. Series 57 / SIE registration, real capital, DAS Trader Pro or Sterling
   Trader Pro, direct market access. `[R]` (blackeaglefg, traderslog, firm career pages). This is
   the population whose data model TapeReader already speaks natively — DAS CSV exports — but it
   is *orders of magnitude smaller* than population 1 and is not the growth segment. Almost all
   "prop firm tooling" discourse is about population 1, which trades **futures on Rithmic /
   Tradovate / TopstepX, not equities on DAS.** `[I]`

**This asymmetry is the single most important finding in this file.** The segment that is growing
fast trades a different asset class on different rails than the product we already have.

### Native dashboards, firm by firm

| Firm | Asset | Native analytics | Native journaling | Verdict |
|---|---|---|---|---|
| **Topstep** | Futures | Performance Dashboard: daily loss, trailing MLL, profit-target progress, payout tracker, multi-account comparison. "Coach T" digital performance coach gives stats + tips. `[R]` `[V]` (topstep.com dashboard page confirms payout tracker, reset bank, instant XFA; it does **not** advertise analytics depth) | Trade log + statistics only. **No setup tagging, no R-multiple, no mistake logging, no notes.** `[R]` (editorialge; TradesViz comparison — note the latter is a competitor's framing) | Compliance-first, reflection-absent |
| **FTMO** | FX/CFD | **Account MetriX** — the strongest native tool found. Interactive equity chart with drawdown periods, open-trade overview, per-trade table with SL/TP, **MFE/MAE**, SL/TP efficiency, time-of-day performance, long vs short, size-handling, per-instrument strength. Free to FTMO account holders, FTMO-only. `[V]` (ftmo.com blog) | FTMO calls it a "Journal" but it is a computed trade table, not a reflective journal — no free-text thesis, tags or screenshots surfaced. `[I]` | **The bar. Genuinely good analytics, given away free.** |
| **Apex Trader Funding** | Futures | Account balance, trailing threshold, contract-scaling status. Rules published in detail; analytics thin. `[R]` (tradetanto, quantcrawler) | None found `[R]` | Rules engine, not a journal |
| **Take Profit Trader** | Futures | Balance + EOD/intraday trailing drawdown display; payout eligibility. `[R]` | None found `[R]` | Rules engine |
| **Earn2Trade** | Futures | Progress vs profit target, daily loss, EOD drawdown; historically education-led. `[R]` | None found `[R]` | Rules engine |
| **Trade The Pool** | **US equities** | TraderEvolution platform (IBKR connectivity) + firm dashboard with scaling tier and daily-pause status. `[R]` (myfxbook, thetrustedprop, blockpool) | None found. Trustpilot reviewers complain the **dashboard itself lags reality** — scaling updates showing stale numbers for days, blocking withdrawals and mis-setting daily limits (2-star, funded 2 years). `[R]` | Rules engine, and a leaky one |

**Pattern `[I]`:** every firm builds the *compliance* half (am I in breach? can I withdraw?) because
it is load-bearing for their own risk desk, and almost none build the *improvement* half (why did I
lose? which setup works?). FTMO is the exception and it is the largest firm in the segment — which
tells you what a well-capitalised firm does once compliance is solved: it builds the analytics
in-house and gives them away.

### Firm stability — the ecosystem risk

Building on the prop-firm ecosystem means building on firms that die and platforms that revoke
access. Evidence:

- **80–100 retail prop firms shut down between Feb 2024 and end-2025** — described as the largest
  collapse in the segment's history. A Brokeree study of 82 firms found 71 still operating at
  year-end (86.6% survival). `[R]` (thepropfirmguide; single aggregator, treat the exact count as
  indicative)
- Named closures `[R]`: The Funded Trader (Mar 2024, 80,000+ accounts, $2M+ denied payouts);
  True Forex Funds (May 2024, ~300 traders, ~$1.2M unpaid, killed by MetaQuotes licence
  revocation); SurgeTrader (May 2024); Smart Prop Trader (Nov 2024, orderly wind-down);
  FundingTicks (Jan 2026).
- **My Forex Funds / CFTC.** CFTC froze the then-largest FX prop firm in Aug/Sep 2023, ~$310M in
  trader balances, alleging it was counterparty to customer trades, ran demo environments while
  implying live, and applied drawdown limits in bad faith to cull profitable traders. On
  **13 May 2025 a US federal judge dismissed the CFTC complaint with prejudice** and imposed
  >$3M in Rule 11 sanctions on the agency; MFF has since begun returning client funds. `[R]`
  (financemagnates, desilvalawoffices, fxnewsgroup, theindustryspread — consistent across four)
  → Net: the regulatory question is *unsettled*, not resolved in the firms' favour. A tool
  economically tied to these firms carries policy risk that a broker-agnostic journal does not.
- **Platform revocation is the sharpest risk.** **ProjectX terminated third-party prop-firm
  licensing effective 28 Feb 2026 and is now exclusive to Topstep as "TopstepX."** Bulenox,
  Tradeify, Lucid Trading, Alpha Futures, Phidias, TradeDay and The Futures Desk all lost the
  platform; Topstep acquired The Futures Desk on 1 Apr 2026. `[R]` (damnpropfirms, tradecopia,
  pickmytrade — three independent, consistent). This is the 2024 MetaQuotes shock repeating on the
  futures side. **Any integration built against a prop rail can be switched off by a party that is
  not your customer and not the firm.** `[I]`
- **Apex specifically** has a documented pattern of subjective payout denial: denials labelled only
  "Account Investigation," traders asked to **video-record themselves trading** to release funds,
  and reported mass bans of profitable traders in May 2025; a further enforcement wave in Feb 2026.
  `[R]` (imantrading — author claims personal involvement in ~$800k of denied payouts; Elite Trader
  thread "APEX Funded Accounts: Denied Payouts and Closed My Accounts"; propfirmstimes). Apex is
  a top-5 firm by trader count, so this is not a fringe operator.

---

## 2. The rule-compliance job-to-be-done

### The rule taxonomy, precisely

This is the useful artifact. Every rule below is a distinct computation over a trade/equity series.

**A. Loss limits**

1. **Daily loss limit (DLL)** — a floor computed from the *day's opening* balance or equity.
   - Futures, absolute: Topstep $1k/$2k/$3k on $50k/$100k/$150k `[R]`; Earn2Trade $550/$1,100/$2,200
     `[R]`; Apex tiered by payout level ($1k→$3k on a $50k PA) `[R]`.
   - FX, percentage: **FTMO 5% of initial capital on the 2-step, 3% on the 1-step**, resetting at
     00:00 CE(S)T, computed as *that day's opening balance minus the limit*. `[V]` (ftmo.com/en/trading-objectives)
   - Equities, percentage of balance: Trade The Pool "daily pause" **2% FLEX / 1% MAX** intraday,
     3% swing. `[V]` (tradethepool.com/the-program)
   - **Consequence varies and this matters:** Topstep's DLL *ends the day* (auto-liquidate, no
     violation) `[R]`; FTMO's DLL *fails the account* `[V]`. Same metric, opposite severity.
   - **Take Profit Trader has no daily loss limit at all** on Test/PRO/PRO+ `[R]`.
   - **Floating P&L counts.** FTMO's daily limit is equity-based — an open unrealised loss can
     breach it without any close. `[R]` A journal built on *closed round-trip trades* — which is
     exactly what TapeReader's grouper produces — structurally cannot compute this. `[I]`

2. **Maximum loss / drawdown — four distinct algorithms.** TradesViz enumerates them and the firm
   docs corroborate: `[V]`/`[R]`
   - **Static** — fixed floor from starting balance, never moves. FTMO 2-step: 10% static. `[V]`
   - **Trailing end-of-day (EOD)** — floor ratchets up with the highest *closing* balance, once per
     session. Topstep MLL `[R]`; Apex EOD accounts (recalc 4:59:59 pm ET) `[R]`; Earn2Trade `[R]`;
     Take Profit Trader Test `[R]`; FTMO 1-step max loss (recalc 00:00 CE(S)T, monotonic) `[V]`.
   - **Trailing intraday** — floor tracks *peak equity including unrealised gains*, in real time.
     Apex intraday accounts `[R]`; Take Profit Trader PRO `[R]`. This is the one that kills people:
     an unrealised spike you never banked permanently raises your floor.
   - **Trailing-to-static lock** — trails until it reaches starting balance (+$100 on Apex PAs),
     then freezes. Apex `[R]`.
   - **Only two of the four are computable from closed trades.** Intraday trailing needs a tick or
     1-minute equity curve; so does equity-based DLL. `[I]`

**B. Payout gates** (these bite *after* you're profitable — the highest-emotion moment)

3. **Consistency rule** — cap on any single day's share of total profit. Range 30–50% across
   futures firms, occasionally 20–40% on stricter products. Apex 50% since Mar 2026 (loosened from
   30%) `[R]`; Take Profit Trader 50% on Test, removed on PRO `[R]`; Earn2Trade 30%, evaluation
   only `[R]`; Topstep Combine 50% of *profit target*, Express Funded expressed as a consistency
   score ≤40% `[R]`; FTMO frames it as a **"Best Day Rule" — best day ≤50% of total positive days'
   profit, and explicitly *not* a hard breach**, you simply keep trading until compliant `[V]`.
   Trade The Pool applies it per-*position*: best trade ≤50% (FLEX) / ≤30% (MAX) of profit target
   `[V]`. **Three different denominators — total profit, profit target, positive-days profit —
   and one per-trade variant. Any generic "consistency %" widget is wrong for somebody.** `[I]`
4. **Minimum trading days.** Take Profit Trader 5 `[R]`; Earn2Trade 10 `[R]`; **FTMO 4** on
   challenge phases only `[V]`; **Apex: none** `[R]`; Topstep Express Funded ≥3 days with ≥1 trade
   `[R]`.
5. **Qualifying / threshold days** — days that count only if profit ≥ a floor. Apex: 5 days at
   ≥$250 ($50k EOD) or ≥$200 (intraday). `[R]`
6. **Safety net / buffer** — must sit above starting balance + drawdown (+$100 on Apex) before any
   withdrawal; Apex $52,600 minimum on a $50k. `[R]` Take Profit Trader PRO requires start + max
   drawdown. `[R]`
7. **Payout ladder** — capped withdrawal amounts by payout number, max 6 payouts per Apex PA. `[R]`

**C. Position and behaviour rules**

8. **Contract / size scaling by profit tier.** Apex $50k PA: 2 contracts under $1,499 → 3 → 4 at
   $3,000+. `[R]` Trade The Pool scales buying power 5% per tier. `[V]`
9. **Flat-by-close.** Apex 4:59 pm ET `[R]`; Take Profit Trader / Earn2Trade 5:00 pm ET / 3:50 pm CT
   `[R]`; Trade The Pool liquidates 3:50 pm ET `[V]`.
10. **News blackouts.** Take Profit Trader PRO/PRO+ must be flat during FOMC, NFP and CPI `[R]`.
    FTMO's published objectives list **no** news restriction `[V]`. Trade The Pool permits news
    trading but bars overnight holds through an earnings window `[R]`, and its T&Cs prohibit
    "bracketing strategies around news events" `[V]`.
11. **Minimum hold time / anti-scalp.** Trade The Pool: 30-second minimum hold, 10-cent minimum
    move, volume rule, 8% volatility rule `[V]`/`[R]`. Apex bans latency-exploiting HFT `[R]`.
    Trade The Pool T&Cs ban trades "measured within a few seconds or less" and tick scalping `[V]`.
12. **No-stop-loss prohibition.** Apex PAs require stops. `[R]`
13. **Hedging / correlated-instrument bans, account sharing bans, copy-trading limits,
    EA restrictions.** `[V]` (tradethepool T&C) `[R]` (apex).
14. **Inactivity.** Apex: ≥2 trading days with ≥$50 net profit per rolling 30 days; 30 days idle =
    permanent closure. `[R]`
15. **Risk-team discretion.** Topstep "Path to Reduction" can cut contract size or the DLL during
    drawdown. `[R]` **Unmodellable by an outsider.** `[I]`

**Total: ~15 rule families, at least 4 drawdown algorithms, 4 consistency denominators, and
per-firm-per-phase-per-account-size parameterisation.** TradesViz's implementation covers
**20 firms × 65 account configurations** — that number is the honest measure of the maintenance
surface. `[V]` (tradesviz.com/blog/prop-firm-compliance-tracking, dated Apr 2026, updated Jun 2026)

### Is this a real job? Yes — and it's a *risk* job, not a *journal* job

- **~71% of phase-1 failures are drawdown breaches** `[R]` (multiple aggregators, all likely
  tracing to one or two originals — treat as directional). Whatever the exact number, breach is
  the dominant failure mode, and it is the one the trader controls.
- **Consistency is the most common cause of a *reduced or denied payout*** `[R]` — and denial is
  the single most emotionally and financially charged event in a funded trader's life.
- Traders "clear the rules on paper and still get turned down," with denials citing clauses not
  previously enforced or recalculated consistency math. `[R]` (fundedxyz, thortradecopier,
  dealpropfirm, imantrading — consistent theme, all affiliate-adjacent)

**The job-to-be-done `[I]`:** *"Tell me, before I place this order, whether it can breach a rule;
and after the fact, give me an auditable record proving I complied when the firm says I didn't."*

That is two jobs — **real-time pre-trade risk** and **a compliance audit trail** — and neither is
what a reflective journal does. The first requires a live equity feed and low latency, and is
already better served by the firm's own risk engine and by platform-level risk controls
(TopstepX built-in risk controls, drag-and-drop brackets `[R]`). The second is a document-retention
problem: keep the rule page, the support replies, and the policy version that applied. `[R]`

**Structural problem `[I]`:** the trader is not the only party who reads the rulebook, and the firm's
number is authoritative. A third-party drawdown figure that disagrees with the firm's dashboard is
worse than no figure — it creates false confidence right up to the breach. Any serious build here
must reconcile against the firm's own reported balance, which means an integration, which means
being switchable-off (see ProjectX, Feb 2026).

---

## 3. Third-party tools already targeting funded traders

| Tool | What it is | Prop-firm features | Pricing | Serious? |
|---|---|---|---|---|
| **FundedMath** (fundedmath.com) | Free calculator set by a YouTuber ("Hamza"), Apex-only | 50% consistency checker; payout-request calculator for EOD vs intraday; $25k–$150k accounts, updated for Mar 2026 rules | **Free**, monetised purely by an Apex affiliate code | Real and current, but a **calculator page**, not a product. `[V]` |
| **TradesViz** | General journal that shipped a full prop module | **Prop Firm Compliance Dashboard** — 20 firms, 65 account configs (Apex, Topstep, MyFundedFutures, Tradeify, TradeDay, Elite Trader Funding, Earn2Trade, Take Profit Trader, Bulenox, UProfit, OneUp, Phidias, Top One, BluSky, FTMO, FundedNext, The5ers, FunderPro, FXIFY, FundedTradingPlus). All 4 drawdown algorithms, DLL, profit target, min trading days, consistency, contract limits, payout buffers. **Retroactive evaluation** ("would I have passed?", with rolling-window pass-rate analysis). **Challenge Mode** simulator that auto-pauses on breach. Multi-account rollup with passed/failed/active counts. Custom firm profiles added Jun 2026. News blackouts still roadmap. | Free tier; **Pro C$19.99/mo annual (10 accounts), Platinum C$28.04/mo annual (20 accounts)** — compliance included, not upsold | **Yes — and it is the most complete implementation found anywhere, including the firms themselves.** `[V]` |
| **TradeZella** | Category-leading journal | **"PropFirm Sync"** dashboard across firms; drawdown-used vs max; DLL; **alerts at 80% of threshold**; evaluation vs funded separation; correlated-risk view of total contracts per instrument across accounts | **Included on every tier.** Essential $35/mo (1 account), Pro $59/mo (50 accounts), Ultra $99/mo (unlimited); 25% off annual | Yes `[V]` (tradezella.com/pricing) |
| **Tanto** (tradetanto.com) | Journal explicitly built for the prop rails | Native real-time sync to **Tradovate, Rithmic and ProjectX/TopstepX**; per-account stats with rollups; per-contract round-turn commissions; hides combine attempts from career stats | $13.99/mo Starter → $24.99/mo Professional (5 accounts) | Yes — and note it is *also* the publisher of much of the "best journal for prop firms" SEO. `[R]` |
| **Traders Second Brain** | Purpose-built prop multi-account SaaS | Per-account filtering, per-firm drawdown rules, rule-compliance monitoring, aggregate "All Accounts" P&L | Not disclosed on the page fetched | Yes, small `[R]` |
| **For Traders Dashboard** | Aggregator across Apex/Topstep/FTMO | Real-time P&L, drawdown monitoring, rule-compliance alerts | Free ≤2 accounts; **Pro $29.99/mo** | Published by a prop firm — treat as marketing `[R]` |
| **PropTrackerHQ** | Expense/tax side of funded trading | Fees, resets, net profit, ROI, tax prep across accounts | **$5/mo or $50/yr** | Narrow but real; note the price point `[R]` |
| **JournalX, TradeLens, JournalPlus, PropJournal, Profit AI** | Recent entrants all marketing "FTMO drawdown tracker" / "prop firm journal" landing pages | Claimed rule presets + drawdown tracking | JournalPlus $159 one-time `[R]`; others undisclosed (pages 403'd) | **Unverified. A thick layer of thin SEO-first products.** `[I]` |
| **Spreadsheets** | Still the default | Everything manual | Free | The incumbent, and the one every vendor attacks. Cited failure mode: getting trailing-floor adjustments wrong. `[R]` |

**Read `[I]`:** this is not a white space. It is a **crowded, already-commoditised** space with a
free calculator at the bottom, a $5/mo expense tracker, several $14–30/mo entrants, and two
serious incumbents who ship compliance as an *included* feature rather than a paid add-on.
TradesViz gives away a 20-firm rules engine at C$19.99/mo. That is the price of the wedge.

---

## 4. Do the mainstream journals support this?

| Vendor | Prop-firm rule engine | Multi-account | Verdict |
|---|---|---|---|
| **TradesViz** | **Yes — best in class.** 20 firms / 65 configs, 4 drawdown types, retroactive eval, challenge simulator | 10 (Pro) / 20 (Platinum) accounts + dedicated multi-account rollup view | Leader `[V]` |
| **TradeZella** | **Yes.** PropFirm Sync, drawdown/DLL vs limits, 80% alerts, eval vs funded, cross-account correlated risk | Up to 50 (Pro) / unlimited (Ultra) | Strong second `[V]` |
| **TraderSync** | Partial. Broad broker coverage (240–700+ claimed, figures vary by source), but prop rails largely via CSV | 5 on Pro, unlimited from Premium | Generic journal with account separation `[R]` |
| **Tradervue** | **No.** "No unified dashboard, no firm-specific rule tracking, no multi-account drawdown monitoring" | Unlimited accounts on both paid plans | Explicitly absent `[R]` (competitor-sourced claim; consistent with Tradervue's own positioning) |
| **Edgewonk** | Partial. FTMO/Topstep referenced, manual CSV import, no live rule engine; psychology/tilt scoring is its differentiator | Unlimited accounts, one price ($169–197/yr, sources differ) | Reflection-first, compliance-thin `[R]` |

**Multi-account is solved on the *counting* axis and unsolved on the *rules* axis `[I]`.** Every
vendor supports N accounts. Only TradesViz and TradeZella apply *different rulesets per account* and
roll up cross-account risk. TradeZella's correlated-exposure view (total contracts per instrument
across all accounts) is the one genuinely non-obvious multi-account feature found — copy-trading the
same setup across five funded accounts is standard practice, and it silently multiplies real
exposure by five.

**The remaining gap, stated honestly `[I]`:** none of them do *pre-trade, live, in-session* rule
enforcement — they are all end-of-day or on-sync. That is the only unoccupied ground, and it is
unoccupied because it needs a live equity feed, a persistent connection per account, and a latency
budget — i.e. it is a risk-management product, competing with the firm's own risk engine and with
platform risk controls that are free and already inside the order path.

---

## 5. Segment attractiveness

**Size.** Best available estimate: **~2.1M active funded traders, ~12M challenge purchases/yr at
~$250 avg, ~$850M retail prop revenue in 2026 (+45% YoY)**; top five firms (FTMO, FundedNext,
The5%ers, Apex, Topstep) ≈62% of trader acquisition. `[R]` — **all from a single vendor's
"Track360 analysis"**, self-described as built from anonymised program data plus public
disclosures. No independent corroboration was found. Treat the *shape* (millions of traders,
high growth, concentrated at the top) as sound and the *digits* as marketing. `[I]`
US-addressable, English-speaking, journal-buying subset is a fraction of 2.1M; and the futures
majority is not the equity/DAS population TapeReader is built for.

**Willingness to pay.** Real but structurally capped. The trader has *already* paid $150–$700 for
the challenge, pays for resets, and often runs 3–10 accounts. That is either an argument for spend
(they demonstrably buy tools) or against it (tool budget is crowded out by reset fees). Observed
price ceiling in prop-specific tooling is **$5–$30/mo**, versus $35–$99/mo for general journals —
the prop-specific tools are *cheaper*, not premium. `[I]` The genuinely valuable moment — a denied
payout — is exactly when the trader is angriest at spending money on this hobby.

**Churn — the decisive issue, and the best-corroborated part of this file.**

This is the crux of whether the segment can support a subscription, so the provenance matters.
Two aggregators were checked and they **converge**, and — importantly — the second one attributes
its numbers to named operator-side datasets rather than to itself:

| Claim | Track360 `[R]` | Chart Whisperer `[R]`, attributed to | Confidence |
|---|---|---|---|
| Challenge → funded pass rate | 5–14%, 12.3% blended | **14%** — FPFX Tech analysis of **300,000+ accounts**; 5–10% industry range; FTMO firm-cited 9–10%; Apex firm-cited 15–20% | **Good.** Two aggregators agree; FPFX Tech is a prop-firm *technology provider*, i.e. operator-side data, and FTMO/Apex figures are firm-cited |
| All challenge buyers who ever get paid | ~7% | **7%** — FPFX Tech via QuantVPS | **Good.** Same underlying dataset, so treat as one source seen twice, not two |
| Funded traders who take ≥1 payout | ~45% | ~20% (secondary compilation) | **Poor — sources disagree by 2×.** Do not rely on either |
| Long-term consistently-paid traders | 1–3% | not covered | **Weak — single source, self-described estimate** |
| Repeat purchase after failure | 30–40% within 90 days | not covered; "2–4 attempts before passing" from community surveys | **Weak — single source**, though directionally consistent with the attempts figure |
| Dominant failure cause | not covered | **71% of phase-1 failures = daily drawdown breaches** — TradeClaris, 2026 | Single named source |
| **How long a funded account survives** | not covered | **explicitly not covered** | **NOT ESTABLISHED** |

**What could not be established, stated plainly:** no source found gives *funded-account
survival time* or a retention curve — the exact number a subscription business would need. The
inference below is therefore built on pass-rate and payout-rate data, not on observed tenure, and
should be treated as a reasoned estimate rather than a measured one.

Read this as a subscription business `[I]`: roughly 86–95% of your signups fail their evaluation,
and a meaningful minority re-enter the funnel later. Expect a **short (order-of-months) median
subscription life** with a lumpy re-acquisition tail; at $20/mo that is plausibly $20–60 LTV, but
the month figure is inferred, not observed. Firms tolerate this because the failure
*is* the revenue event — a challenge fee is collected up front. A SaaS collects monthly and gets
paid only while the trader survives, so **the tool's revenue is perfectly anti-correlated with the
customer's failure rate.** Worse: the better the tool works, the fewer breaches, the longer the
account survives — but the trader who survives long-term is in the 1–3% and is precisely the one
who outgrows the rule-tracking use case and wants a real journal instead.

Not automatically fatal — high-churn/high-recycle consumer SaaS exists — but it forces annual or
lifetime pricing (JournalPlus $159 one-time, Edgewonk annual-only) and it forces cheap, scalable
acquisition. Which brings us to:

**Acquisition channels.** `[R]`
- **Affiliate/referral is the industry's native motion** — 40–50% of challenge purchases are
  affiliate-driven at $40–80 CPA or 10–25% revshare; effective cost per *funded* trader $325–650.
  Prop-tool builders monetise the same way (FundedMath is literally a free calculator wrapped
  around an Apex code). A tool can be acquired *for free* by giving it away as affiliate bait —
  but then it is a lead magnet, not a business, and it competes with other free lead magnets. `[I]`
- YouTube + Discord + prop-specific subreddits are the organic channels; the SEO layer
  ("best journal for prop firms 2026") is already saturated and largely written by the vendors.
- **Firm partnership is the highest-leverage channel and the most dangerous.** FTMO answers it by
  building Account MetriX in-house and giving it away. `[V]`

---

## Wedge attractiveness

**Verdict: qualified no — do not make funded traders the wedge; do treat prop-firm rule modelling
as a possible later feature for whichever segment we do pick.**

The rule-compliance job is real, precisely specifiable (~15 rule families, 4 drawdown algorithms),
emotionally urgent, and genuinely different from reflective journaling — everything you want in a
wedge. But four things break it. **First, it is already served, and served free-or-cheap by people
better positioned than us:** TradesViz ships 20 firms × 65 account configs *plus* retroactive
evaluation *plus* a breach-simulating challenge mode at C$19.99/mo, TradeZella ships PropFirm Sync
on its $35 entry tier, and FTMO — the largest firm in the segment — gives its own traders MFE/MAE,
SL/TP efficiency and time-of-day analytics for nothing. The unoccupied ground is *live pre-trade*
enforcement, which is a low-latency risk product competing against the firm's own risk engine
sitting inside the order path. **Second, we would be building for the wrong asset class on the wrong
rails.** The growth segment is futures on Rithmic/Tradovate/TopstepX; TapeReader's existing
advantage is DAS Trader CSV for US equities, which maps to the small licensed-desk population
(T3, SMB, Seven Points) and to Trade The Pool — a firm on TraderEvolution, not DAS, whose own
Trustpilot reviewers complain its dashboard reports stale numbers. Essentially none of our existing
data pipeline transfers. **Third, the ecosystem is a hostile place to build.** 80–100 firms died in
under two years; MetaQuotes revoked platform access in 2024 and ProjectX did the same to seven
futures firms in Feb 2026, going Topstep-exclusive; the CFTC's flagship enforcement action against
this business model was dismissed with prejudice in May 2025, leaving the regulatory question open
rather than closed. Firm-specific parameters change under you (Apex's consistency rule moved 30%→50%
in Mar 2026 and its MAE rule was deleted), so a 65-config rules matrix is a permanent maintenance
tax with no defensibility — it is *tedious*, not *hard*, which is the definition of a bad moat.
**Fourth and worst, the unit economics invert.** Roughly 86–95% of challenge buyers never reach a
funded account and only ~7% ever see a payout — the strongest-sourced numbers in this file, since
they trace to FPFX Tech's operator-side analysis of 300,000+ accounts and to firm-cited rates from
FTMO and Apex, and two independent aggregators land on the same figures. The small remainder who
survive long-term are precisely the traders who stop needing a rule tracker and start needing the
reflective journal we would have deprioritised to build it. The one caveat I will flag rather than
paper over: **no source establishes how long a funded account actually survives**, so the
subscription-life estimate underneath this is inferred from pass and payout rates, not measured.
If the segment is ever revisited, that is the number to go and get first — it is the single input
that could overturn this verdict. Observed willingness-to-pay in prop tooling is $5–30/mo — *below* the general-journal
band — so we would be trading a higher-value customer for a cheaper, faster-churning one.

**The qualification, and it is a genuine one.** Three specific things found here are worth
importing regardless of segment choice, because they are cheap and they sharpen the product for
*any* serious trader: (a) **retroactive evaluation** — "given my actual history, would I have passed
a $50k EOD-trailing evaluation, and in what fraction of all rolling N-day windows?" is a superb,
honest, self-knowledge metric and it is pure computation over data we already store; (b) **an
EOD-trailing-drawdown curve** as a first-class chart alongside our existing R-based calendar, since
peak-to-floor ratcheting is a better discipline signal than a flat monthly P&L; (c) **cross-account
correlated exposure**, which generalises to anyone running more than one account. Build those as
analytics for our own trader. Do not build a rules matrix for 20 firms whose rules, platforms and
corporate existence are all outside our control.

---

## Sources

Firm-owned / primary `[V]`:
- [FTMO — Trading Objectives](https://ftmo.com/en/trading-objectives/) — accessed 2026-09-01
- [FTMO — Account MetriX blog](https://ftmo.com/en/blog/account-metrix-a-tool-for-analysing-and-improving-your-trading/) — accessed 2026-09-01
- [Topstep — Topstep Dashboard](https://www.topstep.com/topstep-dashboard) — accessed 2026-09-01
- [Topstep — TopstepX platform guide](https://www.topstep.com/blog/topstepx-platform-guide) — accessed 2026-09-01
- [Trade The Pool — The Program](https://tradethepool.com/the-program/) — accessed 2026-09-01
- [Trade The Pool — Terms & Conditions](https://tradethepool.com/terms-and-conditions/) — accessed 2026-09-01
- [Apex Trader Funding — Prop Firm Rules Explained](https://apextraderfunding.com/resources/prop-trading/prop-firm-rules-explained/) — 403 to crawler; surfaced via search 2026-09-01
- [ProjectX Gateway API docs](https://gateway.docs.projectx.com/docs/intro/) — accessed 2026-09-01

Vendor / pricing `[V]`:
- [TradesViz — Prop Firm Compliance Dashboard](https://www.tradesviz.com/blog/prop-firm-compliance-tracking/) — dated 2026-04-06, updated 2026-06-23; accessed 2026-09-01
- [TradesViz — Pricing](https://www.tradesviz.com/pricing) — accessed 2026-09-01
- [TradeZella — Prop Firm Trading Journal](https://www.tradezella.com/blog/prop-firm-trading-journal) — accessed 2026-09-01
- [TradeZella — Pricing](https://www.tradezella.com/pricing) — accessed 2026-09-01
- [FundedMath](https://www.fundedmath.com/) — accessed 2026-09-01
- [Traders Second Brain — prop firm multi-account tracking](https://traderssecondbrain.com/guides/prop-firm-multi-account-tracking) — accessed 2026-09-01
- [JournalX — FTMO Trading Journal & Drawdown Tracker](https://journalx.app/ftmo-trading-journal) — 403 to crawler; surfaced via search
- [TradeLens — FTMO trading journal](https://www.tradelens.vip/trading-journal/ftmo) — 403 to crawler; surfaced via search
- [JournalPlus — for prop firm traders](https://journalplus.co/for/prop-firm-traders/) — redirect loop; surfaced via search

Rules aggregators `[R]` (affiliate-adjacent — corroborate before relying):
- [Tanto — Apex Trader Funding rules](https://tradetanto.com/learn/apex-trader-funding-rules-what-you-need-to-know) — as-of Apr 2026
- [Tanto — Take Profit Trader rules](https://tradetanto.com/learn/take-profit-trader-rules-what-you-need-to-know) — as-of 2026-07-16
- [Tanto — Earn2Trade rules](https://tradetanto.com/learn/earn2trade-rules-a-complete-breakdown) — as-of 2026-07-01
- [Tanto — Topstep rules](https://tradetanto.com/learn/topstep-rules)
- [Tanto — best trading journal for prop firm traders](https://tradetanto.com/learn/best-trading-journal-prop-firm)
- [Tradecovex — Topstep Combine rules 2026](https://tradecovex.com/guides/topstep-combine-rules-2026)
- [Tradecovex — Apex 4.0 rules 2026](https://tradecovex.com/guides/apex-trader-funding-rules-2026)
- [QuantCrawler — Apex rules 2026](https://quantcrawler.com/learn/apex-trader-funding-rules)
- [QuantCrawler — Topstep rules 2026](https://quantcrawler.com/learn/topstep-rules)
- [For Traders — Topstep funded account rules 2026](https://fortraders.com/blog/topstep-funded-account-rules)
- [PropTradingVibes — Apex rules overview](https://proptradingvibes.com/blog/apex-trader-funding-rules-overview)
- [Thor — prop firm consistency rules explained](https://thortradecopier.com/blog/prop-firm-consistency-rules-explained)
- [TradingFinder — Earn2Trade rules 2026](https://tradingfinder.com/props/earn2trade/rules/)
- [QuantVPS — TakeProfit Trader daily loss limit](https://www.quantvps.com/blog/takeprofit-trader-daily-loss-limit)

Tooling round-ups `[R]` (vendor- or firm-published):
- [For Traders — 7 tools to track funded account performance](https://fortraders.com/blog/tools-track-improve-funded-account-performance) — published by a prop firm
- [TraderNotion — best journals for prop firm challenges 2026](https://www.tradernotion.com/blog/best-trading-journals-for-prop-firm-challenges-2026)
- [PropTradingVibes — best trading journal software](https://proptradingvibes.com/blog/best-trading-journal-software)
- [PropFirmApp — best trading journals for futures traders](https://propfirmapp.com/trading-tools/trading-journals) — 403; surfaced via search

Industry structure, stability and regulation `[R]`:
- [Track360 — prop trading industry statistics 2026](https://track360.io/blog/prop-trading-industry-statistics-2026) — sole source for the headline *market-size* figures
- [Chart Whisperer — prop firm statistics 2026](https://chartwhisperer.ca/prop-firm-statistics) — second aggregator; attributes pass/payout rates to **FPFX Tech** (300,000+ accounts) and the 71% breach figure to **TradeClaris**, and is explicit about which of its numbers are secondary compilation
- [Track360 — prop trading industry report 2026 ($850M)](https://track360.io/blog/prop-trading-industry-report-2026-market-analysis)
- [Track360 — MyForexFunds aftermath, CFTC lessons](https://track360.io/blog/myforexfunds-aftermath-cftc-lessons-for-prop-firm-operators)
- [The Prop Firm Guide — 80+ firms that shut down (2020–2026)](https://thepropfirmguide.com/prop-firms-that-shut-down/)
- [Finance Magnates — court throws out My Forex Funds lawsuit](https://www.financemagnates.com/forex/my-forex-funds-parent-defeats-cftc-in-court-as-judge-imposes-sanctions/)
- [DeSilva Law Offices — CFTC sanctioned after MFF dismissal](https://www.desilvalawoffices.com/articles/blog/2025/may/cftc-case-dismissed-my-forex-funds-controversy-h/)
- [FX News Group — MyForexFunds begins returning client funds](https://fxnewsgroup.com/forex-news/retail-forex/prop-firm-myforexfunds-begins-returning-client-funds-following-court-vindication/)
- [The Industry Spread — regulators closing in on retail prop trading in 2026](https://theindustryspread.com/retail-prop-trading-regulation-2026-my-forex-funds-cftc/)
- [Damn Prop Firms — ProjectX & TopstepX complete 2026 guide](https://damnpropfirms.com/best-prop-firm-trading-platforms/projectx/)
- [PickMyTrade — TopstepX API access guide 2026](https://docs.pickmytrade.io/docs/connect-projectx-to-topstep-api/)
- [Tradecopia — what is ProjectX](https://tradecopia.com/learn/what-is-projectx)

Trader sentiment `[R]`:
- [Trustpilot — Trade The Pool reviews (p.5)](https://ie.trustpilot.com/review/tradethepool.com?page=5) — reviews dated Jun 2026
- [Elite Trader — "APEX Funded Accounts: Denied Payouts and Closed My Accounts"](https://www.elitetrader.com/et/threads/apex-funded-accounts-denied-payouts-and-closed-my-accounts-my-experience.382471/) — 403 to crawler; surfaced via search
- [ImanTrading — Apex Trader Funding problems](https://www.imantrading.org/firmfaq/apex-trader-funding-problems)
- [PropFirmsTimes — Apex enforcement wave, 2026-02-21](https://www.propfirmstimes.com/2026/02/21/apex-trader-funding-cracks-down-explosive-enforcement-wave-exposes-alleged-silver-scheme-and-forces-sweeping-account-closures/)
- [FundedXYZ — why prop firm payouts get denied](https://www.fundedxyz.com/blog/why-prop-firm-payouts-get-denied/)
- [Editorialge — mastering the Topstep dashboard](https://editorialge.com/mastering-the-topstep-dashboard/)
- [Myfxbook — Trade The Pool review](https://www.myfxbook.com/prop-firms/trade-the-pool)
- [FXEmpire — Trade The Pool review 2026](https://www.fxempire.com/prop-firms/tradethepool)

US licensed equity prop desks `[R]`:
- [Black Eagle FG — prop trading firms for US equities](https://blackeaglefg.com/prop-trading-firms-us-equities/)
- [Vortex Capital Group](https://www.vortexcapitalgroup.com/)
- [Traders Log — proprietary trading firms](https://www.traderslog.com/proprietarytradingfirms)
- [SMB Capital — equity trader posting](https://smbcapital.applicantstack.com/x/detail/a2vkn4mkv8s9?template_id=2248)

**Evidence gaps, for `07-open-questions`:**

1. **Reddit unreachable.** `reddit.com`, `old.reddit.com` and the `.json` endpoint are all blocked
   to the crawler, and the WebSearch quota was exhausted before `site:reddit.com` snippet search
   could be tried. r/Daytrading, r/FuturesTrading and the prop-firm subreddits contribute *nothing*
   to this file. First-hand threads on drawdown-tracking pain, on which tools funded traders
   actually pay for, and on what they say firm dashboards lack, remain unverified.
2. **Funded-account survival time / retention curve — not established by any source found.** This
   is the load-bearing input for the churn verdict and it is currently inferred, not measured.
3. **Trade The Pool's native dashboard** was assessed only through reviews and third-party
   writeups; no product screenshots or docs were reachable. It is the one equities-side firm whose
   traders overlap TapeReader's existing data model, so this is worth closing by hand.
4. **Prop-tool pricing below the top two** (JournalX, TradeLens, JournalPlus, PropJournal, Profit
   AI, Traders Second Brain) is largely undisclosed or 403'd; the "$5–30/mo ceiling" claim rests on
   FundedMath (free), PropTrackerHQ ($5), Tanto ($14–25) and For Traders ($29.99).
