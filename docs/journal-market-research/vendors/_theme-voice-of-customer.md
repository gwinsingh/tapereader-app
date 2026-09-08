# Theme file — Voice of Customer

**As-of: 2026-09-01.** Public sources only. No accounts created, no credentials
entered, nothing posted anywhere. Confidence tags per `00-method.md`: `[V]`
verified on a primary source, `[R]` reported by users/third parties, `[I]` our
inference.

This file deliberately quotes real traders rather than paraphrasing. Where a
claim rests on **one voice**, it says so inline.

---

## 0. Evidence limitations — read this first

Three constraints shaped what could be gathered. Stating them plainly beats
padding the file with confident-sounding inference.

1. **Reddit was completely unavailable.** The brief assumed r/Daytrading,
   r/RealDayTrading, r/options, r/FuturesTrading etc. would be the backbone.
   They could not be reached by any permitted route: `WebFetch` on
   `reddit.com` and `old.reddit.com` returns "unable to fetch" (Reddit blocks
   the Anthropic crawler); the browser pane refuses both with *"blocked by
   policy"*; `WebSearch` refuses `allowed_domains: ["reddit.com"]` outright;
   and by the time this agent started, the session's `WebSearch` budget
   (200/200 calls) was already exhausted by parallel agents, so
   `site:reddit.com` snippet-mining was also unavailable. Reddit mirrors/
   proxies were **not** used — routing around an explicit policy block is not
   something to do quietly. **So: there is zero Reddit evidence in this file.**
   Any claim below that a Reddit thread would have strengthened is flagged
   `[thin]`. YouTube (`youtube.com`) and BabyPips (Cloudflare bot challenge —
   not bypassed) were likewise unreachable.
2. **The review SERP is compromised.** Nearly every top-ranked "best trading
   journal / <vendor> review" result is written by a company selling a rival
   journal or by an affiliate. Confirmed-conflicted publishers encountered
   while researching: **Trader's Second Brain, Lunefi, Plancana, Tradespad,
   Tradezully, TraderNotion, TradingJournal.com, Financial Tech Wiz,
   besttradingjournal.com, secretstotrading101, daytradingz, TradeTally,
   JournalPlus, TickerScribe, TraderTrac, PropJournal, PipJournal,
   TradeDoctor AI, TraderPlus, OneTradeJournal, TradeFlow**. **Nothing from
   those sites is used as evidence in this file.** Where one is mentioned it is
   labelled as marketing.
3. **What *was* reachable, and is what this file rests on:** Elite Trader
   forums (full thread text), NexusFi/futures.io (full thread text), Trade2Win,
   Trustpilot (including the high-yield `?stars=1&stars=2&stars=3` filter),
   Apple App Store listing + RSS review feeds, Google Play, and Hacker News via
   the Algolia API. Roughly **150 independent trader voices across ~20
   platforms**, plus one original dataset (§1.1).

**Net effect on confidence:** §3 (complaints) and §4 (unserved requests) are
well-evidenced — review sites are the natural home of that signal. §1 and §5
are moderately evidenced. §2 (purchase trigger) and §7 (privacy) are the
weakest sections in the file, because the places traders discuss those things
most openly are exactly the places that were blocked. Both are marked as such.

---

## 1. Do traders actually journal — and why do they stop?

### 1.1 An original measurement of the abandonment base rate `[V]`

Rather than assert a base rate, this was measured. Elite Trader's **Journals**
sub-forum (`elitetrader.com/et/forums/journals.29/`) is a population of traders
who *publicly committed* to journaling — a self-selected, motivated group, i.e.
the best case. Sampling **45 journal threads** across index pages 3, 4 and 6
(read 2026-09-01) and computing the span from thread start to last post:

| Journal lifespan | Count (n=45) | Share |
|---|---|---|
| Dead within **14 days** | 15 | **33%** |
| Dead within **60 days** | 21 | **47%** |
| Still alive after 1 year+ | 16 | 36% |

Examples from the sample: a journal started 2026-03-28 with **0 replies and no
second post**; "Daytrading" (2026-07-11 → 2026-07-12, one day); "Trading
MES/SPX CFD in 2025-11" (3 days); "One day trade per day experiment"
(2025-11-14 → 2025-11-17); "Scalping shit show" (7 days). Against that,
genuine multi-year survivors exist — "Global Macro Trading Journal"
(2011 → 2025, 9,000 replies), "Ka-please I don't even live here. ES"
(2014 → 2025).

**Caveats, stated honestly:** last-post date includes replies from *other*
people, so it is an **upper bound** on the author's own persistence — real
abandonment is at least this fast, possibly faster. And public forum journals
are not the same population as private or software journals; public
accountability could cut either way. `[I]` Still, the shape is unambiguous:
**roughly half of even self-selected, publicly-committed journalers stop inside
two months.** Any product thesis that assumes retention is the default is
wrong.

One vendor asserts a similar number without evidence — the solo dev behind
Tracktions on Hacker News, 2025-12-10: *"Most 'trading journals' are just
passive data dumps that traders abandon within 30 days."* `[R]` — **single
voice, and he sells a competing product**, so treat it as a hypothesis that
happens to agree with §1.1, not as independent confirmation.

### 1.2 Why they stop — the stated reasons, in rough order of how often they recur

**(a) Time cost of manual capture — confirmed, but it is specifically the
*chart and context* capture, not the numbers.** This is the single most
repeated reason.

> "Personally I've found journals to be too much time consuming. Maybe the
> method I was doing wrong/took forever, but **manually copy pasting every
> intraday chart and my thought process was too much**."
> — heavenskrow, Elite Trader, 2016-01-31

> "I built a spreadsheet for myself but I have trouble doing some of the more
> sophisticated stuff and **would rather apply my time to trading than
> developing a spreadsheet**"
> — saatfj, Elite Trader, 2008-07-13

> "I had been keeping an excel journal and **found it cumbersome to update**"
> — gonzofist, NexusFi, 2012-07-12

> "I find journaling very tedious but I think is my ADHD brain that doesn't
> wanna do anything too annoying."
> — _benj, Hacker News, 2025-04-16

> "Useless app. **You have to put everything manually. Ends up wasting more
> time**"
> — 1★ App Store review, *Trading Journal: Trade Tracker* (iOS, id1658216708)

**Refinement of the hypothesis `[I]`:** the friction complained about is
*narrative + visual* capture (chart screenshots, thought process, why I took
it), not fill data. Fill data is already largely automated by every vendor. So
"auto-import solves abandonment" is **not supported** — auto-import solves the
part traders were least bothered by. That is an important negative finding for
product strategy.

**(b) The journal stops paying rent — entries become disconnected data.**

> "**Without visuals, the entries eventually became isolated bits of
> information that didn't help much.**"
> — dbphoenix, Trade2Win, 2005-08-24

> "A spreadsheet full of entry and exit is just not the same as seeing the
> set-ups on the chart"
> — Rhody Trader, Trade2Win, 2005-08-24

> Looking at an old brokerage statement: "it did not tell me what trade
> strategy I used on each trade. It did not tell me what my thoughts were…"
> — wrbtrader, Elite Trader, 2016-01-31

**(c) Data loss kills the habit outright.** Recurs across two decades and both
self-built and commercial tools.

> "The only downside was that **I forgot to backup my data and when my HDD
> crashed, I lost all my 2015 data….. That data alone was prob worth
> thousands.**"
> — heavenskrow, Elite Trader, 2016-01-31

> "DELETES TRADE HISTORY — HORRIBLE. Was working fine and 1 week later, **all
> my trades got deleted.**" · "I spend 2 hours adding my trades, when I wake up
> in the morning all my trades were deleted" · "Bruh, why update the app when
> it erases all of my previous results and trading ideas. Now I gotta retype
> everything… **There is no longer my track record.**"
> — three separate 1★ App Store reviews, *Trading Journal: Trade Tracker* (iOS)

**(d) The journal becomes an emotional mirror people avoid.** `[thin]` — the
clearest statement of this comes from the person *asking* the question, not
from an abandoner, so it is suggestive rather than established:

> "I've thought of starting one, but **imagine it would only bruise or bolster
> ego**. As things are, I am mostly detached from the account balances."
> — nursebee, Elite Trader, 2016-01-31

**(e) "My method is simple enough that I don't need one."**

> "I trade very simply… my strategy is very simple. I only trade one thing —
> so **keeping a journal is not that necessary**, atleast in my case. Only
> takes a few minutes to reflect…. don't dwell too much on the past."
> — lawrence-lugar, Elite Trader, 2016-01-31

**(f) Journaling is past-tense and therefore (allegedly) useless.** A minority
position but a real one:

> "I began to journal, only to find it was past tense… I choose no, **forward
> trading is the only way to learn**."
> — Unequivocaltim, Elite Trader, 2016-01-31

**What does NOT appear as an abandonment reason:** price. People complain about
price when *choosing* a tool (§3.4), not when explaining why they quit. `[I]`

---

## 2. What makes someone finally pay?

**This is the weakest-evidenced section in the file.** Purchase-trigger stories
("I blew my account, then I got serious") live overwhelmingly in Reddit and
YouTube comments, both blocked. Trustpilot reviews were checked specifically
for adoption-origin narratives and largely **do not contain them** — an
explicit negative result: fetching TradeZella's 4–5★ pages surfaced praise for
support and features but **no** reviews explaining what made the person buy.
What follows is therefore partial. Treat §2 as hypotheses to test, not
findings.

**(a) Habit formation *precedes* payment — trials that are too short break the
conversion.** The clearest single articulation, and it is a good one:

> "The free trial also really needs to be **14–30 days to get a real feel for
> the software and create a new habit that we want to actually pay to use**."
> — Philipmb, 1★ App Store review of TraderSync (iOS), 2020-06-14

`[I]` This reads as the actual mechanism: a journal is a habit good, not a
utility good. You cannot evaluate it in a session. Vendors selling with **no
free trial at all** (TradeZella `[R]`, widely reported and repeatedly
complained about) are therefore fighting their own funnel.

**(b) Accuracy failure at another vendor — switching, not first purchase.**
Well evidenced, and probably the most common *observed* trigger in the review
corpus:

> "I tried tradesviz only after checking the commonly 'recommend' ones… **I
> wasted a lot of time *and money*.**" — Joan, TradesViz Trustpilot, 2026-04-12
>
> "**This is the only solution that gave me accurate results for my options
> spreads. tried all the rest.**" — Phil, TradesViz Trustpilot, 2025-12-13
>
> "Moved all of my data from a competitor to this" — Steven, TradesViz
> Trustpilot, 2025-02-16
>
> "I am now **back to TraderVue where I should have stayed to begin with**… I
> got suckered into the 'sexy' interface and app that TraderSync offers"
> — 1★ App Store review of TraderSync (iOS)

`[I]` **The market is substantially a churn carousel, not a greenfield.** New
entrants win by being the one whose numbers reconcile for a specific instrument
class (options spreads, futures CFDs, forex currency conversion) — see §3.1.

**(c) Prop-firm evaluations — strong market signal, weak direct-voice
evidence.** `[V]` A whole cottage industry of prop-firm-specific journals now
exists (PropJournal, PipJournal, TradeDoctor AI, TraderPlus, propfirm.ai,
OneTradeJournal, TradeFlow — **all vendor marketing, cited here only as
evidence that a segment is being chased, not as customer testimony**). The
demand shape they all target is identical: *track drawdown remaining, daily
loss limit, consistency rule, before you breach it.* One direct customer voice
confirms prop traders are paying journal vendors:

> Issues syncing **prop firm accounts**; charged extra for features; inadequate
> support — Hinal, 1★ TradeZella Trustpilot, 2026-06-22

And prop-firm rule pressure is real and painful in traders' own words:

> "**Their rules suck. Tight Stoplosses make it very hard to get a payout**"
> — Duke Powerlifting, 1★ Topstep Trustpilot, 2026-08-13

`[I]` This is the most promising under-served trigger found, but it is inferred
from vendor behaviour plus two customer quotes — not from a body of trader
testimony. Flagged `[thin]`; worth a dedicated re-check when Reddit is
reachable.

**(d) Tax season.** No supporting evidence found in any reachable source. Not
refuted, just absent. Do not build on it without new evidence.

**(e) Mentor/course requirement.** Only indirect support — Tradervue's
long-standing **read-only mentor share** feature was singled out by users as a
selling point:

> "Tradevue's cloud implementation is great with a sharing feature, chart
> plotting, **even a mentoring read-only option**." — gonzofist, NexusFi,
> 2012-07-12

---

## 3. Top recurring complaints about existing tools, ranked by frequency

Ranking is by how often the theme recurs across the reachable corpus
(Trustpilot low-star filters for TradeZella n≈20 named, TraderSync n≈17,
TradesViz n≈18, Tradervue n=9; plus app-store and forum voices). All `[R]`.

### 3.1 Inaccurate stats / broken imports / bad P&L — **#1 by a wide margin**

This is not a bug class, it is *the* complaint. It destroys the product's only
reason to exist: if the numbers are wrong, the journal is worse than nothing.

- **TradesViz** draws the heaviest fire here. "The data is always wrong, no
  accurate pnl, website is very slow" (Autrade, 2024-09-05); "It sucks, always
  the data is wrong with the trades…. It's not worth it" (Catalina Sydney,
  2024-08-27); "**It does not sync trades right consistently. It works one day
  then does not work the next**" (Jayson Lang, 2024-01-09); significant P&L
  discrepancies after uploading 2–3 years of data (Pranjal, 2025-12-20); MAE/
  MFE computed off futures pricing rather than CFD data (NQ Trader,
  2025-11-28).
- **TraderSync**: "API Parsing Failures" producing **"Zombie Trades"** that
  corrupt metrics, plus dashboard math glitches (Zezen Nguyen, 2026-04-14 and
  2026-05-23); wrong currency base applied to both auto and manual trades,
  corrupting commissions/fees/P&L, **a bug that was fixed and then returned**
  (Disappointed, 2026-05-01); "**system randomly reducing the size by 10x on
  some trades**", unresolved for seven months (alxxx xxxa, 2026-04-20).
- **TradeZella**: AI tagging corrupted ~200 trades with no reliable undo
  (Artis Ļebedevs, 2★, 2026-07-26); options trades display incorrectly
  (Cindy F, 2025-08-29); Schwab sync "does not work as advertised" (Korey
  Snead, 2025-08-28); "Constant problems with broker connection" (A L,
  2025-11-07).
- **Trademetria**: Fidelity sync problems — notably, the vendor publicly
  attributes this to the broker's data, which is a credible defence and worth
  remembering when reading everyone else's import complaints.
- Historical, cross-vendor: TradesViz P&L differing ~4% from the broker's own
  figure because of proprietary FX conversion rates (Red, Elite Trader,
  2022-03-22).

### 3.2 Support quality and unresponsiveness — **#2**

Nearly as universal as #1, and it is what turns a bug into a 1★ review.

- "technical support **completely ignored** [tickets] in March through April" —
  TraderSync (Zezen Nguyen, 2026-04-14)
- assigned support staff "**had left and it hadn't been reassigned**", issue
  open 7 months — TraderSync (alxxx xxxa, 2026-04-20)
- "Rude and unprofessional customer service (Pedro)" — TraderSync (2026-04-27)
- "reported numerous issues… **they get absolutely no attention**" — TradeZella
  (Thomas K, 2026-07-30)
- "**Support requests can only be directed to AI**" — TradeZella (H. G., 2★,
  2025-10-16). `[I]` This one is a leading indicator: AI-only support is
  actively generating negative reviews.
- "**Forget about ANY customer service or assistance**" — Tradervue (David
  Roberts, 2026-06-16); "Support does NOT care ABOUT YOU" (Legend, 2025-10-29)
- "These folks just insist that **I'm incapable of following their
  instructions**" — TradesViz
- **Counter-evidence, and it is strong:** support is also the single most
  *praised* attribute. TradeZella's 4.8/5 Trustpilot (1,015 reviews as of
  2026-07/08) is driven by support praise; TraderSync's 4.4/5 (321 reviews)
  likewise; and the historical Tradervue-under-Greg-Reinacker record was
  extraordinary — bugs fixed within 30 minutes of an email (josh, NexusFi,
  2014-08-04), a subscription payment reversed on request no questions asked
  (Hulk, NexusFi, 2014-08-05), feature requests shipped over a weekend
  (indextrader7 & HighRise1202, NexusFi, 2012). `[I]` **Support responsiveness
  is the primary competitive axis in this category, more than features.**

### 3.3 Billing, cancellation and refund practices — **#3**

Distinctly worse in this category than software generally, and **Tradervue is
the standout offender** (Trustpilot 2.4/5, 90% 1★ across 10 reviews — small n,
but the reviews are unanimous and specific):

- "**Two years after cancelling they are still billing and will not refund!**"
  (Michael Roby, 2026-02-16)
- "**There is no way to edit or remove your credit card number**" / "Beware
  their hidden theft policies. No way too delete you credit card from their
  system" (Anton, 2024-05-27)
- "I did login, just to cheek it, and never used it after that. Two months
  later, **alteady 100€ out of my account!**" (jimmadness, 2025-06-18)
- "will charge your credit card **even if you downgrade to free plan** (their
  way of making you cancel)" (Mikey Loves Pizza, 2024-10-12)
- Also elsewhere: "I canceled this by email 4 months ago and **they have
  continued to charge my card**" — TradesViz (Joshua, 2025-12-22); "Will charge
  you long after you cancel" — TraderSync (Jim Grammer, 2023-08-05); "absolutely
  no refunds" — TraderSync (Shiva Gurumurthy, 2026-07-13); "no refund option"
  — TradesViz (Fabian Leferink, 2024-02-14); repeated unauthorized charges —
  TradeZella (Radim Šafrán, 2★, 2026-06-04).

`[I]` A journal whose cancellation is one obvious button, and which lets you
export everything on the way out, would be differentiated **on trust alone**.
That is a remarkably low bar that nobody has cleared.

### 3.4 Price and subscription model — **#4**

Two separable complaints:

**Price level.** "Too complicated, and high price" — TraderSync (web hacker,
2★, 2025-08-06). "Value for money is just not there" at twice competitors'
pricing — TraderSync (Ben, 2★, 2022-11-29). "This platform… awful tool…
**overpriced**" — TradesViz (Autrade). On Hacker News, 2026-02-08, a developer
building a free alternative framed it as: *"you either use messy Excel
spreadsheets or pay $30–$50/month for SaaS journals (like TradeZella) just to
get basic analytics like Win Rate and Expectancy. As a beginner, paying high
subscription fees while still learning (and losing money) **felt like a
punishment**."* `[R]` — single voice, and he sells a free competing product,
but it names the emotional logic precisely.

**Model, not level.** A distinct and durable preference for one-time purchase
over subscription, unchanged across 14 years:

> "**That price sure has an appeal over Tradervue $25 per month forever.**"
> — HighRise1202, NexusFi, 2012-09-28
>
> "**I don't care for the prescription [subscription] model**, where you pay a
> fixed amount per month… I prefer the commercial software model, where you pay
> an initial fee and a yearly maintenance fee."
> — HighRise1202, NexusFi, 2012-09-30
>
> Edgewonk's Trustpilot praise repeatedly cites that "**it doesn't cost an arm
> and a leg like the competition**" (2026) — Edgewonk is the one major player on
> a low annual, not monthly, model, and holds 4.7/5 across 44 reviews.
>
> Counter-point, same vendor: the mandatory-annual model is *itself* a
> complaint — "moe", 1★, 2025-10-17, objects to the forced annual subscription.

**No free trial** is a specific, repeated objection to TradeZella `[R]` — and
see §2(a) for why it matters mechanically.

### 3.5 Over-complexity / poor UX — **#5**

> "This platform tries to add all the bells and whistles… **but lacks
> simplicity**… Something as simple as PnL and the time… cant be displayed."
> — Michael Puett, TradesViz Trustpilot, 2023-10-30 / 2024-02-11
>
> "**overly complex user interface with far too many options**" — Zimonzhawn,
> TradesViz, 2024-01-07
>
> "**super complex with a rather poor UX**" — Navi, TraderSync, 2★, 2026-02-17
>
> "confusing platform and ui! [strategies are] useless… inconsistent filters"
> — Trinh Thi, TraderSync, 2024-10-17
>
> "**Bad Platform. Bad Data. Bad UI.**" — Legend, Tradervue, 2025-10-29
>
> "The UX doesn't prioritize the most valuable info" — 3★ App Store review,
> Kinfo (iOS)

`[I]` Note the pincer: TradesViz is criticised for too *many* features and
Tradervue for too few. The winning position is not "more" or "less" — it is
**a correct default view**.

### 3.6 Slowness and reliability — **#6**

"Website is buggy and laggy. **Sometimes will straight up just not load**"
(TraderSync, 2026-04-27); "Server is extremely slow" (TraderSync, Kenneth,
2024-05-04); "frequent **gateway timeouts**" (TradesViz, Michael Puett);
"constant technical glitches; **500 errors recurring daily**" (TradeZella,
Vraj, 2★, 2025-11-24); "Constant log outs and unavailability" (Kinfo, iOS 1★);
"the app has been failing to open and so I'd have to delete all of the storage
in the app… to sign in and use it again" (Devin Stearns, UltraTrader, Google
Play, 2026-07-01).

### 3.7 Mobile — **#7**

Weaker signal than expected, but real. TraderSync's iOS app sits at **2.7/5
across 84 ratings** while its web product sits at 4.4/5 on Trustpilot — a
notable gap `[V]`. UltraTrader is **3.0/5 across 536 Google Play reviews**
against 4.6/5 on iOS `[V]` — same product, very different mobile experiences.
TradeZella drew "mobile browser issues" (Yassin Kadir, 3★, 2025-08-09).
`[I]` Mobile is where these products are worst and where nobody is winning.

### 3.8 Options and futures handling — **#8 by count, but #1 by intensity**

Fewer complaints, but they come from the highest-value users and they are
specific enough to be actionable:

- **Options rolls are unsupported everywhere.** "I tried a few different ways
  to report this information in TraderSync however **it doesn't support Rolls
  or that strategy in general. The math is misreported**" — The Q4me, App
  Store, 2021-03-16.
- Missing **option spread detection**, missing basic columns — TradeZella
  (Chris, 3★, 2025-11-10). "complex spreads" struggle — TradesViz (Paul,
  2024-10-01).
- ITM option expirations misreported for IBKR users — TraderSync (Naail,
  2025-12-03; later fixed).
- Futures **scaling in/out and leg-level tracking** has been an open request
  since 2012: "**I do think the ability to track the individual legs of a trade
  would be a potentially useful addition**" (omni72, NexusFi, 2012-09-27) and
  "being able to properly track each leg of a trade" (Futures Operator,
  NexusFi, 2014-01-25).
- **Scalpers are simply not served.** "Not for scalpers" — TraderSync 1★
  (2025-08-26); "Account calculations fail for scalping strategies" — TraderSync
  3★. Echoing 2012: per-fill P&L distribution "for short term guys like me
  includes every seperate fill, seperate scale in/out of a trade, etc =
  **meaningless for performance analysis**" (indextrader7, NexusFi,
  2012-09-30).

---

## 4. Repeated, still-unserved feature requests — the "I wish it would just…" list

Ordered by how strongly the evidence supports "asked for repeatedly, still not
delivered". All `[R]` unless noted.

**4.1 Unrealized P&L / open positions.** Asked for by different users, years
apart, at the same vendor, and still absent:

> "If TraderSync included the unrealized P/L feature, it would be a no-brainer
> to give it a five-star rating. But since it's missing this crucial element,
> it's hard to go beyond a one-star rating… **think about driving a car without
> a fuel gauge.**" — INKTEACHA, App Store, 2023-12-22
>
> "**Unrealized profit update is the main issue please add that feature and I'm
> a buyer.**" — Philipmb, App Store, 2020-06-14

Three and a half years apart, same vendor, same ask, explicit "and I'm a
buyer". `[I]` This is the cleanest unserved-demand signal in the entire corpus.

**4.2 Options rolls and multi-leg lifecycle.** See §3.8. Nobody handles the
roll as a continuing position; everyone treats each contract as an independent
trade, which makes the math wrong for anyone running calendars/verticals.

**4.3 Leg-level and scale-in/out granularity for futures.** Open since 2012.
Current tools force a choice between "merged" (hides management) and "split"
(explodes into meaningless per-fill rows). Nobody models *the position with its
management events*.

**4.4 Chart/visual capture without manual work.** The friction in §1.2(a) is
still the friction. Traders have independently built workarounds rather than
buy a solution:

> "I create a **discord channel** and break it down into different sections…
> It does a good job capturing images and its free… All the entries have
> timestamps." — L943973, Elite Trader, 2022-09-27
>
> "I use **my own script for this, done in Python**. Connect to Broker API, get
> trades, push it live to a Microsoft Sharepoint Excel sheet **and add a chart
> some time after the trade was closed**." — John44, Elite Trader, 2022-10-02
>
> "I want to include the **chart image of the trade** as well. This way when I
> refer to the journal I get a visual." — traderday321 (the original ask),
> Elite Trader, 2022-09-27

`[I]` A trader writing Python to auto-attach a post-trade chart is a
build-vs-buy failure. The ask is 20 years old (dbphoenix, 2005) and still being
hand-rolled in 2022.

**4.5 A genuinely free or generous tier / trial.** "Add a free tier for users
to review what the app can do and explore with limitations" (2★ App Store,
*Trading Journal: Trade Tracker*); "The free trial also really needs to be
14–30 days" (§2a); free-tier praise is the top positive theme for Kinfo.

**4.6 Broker coverage gaps that read as absurd to users.** Robinhood is the
loudest:

> "**Robinhood is like…the ONE brokerage that needs a trading journal because
> of how poorly they organize your history.** This app seems pretty popular —
> why doesn't it work with one of the most popular mobile brokers? Fix that and
> I'll use it." — 1★ App Store review, Kinfo

Repeated by two more Kinfo reviewers ("No Robinhood:("), and by TraderSync
users ("Robinhood is not supported automatically, requiring manual CSV
uploads" — Shiva Gurumurthy, 1★, 2026-08-04). Also Webull, Wells Fargo,
TraderEvolution, non-US brokers generally ("Importing trades always broken…
poor support for non-US brokers" — Bruno F., TraderSync 2★, 2021-07-06).

**4.7 Multi-broker / multi-account without corruption.** "Seems like it might
work for someone who uses **one-and-only-one broker**" — Lundy, TradesViz 1★,
2026-05-11. Big Mike asked exactly this in 2012 (multiple Sierra Chart
instances, multiple brokers, same instrument day-traded at one and swung at
another) and it has never been cleanly solved.

**4.8 Planning and goals, not just post-mortem.**

> "**Incorporate a Plan with weekly, monthly and annual target or goals**" —
> henry otto, UltraTrader, Google Play, 2026-05-09

**4.9 Data durability guarantees.** Not phrased as a feature request but as
rage (§1.2c). `[I]` "Your journal cannot lose your history" is an unmet
*promise*, not an unmet feature.

---

## 5. The manual-vs-automatic tension

The split is real, and both camps are large. Critically, **they are not
arguing about the same thing** — which is why the debate never resolves.

### Camp A — "automation is the point"

Wants zero-friction sync; treats the journal as an analytics warehouse.

> "**Works well, and useful if you're lazy journaling your trades!**" —
> 5★ App Store review, Kinfo
>
> "Does all the work for you. Even shows you a picture of the chart and which
> candles you entered and exited at." — 5★, Kinfo
>
> "**Perfect for automated tracking which is essential in order to know your
> edge.**" — 5★, Kinfo
>
> "This app is useless **you are better off using excel**… cumbersome, clunky,
> and takes a lot to journal." — 1★, *Trading Journal: Trade Tracker*, i.e. a
> manual tool judged as a failed automatic one

`[V]` Size proxy: Kinfo (auto-sync, free) holds 4.8/5 across 466 iOS ratings
and its reviews are dominated by sync praise and sync failure — the entire
emotional range of that user base is about whether the pipe works.

### Camp B — "the writing IS the work"

Sees automation as removing the mechanism of benefit. Not fringe: this camp
includes the most experienced voices in the corpus.

> "**Fountain pen and squared notebook, you can draw.**" — mervyn, Elite
> Trader, 2022-09-27
>
> "If I had to keep a journal — I'd rather make my own private one from a
> **paper notebook and pen**. I don't want to be analyzed online." —
> lawrence-lugar, Elite Trader, 2016-01-31
>
> "Every week, I go over each days chart and enter on **a legal pad with a #2
> pencil** the valid signals per my trade plan (**keeps me closer to the action
> than excel etc.**)… I then print out my actual executions for the week and
> **compare the two documents**. Did I take all my signals? Were all my entries
> valid? Did I get out before target?" — speedo, Elite Trader, 2016-01-31
>
> "I used to keep a handwritten journal on loose leaf, but now I keep it in
> typewritten form. **I print out each day's entry and it goes into a three
> ring binder** with printouts of the day's trades and charts and equity run."
> — fortydraws, Elite Trader, 2016-02-01
>
> "i use notepad. tried excel too." — KCalhoun, Elite Trader, 2022-10-02
>
> "**Passively dumping your data into the journal will probably not have much
> impact on your trading**" — omni72's Tradervue review, NexusFi, 2012-09-27

### The synthesis, and it matters for the product `[I]`

speedo's method is the tell. He is not manually recording *fills* — he records
**what his plan said he should have done**, then imports the broker's record of
**what he actually did**, and diffs them. The manual half and the automatic
half are capturing *different variables*.

So the correct framing is **not** manual-vs-automatic. It is:

- **Execution data** (fills, P&L, times, MFE/MAE) → nobody wants to type this.
  Automate it completely. This is table stakes and is where every vendor
  competes.
- **Intent data** (plan, thesis, conviction, what I expected, whether I
  followed my rules) → **cannot** be automated, because it does not exist in
  the broker feed. It must be captured, and preferably *before* the trade.

`[I]` The vendors have automated the half traders never minded doing and left
untouched the half that actually produces the insight. Camp B is not
technophobic; it is correctly observing that automating fills does not
automate reflection. A tool that auto-imports execution and makes intent
capture cheap and **pre-market** dissolves the argument. (This is precisely
what TapeReader's Morning Plan → Origin → Process-Followed chain does — see
`03-gap-analysis.md`.)

Two further variants worth noting as evidence that friction, not principle,
drives the split:

- **Video/voice replaced typing for at least two traders.** "last year I
  changed to doing **video journals** of every trade, my thought psyche and it
  has **helped tremendously**" (heavenskrow, Elite Trader, 2016 — the same
  person who abandoned typed journaling as too slow). And a 2025 Hacker News
  front-page post, "How I use audio journaling and AI to improve my trading
  decisions" (76 points, 2025-04-16) — the article itself is now 404, but the
  discussion is intact and traders in it were explicit that typing was the
  blocker.
- **Discord as an accidental journal** (L943973, above) — timestamped,
  image-friendly, zero-friction, free.

---

## 6. Psychology / discipline tracking specifically

This is the section most directly relevant to TapeReader's differentiation, so
it gets the most careful handling. **Three findings, and they do not all point
the same way.**

### 6.1 There is a genuine, long-running ideological split about whether psych data belongs in a journal at all

The cleanest exchange found anywhere in the corpus, Elite Trader, 2016-01-31:

> **schizo:** "**Trading journal is not a diary!** It should be used to write
> trading stats, eg. cold facts, and **not your psychological hogwash**. For
> example, win/loss ratio is more telling than 'Oh, I just felt like the market
> might move up so I went long.'"
>
> **wrbtrader:** "**That's B.S.** … **stats alone doesn't tell you market
> context, trade strategy used…, why you enter early or exit early, why you
> didn't follow the trading plan** and many other things that you are not going
> to remember 3 months from now."

`[I]` Note *what* wrbtrader defends. He is not defending mood-logging. He is
defending **decision context and rule-adherence** — "why you didn't follow the
trading plan". This distinction runs through everything below.

### 6.2 Structured *process/discipline* scoring is used, is sustained longer than mood-logging, and users credit it

The strongest single piece of evidence is a public journal on Trade2Win
("Trading Journal — Rule Adherence and Discipline", user **itsover**, started
2025-10-20, ran 41 trading days to 2025-12-17). He scores **12 criteria 1–5**
per session — including "Bias Defined", "Filter Applied", "Valid Entry",
"Emotional Control" — plus an "Aftermath" block tracking emotional residue
duration, process trust, and focus recovery.

> Day 2: "**I penalised emotional control with −2 despite abiding by all
> rules**" (fear of reversals, mechanically flawless execution)
>
> By December: "**there was no emotional hang-up throughout the 40 days**"
> — despite middling P&L (≈$48,800 → ≈$50,121)

`[R]` — **single trader**, so do not over-weight it. But it is a direct,
dated, self-reported *credit* to structured discipline scoring for an outcome
(emotional stability) that P&L did not deliver. He also names the exact failure
mode the scoring is meant to catch: *"These losing streaks are followed by
switching trading strategies."*

Corroborating, from a paying customer of the one vendor that ships real psych
tooling:

> "**psychology tools, checklists, and trade-management features have also
> helped me stay disciplined and avoid repeating old mistakes**" — cp, Edgewonk
> Trustpilot, 5★, 2025-11-26
>
> "The Custom Statistics feature **forces you to think**" and holds consistency
> "**only when actively using the journal**" — PROFESSOR O, Edgewonk
> Trustpilot, 5★, 2025-02-25

That second quote contains its own caveat, and it is the honest one: the
benefit is conditional on *continued use*, which §1.1 says is roughly a coin
flip past two months.

Also relevant, from a non-trading domain that traders themselves invoke:

> "**You literally can not survive online poker without keeping data and stats
> on everything you do**" — Heads Up Coach, Edgewonk Trustpilot, 5★, 2025-11-28

And, notably, a *general* futures-trading source independently arrives at
TapeReader's exact metric: NexusFi's pre-market preparation guide (2026-06-01)
advises "**Track behavioral proxies, not P&L**… **Rule adherence rate: what
percentage of your trades followed the plan?** If your routine works, this
number climbs over time. **If it doesn't change, the routine is cosmetic.**"
`[V]` That is Discipline % as TapeReader computes it, described by someone with
no product to sell in this category.

### 6.3 But: free-text emotion logging is what gets abandoned first, and pure mood fields have essentially no advocates

Across the entire corpus — hundreds of reviews for six vendors — **not one
user review praised a mood/emotion field**. Praise attaches to *checklists*,
*custom statistics*, *rule adherence*, *process trust*. The one vendor
generating psych-feature praise (Edgewonk) is praised for the structured,
scored surfaces, not the diary box. `[I]`

Meanwhile the abandonment evidence in §1.2(a) is specifically about narrative
capture — "manually copy pasting every intraday chart **and my thought
process** was too much."

### 6.4 Verdict for TapeReader

`[I]`, and I want to be clear this is inference, not established fact:

1. **Traders do value discipline/process tracking** — but they value it in
   *scored, comparable, aggregatable* form (a % that moves over time), not as
   free text. Evidence: 6.2 is all about scores and checklists; 6.3 shows zero
   praise for prose fields.
2. **They do not reliably fill it in.** §1.1 says half quit inside 60 days, and
   §1.2(a) says the narrative field is the specific thing that got heavy.
3. **The mitigation the evidence points at is capture timing and cost.**
   itsover survived 41 days on a 12-field score sheet — because scoring 12
   items 1–5 is fast and bounded. Free text is unbounded, and unbounded is what
   gets skipped.
4. **TapeReader's design is on the right side of this.** Energy/Tension 1–5,
   Urge-to-Trade-Fast Yes/No, sleep hours and sleep/readiness scores captured
   **once pre-market in the Morning Plan and auto-filled onto every trade of
   the day** is exactly the bounded, low-cost, scored pattern that survived in
   the evidence — and it front-loads capture to before the emotionally loaded
   moment. The Discipline % metric matches NexusFi's independent
   recommendation almost word for word.
5. **The honest risk:** nothing in the reachable evidence shows anyone
   *quantitatively* linking psych inputs to P&L outcomes and being persuaded by
   it. Every credit found is qualitative ("helped me stay disciplined"). `[thin]`
   Whether "your win rate on 4+ energy days is X vs Y" changes behaviour is
   **unproven** and is a genuine open question for `07-open-questions.md`.
6. **Sleep/readiness specifically has no precedent in this corpus at all** —
   no vendor ships it, no user asks for it. That is either a real wedge or a
   real signal that nobody wants it. Cannot be settled from public sources.

---

## 7. Trust and privacy

**Second-weakest section in the file.** Privacy discussion concentrates on
Reddit and Hacker News threads about *specific incidents*; the reachable
corpus yielded scattered evidence rather than a pattern. No trading-journal
data breach was found in any reachable source — that is a **null result, not a
clean bill of health**, since a targeted search was not possible.

**What was found:**

**(a) Credential-based broker linking makes some users uncomfortable — but
it's one voice.** `[R]` `[thin]`

> Security concerns about **login-based broker linking**; free trial doesn't
> work — Gao Yun fat, TraderSync Trustpilot, 1★, 2021-05-15

**(b) One user directly blamed a journal app for account compromise.** Almost
certainly coincidental, but the *reasoning* is what matters — this is how
traders think about the risk:

> "This app seems great… but in less than 12 hours, I was bombarded by
> hundreds of confirmations for foreign companies' newsletters I didn't
> authorize and **my Amazon account was hacked into**. The terms of agreement
> said that could happen, so my bad. I will be deleting it."
> — 1★ App Store review, Kinfo

`[I]` Note "the terms of agreement said that could happen" — the user had read
the ToS, found it permissive, and treated that as sufficient grounds to leave.

**(c) Some traders refuse public journaling on privacy/exposure grounds** —
this is well evidenced and is a *different* privacy axis (social, not
data-security):

> "**I don't want to be analyzed online.**" — lawrence-lugar, Elite Trader,
> 2016-01-31
>
> "I wouldn't journal here because of **all the frustrations of putting stuff
> on the internet**… **It's for me, not for public consumption.**" — Ferdinand,
> Elite Trader, 2016-01-31

Balanced by the opposite preference — traders who share precisely to get help
("Best trading decision I ever made was to start a journal here" —
damnpenguins, 2016-01-31; "I hope someday when my trading is not going very
well someone will give me an advice" — TimBox75, 2016-02-01). `[I]` Default-
private with explicit opt-in sharing is the only defensible default.

**(d) Vendors are starting to market on privacy**, which is weak but real
evidence that they perceive concern: StonkJournal leads with "**No ads. No data
sold.**" `[V]` (vendor claim, unverified).

**(e) An adjacent, strongly-argued position from HN** — about mental-health
journaling, not trading, so it is analogy not evidence:

> "**I will absolutely never use a digital service for mental health.**…
> This is also the main reason I use a paper notebook as my diary… the
> alternative of this data being mined and leaked online is not a risk I'm
> willing to take." — pm90, Hacker News, 2021-12-21

`[I]` If that instinct transfers to trading psych data — sleep, tension,
readiness — then a journal that stores psychological state is carrying more
reputational risk than one that stores fills. Untested, but worth designing
around (local-first or user-owned store). TapeReader's Google-Sheet-in-the-
user's-own-Drive model is unusually well positioned here and should be treated
as a **trust feature, not an implementation detail**.

---

## The five things traders most want that nobody has built well

Ranked by strength of evidence × apparent size of the gap.

**1. Numbers that reconcile with the broker, for *my* instrument.**
Not "analytics" — *arithmetic that is correct*. Options rolls, multi-leg
spreads, futures scale-in/out, non-USD conversion, ITM expirations, CFDs, and
scalping fill volumes all break at least one major vendor today (§3.1, §3.8).
This is the #1 complaint at every vendor and the #1 reason people switch (§2b).
It is unglamorous, it is the whole product, and **it is still unsolved in
2026**.

**2. The chart and the reasoning attached automatically.**
Asked for since 2005 (dbphoenix: "without visuals, the entries eventually
became isolated bits of information"), still being hand-rolled in Python and
Discord in 2022. The friction that kills journaling is *narrative and visual*
capture, not fill capture — and every vendor automated the fills instead
(§1.2a, §4.4). Whoever makes "here is the chart, marked with your entry/exit,
with your pre-trade thesis next to it" appear with **zero** post-trade effort
removes the actual cause of abandonment.

**3. Intent captured before the trade, then diffed against execution.**
speedo has been doing this by hand with a legal pad for years: write the plan's
valid signals, print the broker's actual fills, compare. Nobody sells it. This
is what dissolves the manual-vs-automatic war (§5) and it is what turns a
journal from a mirror into a scorecard. Rule-adherence rate — "if it doesn't
change, the routine is cosmetic" — is the metric, and only Edgewonk gestures at
it.

**4. Live position state — unrealized P&L and open risk.**
The most explicit "and I'm a buyer" in the corpus, asked twice at the same
vendor three years apart, still absent (§4.1). Every journal is strictly
post-mortem; traders want the fuel gauge while driving. This is also the
natural bridge to the prop-firm segment, whose entire need is *drawdown
remaining, right now, before I breach* (§2c).

**5. A vendor that is boringly trustworthy.**
One-click cancellation, a removable card, full data export, and a promise that
your history cannot silently vanish. Every one of those is currently a 1★
review at some major vendor (§3.3, §1.2c, §4.9). The bar is on the floor and
nobody has stepped over it. `[I]` In a category where the product's value
compounds only if you stay for years, "we will not lose your data and we will
let you leave" is not hygiene — it is the pitch.

---

## Sources

Read 2026-08-31 / 2026-09-01. Grouped by platform. **Conflicted publishers
(rival-journal vendors and affiliates) are deliberately excluded** — see §0.2.

**Elite Trader (elitetrader.com)** — full thread text read via browser
1. `/et/threads/why-journal.297532/` — pp.1–2 (2016) — 15+ distinct posters:
   nursebee, lawrence-lugar, Ferdinand, Xela, wrbtrader, Pekelo, heavenskrow,
   Unequivocaltim, schizo, damnpenguins, speedo, TimBox75, fortydraws
2. `/et/threads/what-software-website-to-use-to-create-a-trading-journal.369932/`
   (2022) — traderday321, ZBZB, L943973, schizo, mervyn, Fonz, KCalhoun, John44
3. `/et/threads/best-online-trading-journal-for-forex.365917/` (2022) — Red
4. `/et/threads/trading-journal-software.131579/` (2008) — saatfj,
   skepticaltrader
5. `/et/threads/hot-or-not-elitetraders-journals-measured.390732/` (2026)
6. `/et/forums/journals.29/` index pages 3, 4, 6 — **original dataset, n=45
   journal threads, start/last-post dates** (§1.1)

**NexusFi / futures.io (nexusfi.com)** — full thread text read via browser
7. `showthread.php?t=21650` pp.1, 3 — "www.tradervue.com journaling and trade
   analytics" (2012–2015) — gonzofist, Big Mike, omni72, HighRise1202, josh,
   Hulk, tturner86, fibtrader2012, Magiklair
8. `showthread.php?t=23452` — "Alternate Products To Tradervue" (2012–2015) —
   HighRise1202, trendisyourfriend, Goldstone15, indextrader7, Frank R,
   Futures Operator
9. `nexusfi.com/a/psychology/pre-market-preparation` (2026-06-01) — "track
   behavioral proxies, not P&L; rule adherence rate"
10. `nexusfi.com/d/journals/*` resource directory entries (Tradervue, TradesViz)

**Trade2Win (trade2win.com)**
11. `/threads/trading-journal-rule-adherence-and-discipline.243451/` (Oct–Dec
    2025) — itsover, tr1ps_master — 41-day rule-adherence scoring journal
12. `/threads/trading-journals.16681/` (2005) — dbphoenix, Rhody Trader
13. `/forums/trading-journals.330/` index

**Trustpilot** (star-filtered pages used where available)
14. TradeZella — 4.8/5, 1,015 reviews; 1–3★ filter, ~20 named reviewers
    (Thomas K, Hinal, A L, Andy Robson, Jakub, Korey Snead, Cindy F, Carlos
    Aparicio, Artis Ļebedevs, Radim Šafrán, Leighton O'Donnell, InvisibleG,
    xr, Vraj, H. G., Chris, Yassin Kadir …)
15. TraderSync — 4.4/5, 321 reviews; 1–3★ filter, ~17 named reviewers
    (Zezen Nguyen, Disappointed, alxxx xxxa, stevenforbes07, Trinh Thi,
    Kenneth, Check, Jim Grammer, Ian K. Thomas, Chris Batten, Gao Yun fat,
    Navi, Vinay, web hacker, Ben, Bruno F., Shiva Gurumurthy …); plus Naail,
    DHANISHTA, Taimoor on the main page
16. Tradervue — 2.4/5, 10 reviews, 90% 1★ — David Roberts, Michael Roby,
    Legend, jimmadness, Mikey Loves Pizza, Lemonde Rush, Anton, CSmith,
    TradingFutures, John Palmer
17. TradesViz — 4.1/5, 67 reviews; 1–3★ filter, ~18 named reviewers (Lundy,
    Marko Markic, Joshua, Pranjal, Mike, Trey, Paul, Autrade, Catalina Sydney,
    Chris, Fabian Leferink, Michael Puett, Jayson Lang, Zimonzhawn, Jimmy
    Ricard, NQ Trader, Ryn …); 4–5★ — Jason, Joan, Steven, Daniel Ushakov, Phil
18. Edgewonk — 4.7/5, 44 reviews — cp, PROFESSOR O, Heads Up Coach, Albert
    Burgess, moe (1★, 2025-10-17)
19. Trademetria — 4.0/5, 12 reviews
20. Chartlog — 0 reviews (notable absence)
21. Topstep — 1–3★ filter, ~19 named reviewers (prop-firm context: Duke
    Powerlifting, David, Jack L, Qian Yang, Chris …)

**Apple App Store** (listing pages + iTunes RSS review feeds)
22. TraderSync iOS (id1177329277) — **2.7/5, 84 ratings** — The Q4me,
    INKTEACHA, Philipmb, and the TOS-reconciliation 1★
23. "Trading Journal: Trade Tracker" (id1658216708) — 4.17/5, 47 ratings —
    ~23 reviews pulled via RSS
24. Kinfo (id1220075825) — 4.8/5, 466 ratings — ~38 reviews pulled via RSS
25. App-store search corpus establishing category shape (SuperTrader 4.67/1,192;
    UltraTrader iOS 4.6/56; TradesViz iOS 0 ratings; P&L Calendar 4.88/596)

**Google Play**
26. UltraTrader (`com.ultratrader`) — **3.0/5, 536 reviews** — Devin Stearns
    (2026-07-01), henry otto (2026-05-09), cjack202003 (2026-01-04)
27. Play "trading journal" search listing — 25 apps, evidence of extreme
    long-tail fragmentation (PNL 1.8★, FX Journal 3.7★ …)

**Hacker News** (via Algolia API)
28. #25219314 Show HN: Forexbook (2020-11-26, 80 pts, 35 comments) — lordnacho,
    PortlandMEnerd, AdrianAvtomat, sitzkrieg on retail-broker trust
29. #43678023 "How I use audio journaling and AI to improve my trading
    decisions" (2025-04-16, 76 pts) — _benj, qntmfred, ramesh31 (source article
    now 404)
30. #46216592 Show HN: Tracktions (2025-12-10) — "passive data dumps that
    traders abandon within 30 days" (competing vendor)
31. #46933191 DayTradingCentral (2026-02-08) — "$30–$50/month… felt like a
    punishment" (competing vendor)
32. amano-kenji (2024-04-01) — open-source bare-bones journal vs Excel
33. pm90 (2021-12-21) — digital-journaling privacy refusal (adjacent domain)

**Deliberately excluded as conflicted** (rival-journal vendors / affiliates
encountered in SERPs): Trader's Second Brain, Lunefi, Plancana, Tradespad,
Tradezully, TraderNotion, TradingJournal.com, Financial Tech Wiz,
besttradingjournal.com, secretstotrading101, daytradingz, TradeTally,
JournalPlus, TickerScribe, TraderTrac, PropJournal, PipJournal, TradeDoctor AI,
TraderPlus, OneTradeJournal, TradeFlow, tradereview.app, StonkJournal
(cited once, labelled, only for its own privacy marketing claim).

**Unreachable** (stated for completeness): all of reddit.com (policy block +
crawler block + exhausted search budget), youtube.com, forums.babypips.com
(Cloudflare challenge, not bypassed), g2.com (403), producthunt.com (404),
capterra.com (product pages not resolvable).
