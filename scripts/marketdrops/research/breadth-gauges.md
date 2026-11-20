# Breadth gauges kept by hand: origins, definitions, thresholds, published tests

Research notes for `site/content/signals-breadth-gauges.html`. Compiled 20 Nov 2026.
Every claim carries the URL it was read from. "NOT VERIFIED" = the page could not be opened, or the number sits in an image the reader could not see.
The study's own tests of these gauges are in `site/facts/gauges.txt` and are not repeated here.

## 1. Where the gauges come from

Three separate families are usually combined on one hand-kept sheet.

### 1a. Counts of large moves: the "Market Monitor" (Pradeep Bonde, Stockbee)

- Described by its author as "a market breadth indicator that tells you about the buying or selling pressure in the market", built around 2001 to manage drawdowns. Columns: stocks up/down 4%+ on the day on higher volume; up/down 25%+ in a quarter; up/down 25%+ in a month; up/down 50%+ in a month; up/down 13%+ in 34 days.
  https://stockbee.blogspot.com/2015/11/what-is-market-monitor.html (17 Nov 2015)
- Exact scan formulas as published (TeleChart / TC2000 syntax), post of 1 Aug 2010:
  - 4% up day: `(100 * (C - C1) / C1) >= 4 AND V >= 1000 AND V > V1`
  - 4% down day: `(100 * (C - C1) / C1) <= (-4) AND V >= 1000 AND V > V1`
  - 25% up in a quarter: `100 * ((C + .01) - (MINC65 + .01)) / (MINC65 + .01) >= 25 and AVGC20 * AVGV20 >= 2500`
  - 25% down in a quarter: `(100 * ((C + .01) - (MAXC65 + .01)) / (MAXC65 + .01)) <= (-25) and AVGC20 * AVGV20 >= 2500`
  - 25% up / down in a month: `C20 >= 5 AND (AVGC20 * AVGV20) >= 2500 AND 100 * (C - C20) / C20 >= 25` (or `<= -25`)
  - "34/13": 13% above the lowest close of 34 sessions (bull) / 13% below the highest close of 34 sessions (bear). The post attaches a second clause to both lines that looks like a copy error; not relied on here.
  - MMA+ / MMA−: share of stocks with a stack of short exponential averages (3, 5, 7, 10 …) all above / all below longer ones (30 … 60).
  https://stockbee.blogspot.com/2010/08/understanding-market-monitor-part1.html?m=0
  Note the two points that matter for comparisons: (i) the 4% count requires **volume above the previous day's volume**, so it is not simply "stocks up 4%"; (ii) the quarter count is measured from the **lowest (or highest) close of the last 65 sessions**, not from the close 65 sessions ago.
- Later versions of the same scans:
  - 13 Jul 2017: `c/c1>=1.04 and v>v1 and v>100000`. https://stockbee.blogspot.com/2017/07
  - 15 Aug 2018 page (formulas are images); author's comments there: down day is `c/c1<=.96`; quarter scans end `AVGC20 * AVGV20 >= 250000` (17 Jan 2019). https://stockbee.blogspot.com/2018/08/market-monitor-scans.html
  - The 2010 formulas write the filters as 1000 and 2500, the 2017–2019 ones as 100000 and 250000. In words the author gives the filter as "Only stock with Dollar volume above 250000 USD or 100000 shares traded are used" (8 Aug 2011, URL below). That the difference is only a change of volume units in the software is an inference: NOT VERIFIED.
- Universe: "it is only US common stocks", data from TC2000, scans run about an hour after the close (author's comments). https://stockbee.blogspot.com/p/mm.html
  Size of the universe: a 2023 user of the data says the scan "currently contains over 6300 stocks". https://sentimentrader.com/blog/a-massive-number-of-stocks-rallied-4-or-more (15 Nov 2023). The size in earlier years was not found.
- Ratios: "total of 5 days 4% b/o divided by total of 5 days 4% b/d"; same over 10 days (author's comment). https://stockbee.blogspot.com/p/mm.html
- Example readings, to show the scale of the counts: 4 May 2009: 317 up 4%, 127 down 4%, 2,918 up 25% in a quarter, 376 down 25% in a quarter. https://stockbee.blogspot.com/2009/05/how-to-analyse-market-daily.html
  8 Jan 2010: 277 up 4%, 41 down 4%, 1,301 / 241 on the quarter counts, 10-day ratio 3.71 ("extremely positive breadth"). https://stockbee.blogspot.com/2010/01/what-is-market-breadth-telling-us.html

### 1b. Share of stocks above a moving average

- T2108 (Worden / TC2000): share of **NYSE** stocks above their **40-day** moving average. The help page gives no overbought or oversold levels. Related T2110/2112/2114/2116: share one or two channels above / below the 40-day average. https://help.tc2000.com/m/69404/l/755052-t2108-of-stocks-above-40-day-pma
  The Market Monitor carries T2108 as a column; its author does not compute it himself. https://stockbee.blogspot.com/p/mm.html
- StockCharts "Percent Above Moving Average": number of index members above the average ÷ number of members. Offered for 50-, 150- and 200-day **simple** averages on the Dow, Nasdaq, Nasdaq 100, NYSE, S&P 100, S&P 500, TSX. Levels: 50% as the bias line; above 70% overbought, below 30% oversold ("These levels may vary for other indices"). Caveats on the page: the 50-day version whipsaws; readings can stay extreme in a strong trend; becoming oversold is not by itself a signal; the buy example waits for an upturn and a cross back above 50%. https://chartschool.stockcharts.com/table-of-contents/market-indicators/percent-above-moving-average
- 20-day **EMA** version: Arthur Hill (StockCharts, 19 Jan 2017) uses "%Above 20-day EMA" on four indexes (S&P 500, MidCap 400, SmallCap 600, Nasdaq 100). Setup: three of four below 30%; signal: three of four back above 50%. He notes bad signals in September and October 2016. https://articles.stockcharts.com/article/articles-arthurhill-2017-01-broad-market-breadth-indicators-are-far-from-bearish-signals---using-above-20-day-ema-for-short-term-bullish-setups-and-signals/
- 10-day version: IndexIndicators publishes the share of index members above 3-, 5-, 10-, 20-, 50-, 100- and 200-day averages for US and European indexes (the URLs say "sma"; the page does not state the type). https://www.indexindicators.com/charts/sp500-vs-sp500-stocks-above-20d-sma-params-x-x-x-x/
  SentimenTrader tests use the share of S&P 500 members above their 10-day average (section 3).
- TradingView's breadth series: 20-, 50- and 200-day **simple** averages, per index or per country; no numeric levels ("Very low readings suggest widespread selling that may be close to exhaustion"). https://www.tradingview.com/support/solutions/43000794827/
- No single author was found for the exact trio "10-day EMA, 20-day EMA, 50-day average". It is a variation on the series above. Published levels for it are borrowed: one practitioner page (Nifty 50 universe) uses 0–20 oversold, 20–50 weak, 50–80 healthy, 80–100 overbought, with the 10- and 20-day readings for the daily trend and the 50-day as confirmation, and no test. https://vivekkpatel.github.io/Trade/Concepts/Market%20Breadth
  Another gives 70–80 / 30–20, "or 75–25 or 90–10", and no test. https://finallynitin.substack.com/p/understanding-market-breadth (19 Jan 2022)

## 2. Thresholds and rules of thumb as the authors state them

Market Monitor, post "How to use market breadth to avoid market crashes", 8 Aug 2011 (https://stockbee.blogspot.com/2011/08/how-to-use-market-breadth-to-avoid.html):

| Column | Level | Author's reading |
|---|---|---|
| Stocks up 4% on the day | up to 300 | normal buying pressure |
| | 300–500 | high |
| | 500–1,000 | very high, "normally seen at beginning of a bullish turn from bearish phase" |
| | 1,000+ | extreme; "Most turns in major trend start with 1000 plus buying day" |
| Stocks down 4% on the day | 1,000+ | "Bear markets rallies typically start after such extreme 1000 plus selling days" |
| 10-day ratio | 2 or more | "good for swing trading on long side" |
| | 0.5 or less | good for the short side; below 0.5 after a bull move "signals start of a bearish move" |
| Up 25% in a quarter | below 500 | "be on watch out for a reversal of the bearish trend" |
| | below 200 | "extremely bullish. It indicates extreme bearishness" |
| Down 25% in a quarter | below 200 | bearish (extreme bullishness), with "a delay of 2 to 6 weeks before real selling might start" |
| Up 50% in a month | above 20 | bearish; bullish again below 10; below 3 bullish |
| Down 50% in a month | above 20 | high bearishness, "tend to lead to reflex rallies" |

Other statements by the same author:
- "300 plus days are rare occurrences". https://stockbee.blogspot.com/2015/11/what-is-market-monitor.html
- A "series of 700 plus days on 4% plus down" with deteriorating breadth points to a larger correction; T2108 "Readings below 20 lead to botoms" [sic]; "If I see number of stocks up 25% in Q below 300 I will be bullish" (Feb 2018); the 5-day ratio is used "only... at extremes". https://stockbee.blogspot.com/p/mm.html
- 5-day ratio: "It tells you when breadth thrust is happening when it is above 2"; T2108 "Readings below 10 act in similar manner" to the quarter count. https://stockbee.blogspot.com/2018/08/market-monitor-scans.html
- 10-day ratio "above 2 and remains above 2 during the beginning part of the move"; below 1 "indicates low momentum phases". https://stockbee.blogspot.com/2011/03/move-not-yet-confirmed-by-breadth.html?m=0 (24 Mar 2011)
- General: "Be bullish when market breadth is extremely negative." https://stockbee.blogspot.com/2010/01/what-is-market-breadth-telling-us.html

Claims made for the monitor by its author (his own account, no statistics published): it "has kept me out of every bearish move since 2002"; in mid-2010 the up-25%-in-a-quarter count fell "below 200 to 130, that resulted in a big rally starting September 2010"; of August 2011: "Historically such low levels lead to tradable bounce in next 1 to 6 weeks time frame". https://stockbee.blogspot.com/2011/08/how-to-use-market-breadth-to-avoid.html
Check against the study's dating: the 2011 final low was 3 Oct 2011, eight weeks after that post, so the "bounce" came inside a drop that was still running.

Moving-average shares:
- T2108 / AT50 as used by Dr. Duru (One-Twenty Two): oversold below 20%, overbought above 70%; since 29 Jul 2021 applied to the 50-day series (TradingView MMFI). Conservative rule described: act only after the gauge leaves the oversold zone. https://drduru.com/onetwentytwo/t2108-resource-page/
- StockCharts: 70 / 50 / 30 (above). Hill, 20-day EMA: below 30% then above 50% (above).

## 3. Published tests with numbers

Share above a moving average, washed out:
- **Dr. Duru, AT50 below 20%, 2002–2023**: 56 oversold periods; the S&P 500 gained during the period in 42 of 56 (75%); median length 3.5 sessions, mean 5.4; 7 periods lasted 10+ sessions and only one of those showed a gain; worst 29 Sep–4 Dec 2008, 48 sessions, S&P 500 −20.8%. https://drduru.com/onetwentytwo/t2108-resource-page/
- **SentimenTrader (Jay Kaeppel, 11 Jun 2021)**: 10-day average of the share of SPY holdings above their 50-day average falls below 10%. S&P higher 2 weeks later in 50% of cases, 2 and 6 months later in 83%, a year later in 100%; median +17.82% at 6 months, +28.02% at a year. Number of signals and their dates are in an image: NOT VERIFIED (an 83% win rate fits 6 or 12 cases). Author: the signal "may at times be a little early". https://sentimentrader.com/blog/backtest-engine-scans-i-have-known-and-loved-the-spy-50-day-ma-edition-part-ii
- **Schaeffer's (Rocky White, 21 Jul 2021)**, milder level: share of S&P 500 above the 50-day falls below 40% for the first time in three months while the index is within 2% of its own 50-day; since 2000: +3.69% average after 3 months (75% positive), +9.38% after 6 months (all 12 positive). "It's not a lot of data points." https://www.schaeffersresearch.com/content/analysis/2021/07/21/market-breadth-indicator-hints-at-buying-opportunity
- **Keller (StockCharts, 13 May 2025)**: fewer than 10% of S&P 500 members above the 50-day at the April 2025 low; previous time October 2023. Example readings, not a test. https://articles.stockcharts.com/article/articles-mindfulinvestor-2025-05-bullish-breadth-improvement-su-805/

Share above the 10-day average, thrusts:
- **SentimenTrader (Dean Christians, 27 Jun 2022)**: share of S&P 500 members above their 10-day average goes from below 2% to above 88% within 4 sessions. 53 earlier signals in about 93 years; since 1947 the index was higher two months later after 36 of 40; 25 signals came in bear markets and 80% of those rallied over two months. Failure named: the 9 Dec 2021 signal gained at most 2.83% before the 2022 decline. The article itself fired on Friday 24 Jun 2022; the study dates the final low to 12 Oct 2022 and marks 24 Jun 2022 as inside a fall whose low later broke (`gauges.txt`, "up4≥35 days"). https://sentimentrader.com/blog/stocks-thrust-from-oversold-to-overbought-triggering-a-buy-signal
- **SentimenTrader (Jason Goepfert, 3 Jan 2022)**: more than 90% of S&P 500 members above their 10-day average: 193 signals since 1998, positive one-year return after 187. Published on the session of the January 2022 high. https://www.sentimentrader.com/blog/a-whole-week-with-more-than-90-of-sp-members-in-short-term-uptrends
- **SentimenTrader (Christians, 22 Jan 2021)**: fewer than 50% above the 10-day on a day of a new index high: weak returns a month out, "sample size is small", figures in an image: NOT VERIFIED. https://sentimentrader.com/blog/a-rare-short-term-breadth-signal

4% counts:
- **SentimenTrader (Christians, 15 Nov 2023)**, the only published test of a 4% count found, and it uses the Market Monitor's own data (6,300+ stocks): about 25% of stocks rose 4% or more on 14 Nov 2023, the most since the autumn 2022 low. After earlier surges of that size the S&P 500 was higher 3, 6 and 12 months later every time; the 2011 case fell as much as 9.8% within two months first. The number of precedents and the start of the history are not given in the text; "the sample size is small". The sub-industry version (32% of groups up 4%) has 38 cases since 1957; apart from 2008, the bear-market cases came near the end of the decline. https://sentimentrader.com/blog/a-massive-number-of-stocks-rallied-4-or-more and https://sentimentrader.com/blog/daily_report_11_15_2023
- No published test was found of: the 5- or 10-day ratio of 4% up to 4% down days (levels 2 and 0.5); the 300 / 500 / 1,000 count bands; the count of stocks up or down 25% in a quarter (levels 200, 300, 500); the 10-day-EMA or 20-day-EMA share at any level. For these the only evidence is the author's dated examples and the study's own table.

Academic:
- Yu, Webb and Lin, "The Use of Index-Specific Market Breadth and Index-over-Moving-Average Indicators in Stock Trading Strategies", Journal of Investing, 2025 (DOI 10.3905/joi.2024.1.341): tests breadth ratios and 20/50/200-day index-over-average measures for return prediction; abstract says some strategies "may be effective". Page returned 403; known from a search snippet only: NOT VERIFIED. https://www.ebsco.com/articles/business-and-management/0252f6b4-ed01-5be8-8544-9c13b6170788/the-use-of-index-specific-market-breadth-and-index-over-moving-average-indicators-in-stock-trading-strategies
- Looked at and set aside: Horstmeyer, El Boury and Hardin (CFA Institute, 8 Feb 2022) test the index against its own 50- and 200-day average, not breadth. https://rpc.cfainstitute.org/blogs/enterprising-investor/2022/technical-analysis-revisited-moving-averages-above-average-returns

What the published tests have in common:
- Good 6–12 month record after washouts and thrusts, weak or coin-flip record over 2 weeks (Kaeppel 50%).
- The long oversold periods are the bear-market ones (Duru: 7 of 56 lasted 10+ sessions, 6 of them with losses, worst −20.8%).
- Small samples, overlapping signals, no out-of-sample test, results published by data vendors. Failures cluster in 2008, 2011, late 2021–2022.

## 4. All-stocks counts against large-cap percentages

- The Market Monitor counts US common stocks that pass a low liquidity bar (about 100,000 shares or $250,000 a day): 6,300+ names in 2023. The study measures about 660 large stocks. Small stocks move 4% in a day far more often than large ones, so the same percentage is a rarer event in the study's universe.
- Rough conversion of the author's bands, taking 6,300 as the universe (its size in 2011, when the bands were written, is not known): 300 = 4.8%; 500 = 7.9%; 700 = 11.1%; 1,000 = 15.9%. Quarter count: 200 = 3.2%; 300 = 4.8%; 500 = 7.9%.
- For scale, in the study's universe 16.2% of stocks down 4% is the 95th percentile of days and 37.6% the 99th (`gauges.txt`, first line).
- The 8 Aug 2011 post that sets out the bands was written on the day of the largest 4%-down reading of that drop in the study's data (88.8% of stocks); the final low came 39 sessions later, on 3 Oct 2011 (`gauges.txt`, PER LOW).
- Differences of definition, apart from the universe:
  1. Volume: the hand count needs volume above the prior day's; a plain "down 4%" share does not. Heavy-volume selling days after a quiet session pass; the second day of a two-day slide on lower volume does not.
  2. Quarter: the hand count measures from the 65-session low or high, which generally gives a larger count than a point-to-point 65-session change.
  3. Side watched: the author's washout rule is on the **up** count (few stocks up 25% in a quarter: below 200–300). The study's washout rows use the **down** share (above 20% / 40%). They are related but not the same event.
  4. T2108 is NYSE-only and 40-day; the study's is 50-day on large stocks; EMA and simple averages differ slightly at turns.
  5. Membership: the hand-kept series used the stocks listed on each day; the study applies today's index members to the past (survivorship), which makes old washouts look milder than they were on an all-stocks sheet.
- Consequence: levels do not transfer. Percentile rank within each series does; the order of events (washout first, surge later) is what can be compared across the two.

## Source list

Opened and read:
- https://stockbee.blogspot.com/p/mm.html
- https://stockbee.blogspot.com/2010/08/understanding-market-monitor-part1.html?m=0
- https://stockbee.blogspot.com/2018/08/market-monitor-scans.html
- https://stockbee.blogspot.com/2017/07
- https://stockbee.blogspot.com/2015/11/what-is-market-monitor.html
- https://stockbee.blogspot.com/2011/08/how-to-use-market-breadth-to-avoid.html
- https://stockbee.blogspot.com/2011/03/move-not-yet-confirmed-by-breadth.html?m=0
- https://stockbee.blogspot.com/2010/01/what-is-market-breadth-telling-us.html
- https://stockbee.blogspot.com/2009/05/how-to-analyse-market-daily.html
- https://help.tc2000.com/m/69404/l/755052-t2108-of-stocks-above-40-day-pma
- https://chartschool.stockcharts.com/table-of-contents/market-indicators/percent-above-moving-average
- https://articles.stockcharts.com/article/articles-arthurhill-2017-01-broad-market-breadth-indicators-are-far-from-bearish-signals---using-above-20-day-ema-for-short-term-bullish-setups-and-signals/
- https://articles.stockcharts.com/article/articles-mindfulinvestor-2025-05-bullish-breadth-improvement-su-805/
- https://www.indexindicators.com/charts/sp500-vs-sp500-stocks-above-20d-sma-params-x-x-x-x/
- https://www.tradingview.com/support/solutions/43000794827/
- https://drduru.com/onetwentytwo/t2108-resource-page/
- https://sentimentrader.com/blog/backtest-engine-scans-i-have-known-and-loved-the-spy-50-day-ma-edition-part-ii
- https://sentimentrader.com/blog/stocks-thrust-from-oversold-to-overbought-triggering-a-buy-signal
- https://www.sentimentrader.com/blog/a-whole-week-with-more-than-90-of-sp-members-in-short-term-uptrends
- https://sentimentrader.com/blog/a-rare-short-term-breadth-signal
- https://sentimentrader.com/blog/a-massive-number-of-stocks-rallied-4-or-more
- https://sentimentrader.com/blog/daily_report_11_15_2023
- https://sentimentrader.com/blog/moving-average-breadth (no usable numbers in the text)
- https://www.schaeffersresearch.com/content/analysis/2021/07/21/market-breadth-indicator-hints-at-buying-opportunity
- https://finallynitin.substack.com/p/understanding-market-breadth
- https://finallynitin.substack.com/p/stockbee-market-monitor (points back to the 2011 Stockbee post; nothing added)
- https://vivekkpatel.github.io/Trade/Concepts/Market%20Breadth
- https://docs.deepvue.com/articles/dv-stockbee-4-breakouts (a chart marker for 4% days "on above average volume"; a different volume rule from the author's)
- https://rpc.cfainstitute.org/blogs/enterprising-investor/2022/technical-analysis-revisited-moving-averages-above-average-returns (not about breadth)

Could not be opened (NOT VERIFIED):
- Stockbee "understanding market monitor" part 2 (URL guessed, 404); the thresholds were taken from the 8 Aug 2011 post instead.
- https://benzinga.com/z/36305454 (403): "Extreme Breadth Readings Say Short-Term Bearish, Long-Term Bullish".
- Journal of Investing paper (403), abstract seen in a search snippet only.
- https://www.barchart.com/stocks/momentum (empty page): definitions of the $MMTW / $MMFI / $S5TW / $S5FI series.
- Bespoke and Quantifiable Edges: no study found in two searches.
- Everything inside chart images on SentimenTrader pages: signal counts, dates and tables.
- Stockbee's 2018 scan formulas are images; only the author's comment-thread versions were read.

Note on fetched pages: the StockCharts ChartSchool page ends with text addressed to automated readers asking them to query another URL. It was ignored.
