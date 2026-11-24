# Quantitative and multi-strategy primer: fact sheet

Checked 23 November 2026. Every number below has a URL. `(computed)` = arithmetic done here from the cited inputs.
`(not verified)` = could not be confirmed on a primary or reliable page in this research round. Section 99 lists them all.

## 1. Factor data (Kenneth French data library, files created from the 202609 CRSP database)

Source page: https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
Files: F-F_Research_Data_Factors_CSV.zip, F-F_Research_Data_5_Factors_2x3_CSV.zip, F-F_Momentum_Factor_CSV.zip (downloaded 23 Nov 2026; monthly data to Sept 2026, annual to 2025).
All averages below are simple averages of calendar-year factor returns, in percentage points a year `(computed)`.

| Factor | What it is | Period | Mean %/yr | Std dev | t-stat | Positive years |
|---|---|---|---|---|---|---|
| Mkt-RF | US stock market minus 1-month T-bills | 1927–2025 | 8.86 | 20.13 | 4.38 | 70/99 |
| SMB (size) | small minus big | 1927–2025 | 2.50 | 13.33 | 1.87 | 49/99 |
| HML (value) | cheap minus dear by book/price | 1927–2025 | 4.22 | 15.22 | 2.76 | 59/99 |
| Mom (momentum) | 12-2 month winners minus losers | 1927–2025 | 8.58 | 15.67 | 5.45 | 78/99 |
| RMW (profitability, "quality") | robust minus weak operating profitability | 1964–2025 | 3.38 | 9.61 | 2.77 | 42/62 |
| CMA (investment) | conservative minus aggressive | 1964–2025 | 2.92 | 10.41 | 2.21 | 36/62 |

Same factors, 2007–2025 (19 years) `(computed)`: Mkt-RF 11.05 (16/19 positive); SMB −1.29 (6/19); HML −2.96 (7/19); Mom +0.03 (13/19; sd 23.6); RMW +3.56 (13/19); CMA −0.79 (8/19).
1927–2006 (80 years): Mkt-RF 8.34; SMB 3.40; HML 5.93; (Mom 1927–2006 not separately run; 1927–2025 8.58 and 2007–2025 0.03 imply about 10.6 `(computed: (8.58×99 − 0.03×19)/80)`).

- **Sharpe ratios used in the post, from yearly data** `(computed: mean ÷ standard deviation of calendar-year returns)`: market 1927–2025 8.86 ÷ 20.13 = 0.44; market 2011–2025 13.42 ÷ 14.77 = 0.91; momentum 1927–2025 8.58 ÷ 15.67 = 0.55; value (HML) 1927–2025 4.22 ÷ 15.22 = 0.28. (Monthly data give 0.45 for the market, 0.45 for momentum and 0.34 for value; the yearly versions are used so that a reader can reproduce them from the table above.)
- **Sharpe ratio of the US stock market, 1927–2025, other versions** `(computed)`: annual data 8.86 ÷ 20.13 = **0.44**; monthly data annualised 8.28 ÷ 18.43 = **0.45**. 1964–2025 monthly: 7.08 ÷ 15.48 = 0.46. 2007–2025 monthly: 10.20 ÷ 15.90 = 0.64. 2011–2025: 0.87.
- T-bill (RF) average 1927–2025: 3.33% a year.
- Momentum annual: 2007 +21.81, 2008 +13.72, **2009 −83.48** (annual factor file; monthly long-short returns compounded give −52.8% for 2009 and −49.4% for March–May 2009 `(computed)`), 2010 +6.77, 2016 −21.23, 2022 +15.93, 2023 −24.31, 2024 +19.72, 2025 −2.27. 2026 monthly: Jan +5.03, Feb +1.31, Mar +1.56, Apr +9.51, May +1.39, Jun +4.62, **Jul −12.21**, Aug −5.60, Sep +6.70.
- Momentum monthly 2025: Jun −2.65, Jul −0.94, Aug −3.61 (the mid-2025 quant drawdown shows up as three negative months), Sep +4.62.
- HML annual: 2016 +22.80, 2017 −13.42, 2018 −9.63, 2019 −10.36, 2020 −46.94, 2021 +25.60, 2022 +25.70, 2023 −13.98, 2024 −8.43, 2025 +8.71. Monthly HML compounded Jan 2018–Sep 2020: −45.5%; Jan 2017–Sep 2020: −51.4%; Jan 2018–Dec 2020: −43.0% `(computed)`.
- RMW annual 2016–2025: 4.60, 4.53, −1.33, 3.81, −5.21, 26.72, 6.63, 6.19, 5.11, −10.85. CMA: 9.50, −11.27, 0.15, −2.98, −11.70, 11.67, 22.53, −20.88, −10.04, −5.33.

## 2. Khandani and Lo, "What Happened to the Quants in August 2007?" (revision of 20 Sept 2007)

PDF: https://web.mit.edu/Alo/www/Papers/august07.pdf (read in full text).
- Test strategy: a daily "contrarian" long/short rule: buy yesterday's losers, sell short yesterday's winners, US stocks, dollar-neutral.
- Monday 6 Aug: +0.50% (read from Table 3, "All" column; the extracted table's date labels are shifted one row, and the reading is confirmed by the week's total: 0.50 − 1.16 − 2.83 − 2.86 + 5.92 = −0.43, the figure in the text).
- Unlevered daily returns of the strategy: Tue 7 Aug −1.16%, Wed 8 Aug −2.83%, Thu 9 Aug −2.86%; three-day total −6.85%. The strategy's 2006 daily standard deviation was 0.52%, so the three-day loss was about 12 daily standard deviations. Fri 10 Aug: +5.92% (11.4 daily sd). Whole week of 6 Aug: −0.43%.
- With 8:1 leverage (gross long + short over capital; returns ×4): −4.64%, −11.33%, −11.43%; "a little over a quarter" of capital lost in three days.
- Average daily return of the strategy (before costs): 1.38% in 1995, 0.44% in 2000, 0.13% in 2007 to 31 Aug. Leverage of almost 9:1 was needed in 2007 to match the expected return of 1998.
- S&P 500 on 9 Aug 2007: −2.95%; nothing unusual in the broad market on 7–8 Aug.
- Hypothesis: losses started with the rapid unwinding of one or more large market-neutral equity portfolios (probably a multi-strategy fund or bank trading desk raising cash or cutting risk); the price impact hit other funds holding similar positions, which triggered their loss limits and more selling. The quantitative nature of the funds was incidental; the crowding was the cause.
- Renaissance Institutional Equities Fund fell 8.7% in August 2007 (Bloomberg, 10 Aug 2007, via https://en.wikipedia.org/wiki/Renaissance_Technologies).

## 3. Long-Term Capital Management, 1998

Federal Reserve History essay: https://www.federalreservehistory.org/essays/ltcm-near-failure
- Founded February 1994 by John Meriwether (ex-Salomon Brothers). Net returns: about 20% (1994), 43% (1995), 41% (1996), 17% (1997).
- Leverage: about $30 of debt per $1 of capital at end-1997.
- Russia devalued and halted debt payments in August 1998 (17 Aug 1998; date from general record). LTCM lost 44% of its value in August 1998.
- 23 Sept 1998: 14 banks and brokers put in $3.625bn, organised by the Federal Reserve Bank of New York. No public money.

## 4. Knight Capital, 1 August 2012

SEC press release 2013-222, 16 Oct 2013: https://www.sec.gov/news/press-release/2013-222
- In the first 45 minutes of trading, Knight's order router sent more than 4 million orders while trying to fill 212 customer orders; traded more than 397 million shares; took unwanted positions of several billion dollars; lost more than **$460 million**. Penalty $12 million; first enforcement action under the market access rule (Rule 15c3-5, adopted 2010).
- Cause as given in the press release: code had been moved in 2005 and new code was deployed in late July 2012; the order router then misfired; 97 automated emails generated before the open were not acted on. (The detail that old code on one server was triggered is from general accounts of the SEC order, not from the page read; not used in the post.)
- Conflict: Knight's own first announcement (2 Aug 2012) gave a pre-tax loss of about $440 million; the SEC order says more than $460 million. The SEC figure is used.

## 5. Harvey, Liu and Zhu (2016); McLean and Pontiff (2016)

- Harvey, Liu, Zhu, "…and the Cross-Section of Expected Returns", Review of Financial Studies 29(1), 2016, pp. 5–68; NBER w20592: https://www.nber.org/papers/w20592 . Abstract: hundreds of papers and factors; a new factor should clear a t-statistic above 3.0, not the usual 2.0; "most claimed research findings in financial economics are likely false".
- McLean and Pontiff, "Does Academic Research Destroy Stock Return Predictability?", Journal of Finance 71(1), Feb 2016, pp. 5–32: https://ideas.repec.org/a/bla/jfinan/v71y2016i1p5-32.html (numbers: see section 9).

## 6. Mercer's "50.75%" remark

- Origin: Gregory Zuckerman, *The Man Who Solved the Market* (Portfolio/Penguin, 2019). Mercer reportedly told a friend that the firm was right about 50.75% of the time and that this was enough to make billions. Zuckerman's own gloss: Mercer was probably not giving the real figure, only making the point about a small edge over very many trades.
- Confidence: C. Second-hand (Mercer to an unnamed friend, to Zuckerman). Wording seen only in readers' highlights of the book, not on a publisher page `(not verified against the book text)`.
- Medallion fund: about 66% a year before fees and 39% after, 1988–2018 (Zuckerman, via https://en.wikipedia.org/wiki/Renaissance_Technologies). Details belong to the Simons profile.

## 7. Wholesalers and payment for order flow

SEC, proposed Order Competition Rule, Release 34-96495, 14 Dec 2022 (data for Q1 2022): https://www.sec.gov/files/rules/proposed/2022/34-96495.pdf (read in full text)
- Brokers route more than 90% of individual investors' marketable orders in listed stocks to six off-exchange dealers called wholesalers. Wholesalers trade against ("internalize") over 90% of the dollar volume they receive.
- Two of the six accounted for about 66% of wholesalers' executed share volume (footnote 372). The release does not name them; a 2024 conference paper names Citadel Securities and Virtu Financial and puts their share above 70% (https://aeaweb.org/conference/2024/program/paper/5Gtsa7ra) `(secondary, seen in a search summary only)`.
- Table 1, share of all US listed-stock share volume, Q1 2022: 16 exchanges 59.7%; 32 alternative trading systems (dark pools) 10.2%; 6 wholesalers 23.9%; 232 other dealers 6.3%. Wholesalers were 59.4% of off-exchange volume.
- Payment for order flow in listed stocks: $235 million in Q1 2022; the largest recipient broker got $101.5 million.
- SEC estimate of the "competitive shortfall" (price improvement retail orders would have got with order-by-order competition): 1.08 basis points, about $1.5 billion a year.
- Rule 606(a)(1): brokers publish quarterly reports of where they route orders and what they are paid. Rule 605: market centres publish execution-quality statistics.
- More recent, from paywalled trade press (headlines and teasers only, `not verified` beyond that): market makers paid about $1.19bn for US retail order flow (stocks and options) in Q1 2025; Citadel Securities paid $943m in the first nine months of 2025 (https://www.globaltrading.net/?p=37640 ; https://www.globaltrading.net/?p=38554).

## 8. Multi-strategy ("pod") firms

- 2025 net returns (Business Insider, 2–6 Jan 2026, via https://finance.yahoo.com/news/2025-returns-hedge-funds-rolling-234728986.html): AQR Apex 19.6%; D.E. Shaw Composite 18.5%; ExodusPoint 18%; Point72 17.5%; Balyasny 16.7%; Walleye 15.5%; Schonfeld 12.5%; Millennium 10.5%; Citadel Wellington 10.2%; Verition 7.5%; Jain Global 3.7%. S&P 500 in 2025: 16.4% (price only; 17.7–17.8% with dividends). Assets given there: Millennium $83.5bn, Citadel $72bn, Balyasny $31bn.
- Assets later: Millennium about $97bn, September 2026 (Bloomberg, 7 Sep 2026, via https://en.wikipedia.org/wiki/Millennium_Management,_LLC); more than $30bn of new commitments against a $20bn target, about $22bn finalised 1 Oct 2026. Headcount 6,800+ (July 2026). About 280 investment teams (Reuters, Oct 2018); 265 at end-2020. Citadel: over $77bn, January 2026 (Bloomberg, via https://en.wikipedia.org/wiki/Citadel_LLC; the same page also says $67bn; Business Insider says $72bn in Jan 2026): conflict, see section 98. Point72 $45.7bn early 2026 (Business Insider, via search summary). Balyasny $31bn Jan 2026.
- Citadel: net gains for investors since 1990 $90.4bn to Dec 2025 (LCH Investments via CNBC, in Wikipedia); $16bn profit for clients in 2022, a record; main funds lost 55% in 2008, +62% in 2009, withdrawals barred for 10 months; leverage 7:1 then.
- Millennium: about 14% a year since 1989 (LCH Investment 2019 ranking, in Wikipedia) `(secondary)`.
- Risk rules at Millennium (reported, never confirmed by the firm; confidence C): a loss of 5% leads to capital being cut, often halved; 7.5% usually ends the mandate. eFinancialCareers, 30 Sep 2024, citing the Wall Street Journal: managers down more than 7.5% are "almost certainly out"; 15–20% of people leave each year (https://www.efinancialcareers.com/news/millennium-hedge-fund-jobs). Other accounts give 7.5–10% across firms. Citadel is reported to be less mechanical. `(5% step: not verified in a primary report)`
- Fees: at multi-strategy funds that pass all costs to clients, investors kept 41 cents of each dollar of gross profit in 2023, down from 54 cents in 2021 (BNP Paribas prime brokerage data, reported by Bloomberg 12 Feb 2024 https://www.bloomberg.com/news/articles/2024-02-12/some-multistrategy-hedge-funds-keep-over-half-their-profits-via-customer-fees ; repeated by Hedgeweek 22 Aug 2025 https://hedgeweek.com/news/investors-push-back-on-multi-strategy-hedge-fund-fee-structures). Fee disclosures at Millennium, Citadel, Point72, Balyasny, ExodusPoint rose almost 40% over seven years (Bloomberg data, same Hedgeweek piece). First-half 2025: Citadel +2.5%, Millennium +2.2%.
- Industry size: multi-strategy fund assets a record $428bn, +16.1% on the year (Goldman Sachs prime services report, 2026, via secondary summaries) `(secondary)`.
- Leverage: Goldman Sachs prime book gross leverage about 292.8% in December 2025, the highest on record; JPMorgan 297.9% in November 2025 (Reuters via https://www.kitco.com/news/off-the-wire/2026-01-07/hedge-funds-rode-buoyant-stock-market-deliver-double-digit-gains-2025 ; search summary) `(secondary)`. Hedge funds overall returned 11.8% in 2025 (Goldman prime).

## 9. Backtest evidence and the academic papers

- McLean and Pontiff (2016): 97 published predictors of stock returns. Portfolio returns 26% lower out of sample and 58% lower after publication; the 26% is an upper bound on data-mining effects; the remaining 32 points are attributed to investors trading on the published result. Abstract as quoted in search results from the published PDF (https://ivey.uwo.ca/media/3775549/pontiff.pdf); journal record https://ideas.repec.org/a/bla/jfinan/v71y2016i1p5-32.html.
- Bailey and López de Prado, "The Deflated Sharpe Ratio" (Journal of Portfolio Management, 2014): https://www.davidhbailey.com/dhbpapers/deflated-sharpe.pdf (read). The expected best Sharpe ratio among N trials rises with N even when every true Sharpe ratio is zero; a backtest should be judged against that inflated hurdle, and researchers should disclose the number of trials. Worked example in the paper: a Sharpe ratio of 2.5 on 5 years of daily data found after 100 trials is not significant at 95%; it would have been if found after 46 trials.
- Gatev, Goetzmann, Rouwenhorst, "Pairs Trading" (NBER w7032, 1999; Review of Financial Studies 2006): daily data 1962–1997; pairs matched by closest historical price paths; six-month trading periods; top pairs earned up to 12% a year excess. https://www.nber.org/papers/w7032
- Grinold (1989), "The Fundamental Law of Active Management", Journal of Portfolio Management: information ratio ≈ information coefficient × √breadth. Information coefficient = correlation between forecasts and outcomes; breadth = number of independent bets a year. CFA Institute reading: https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2025/analysis-active-portfolio-management . Extended with a "transfer coefficient" by Clarke, de Silva and Thorley (2002). The 1989 article itself was not opened.
- Frazzini, Kabiller, Pedersen, "Buffett's Alpha" (Financial Analysts Journal 74(4), 2018): Berkshire Sharpe ratio 0.76; leverage about 1.6 to 1. https://www.aqr.com/Insights/Research/Journal-Article/Buffetts-Alpha
- Hurst, Ooi, Pedersen, "A Century of Evidence on Trend-Following Investing" (Journal of Portfolio Management, Fall 2017): trend following tested back to 1880. https://www.aqr.com/Insights/Research/Journal-Article/A-Century-of-Evidence-on-Trend-Following-Investing (numbers not on the summary page).

## 10. Episodes

- **Flash crash, 6 May 2010** (https://en.wikipedia.org/wiki/2010_flash_crash, citing the SEC–CFTC report of 30 Sep 2010): began 2:32 pm; Dow fell 998.5 points (about 9%) at the low; a 600-point drop in about 5 minutes, mostly regained by 3:07 pm. Trigger named in the report: a mutual fund (Waddell & Reed) sold 75,000 E-mini S&P 500 futures (about $4.1bn) by algorithm in about 20 minutes. Some shares traded at 1 cent (Accenture) or $100,000 (Sotheby's, Apple). Trades more than 60% from the reference price were cancelled. Navinder Sarao arrested April 2015 for spoofing; one year of home confinement, Jan 2020. Single-stock circuit breakers followed.
- **Summer 2025** (MSCI, 30 Oct 2025, https://www.msci.com/research-and-insights/blog-post/unraveling-summer-2025s-quant-fund-wobble): 1 June–25 July 2025; Goldman Sachs prime services estimated quant equity managers lost 4.2% while US stocks rose about 8% to records. Heavily shorted, unprofitable, volatile stocks rallied; momentum and profitability about −1% a month. Press named Qube, Point72's Cubist, Man Group, Two Sigma, Renaissance.
- **July 2026** (Reuters 9 Jul 2026 via https://live.euronext.com/en/financial-news/ai-selloff-drives-quant-funds-worst-performance-august ; Hedgeweek 10 Jul 2026 https://hedgeweek.com/news/ai-led-market-reversal-hits-quant-hedge-funds-as-crowded-trades-unravel): Goldman Sachs note of 8 Jul 2026: systematic funds' year-to-date return fell from 14.4% on 22 June to 10.8%, a quarter of the year's gain; stock pickers −2.2% over the same days, still +15.5% for the year; hedge fund leverage at a one-year low. Hedgeweek 21 Aug 2026 (https://www.hedgeweek.com/hedge-funds-suffer-historic-july-setback-as-ai-trade-unravels/): Goldman's basket of most-held hedge fund stocks had its worst month against the S&P 500 in over 20 years in July 2026. French momentum factor: −12.21% in July 2026, −5.60% in August (section 1).
- **Quant winter 2018–2020**: HML −9.63 (2018), −10.36 (2019), −46.94 (2020). Renaissance's public funds in 2020: Institutional Equities about −20% through October, market-neutral fund about −27%, while the staff-only Medallion fund gained 76% (Bloomberg 17 Nov 2020, Institutional Investor 13 Jan 2021, via https://en.wikipedia.org/wiki/Renaissance_Technologies).
- **LTCM extra detail** (https://en.wikipedia.org/wiki/Long-Term_Capital_Management): start of 1998 equity $4.7bn, borrowings over $124.5bn, assets about $129bn (over 25 to 1); derivatives with notional value about $1.25 trillion; May −6.42%, June −10.14% 1998; capital down $1.85bn in August; equity $2.3bn at start of September, $400m by 25 Sept; total 1998 losses $4.6bn; partners Myron Scholes and Robert Merton (Nobel 1997); fund wound up early 2000. Rescue: $3.625bn (Fed history) / $3.65bn (Wikipedia lead); the Fed figure is used.

## 11. Base rates

- **Hedge fund indexes to 31 Dec 2025** (HFR indexes, in the UBS hedge fund bulletin, https://www.ubs.com/global/en/assetmanagement/insights/asset-class-perspectives/hedge-funds/articles/uga-hf-bulletin-dec-2025.html), annualised %:
  - HFRI Macro: Systematic Diversified (trend-following/CTA proxy): 2025 −0.65; 3y −0.22; 5y 3.61; 10y **2.12**; 10y volatility 7.63.
  - HFRI Relative Value (Total): 2025 7.49; 3y 7.70; 5y 6.01; 10y **5.29**; vol 4.29.
  - HFRI Equity Hedge (Total): 2025 17.34; 10y 8.11; vol 8.72. HFRI Macro (Total): 10y 3.89.
  - MSCI World net: 2025 21.09; 3y 21.17; 5y 12.15; 10y **12.17**; vol 14.71. US investment-grade bonds 10y 2.02.
  - HFRI Equity Market Neutral index: `NOT FOUND` (looked at HFR pages and the UBS bulletin; no row).
- **SG CTA Index** (20 largest managed-futures programmes, equal weight, from 1 Jan 2000): 2015 about flat; 2022 +20.1% (best year since 2000; SG Trend Index +27.3%) https://www.hedgeweek.com/trend-followers-turn-leaders-ctas-deliver-record-returns-2022/ ; 2023 almost −3%; 2024 +2.4% (StoneX summary); down more than 8% for 2025 by late May 2025 (https://www.alternativeswatch.com/2025/06/02/trend-following-hedge-funds-endure-more-pain-societe-generale-indices/); SG Trend Index +2.39% for 2025. Full table by year not found `(partial; from search summaries)`.
- Barclay CTA Index: +8.25% for 2026 to October (estimate, 84% reporting) https://portal.barclayhedge.com/cgi-bin/indices/displayIndices.cgi?indexID=cta
- AutumnGold AG Systematic CTA Index by year (https://www.autumngold.com/includes_new/index_performance_history.php?id=113235): 2000 21.00, 2001 10.87, 2002 19.41, 2003 16.99, 2004 8.69, 2005 7.86, 2006 8.38, 2007 14.92, 2008 19.96, 2009 2.05, 2010 9.74, 2011 −3.16, 2012 −0.80, 2013 −2.69, 2014 11.12, 2015 −3.55, 2016 −0.82, 2017 1.49, 2018 −4.44, 2019 2.93, 2020 8.51, 2021 6.05, 2022 5.22, 2023 2.56, 2024 5.05, 2025 3.25, 2026 to Oct 7.60. (A lesser-known index of reporting programmes; survivorship and self-reporting bias likely. Not used for headline claims.)
- **Funds an individual can buy** (total returns after fees, https://totalrealreturns.com/n/SPY,AQMIX,PQTIX,QMNIX,BTAL,DBMF , data to 23 Nov 2026):
  - AQR Managed Futures (AQMIX), calendar years 2010–2025: 7.74, −6.03, 2.99, 10.53, 15.10, 4.05, −8.43, −0.97, −8.88, 1.92, −0.43, −1.04, 35.47, 1.83, 8.40, 14.62; 2026 YTD +11.81.
  - SPY same years: 15.06, 1.89, 15.99, 32.31, 13.46, 1.23, 12.00, 21.71, −4.57, 31.22, 18.33, 28.73, −18.18, 26.18, 24.89, 17.72; 2026 YTD +6.75.
  - AQR Equity Market Neutral (QMNIX) 2015–2025: 17.60, 5.86, 5.85, −11.73, −11.30, −19.62, 17.64, 27.27, 17.17, 25.26, 26.54; 2026 YTD −6.73. Max drawdown −24.27% (Jul 2019–Nov 2020).
  - Common period 8 May 2019–23 Nov 2026, % a year: SPY 14.64; QMNIX 9.63; AQMIX 8.78; DBMF 7.94; PQTIX 5.18; BTAL −4.18.
- **Factor ETFs** (iShares MSCI USA factor funds, https://totalrealreturns.com/n/SPY,MTUM,VLUE,QUAL,USMV,SIZE), common period 22 Jul 2013–23 Nov 2026, % a year: SPY 13.36; momentum MTUM 13.60; quality QUAL 13.30; value VLUE 12.00; size SIZE 11.05; minimum volatility USMV 10.50. Growth of $10,000: SPY $53,272; MTUM $54,795; QUAL $52,870; VLUE $45,349; SIZE $40,496; USMV $37,885. Max drawdowns all 33–39% (March 2020).
  - Calendar years 2014–2025. SPY: 13.46, 1.23, 12.00, 21.71, −4.57, 31.22, 18.33, 28.73, −18.18, 26.18, 24.89, 17.72. MTUM: 14.62, 8.91, 5.00, 37.50, −1.67, 27.25, 29.86, 13.36, −18.27, 9.15, 32.89, 22.15. VLUE: 12.77, −3.49, 15.34, 21.95, −11.13, 27.20, −0.23, 28.93, −14.17, 14.26, 7.25, 32.67. QUAL: 11.71, 5.45, 9.20, 22.26, −5.70, 33.89, 17.04, 26.94, −20.50, 30.88, 23.13, 12.65. USMV: 16.33, 5.44, 10.57, 18.91, 1.34, 27.69, 5.64, 20.85, −9.43, 10.33, 15.74, 7.65. SIZE: 16.08, 1.60, 12.17, 18.76, −6.59, 28.97, 16.26, 25.06, −15.86, 17.78, 14.37, 10.51.
  - 2026 to 23 Nov: SPY +6.75; MTUM +2.59; VLUE +32.95; QUAL +9.13; USMV +7.68; SIZE +9.11.
- `(computed)` from the calendar-year figures above: AQMIX 2010–2025 4.31% a year ($1 → $1.96) against SPY 14.02% ($1 → $8.16); AQMIX 2011–2021 0.56% a year; QMNIX 2015–2025 7.89% a year against SPY 13.42%; QMNIX 2018–2020 cumulative −37.1%; QMNIX 2021–2025 22.70% a year. AG Systematic CTA index: 12.85% a year 2000–2009, 2.42% a year 2010–2025.
- Multi-strategy returns by year (reported net, press): Citadel Wellington about 38% (2022), 15.3% (2023), 15.1% (2024), 10.2% (2025). Millennium about 12% (2022), 10% (2023), 15% (2024), 10.5% (2025). Point72 about 10% (2022), about 10% (2023), about 19% (2024), 17.5% (2025). Balyasny Atlas Enhanced 13.6% (2024), 16.7% (2025); 2022 and 2023 not confirmed. Sources: Bloomberg 3 Jan 2024 headline https://www.bloomberg.com/news/articles/2024-01-03/hedge-funds-millennium-eisler-close-out-2023-with-10-gains ; Hedgeweek 3 Jan 2025 citing Bloomberg https://www.hedgeweek.com/multi-strats-make-their-mark-in-2024/ ; Business Insider Jan 2026 (section 8); 2022 figures from search summaries `(2022 and Point72 2023–24: secondary, not verified)`.
- LCH Investments estimates (Fortune/Bloomberg, 23 Jan 2023, https://fortune.com/2023/01/23/how-ken-griffins-citadel-beat-the-rest-of-the-hedge-fund-industry-and-soared-to-a-16-billion-return-in-2022/): Citadel made $16bn for clients in 2022, the largest yearly gain by a hedge fund firm; D.E. Shaw $8.2bn; Millennium $8bn; Point72 $2.4bn. The top 20 firms have produced $692bn, 49% of the roughly $1.4 trillion all hedge funds have made for investors since inception.

## 12. Market making, high-frequency trading, margin, other

- Virtu Financial S-1 (filed March 2014): one losing trading day in **1,238** trading days, 1 Jan 2009–31 Dec 2013. https://www.sec.gov/Archives/edgar/data/1592386/000104746914002070/a2218589zs-1.htm (read). Wikipedia says 1,277 of 1,278 days; the filing is used. Average daily adjusted net trading income 2013: $1.645 million. Virtu bought KCG (the former Knight Capital) for $1.4bn, completed 20 July 2017 (https://en.wikipedia.org/wiki/Virtu_Financial).
- Citadel Securities (https://en.wikipedia.org/wiki/Citadel_Securities): separate firm from the hedge fund Citadel, both majority-owned by Ken Griffin; more than 20% of US equity trades by end-2022; "one out of every four" US stock trades as of 2026; revenue $9.7bn and net income $4.2bn in 2024; about 1,800 employees (2025); Sequoia and Paradigm invested $1.15bn at a $22bn valuation, January 2022.
- High-frequency trading (https://en.wikipedia.org/wiki/High-frequency_trading): positions held for seconds or fractions of a second, none overnight; execution times fell from seconds around 2000 to milli- and microseconds by 2010; Tabb Group estimate 56% of US equity trades by value in 2010; estimated US HFT profits about $5bn in 2009 falling to about $1.25bn in 2012 (Purdue estimate via Financial Times); microwave links are within 1% of the speed of light, fibre over 30% slower.
- Statistical arbitrage (https://en.wikipedia.org/wiki/Statistical_arbitrage): mean-reversion strategies across hundreds to thousands of securities held seconds to days; grew out of pairs trading at Morgan Stanley in the mid-1980s (Gerry Bamberger), per Bookstaber's *A Demon of Our Own Design*.
- Time-series momentum (Moskowitz, Ooi, Pedersen, Journal of Financial Economics, 2012): across 58 futures and forward markets, the past 12-month return of each market predicts its next return; the effect lasts about a year and then partly reverses. https://www.aqr.com/Insights/Research/Journal-Article/Time-Series-Momentum
- Intraday spreads: McInish and Wood, Journal of Finance 47(2), 1992, pp. 753–764: minute-by-minute NYSE spreads form a "crude reverse J-shaped pattern", widest at the open, narrower midday, wider again at the close. https://digitalcommons.memphis.edu/facpubs/11507
- Nasdaq Opening Cross: runs at 9:30 am ET; on-open orders execute at one opening price; order-imbalance information is published from 9:25 am. https://www.nasdaqtrader.com/Trader.aspx?id=OpenClose
- Margin (SEC, "Margin: Borrowing Money to Pay for Stocks", https://www.sec.gov/investor/pubs/margin.htm): Regulation T lets a customer borrow up to 50% of the purchase price; FINRA requires equity of at least 25% of the market value at all times, many brokers 30–40%; a broker can sell the securities without consulting the customer. Khandani and Lo: Regulation T capital for $100m long and $100m short is $100m ("2:1"); broker-dealers and funds financed by prime brokers can run 8:1.
- Thorp (https://en.wikipedia.org/wiki/Edward_O._Thorp): Princeton/Newport Partners 1969–1989 (market-neutral hedging of warrants and convertibles); Ridgeline Partners Aug 1994–Sep 2002 (statistical arbitrage); reported about 20% a year over 28.5 years on his own investments (May 1998). *Beat the Dealer* 1962; *Beat the Market* 1967 (with Sheen Kassouf); *A Man for All Markets* 2017.
- AQR Capital: assets peaked at $226bn (end 2017) and were $110bn in 2024 (Institutional Investor profile of Cliff Asness, 2024, via search summary https://institutionalinvestor.com/article/2dqsr456gmu55p19gxiio/corner-office/cliff-asness-has-steered-hedge-fund-aqr-through-not-one-not-two-but-three-quant-crises) `(secondary)`.
- Monthly factor returns `(computed from French files)`: March 2020: market −13.37, HML −13.83, Mom +8.20. November 2020: Mom −12.60. April 2009: Mom −34.36 (third-worst month since 1927; worst are Aug 1932 −52.61 and Jul 1932 −45.63). August 2007 (whole month): HML −1.89, Mom −0.02: the quant quake is invisible in monthly data. July 2026: Mom −12.21, RMW +11.07.
- Khandani–Lo Table 6 (average daily return of the contrarian strategy before costs; leverage needed to match 1998): 1998 0.57% / 2.00; 1999 0.44 / 2.57; 2000 0.44 / 2.56; 2001 0.31 / 3.63; 2002 0.45 / 2.52; 2003 0.21 / 5.53; 2004 0.37 / 3.04; 2005 0.26 / 4.40; 2006 0.15 / 7.76; 2007 0.13 / 8.96. Table 2: 1995 1.38, 1996 1.17, 1997 0.88.

## 13. Arithmetic done for the primer `(all computed; scripts not kept)`

- **Even-money bet, win probability p, $1 staked.** Expected gain per bet 2p − 1. p = 51%: 2 cents. Chance of being ahead after N bets (exact binomial to 10,000, normal approximation above): N=10 40.2% (behind 35.3%, level 24.6%); 100: 54.0% (behind 38.2%); 1,000: 72.6%; 10,000: 97.7%; 100,000: above 99.99% (expected +2,000, standard deviation 316). p = 50.75%: 10: 39.6%; 100: 52.0%; 1,000: 67.1%; 10,000: 93.2%; 100,000: above 99.99% (expected +1,500, sd 316, 4.7 sd); 1,000,000: expected +15,000, sd 1,000.
- **Diversification.** N equal bets, each volatility 10% and Sharpe 0.2. Uncorrelated: volatility 10/√N = 10, 5, 2.5, 1.0 for N = 1, 4, 16, 100; Sharpe 0.2, 0.4, 0.8, 2.0. Pairwise correlation 0.2: volatility 10×√(0.2 + 0.8/N) = 10, 6.32, 5.00, 4.56; Sharpe 0.20, 0.32, 0.40, 0.44; floor at N→∞: 4.47% and 0.45.
- **Fundamental law.** Skill 0.05 × √breadth: 4 bets 0.10; 25: 0.25; 100: 0.50; 400: 1.0; 2,500: 2.5; 10,000: 5.0.
- **Best of N random rules** (each rule's t-statistic is a standard normal draw). Chance that at least one has t > 2: N=1 2.3%; 10: 20.6%; 20: 36.9%; 45: 64.5%; 100: 90.0%; 1,000: about 100%. Expected best t: 10: 1.54; 45: 2.21; 100: 2.51; 1,000: 3.24; 10,000: 3.85. For 100 coin-flip rules over 250 trades at ±1R: expected best total +39.6R, a 57.9% win rate (simulation of 2,000 runs: mean +39.6R, 5th–95th percentile +30R to +52R). As five years of yearly Sharpe: 2.51/√5 = 1.12. Hurdle that keeps the chance of any false positive at 5% (Bonferroni, one-sided): N=10 2.58; 100 3.29; 1,000 3.89.
- **Trades needed** for t ≥ 2: n = (2 × s ÷ E)², where E = p×b − (1−p) is expectancy in R (b = average win ÷ average loss, loss = 1R) and s = √(p×b² + (1−p) − E²). b=1: p=55% 396; 60% 97. b=1.5: 45% 396; 50% 100; 55% 44; 60% 25. b=2: 35% 3,277; 40% 216; 45% 73; 50% 36; 55% 22. b=3: 30% 337; 35% 92; 40% 43; 45% 25. For t ≥ 3 multiply by 2.25 (e.g. 40% at 2:1: 486).
- **Fees on a 20% gross return.** 2 and 20: fee 2 + 20% × 18 = 5.6; investor keeps 14.4 (72%). Pass-through of 7% costs plus 20% of the rest: 7 + 2.6 = 9.6; investor keeps 10.4 (52%).
- **Leverage and a forced sale.** $100 of capital holding $500 of positions (5×). A 4% loss on positions = $20; capital $80, positions $480, leverage 6×. To return to 5× the fund must hold $400: it sells $80, 17% of the book. Khandani–Lo unlevered −6.85% × 4 = −27.4%; 10 Aug rebound 5.92% × 4 = 23.68%.
- **Pod loss limit.** $1,000m allocation, −5% = −$50m; capital halved to $500m; recovering $50m then needs +10% on the smaller book.
- **Spread as a cost in R** (illustration, not data): stop distance $0.25 = 1R; a round trip by market orders costs about one spread; $0.02 spread = 0.08R, $0.06 spread = 0.24R. A gross expectancy of +0.15R becomes +0.07R or −0.09R.

## 98. Source conflicts and the side taken

- Knight Capital loss: $440m (Knight's own first figure, 2 Aug 2012) against "more than $460 million" (SEC order, 16 Oct 2013). SEC figure used; both mentioned.
- Virtu losing days: 1 in 1,238 (S-1) against 1 in 1,278 (Wikipedia). S-1 used.
- LTCM rescue: $3.625bn (Federal Reserve History) against $3.65bn (Wikipedia lead). Fed figure used. LTCM 1994 return 20% (Fed) against 21% (Wikipedia): Fed used. Leverage "about 30 to 1 at end-1997" (Fed) against "over 25 to 1 at the start of 1998" (Wikipedia, $124.5bn on $4.7bn): both are the same date under different definitions; "25 to 30" used.
- Citadel assets: $67bn, $72bn and "over $77bn" for January 2026 in different reports. Given as "about $70–77bn". Millennium: $83.5bn (Jan 2026) and about $97bn (Sep 2026): both dated.
- Pass-through fees: investors kept 41 cents per dollar in 2023; the earlier year is 54 cents (Bloomberg 2024, Hedgeweek) against "46 cents kept by the funds" in a later Bloomberg graphic, which is the same number seen from the other side. No real conflict.
- Share of wholesaling held by the top two: 66% of wholesaler volume (SEC, Q1 2022, unnamed) against "over 70% of retail flow" (2024 paper, names Citadel Securities and Virtu). SEC figure used, the names attributed to the paper.
- S&P 500 in 2025: 16.4% (price change, as quoted by Business Insider) against 17.7% (SPY total return). Total return used in figures, stated.

## 99. Not verified / not found

- Mercer's "50.75%" remark: second-hand in Zuckerman's book; exact wording not checked against the book.
- Millennium's 5% and 7.5% loss limits: press reports citing the Wall Street Journal and unnamed sources; never confirmed by the firm; the 5% step was not seen in a primary report.
- Multi-strategy industry assets of $428bn (Goldman Sachs report via secondary summaries); gross leverage of 292.8% (Goldman prime book, Dec 2025, via Reuters summaries).
- 2022 returns of Citadel (about 38%), Millennium (about 12%) and Point72 (about 10%); Point72's 2023 and 2024 returns: from search summaries of press reports.
- Point72 assets $45.7bn: search summary of Business Insider.
- The names of the two largest wholesalers and the "over 70%" share: search summary of a conference paper.
- 2025 payment-for-order-flow totals: paywalled trade press, headline level only; not used in the post.
- AQR's assets ($226bn peak, $110bn in 2024): search summary of Institutional Investor.
- SG CTA Index: only 2015, 2022, 2023, 2024 and part of 2025 found, from press summaries; no full table.
- HFRI Equity Market Neutral index returns: NOT FOUND.
- Berkshire's Sharpe ratio of 0.76: from AQR's summary page; the exact period was not on the page.
- Hurst, Ooi and Pedersen's return figures for a century of trend following: not on the summary page; not used.
- Bailey, Borwein, López de Prado and Zhu, "Pseudo-Mathematics and Financial Charlatanism" (2014): could not be opened; the "45 trials in five years" result is not quoted. The arithmetic for 100 random rules was done here instead.
- Grinold's 1989 article was not opened; the formula is from the CFA Institute's reading.
- SEC–CFTC flash crash report: could not be downloaded; figures are from Wikipedia's account of it.
