# 11 — Red Team

**Track J.** Written by an agent instructed to kill this idea. A red team that
concludes "looks good to me" has failed at its only job, so read everything below
as advocacy — but advocacy that is checkable, because every number in §3 was
measured against the files in this repo and can be re-run.

**As-of: 2026-09-08.**

**Evidence key:** `[V]` verified on the source's own material · `[R]` reported by
a third party · `[I]` my inference · `[M]` **measured by me during this pass**,
against `data/social/apewisdom/2026/2026-09-08.ndjson` and
`scripts/social-ingest.mjs`. `[M]` outranks `[V]` outranks `[R]`.

---

<table>
<tr><td>

## ⬛ VERDICT — **DON'T BUILD IT**

**The claim under attack:** *adding social/crowd sentiment to TapeReader will
measurably improve a discretionary intraday breakout trader's decisions.*

**That claim does not survive.** Not on the literature, not on the arithmetic
already assembled in this directory, and not on four new defects I measured in
the confirmatory arm itself.

**What "don't build it" means, precisely — three things stop, one continues:**

| | Decision |
|---|---|
| ⛔ **No journal columns.** | No social field is appended to the 96-column sheet. The migration contract is additive-only and permanent. |
| ⛔ **No Morning Plan attention panel, no `/market` or `/scans` social surface, no signup.** | The public surface is separately dead on licensing (§6.4): the entire set of sources whose terms permit public display is Wikipedia pageviews, GDELT and Bluesky — and this study rejected the latter two on ticker resolution and emptiness. |
| ⛔ **No multi-quarter analysis programme.** | H1–H4 and H6 are not "exploratory". They are decorative: by the pre-registration's own promotion rule they cannot reach a terminal node before 2028, and for literature-scale effects, ever. |
| ✅ **The collector keeps running.** | ~$0, 66 MB/year, and ApeWisdom history cannot be repurchased at any price. **This is an archival decision, not a product decision, and it must not be narrated as a reduced build.** Turning the cron on costs one uncommented block; believing anything on the strength of it is the part that stops. |

**Two things escape this verdict because they are not social sentiment**, and
they should be renamed so they stop borrowing this study's justification:
Polygon `insights` backfill into the **100%-blank `Catalyst` column**, and SEC
EDGAR 8-K item codes. Those are *data-entry* wins with exact ticker resolution
and legal-liability provenance. They belong in the journal backlog, not here.

**Cheapest experiment that falsifies the whole thesis early:** §9.

</td></tr>
</table>

---

## 0. What I concede before attacking

A red team that overstates gets discounted, so the concessions come first and
they are real.

1. **This directory is unusually honest.** `05-preregistration.md` §0 already
   says the trade-level question is unanswerable until 2029–2041, in bold, before
   any data existed. Most of my §2 is marshalling their own findings. The
   pre-registration is a better document than the idea it protects.
2. **The collector is genuinely cheap and genuinely irreversible-if-skipped.**
   ApeWisdom exposes no history `[V]`; a night not collected is gone. 66 MB/year
   gzipped `[V]` against an unrepurchasable series is a good trade at any belief
   level. I am not arguing to delete it.
3. **Polygon `insights` really is free, replayable and already paid for.** Each
   article carries a real `published_utc`, so a `published_utc < entry_time`
   filter produces a legitimately replayable feature `[V]` — that is a materially
   stronger position than the post-hoc-scored vendor data the brief warns about.
4. **The join rate is better than I predicted — I checked, and I was wrong.** I
   expected the trader's names to be invisible to a WSB-derived aggregator. On
   the one snapshot that exists, **15 of his 18 non-ETF May trade-instances land
   on a symbol with ≥5 mentions** `[M]`. Coverage is not the binding constraint.
   (§3.4 explains why that fact hurts the study rather than helping it, but the
   concession stands as stated.)
5. **The "50% ETF haircut" is slightly overstated.** SOXL is not signal-free — it
   sits at **rank 36/797 with 13 mentions** `[M]`. Restoring SOXL lifts analyzable
   accrual from ~18 to ~23/month and pulls the *d*=0.5 date from Jul 2027 to
   ~May 2027 `[I]`. Two months. It does not rescue anything.
6. **Track C set a standard this study should be judged by, and passed it.** It
   tested short-volume ratio against RVOL on 4,100 ticker-days, got r = −0.005,
   and only then claimed additivity `[V]`. That is the right method. **No
   attention feature in this study has been given that test yet**, which is §4.

---

## 1. The academic case against

### 1.1 The founding result of this field failed to replicate, and its fund closed

Bollen, Mao & Zeng (2011), *Twitter mood predicts the stock market* (J.
Computational Science) reported ~87% directional accuracy on the DJIA and is the
single most-cited justification for products in this category `[R]`. Lachanski &
Pav (2017), *Shy of the Character Limit* (Econ Journal Watch) performed the first
in-sample replication and found no evidence the mood measures help predict the
market out of sample; Derwent Capital Markets, the hedge fund built to trade the
signal, closed within about a month in 2012 `[R]`.

That is the base rate this study is drawing from: **the field's headline result
is a failed replication with a dead fund attached.**

### 1.2 The effect sizes actually reported are one to two orders of magnitude below what this study can detect

| Study | Setting | Reported effect |
|---|---|---|
| Antweiler & Frank (2004), *J. Finance* 59(3) | 1.5M Yahoo!/Raging Bull messages, 45 firms | Messages predict **volatility** and disagreement predicts **volume**; the return effect is statistically significant but economically small `[R]` |
| Da, Engelberg & Gao (2011), *J. Finance* 66(5) | Google SVI, Russell 3000 | Abnormal SVI → **~+30 bp** characteristic-adjusted over the **next two weeks**, reversing within the year `[R]` |
| Behrendt & Schmidt (2018), *J. Banking & Finance* 96 | **Intraday**, 5-min absolute returns, all DJIA names | Statistically significant co-movement; effects of **negligible economic magnitude**, and **out-of-sample forecasts are not improved** by adding Twitter sentiment or activity `[R]` |
| Barber, Huang, Odean & Schwarz (2022), *J. Finance* 77(6) | Robinhood herding | Intense retail buying forecasts **−4.7% average 20-day abnormal returns** on top-purchased names `[R]` |
| Bradley, Hanousek, Jame & Xiao (2024), *RFS* 37(5) | WSB due-diligence reports | Predictive **pre-GameStop**; predictive power **vanishes post-GME**, with price-pressure-focused reports up 165% and attention-stock reports up 75% `[R]` |
| Renault (2017), *J. Banking & Finance* 84 | StockTwits, half-hourly | First-half-hour sentiment change forecasts last-half-hour return — **of the S&P 500 index ETF**, not of single names `[R]` |

On Antweiler & Frank's own reading of their return result: *"It is hard to
imagine using such small magnitudes to earn excess returns"* (Antweiler & Frank,
2004) `[R]`.

**Now put those numbers next to the pre-registration's own power table.** At
N = 100 analyzable trades split three ways, the detectable difference between the
top and bottom attention bucket is **≈ 1.03 R of MFE** at sd = 1.5 `[V,
05-preregistration §4.2]`. A +30 bp two-week characteristic-adjusted drift is not
1 R of intraday maximum favourable excursion. It is not 0.1 R. The study is
instrumented to detect an effect roughly **thirty times larger than the best
documented one**, and the literature's own effect (*d* ≈ 0.2, ρ ≈ 0.05) needs
N = 1,177–3,137 → **2032–2041** `[V, §4.3–4.4]`.

### 1.3 Four of those six studies point the wrong way for H1

This matters more than the magnitudes. **H1 (Fuel) says rising attention →
better excursion.** The best-identified attention results in finance say the
opposite:

- Barber & Odean's attention hypothesis: retail buys attention-grabbing stocks,
  producing temporary price pressure and **subsequent underperformance** `[R]`.
  The Robinhood paper quantifies it at −4.7% over 20 days `[R]`.
- Da/Engelberg/Gao: attention → two weeks of drift → **reversal within the year**
  `[R]`.
- Renault's AMF work on suspicious recommendations: abnormally high message
  activity on small caps is associated with a large event-day rise followed by a
  **sharp reversal the next week**, strongest when the activity comes from
  promoters `[R]`.

So the literature's modal finding is closer to **H2 (crowded/late is a fade)**
than to H1 — and the pre-registration is right to have fixed H2's direction as
negative in advance. But note what that means for the product: the actionable
form of the well-documented effect is *"don't buy the loudest name"*, which is a
**20-day** statement about **retail net buying**, measured on a population of
holders this trader is not part of and at a horizon he is never exposed to. He is
flat by 16:00 ET. **A reversal that arrives over the following month is not a
fact about his trade.**

### 1.4 The one result closest to his actual use case is the most negative one

Behrendt & Schmidt is the single most on-point paper in the literature for this
study: **intraday**, **individual names**, **5-minute resolution**, high-quality
Twitter data with real sentiment scoring — everything this study wants and cannot
have. They find negligible economic magnitude and **no out-of-sample forecast
improvement** `[R]`. Renault (2017) is the strongest positive intraday result and
it is an **index-level** finding, which maps onto H6 (regime) — the arm the
pre-registration itself calls the worst-powered in the set and marks permanently
exploratory `[V, §3.6]`.

**The literature's intraday single-name verdict is null; its intraday positive
result lives on the one hypothesis this study cannot power.**

### 1.5 Publication bias and decay are not hypothetical here

- McLean & Pontiff (2016), *J. Finance*: across 97 published predictors, returns
  are **26% lower out-of-sample and 58% lower post-publication** `[R]`.
- Hou, Xue & Zhang (2020), *RFS*, *Replicating Anomalies*: the large majority of
  published anomalies fail to replicate under value weighting and NYSE
  breakpoints `[R]`.
- Harvey, Liu & Zhu (2016), *RFS*: with hundreds of tested factors, a t-statistic
  of 2.0 is not evidence; the threshold should be nearer 3.0 `[R]`.

Apply the McLean–Pontiff haircut to a +30 bp two-week effect discovered in
2004–2008 Google data and published in 2011, then apply it again for the fact
that **every retail brokerage now ships a trending-tickers list**, and there is
nothing left to find. **Attention is the most commoditised signal in retail
finance.** Robinhood, Webull, Fidelity, StockTwits, Yahoo and TradingView all
publish a trending list for free, in the app, before the open. A signal that
several million retail accounts see on their home screen is not an edge; it is
the consensus.

And Bradley et al. is the decay result *inside this exact source*: WSB research
was informative until the population changed, then it was not `[R]`. **The
collector's adopted source is ApeWisdom, whose disclosed inputs are Reddit
(WSB-dominated) and 4chan /biz** `[V, 01-sources-social §9.1]`. This study is
building on the post-GME WSB whose predictive content a top-three finance journal
measured as gone.

---

## 2. The cumulative case from the facts already in this directory

Individually each of these is a caveat. Together they are a structure, and the
structure is that **every path to a signal is severed at a different point.**

**Access is fine; nothing else is.**

1. **The best social source is contractually blocked.** StockTwits has
   structurally pre-parsed cashtags and human-declared Bullish/Bearish labels on
   45–48% of messages — the only look-ahead-immune ground truth in the whole
   study `[M, A1–A3]`. The v2 docs now return 404 across the board, the developer
   portal is frozen at "© 2021", the only API terms ever published banned
   creating **or displaying** sentiment summaries, and `robots.txt` disallows
   `/*?` — i.e. every paginated call, which *is* the backfill mechanism `[V,
   13-open-questions §6]`. **The closed door is not hiding a better deal.**
2. **The second-best is empty.** Bluesky's access terms are the most permissive
   in the track and the data is not there: 0–15 posts/day on the names a breakout
   scan surfaces, a 14,514-post firehose sample containing one genuine US-equity
   post, and the whole network's daily US-equity cashtag output at roughly a
   third of StockTwits' TSLA volume alone `[V, §11]`.
3. **X is priced out.** $10/month buys ~2,000 post reads ≈ **95 posts/day across
   the entire watchlist** `[I]`. Nitter is dead by cease-and-desist dated
   2026-08-24 `[M]`.
4. **Reddit's only route is one unpaid maintainer.** Every keyless path 403s to
   datacenter IPs, so GitHub Actions is blocked by construction; Arctic Shift is
   the sole viable route, with **no stated licence and an explicit no-uptime
   guarantee** `[V]`. And Reddit's ticker resolution is fatal on its own: **0.6%
   of WSB comments carry a cashtag**, forcing bare-token extraction, and **39 of
   51** tested common words are real tickers `[M]`.
5. **The adopted sources are the weakest ones that happened to be open.**
   ApeWisdom has **no terms-of-service page at all** — `/terms/` 404s `[V]` — and
   redistributes Reddit-derived data with no evident licence, so adopting it
   means inheriting someone else's unresolved exposure with no contract to stand
   on `[V, 09-legal §12]`. Tradestie's advertised `sentiment_score` is a **static
   per-ticker constant** across 5.4 years — TSLA is 0.381 on all 30 dates it
   appears `[V]` — i.e. a ticker fixed effect wearing a sentiment costume, and a
   look-ahead landmine. Its documented host's **TLS certificate expired
   2026-01-03** `[V]`.
6. **The trader's own trade stream cannot answer the question.** ~18 analyzable
   trades/month, 11 distinct symbols, 35 of 36 trades long, `Catalyst` 100%
   blank, `Conviction` 61% blank, symbol ICC 0.10 `[V]`. Even the *discovery* set
   (~75 analyzable trades) only detects *d* ≈ 0.65 ≈ 0.97 R `[V, §4.6]`.

**The cumulative shape:** the source with clean ticker resolution may not be
used; the source that may be used has no licence and no terms; the platform with
the deepest archive is unaffordable; the platform with the best terms has no
users; and the trader whose decisions this is all for produces eighteen usable
observations a month. **There is no configuration of these facts that yields a
tested signal on a horizon anyone will wait for.**

---

## 3. Four new defects, measured, in the arm the study calls confirmatory

Everything above was already known here. This section is not. **The
pre-registration designates H5 as the single confirmatory test and says it is
"answerable comfortably by ~Dec 2026"** `[V, §0, §5.1]`. It is not, and the
reasons are specific.

### 3.1 H5's power is computed on the wrong universe — off by ~5×

§4.5 states H5 runs on "ticker-days across the liquid universe (~4,000/day)" and
gets ~360,000 ticker-days in 90 days `[V]`. That 4,174 figure is the **price**
universe from `docs/market-scans/phase-1-spec.md` (price ≥ $1, dollar volume ≥
$5M). The **social** universe is what ApeWisdom actually returns.

Measured on the only snapshot that exists `[M]`:

| Cut | Tickers in `all-stocks` |
|---|---|
| rows returned | **797** |
| mentions ≥ 2 | **185** |
| mentions ≥ 5 | **96** |
| mentions ≥ 10 | **49** |

So the joinable panel is **797/day, not ~4,000** — and the *informative* panel,
where a count carries any resolution at all, is **~96/day**. Ninety days gives
**~71,700 joinable ticker-days**, of which ~8,600 are above the ≥5 floor `[M]`.
That is still a large N, so this alone does not sink H5 — but it is a **5×
overstatement in the one power calculation the study leans on**, and it should be
corrected before anyone quotes "comfortably by December".

The worse consequence is what happens to the other ~3,380 liquid names per day
that ApeWisdom never returns. They are either dropped — in which case H5 is not a
universe test and inherits its own selection problem — or zero-filled, in which
case `overnight_delta = ln(1/1) = 0` and the **Flat bucket becomes 80% names with
no social data at all**. "Surging vs Flat" then decomposes into *in-play vs
ignored*, which is a market-cap-and-liquidity sort, and of course it predicts
bigger gaps. The §8.1 RVOL gate is applied to the **feature**, not to this
membership effect, so it would not catch it `[I]`.

### 3.2 The `Surging` cut point was frozen without calibration and fires on 62% of the top 50

§3.5 fixes `Surging: overnight_delta ≥ 1.00 (≈ +172%)` as an absolute constant,
and §3.7 forbids ever moving it `[V]`. That discipline is correct in principle.
In practice the constant was chosen with **zero snapshots in hand**.

Measured on the first snapshot, using ApeWisdom's own `mentions_24h_ago` lag pair
as the closest available proxy for a day-over-day ratio `[M]`:

- Median top-50 ratio `mentions / mentions_24h_ago`: **3.67** (range 0.37 → 26.0)
- **31 of the top 50 tickers** clear ln(ratio) ≥ 1.00 → classified **Surging**

The boundary intended to isolate a rare tail sits **below the median of the
ordinary day-to-day distribution**. Caveat honestly: 2026-09-07 was Labor Day, so
this comparison straddles a market holiday and overstates a typical day. But that
is the point in a second way — **the feature is dominated by day-of-week and
holiday effects that no absolute constant can absorb**, and a 20-session z-score
was specified for H1 and *not* for H5.

There is a third, compounding problem. With **612 of 797 rows sitting at exactly
1 mention** `[M]`, the `+1` smoothing means a ticker going **1 → 5 mentions
overnight scores ln(6/2) = 1.10 → Surging**. **Four extra Reddit comments
qualifies a stock as surging.** The Surging bucket will be overwhelmingly
Poisson noise off the count floor, and the pre-registration sets **no minimum
count floor for H5** (it sets one only for H3) `[V]`.

Together these mean the confirmatory test is locked, by its own anti-p-hacking
rules, to a cut point that is already visibly miscalibrated. Fixing it requires
an §10 amendment — which by §0 rule 6 must be marked as made **after** data was
seen, permanently downgrading the arm it was meant to protect.

### 3.3 `mentions_pct_universe` is 77% ties — H2's buckets are an array-ordering artifact

H2 buckets on percentile rank by mention count within the day's `all-stocks`
list `[V, §3.2]`. Measured: **612 of 797 rows have mentions == 1** `[M]`. Every
rank from 186 to 797 carries **identical data**.

Concretely, from his own traded symbols `[M]`:

| Symbol | Rank | "Percentile" | Mentions |
|---|---|---|---|
| CSCO | 192 / 797 | 76.0 | **1** |
| QUBT | 732 / 797 | 8.3 | **1** |

Two observations with the same measurement are assigned percentiles **68 points
apart**. The feature manufactures continuous-looking variation out of a tie-break
in ApeWisdom's array order. Any regression, rank test or bucket boundary applied
below the ~77th percentile is reading sort order, not attention.

### 3.4 His trade set sits at the 96.5th attention percentile — range restriction, now measured

§8.2 flags selection circularity as "the deepest problem in the study" and asks
for the distribution to be reported at every window `[V]`. Here it is, on his 11
May symbols `[M]`:

| Symbol | Trades | Attention percentile |
|---|---|---|
| SPY | 6 | 100.0 |
| NVDA | 6 | 99.7 |
| NBIS | 3 | 99.5 |
| QQQ | 7 | 99.2 |
| IREN | 2 | 96.5 |
| NOW | 1 | 96.1 |
| SOXL | 5 | 95.6 |
| SMCI | 2 | 89.5 |
| DELL | 1 | 89.2 |
| CSCO | 2 | 76.0 (1 mention) |
| QUBT | 1 | 8.3 (1 mention) |

Weighting by trades and excluding ETFs: **9 of 18 non-ETF trade-instances are at
or above the 99th percentile**, and only 6 are below the 90th. The **median
non-ETF traded name sits at the 96.5th percentile** of the day's attention
distribution `[M]`.

This is the concession from §0.4 turning into the strongest argument against the
study. **Coverage is excellent precisely because he only trades names the crowd
is already shouting about.** Consequences, all of which the pre-registration
anticipates in prose and none of which it can fix:

- **H2 has almost no `Normal` cell.** The 6 trades below the 90th percentile are
  SMCI, DELL, CSCO and QUBT — and **3 of those 6 sit at exactly 1 mention**,
  i.e. at the noise floor, indistinguishable from the 612 names nobody mentioned.
  The `Normal` bucket is not "low attention"; it is "no data".
- **Effective symbol count per cell is ~2.** The Extreme cell is 6/9 NVDA. A
  reported "n = 30" in 2027 will be four symbols on six days, exactly the failure
  §8.4 names.
- **Attenuation is severe.** A population correlation of 0.15 can present as 0.05
  inside a sample selected on the predictor `[I, §8.2]`. So every trade-level
  null this study produces will be **uninterpretable in the direction that keeps
  the study alive** — "we saw nothing, but we couldn't have."

### 3.5 `overnight_delta` does not measure overnight attention

This is a specification error, not a power problem, and it is at the centre of
the confirmatory arm.

ApeWisdom `mentions` is a **rolling trailing-24h count** `[V→I, 01-sources-social
§9.1]`. Write M(t) for the count over (t−24h, t]. §3.5 defines

```
overnight_delta = ln( (M(today 09:15) + 1) / (M(prior 16:05) + 1) )
```

Expand the windows. M(t₀₉₁₅) covers (yesterday 09:15 → today 09:15];
M(y₁₆₀₅) covers (day−2 16:05 → yesterday 16:05]. The shared segment
(yesterday 09:15 → yesterday 16:05] cancels, leaving

```
M(t₀₉₁₅) − M(y₁₆₀₅) = [this overnight] − [last overnight]
```

The **difference** is a clean first difference of overnight attention — that part
is elegant and I did not expect it. But H5 uses the **log ratio**, and
ln(A/B) ≈ (A−B)/B where B is a **24-hour level dominated by regular-session
chatter**. So the predigested predictor is:

> **(this overnight's mentions − last overnight's mentions) ÷ yesterday's
> all-day attention level.**

That is an *acceleration* term, scaled by an unrelated denominator — not the
"16:00→09:15 ET mention delta" the brief names `[V, 00-brief §D-H5]` and not what
§3.5 says it computes. Practical consequences:

- A stock with **large but steady** overnight attention reads **Flat**. The
  Morning Plan's most obvious use case — "what did the crowd talk about while I
  slept" — is invisible to this feature.
- The denominator makes the same overnight jump score differently on a
  high-volume name than a quiet one, in a way that has nothing to do with
  overnight interest.
- **The fix is nearly free and should be recorded regardless of the verdict:** use
  the *difference* `M(t₀₉₁₅) − M(y₁₆₀₅)`, which is exactly overnight mentions net
  of the prior overnight, and z-score it per ticker. That the fix is cheap does
  not rescue the study; it does mean the confirmatory arm as currently
  pre-registered would have tested the wrong quantity.

**And the whole construction rests on an inference.** That `mentions` is a
rolling 24h window is tagged `[V→I]` — deduced from values falling as well as
rising `[V]`. Falling counts are equally consistent with post deletion,
re-deduplication, or a since-midnight counter with retractions. **The confirmatory
test of this study depends on undocumented window semantics of a free site that
has no terms of service page** `[V]`.

### 3.6 A collector bug that seals truncated snapshots permanently

`scripts/social-ingest.mjs` `[M]`. The idempotency key is `scope|slot`, and a
paging failure breaks out of the loop while **keeping the rows already
accumulated**:

```js
if (!res.ok) { console.error(`  ${filter} p${page}: FAILED (${res.status})`); break; }
```

Those partial rows are then written by `append()`, which registers
`all-stocks|premarket` as present. **Any re-run in the same slot skips that scope
entirely** — so a snapshot truncated at page 3 of 8 is permanently sealed as
complete, with no error surviving past the Actions log. The failure mode is
silent, and it corrupts exactly the tail of the distribution (ranks 300+) that
H3's fresh-discovery hypothesis lives in.

Two smaller ones, recorded for whoever maintains this:

- **`slotFor` boundaries are fragile under DST.** The `5 20 * * *` cron lands at
  16:05 ET under EDT and 15:05 ET under EST; `prior_close` begins at 15:00, so
  the slot survives by **five minutes** `[M]`. The workflow's own comment
  acknowledges the drift but not how close the boundary is.
- **Unknown filter names return `{"count":0}`, not 404** `[V]`. A typo becomes a
  silent year-long gap, and the collector validates nothing.

---

## 4. Circularity — is this RVOL with extra steps and a worse licence?

The journal already computes **RVOL, %Gap, %ATR, Avg $ Vol, Breakout Vol Ratio,
OR %ATR, ADR, 30mATR** `[V, CLAUDE.md]`. The incremental-validity question is
therefore the whole question, and the honest answer is that **nobody has measured
it yet.**

What the literature says about the general form: attention proxies are strongly
related to abnormal trading volume, and strategies built on attention and
disagreement proxies produce returns that are marginal and **much smaller than
the corresponding abnormal-trading-volume strategies** `[R]`. That is the
worst-case reading of H1 stated as a published result: the volume feature
dominates the attention feature built on top of it.

Three structural reasons to expect it here specifically:

1. **The generating process is shared.** People post about what is moving on
   volume. ApeWisdom's own methodology counts distinct posts/comments mentioning
   a ticker `[V]` — a direct function of how loud a name is that day, which is
   what RVOL measures.
2. **`13-open-questions.md` §10 names a mechanism that guarantees a spurious
   H1.** A measurable share of small-cap cashtag volume is other people's
   scanners posting price moves — *"$SATL breakout, up 13.9% on 4,801,697
   volume"* `[V]`. That is a **lagging transform of price wearing the costume of
   sentiment.** Without a bot denylist, H1 measures breakouts causing bots to post
   about breakouts. And **author diversity — the guard the brief asks for — is not
   computable from any adopted source**, because no A7 aggregator exposes
   per-post text or author identity `[V, §2]`. The detector for the trap is
   unavailable on the sources that have the trap.
3. **The gate is set at |r| > 0.5, which is generous.** A feature correlating 0.45
   with RVOL passes and then explains almost nothing incrementally. The
   pre-registration mitigates this with the median-regression second form (§9.3),
   which is the right instrument — but that second form is what will actually
   decide the study, and it is a *harder* test than the gate.

**Concession:** the study does pre-register this test, does specify the frozen
control set, and does pre-commit to the exact wording *"it was RVOL with extra
steps"* on failure `[V, §7]`. That is better than any vendor in this category
does. My objection is not that the risk is unacknowledged; it is that **the risk
is very likely to realise, and it can be checked in October 2026 for one day's
work instead of being discovered in July 2027** (§9).

---

## 5. The behavioural case — the failure mode is not "wrong", it is "right and inert"

Assume the data is correct. Assume z-scores are clean, bots removed, licence
resolved. **Now ask what changes at 09:15 ET.**

**5.1 He will not skip a trade because of a mention z-score.** The decision he
makes is: this name is gapping on volume, the opening range is forming, the level
is here, size is R. A number saying "attention z = 1.7" arrives with no
directional content, no level, and no relationship to his stop. The literature's
own effect is a magnitude-and-horizon claim (+30 bp over two weeks) with a sign
that is *negative* at the horizon where it is best identified. There is no
translation from that to "take this ORB or don't".

**5.2 The confirmatory arm's outcome is not a decision variable.** H5 predicts
**|next-session gap| ÷ ADR** — an **absolute** value `[V, §3.5]`. Even if it
passes cleanly, the output is *"this name will move more tomorrow"*, with **no
sign**. He is a long-biased ORB trader (35 of 36 trades long `[V]`). A
magnitude-without-direction forecast tells him a name will be volatile — which
%ATR, ADR, %Gap and RVOL already tell him, from data he already has, with a
licence he already holds. **The one arm the study can power produces the one
output his process cannot consume.**

**5.3 The realistic outcome is a dashboard glance.** `docs/journal-market-research`
already measured the shape of this failure: the Morning Plan's fill rate is
unmeasured and the red team there rated the assumption that it gets filled in
"UNRESOLVED, leaning against" `[V, 06-dogfood-backlog Tier 3]`. **Item 0.1 —
measure the fill rate — is described as "the highest-value 20 minutes in this
entire study" and has still not been run** `[V]`. Adding a panel to a form whose
completion rate is unknown and suspected falling is building a second floor on an
unsurveyed foundation.

**5.4 A noisy signal on a discretionary process can make execution worse.** This
is the argument the pre-registration makes better than I can, so I will just point
at it: §7.1 pre-commits that *"a pre-market attention rank that has been measured
not to predict anything is worse than absent — it will be looked at, and it will
influence decisions, precisely because it is on the screen"* — paraphrasing `[V]`.
Extend that. The journal's own architecture keeps `Origin` (idea source)
deliberately separate from `Process Followed?` (execution discipline), because
contaminating one with the other destroys both signals `[V, CLAUDE.md]`. A
sentiment column is an **idea-source** axis. If it starts influencing *execution*
— hesitating on a clean setup because attention is "extreme", or sizing up
because it is "surging" — it does exactly the contamination the journal's design
exists to prevent, and it does it to the single metric (`Process Followed?`,
100% labelled `[V]`) that is currently the cleanest field on the sheet.

**5.5 Post-hoc rationalisation is the concrete harm.** With 15 exploratory tests
across 6 hypotheses and 3 outcomes `[V, §5.2]`, plus a permanent "underpowered"
verdict on all of them, the study's realistic steady state is **a quarterly file
of suggestive tercile tables that may never be acted on.** Human beings do not
read a table four times a year and act on none of it. The most likely behavioural
outcome of building this is not a better trader — it is a trader with one more
number to explain a loss with.

---

## 6. Opportunity cost — this is the weakest link on the board

Two designed, unbuilt bodies of work already exist in this repo, and both beat
this on every axis that matters.

### 6.1 The dogfood backlog contains live defects that corrupt this study's own outcome variable

`docs/journal-market-research/06-dogfood-backlog.md` Tier 0 `[V]`:

| Item | What it is |
|---|---|
| **0.2** | **No auth on 14 journal API routes.** Live on tapereader.us, proxying service-account access to the sheet, **with mutating PATCH/POST endpoints open.** |
| **0.3** | The grouper **mis-handles a position that flips through zero**, silently corrupting trades — and therefore every statistic downstream. |
| **0.4** | Comma-split Setup/Catalyst **double-counts P&L into each value**, inflating breakdown totals by an unknown amount. |
| **0.5** | **Zero tests exist in the journal code.** |

Read 0.3 and 0.5 against this study's primary outcome. **The pre-registration's
primary is `Max R Before Stop`, produced by that untested pipeline** `[V]`. The
study proposes to spend until 2029 hunting a 0.45 R difference in a quantity
whose measurement error has never been bounded, on a grouper with a known
corruption bug and no golden-file tests. **You cannot measure a small effect with
an uncalibrated instrument, and calibrating the instrument is item 0.5 on a list
nobody has started.**

0.2 is worse in a different way: it is a live security exposure on a public
domain, and it has been known since 2026-09-01.

### 6.2 Tier 1 is strictly dominant on value-per-hour

Every Tier 1 item is a **rendering layer over columns already computed and stored
and never once looked at** `[V]`:

- **1.1 Market Behavior reports** — performance sliced by %Gap band, RVOL, ATR,
  distance from SMAs, prior-close location. Described as *"the single largest gap
  between data we hold and insight we extract"*. Effort: M.
- **1.2 Exit Analysis** — float the last exit to max P&L bounded by actual risk.
  Strictly better-formed than the Capture Tracker the journal currently
  over-trusts.
- **1.4 Sample-size gating on every statistic** — Wilson intervals and an explicit
  "not enough data yet" band.

**Note what 1.1 is.** It is the *same question this study is asking* — "under
which conditions does my edge work?" — answered against **RVOL, %Gap and %ATR,
which are already measured, already licensed, already joined to every trade, and
already backfilled**. It needs no collector, no vendor, no ToS resolution, and no
three-year accrual. If crowd attention is largely a function of volume and
volatility (§4), then **1.1 is a strictly better-powered version of this entire
study, available in days.**

And 1.4 is the ironic one: the discipline `05-preregistration.md` spent 979 lines
building for a hypothetical future dataset is **not yet applied to the statistics
the trader looks at today.**

### 6.3 Tier 0.1 is 20 minutes and gates the product surface

The Morning Plan attention panel is the main product output of this study. Its
prerequisite — *does he fill in the Morning Plan?* — costs 20 minutes to measure
and **has not been measured** `[V]`. Building a panel for a form of unknown
completion rate is unjustifiable at any effect size.

### 6.4 The public product is dead on licensing before it is dead on statistics

`09-legal-tos.md` §12: the complete list of sources whose terms permit public
display of derived metrics is **Wikipedia pageviews, GDELT, and Bluesky** `[V]`.
Of those, this study **rejected GDELT** (no ticker resolution) and **measured
Bluesky as empty**. **The entire licensed public social-sentiment surface for
tapereader.us is Wikipedia pageviews.** ApeWisdom and Tradestie are `⚠️ UNCLEAR`
with no published terms at all; StockTwits is a flat no; Reddit and Alpha Vantage
and Polygon are private-use-only; and the cheapest confirmed self-serve public
display licence found anywhere in the survey is **Twelve Data Venture at
$499/mo** `[V, 13-open-questions §1]`.

So `07-product-surface.md` has, at most, a Wikipedia-pageview panel to design.
That is not a crowd-sentiment product.

*(Separately and much more urgently: §1 of `13-open-questions.md` found that
Polygon's individual licence forbids public display, which **already** blocks the
built-and-designed market-scans product and may expose the shared Google Sheet.
That finding is worth more than this entire study and it arrived here by
accident.)*

---

## 7. Maintenance — the measured half-life of this ecosystem

The brief asks who fixes it at 6am when it silently writes zeros. **The honest
answer is nobody, and the evidence is that the decay is already visible in a
single night's research.** Found in one run `[V]`:

| Breakage | Found |
|---|---|
| Tradestie's **documented** API host — TLS cert expired **2026-01-03**, eight months dead | A collector written from their docs simply does not work |
| Tradestie `sentiment_score` — frozen per-ticker constant despite docs claiming a 15-minute recompute | The advertised product is fake |
| Quiver's public WSB series — **frozen at 2025-02-21** | Vendor abandoned the dataset without saying so |
| Nitter — cease-and-desist **2026-08-24** | Whole access class removed in a fortnight |
| Sentiment Investor, Utradea, SentiSense, Adanos, and others | NXDOMAIN, timed out, or crypto-only |
| StockTwits developer portal | Frozen, footed **"© 2021"**, docs 404 |
| Reddit keyless routes | 403 to all datacenter IPs |
| Finnhub social sentiment | Moved off free; every 2026 listicle saying otherwise is stale |
| Bluesky `searchPosts` | Silent opaque-403 throttle degrading to **1 request / 61 seconds** — a collector built on it **writes zeros with no error** |

That is **nine independent failures in one category in one night's survey**. The
implied half-life of a free keyless sentiment endpoint is on the order of a year
or two `[I]`.

Now apply it forward. The collector depends on **two** such endpoints. ApeWisdom
has no terms, no contract, no SLA, no rate-limit headers and no public commitment
of any kind `[V]`; it is a side project by the `companiesmarketcap.com` team.
Reddit — the upstream — has spent two years progressively closing access `[R]`.
The realistic failure is not a 500; it is **an undocumented change to what
`mentions` means**, which produces a series that looks fine, joins fine, plots
fine, and is a different variable after some Tuesday. §8.7 pre-registers a drift
check for Polygon's `sentiment_reasoning` `[V]` — there is **no equivalent check
for ApeWisdom's counting rule**, which is the one that matters more because the
whole study is built on it and its semantics are already an inference (§3.5).

And per §3.6, the collector's own failure mode is silent by construction.

---

## 8. Steelman — and why it still fails

**The strongest honest case for building this:**

> The trader is discretionary and intraday, so he is not running a factor
> strategy and does not need a factor-scale effect. He needs *context at the
> moment of decision*. The published literature measures alpha, which is the
> wrong bar: TapeReader is a **study tool**, and Track C already established the
> right bar — a series only has to be **new** relative to what is on the sheet,
> not profitable (`03-sources-flow.md` §11.4) `[V]`. Crowd attention is
> plausibly new: it is generated by a different population using a different
> mechanism than volume. The collection cost is genuinely ~$0 and 66 MB/year, and
> the history is unrepurchasable, so the option value of collecting is high and
> the option value of *not* collecting is zero. And the study is protected by an
> unusually rigorous pre-registration with a pre-committed futility stop, so the
> downside is bounded: at worst you learn a real null with a real power figure
> attached, which is a genuine research output. Building nothing guarantees you
> never know.

**That is a good argument. It fails on four counts.**

1. **"New, not profitable" is the right bar, and this study cannot clear even
   that.** Track C earned its verdict with a measurement — r = −0.005 against
   RVOL on 4,100 ticker-days `[V]`. Attention has not been measured against RVOL
   at all, the mechanism argues strongly for correlation, and the literature
   reports that attention strategies underperform the abnormal-volume strategies
   they are built on `[R]`. **The steelman assumes the additivity result it
   needs.** Until the §8.1 gate is run, "plausibly new" is the study's premise,
   not its finding.
2. **"The downside is bounded" is false for the analysis, true only for the
   collector.** The two are separable and the argument silently merges them.
   Collection is bounded. **The analysis programme is a multi-year commitment
   whose most likely terminal state is "underpowered"** — a third outcome that is
   neither a yes nor a no, that §7.1 correctly warns will be reported as itself
   `[V]`, and that therefore **never closes**. An open question that can never be
   closed is unbounded cost, not bounded.
3. **"Context at the moment of decision" is exactly what §5 attacks.** The
   confirmatory arm's output is an unsigned magnitude. The trade-level arms are
   unanswerable. What lands on the screen at 09:15 is a number nobody has shown
   changes a decision, on a form whose fill rate has never been measured.
4. **The steelman is silent on the licence.** Even in the world where the signal
   is real and new and actionable, the public surface is **Wikipedia pageviews**
   (§6.4), and the private surface is one more column on a sheet whose generating
   pipeline has two known corruption bugs and zero tests (§6.1).

**Where the idea genuinely survives, and I will say so plainly:**

- **The collector should stay on.** Every argument against the *feature* is an
  argument about belief and effort, none of which apply to a ~free tap on an
  unrepurchasable series. If the answer in 2028 is that attention matters, the
  history will exist. That asymmetry is real and I could not break it.
- **The pre-registration is worth keeping even if nothing is built.** It is the
  best artefact this run produced, and the same discipline applied to backlog
  item 1.4 would improve the statistics he looks at **this month**.
- **Polygon `insights` → `Catalyst` is a genuine, free, backfillable win** that
  survives everything above — because it is not a sentiment feature. It is
  filling in a column that is 100% blank, with replayable data on a key already
  held. Ship it under the journal backlog, not under this study.

---

## 9. The cheapest experiment that falsifies the thesis early

Even holding the verdict, someone will want to keep the option open. If so, run
**one test, in October 2026, for about one day's work** — and make everything
else wait on it.

> ### The RVOL gate, run early, on 20 trading days of collected snapshots
>
> §8.1 already specifies it, already freezes the control set, and already
> pre-commits the decision rule: **if |r| vs RVOL > 0.5, the feature is dropped
> from the trade-level tests entirely** `[V]`.
>
> **Compute, on the universe ticker-day panel, restricted to rows with
> `mentions ≥ 5`:** Pearson r between each attention feature (`mentions_z20`,
> `mentions_pct_universe`, `overnight_delta`, and the corrected overnight
> *difference* from §3.5) and **RVOL**, **%ATR**, and **log dollar volume**.
>
> At ~96 informative names/day × 20 days ≈ **1,900 ticker-days**, the standard
> error on r is ~0.023 — the correlation is pinned to ±0.05 `[I]`. **This test is
> fully powered in three weeks.** It is the only test in the study that is.

**Why this one and not H5:** it is decisive by the study's own pre-registered
rule, it needs no outcome data, and — critically — **§6 explicitly permits it.**
The stopping rule bans examining *outcomes* between windows; it expressly allows
coverage, join rates and data-quality monitoring `[V]`. Correlations among
predictors and controls read no outcome column. **Running it in October violates
nothing and can end the study eight months before the first scheduled window.**

**Pre-commit the reading now, before the number exists:**

- **|r| > 0.5 against RVOL** → every attention feature is dropped from the
  trade-level tests by the existing rule; the study reduces to H5 alone, which
  §3.1–3.5 have already shown to be miscalibrated and mis-specified. **Close it.**
- **0.3 < |r| ≤ 0.5** → survives the gate, but the median regression (§9.3) is
  what will decide it, and at ~18 analyzable trades/month that regression is not
  interpretable before 2028. **Close it anyway; keep collecting.**
- **|r| ≤ 0.3** → the steelman's central premise holds and the idea has earned
  a re-hearing. **Then, and only then**, fix §3.5's specification, re-calibrate
  §3.2's cut point on real snapshots (as a marked amendment), correct §3.1's
  universe arithmetic, fix the §3.6 collector bug — and re-run this red team.

Two supporting measurements, each under an hour, worth taking at the same time
because they can independently end it:

1. **Effective distinct symbols per H2 bucket**, projected from the 20 days of
   snapshots against his actual trades. If the `Normal` cell is still 3 symbols
   at the 1-mention noise floor (§3.4), the trade-level arms are dead on
   construction rather than on power, which is a **faster and more certain** way
   to close them.
2. **Backlog item 0.1 — the Morning Plan fill rate.** Twenty minutes `[V]`. If
   the plan is not being filled in, the product surface this study exists to feed
   does not exist, and no amount of signal quality changes that.

---

## 10. One paragraph, for the morning

The idea does not survive. The literature's founding result failed replication,
its best-documented effect points the wrong way and lives at a twenty-day horizon
this trader never holds, the one study that matches his use case exactly —
intraday, single names, real Twitter data — found economically negligible effects
and no out-of-sample improvement, and the WSB corpus this collector is built on is
the specific corpus a top-three finance journal measured as having lost its
predictive content after GameStop. Locally, the source with clean ticker
resolution may not be used, the source that may be used has no terms of service,
the platform with the deepest archive costs ninety-five posts a day at our budget,
and the trader produces eighteen analyzable trades a month at a median attention
percentile of 96.5, which means there is no low-attention bucket to compare
anything against. The one arm the study calls confirmatory is powered on a
universe five times larger than the one that exists, uses a cut point that fires
on thirty-one of the top fifty names, buckets on a percentile feature that is
seventy-seven percent ties, and computes a quantity that is not the quantity its
own hypothesis names. Meanwhile the journal that would host all this has fourteen
unauthenticated API routes on a public domain, a grouper that corrupts trades on
position flips, zero tests, and a twenty-minute measurement that gates the entire
product surface and has never been run. **Keep the collector — it is free and
history cannot be bought back. Stop everything else, run the RVOL gate in October
to close it properly, and spend the next N weekends on Tier 0 and Tier 1 of the
dogfood backlog, which answers the same question with data that is already
measured, already licensed, and already joined to every trade.**

---

## Sources

Academic literature cited above, with the findings attributed:

- Bollen, Mao & Zeng (2011), *Twitter mood predicts the stock market*, Journal of Computational Science 2(1) — the founding result `[R]` (cited via Lachanski & Pav; original not fetched this pass)
- [Lachanski & Pav (2017), *Shy of the Character Limit*, Econ Journal Watch](https://econjwatch.org/articles/shy-of-the-character-limit-twitter-mood-predicts-the-stock-market-revisited) — replication failure; Derwent Capital closed early 2012 `[R]`
- [Antweiler & Frank (2004), *Is All That Talk Just Noise?*, J. Finance 59(3)](https://onlinelibrary.wiley.com/doi/10.1111/j.1540-6261.2004.00662.x) — return effects statistically significant, economically small `[R]`
- [Da, Engelberg & Gao (2011), *In Search of Attention*, J. Finance 66(5)](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.2011.01679.x) — ~+30 bp over two weeks, reversing within the year `[R]`
- [Behrendt & Schmidt (2018), *The Twitter myth revisited*, J. Banking & Finance 96](https://www.sciencedirect.com/science/article/abs/pii/S0378426618302115) — intraday, negligible magnitude, no out-of-sample improvement `[R]`
- [Barber, Huang, Odean & Schwarz (2022), *Attention-Induced Trading and Returns*, J. Finance 77(6)](https://onlinelibrary.wiley.com/doi/abs/10.1111/jofi.13183) — −4.7% 20-day abnormal returns on top-bought names `[R]`
- [Bradley, Hanousek, Jame & Xiao (2024), *Place Your Bets?*, RFS 37(5)](https://academic.oup.com/rfs/article-abstract/37/5/1409/7486572) — WSB DD predictive pre-GME, vanishes post-GME `[R]`
- [Renault (2017), *Intraday online investor sentiment*, J. Banking & Finance 84, 25–40](https://ideas.repec.org/a/eee/jbfina/v84y2017icp25-40.html) — index-level intraday result `[R]`
- [Renault, *Market manipulation and suspicious stock recommendations on social media* (AMF)](https://www.amf-france.org/sites/institutionnel/files/resource/Market%20manipulation%20and%20suspicious%20stock%20recommendations%20on%20social%20media%20-%20T%20Renault.pdf) — abnormal message activity → event-day rise → sharp reversal `[R]`
- [McLean & Pontiff (2016), *Does Academic Research Destroy Stock Return Predictability?*, J. Finance](https://onlinelibrary.wiley.com/doi/abs/10.1111/jofi.12365) — 26% lower out-of-sample, 58% lower post-publication `[R]`
- [*Persistence or reversal? The effects of abnormal trading volume on stock returns*, European J. Finance (2024)](https://www.tandfonline.com/doi/full/10.1080/1351847X.2024.2303092) — attention/disagreement strategy returns marginal vs abnormal-volume strategies `[R]`

Internal, all `[V]` unless marked: `00-brief.md` · `00-measured-facts.md` ·
`01-sources-social.md` · `02-sources-news.md` · `03-sources-flow.md` ·
`05-preregistration.md` · `09-legal-tos.md` · `13-open-questions.md` ·
`.wip/stocktwits-terms-resolution.md` · `.wip/finra-terms-resolution.md` ·
`.wip/polygon-licensing-verification.md` ·
`docs/journal-market-research/06-dogfood-backlog.md` ·
`docs/market-scans/phase-1-spec.md` · `CLAUDE.md`.

Measured by this pass `[M]`: `scripts/social-ingest.mjs` and
`data/social/apewisdom/2026/2026-09-08.ndjson` (2,078 rows, 797 `all-stocks`,
snapshot 2026-09-09T02:00:17Z).
