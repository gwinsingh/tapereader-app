# Global macro primer: fact sheet

Checked 23 November 2026. Every number below has a URL. `(computed)` = arithmetic done here from the cited inputs.
`(not verified)` = could not be confirmed on a primary page in this research round. FRED series were read from the
CSV download of the series page cited (`https://fred.stlouisfed.org/graph/fredgraph.csv?id=<SERIES>`).

## 0. Sources that could not be fetched

- **CME Group** (cmegroup.com): every page timed out, and the browser pane was refused. Contract sizes and tick values
  below come from broker pages that restate the CME specification. Margins are broker-quoted. Treat margins as `(not verified against CME)`.
- **The Atlantic** (Mallaby excerpt on the sterling trade), **investor.gov**, **Japan Times**, **hfr.com press pages** (404), **slickcharts**: blocked or missing. Substitutes are named where used.
- **FRED ICE BofA high-yield spread** (BAMLH0A0HYM2): FRED now serves only about three years of history (first row returned: December 2023). Long history taken from Moody's Baa spread (BAA10Y) instead.

## 1. What global macro is; discretionary and systematic

- HFR publishes a Macro (Total) index with sub-indices including "Systematic Diversified" (rules-based, mostly trend following) and "Discretionary Thematic" (human judgement). Index names and returns: HFR Media Reference Guide, 8 Jan 2024. https://mondovisione.com/_assets/files/HFR-Media-Reference-Guide-2024.01.08.pdf
- Sub-index returns, % per calendar year, net of fees (same guide; 2008–2010 from HFR Media Reference Guide 16 May 2011, https://www.hse.ru/data/2011/10/27/1269589620/2011%2005%20HFR%20Report.pdf; 2025 from The Full FX citing HFR, 13 Jan 2026, https://thefullfx.com/macro-funds-end-2025-strongly-as-hedge-funds-thrive/):

| Year | Systematic Diversified | Discretionary Thematic |
|---|---|---|
| 2008 | +18.06 | not in guide |
| 2009 | −1.68 | not in guide |
| 2010 | +9.76 | not in guide |
| 2014 | +10.73 | −1.54 |
| 2018 | −6.62 | −0.92 |
| 2020 | +2.61 | +13.94 |
| 2021 | +6.43 | +2.99 |
| 2022 | +12.13 | +1.99 |
| 2023 | −4.16 | +3.38 |
| 2025 | −0.68 (est.) | +17.28 (est.) |

- Mallaby's *More Money Than God* (Penguin Press, 2010) has chapters on Soros (ch. 4), Paul Tudor Jones (ch. 6), the sterling trade with Soros and Druckenmiller (ch. 7 "White Wednesday"), the 1994 bond crisis (ch. 8) and LTCM (ch. 10). https://en.wikipedia.org/wiki/More_Money_Than_God
- Bridgewater as the standard example of rules-based ("systematic") macro: `(not verified on a primary page here; the Dalio profile covers it)`. Dalio's own explainer: https://www.economicprinciples.org/how-the-economic-machine-works

## 2. The four things macro traders trade

- **Currencies.** Global over-the-counter FX turnover averaged $9.6 trillion a day in April 2025, up 28% from $7.5 trillion in April 2022. The US dollar was on one side of 89.2% of trades. Spot $3.0tn, FX swaps $4.0tn, outright forwards $1.8tn a day. BIS Triennial Survey 2025. https://www.bis.org/statistics/rpfx25_fx.htm
- Yen per dollar, monthly average: 76.64 (Oct 2011, low of the series since 2011), 103.79 (Jan 2021), 147.05 (Oct 2022), 157.52 (Jul 2024), 162.33 (Jul 2026, high), 157.97 (Oct 2026). FRED EXJPUS. https://fred.stlouisfed.org/series/EXJPUS
- **Rates and bonds.** US 10-year Treasury yield, monthly average: 0.62% (Jul 2020), 1.47% (Dec 2021), 3.98% (Oct 2022), 3.62% (Dec 2022), 5.13% (Oct 2026). FRED GS10. https://fred.stlouisfed.org/series/GS10
- **Stock indexes.** S&P 500 closes: 3,386.15 (19 Feb 2020), 2,237.40 (23 Mar 2020), 4,796.56 (3 Jan 2022), 3,577.03 (12 Oct 2022), 6,910.39 (20 Nov 2026; 7,416.59 on 16 Nov 2026). FRED SP500. https://fred.stlouisfed.org/series/SP500
- **Commodities.** WTI crude oil, monthly average, $ per barrel: 133.88 (Jun 2008), 39.09 (Feb 2009), 16.55 (Apr 2020), 114.84 (Jun 2022), 57.97 (Dec 2025), 102.07 (Oct 2026). FRED MCOILWTICO. https://fred.stlouisfed.org/series/MCOILWTICO

- Derived from the figures above `(computed)`: the yen lost 29.4% of its dollar value between the January 2021 and October 2022 averages (103.79 / 147.05 − 1). The S&P 500 fall of 19 Feb to 23 Mar 2020 was −33.9% over 23 trading days.

## 3. Bonds and the yield curve

- Bond price arithmetic `(computed)`, 4% coupon paid twice a year, price per $100 face:

| Maturity | Yield 3% | Yield 4% | Yield 5% |
|---|---|---|---|
| 2 years | 101.93 | 100.00 | 98.12 |
| 10 years | 108.58 | 100.00 | 92.21 |
| 30 years | 119.69 | 100.00 | 84.55 |

- 10-year at par: Macaulay duration 8.34 years, modified duration 8.18 `(computed)`. A 1-point rise in yield cuts the price 7.8%; a 1-point fall lifts it 8.6%.
- Real case: 10-year Treasury bond total return −17.83% in 2022, −8.04% in 1994, −11.12% in 2009, +20.10% in 2008. Damodaran, NYU Stern, updated 5 Jan 2026. https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html
- **Inversions** (10-year minus 2-year Treasury yield below zero, daily, FRED T10Y2Y, series starts June 1976; https://fred.stlouisfed.org/series/T10Y2Y). Before 1976: 10-year minus 3-month Treasury bill, monthly averages, FRED GS10 and TB3MS (https://fred.stlouisfed.org/series/TB3MS). Recession dates: NBER (https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions). Lead times `(computed)`.

| Curve first inverted | Last inverted day/month | Deepest (points) | Next NBER recession | Lead to peak |
|---|---|---|---|---|
| Sep 1966 (10y−3m bill, monthly) | Jan 1967 | −0.34 (Oct 1966) | none | false signal |
| Jan 1969 (10y−3m bill, monthly; on and off to Jan 1970) | Jan 1970 | −0.29 (Aug 1969) | Dec 1969–Nov 1970 | about 11 months |
| Jun 1973 (10y−3m bill, monthly) | Sep 1974 | −1.27 (Aug 1973) | Nov 1973–Mar 1975 | about 5 months |
| 18 Aug 1978 (10y−2y) | Apr 1980 (monthly) | −2.41 (20 Mar 1980) | Jan 1980–Jul 1980 | about 17 months |
| Sep 1980 (10y−2y, monthly; daily data inverted on and off to 16 Jul 1982) | Oct 1981 (monthly) | −1.36 (May 1981, monthly) | Jul 1981–Nov 1982 | about 10 months |
| 13 Dec 1988 | 29 Mar 1990 | −0.45 (28 Mar 1989) | Jul 1990–Mar 1991 | about 19 months |
| 26 May 1998 (27 trading days) | 27 Jul 1998 | −0.07 (25 Jun 1998) | none | false signal |
| 2 Feb 2000 | 28 Dec 2000 | −0.52 (7 Apr 2000) | Mar 2001–Nov 2001 | about 13 months |
| 27 Dec 2005 | 5 Jun 2007 | −0.19 (15 Nov 2006) | Dec 2007–Jun 2009 | about 24 months |
| 27 Aug 2019 (3 days only; 10y−3m was inverted on 117 days between 22 Mar 2019 and 2 Mar 2020) | 29 Aug 2019 | −0.04 | Feb 2020–Apr 2020 (pandemic) | about 6 months |
| 1 Apr 2022 (2 days), then continuously from 6 Jul 2022 | 5 Sep 2024 | −1.08 (3 Jul 2023) | none dated by NBER as of Nov 2026 | open |

- 10-year minus 3-month (FRED T10Y3M, https://fred.stlouisfed.org/series/T10Y3M): first negative 18 Oct 2022, deepest −1.89 points on 4 May 2023, monthly average negative Nov 2022 to Nov 2024, last negative day 16 Oct 2025.
- Latest: 10y−2y +0.29 points, 10y−3m +0.55 points (23 Nov 2026). Same FRED series.
- NBER's latest dated peak is February 2020 and latest trough April 2020; no later recession is listed (page read 23 Nov 2026).

## 4. The Federal Reserve

- Federal funds target, selected changes. Before Dec 2008 a single target (FRED DFEDTAR, https://fred.stlouisfed.org/series/DFEDTAR); after, a range (Federal Reserve, https://www.federalreserve.gov/monetarypolicy/openmarket.htm; FRED DFEDTARU/DFEDTARL). Dates are effective dates as listed.

| Date | Level | Note |
|---|---|---|
| 29 Jun 2006 | 5.25% | top of 2004–06 hiking cycle |
| 18 Sep 2007 | 4.75% | first cut |
| 16 Dec 2008 | 0–0.25% | zero for seven years |
| 16–17 Dec 2015 | 0.25–0.50% | first hike after zero |
| 20 Dec 2018 | 2.25–2.50% | top of that cycle |
| 31 Oct 2019 | 1.50–1.75% | after three cuts in 2019 |
| 16 Mar 2020 | 0–0.25% | announced Sunday 15 Mar 2020 |
| 17 Mar 2022 | 0.25–0.50% | first hike |
| 15 Dec 2022 | 4.25–4.50% | +4.25 points in 2022 (seven hikes) |
| 27 Jul 2023 | 5.25–5.50% | top; 11 hikes in 16 months |
| 19 Sep 2024 | 4.75–5.00% | first cut (−0.50) |
| 19 Dec 2024 | 4.25–4.50% | |
| 11 Dec 2025 | 3.50–3.75% | after three cuts in 2025 (18 Sep, 30 Oct, 11 Dec) |
| 17 Sep 2026 | 3.75–4.00% | hike of 0.25; latest level on 23 Nov 2026 |

- 16 Sep 2026 statement: raised by 1/4 point to 3-3/4 to 4 percent, vote 12–0, says inflation "remains elevated". https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm
- Monthly average effective federal funds rate peaked at 19.10% in June 1981. FRED FEDFUNDS. https://fred.stlouisfed.org/series/FEDFUNDS
- **Balance sheet** (total assets, Wednesday levels, FRED WALCL, https://fred.stlouisfed.org/series/WALCL):

| Date | Total assets | Note |
|---|---|---|
| 10 Sep 2008 | $0.926tn | week before Lehman |
| 31 Dec 2008 | $2.239tn | 2.4 times in 16 weeks (computed) |
| 31 Dec 2014 | $4.498tn | after three rounds of QE; cycle high $4.516tn on 14 Jan 2015 |
| 28 Aug 2019 | $3.760tn | low after first run-off |
| 26 Feb 2020 | $4.159tn | before the pandemic |
| 10 Jun 2020 | $7.169tn | +$3.0tn in 15 weeks (computed) |
| 13 Apr 2022 | $8.965tn | all-time peak |
| 3 Dec 2025 | $6.536tn | low after run-off; −$2.43tn from peak (computed) |
| 18 Nov 2026 | $6.741tn | latest; +$0.21tn from the low (computed) |

- QE1: Nov 2008 up to $500bn agency MBS and $100bn agency debt; Mar 2009 $300bn longer-term Treasuries; total about $1.75tn. QE2: $600bn Treasuries, 2010–11. Federal Reserve History. https://www.federalreservehistory.org/essays/great-recession-of-200709
- 15 Mar 2020: target cut to 0–0.25%; at least $500bn Treasuries and $200bn agency MBS to be bought. https://www.federalreserve.gov/newsevents/pressreleases/monetary20200315a.htm
- Run-off (quantitative tightening) from 1 Jun 2022: caps $30bn Treasuries and $17.5bn MBS a month, doubling after three months to $60bn and $35bn. https://www.federalreserve.gov/newsevents/pressreleases/monetary20220504b.htm
- 29 Oct 2025: Committee to conclude the reduction of its securities holdings on 1 December 2025. https://www.federalreserve.gov/newsevents/pressreleases/monetary20251029a.htm
- 10 Dec 2025: reserves judged to have fallen to ample levels; purchases of shorter-term Treasuries to begin as needed. https://www.federalreserve.gov/newsevents/pressreleases/monetary20251210a.htm

## 5. Business cycle and debt cycle

- NBER recessions since 1970 (peak → trough, months): Dec 1969–Nov 1970 (11); Nov 1973–Mar 1975 (16); Jan 1980–Jul 1980 (6); Jul 1981–Nov 1982 (16); Jul 1990–Mar 1991 (8); Mar 2001–Nov 2001 (8); Dec 2007–Jun 2009 (18); Feb 2020–Apr 2020 (2). https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions
- 2007–09: real GDP −4.3% peak to trough; unemployment 5% (Dec 2007) to a 10% peak (Oct 2009); S&P 500 −57% from Oct 2007 peak to Mar 2009 trough; home prices about −30% mid-2006 to mid-2009; household net worth about $69tn (2007) to $55tn (2009). https://www.federalreservehistory.org/essays/great-recession-of-200709
- Dalio's "How the Economic Machine Works": video and paper on credit, interest rates, leveraging and deleveraging. https://www.economicprinciples.org/how-the-economic-machine-works . Cycle lengths often quoted from it (short-term debt cycle 5–8 years, long-term 75–100 years): `(not verified; page text does not state them, the video does)`.
- Credit spread, Moody's Baa yield minus 10-year Treasury (FRED BAA10Y, https://fred.stlouisfed.org/series/BAA10Y): 6.16 points on 4 Dec 2008 (series high since 1986); 4.31 on 23 Mar 2020; 2.42 high of 2022 (1 Jul); 1.61 on 20 Nov 2026.

## 6. Currencies: Black Wednesday and the yen carry trade

**Sterling, 1992**
- UK joined the ERM on 8 Oct 1990 at a central rate of DM 2.95, band ±6%. Secondary: https://en.wikipedia.org/wiki/Black_Wednesday . Floor ("absolute ERM limit") DM 2.7780: Bank of England Quarterly Bulletin, Nov 1992. https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/1992/operation-of-monetary-policy-qb-1992-q4.pdf (Wikipedia gives DM 2.773; the Bank's figure is the primary record.)
- 14 Sep 1992: lira devalued; Bundesbank cut its discount rate to 8.25% and Lombard rate to 9.5%, less than hoped. Same BoE bulletin.
- 15 Sep evening: reports of remarks by Bundesbank president Schlesinger that a wider realignment would have been better; sterling closed at DM 2.7812. Same BoE bulletin; Naef (below).
- 16 Sep 1992 (BoE bulletin): by 8:00 am sterling at DM 2.7794; 11:00 am Minimum Lending Rate set at 12% (from 10%); 2:15 pm rise to 15% announced, effective the next day; sterling still at its floor at the close; "just after 7.30 pm" the Chancellor announced suspension from the ERM and rescinded the 15%; 9:30 am on 17 Sep the rate went back to 10%; cut to 9% on 22 Sep. No bank base rate was ever raised to 15%.
- After: closed 18 Sep at DM 2.6100 (6% below the floor) and $1.7435; new low DM 2.5005 on 30 Sep 1992 (10% below the floor, 15% below DM 2.95, computed). Same BoE bulletin.
- Dollars per pound, noon New York (FRED DEXUSUK, https://fred.stlouisfed.org/series/DEXUSUK): 2.0035 (2 Sep 1992), 1.8715 (15 Sep), 1.8110 (16 Sep), 1.7370 (18 Sep), 1.5130 (31 Dec 1992), 1.4175 (12 Feb 1993, low). −29% from 2 Sep to the low; −19% from 15 Sep to year-end (computed).
- Reserves: the Bank sold over $22bn of reserves in a few hours; net loss about $4.91bn (citing Harold James); over £1bn spent by 9 am; daily global FX turnover then $880bn. Alain Naef, *An Exchange Rate History of the United Kingdom 1945–1992*, ch. 14, Cambridge University Press. https://doi.org/10.1017/9781108878333.015
- UK Treasury "best estimate" of the cost: £3.3bn ($4.9bn), papers released under Freedom of Information, reported 9 Feb 2005. https://www.centralbanking.com/node/1423239 . An earlier 1997 estimate of £3.14bn appears on Wikipedia with a weak citation `(not verified)`.
- Soros: contemporaneous report, *Forbes*, Nov 1992 (Jaffe and Machan): about $7bn short sterling, about $6bn long marks, about $1bn of collateral, about $1.5bn made in September 1992 across his funds; Quantum net asset value +31% late Aug to early Oct. Repost: https://stuff.mit.edu/afs/net/user/tytso/usenet/americast/forbes/51
- The usual "$1bn" and "$10bn position" figures: the $10bn is Soros's own later description of the total position (quoted in secondary accounts); Mallaby's book is the standard narrative and names Druckenmiller as the manager who built the trade. Secondary: https://en.wikipedia.org/wiki/More_Money_Than_God ; https://www.npr.org/2024/12/04/1216966368/george-soros-british-pound-bessent-johnson-druckenmiller `(page timed out; title from search result)`. Record grade for the $1bn: B/C (press and the fund's own account, no audited statement).

**Yen carry trade, August 2024**
- BoJ raised its overnight call rate target to "around 0.25 percent" on 31 Jul 2024, 7–2 vote. https://www.boj.or.jp/en/mopo/mpmdeci/mpr_2024/k240731a.pdf
- US effective federal funds rate July 2024: 5.33%. FRED FEDFUNDS.
- Yen per dollar (FRED DEXJPUS, https://fred.stlouisfed.org/series/DEXJPUS): 161.73 (10 Jul 2024), 153.72 (30 Jul), 150.38 (31 Jul), 146.98 (2 Aug), 143.95 (5 Aug), 147.42 (7 Aug). Dollar −11.0% against the yen from 10 Jul to 5 Aug (computed).
- 2 Aug 2024: weak US jobs report; 2-year Treasury yield −26 basis points. 5 Aug: TOPIX double-digit loss; VIX above 60 before the US open, closed under 40; markets recovered within about a week. BIS Quarterly Review, Sep 2024. https://www.bis.org/publ/qtrpdf/r_qt2409a.htm
- Nikkei 225 −12.4% on 5 Aug 2024, worst since October 1987; +3,217.04 points to 34,675.46 on 6 Aug (about +10.2%, computed). AP via Fortune. https://fortune.com/asia/2024/08/06/japan-nikkei-index-recovers-from-worst-plunge-since-1987
- VIX close 16.36 (31 Jul), 38.57 (5 Aug), 15.23 (15 Aug). S&P 500 5,522.30 (31 Jul), 5,186.33 (5 Aug, −6.1%), 5,543.22 (15 Aug). FRED VIXCLS, SP500. https://fred.stlouisfed.org/series/VIXCLS
- Size: BIS "rough middle" estimate of yen carry trades ¥40 trillion ($250bn), probably too low. BIS Bulletin 90, 27 Aug 2024. https://www.bis.org/publ/bisbull90.htm

## 7. Leverage and futures

- E-mini S&P 500 (ES): $50 × index; tick 0.25 point = $12.50; trades Sunday 6 pm to Friday 5 pm ET with a daily one-hour break; initial/overnight margin $28,628.75 per contract as of 16 Sep 2026 (broker-quoted). https://tradezero.com/en-us/support/questions/what-are-the-contract-specifications-for-the-e-mini-s-and-p-500-tradezero-america . Barchart showed $24,984 initial / $22,713 maintenance for the Sep 2026 contract (search snippet, https://www.barchart.com/quotes/ESH26) `(not verified against CME)`. Official page: https://www.cmegroup.com/markets/equities/sp/e-mini-sandp500.contractSpecs.html
- Worked example `(computed)`: index 6,910.39 (20 Nov 2026) × $50 = $345,520 notional. Margin $28,629 = 8.3% of notional, leverage 12.1 times. A 1% index move = $3,455 = 12.1% of the margin. The 6.8% fall from 7,416.59 (16 Nov) to 6,910.39 (20 Nov 2026) = $25,310 per contract, 88% of that margin.
- 10-Year T-Note futures (ZN): face value $100,000; tick half of 1/32 point = $15.625; deliverable notes 6½ to 10 years remaining; broker-quoted initial margin about $2,300–$3,000, undated. https://help.metrotrade.com/kb/10-year-u.s.-treasury-note-futures-zn-contract-specifications `(not verified against CME)`. Official page: https://www.cmegroup.com/markets/interest-rates/us-treasury/10-year-us-treasury-note.contractSpecs.html
- LTCM leverage about $30 of debt per $1 of capital at end-1997. https://www.federalreservehistory.org/essays/ltcm-near-failure
- Multi-strategy hedge funds: leverage about 4:1 on traditional measures, 14:1 including derivatives. BIS Quarterly Review Sep 2024, Box C. https://www.bis.org/publ/qtrpdf/r_qt2409a.htm

## 8. How a macro fund is built

- SEC investor bulletin: hedge funds generally open only to accredited investors; typical fees 1–2% of assets a year plus 20% of profit; redemptions limited (monthly, quarterly, annually), lock-up often one year or more; leverage magnifies gains and losses. https://www.sec.gov/files/ib_hedgefunds.pdf
- Fee example `(computed)`: $1,000,000, 10% gross a year for 10 years, 2% of assets charged on the opening balance each year and 20% of the profit after that fee, no losing year. Gross end value $2,593,742. Net $1,859,586 (6.40% a year). Fees paid $483,517; total gap to the gross result $734,156 (fees plus the growth those fees would have earned). An index fund at 0.05% a year earning the same 10% would end at $2,580,803.
- Drawdown rules: some multi-manager hedge funds state upfront the drawdown at which a portfolio manager is fired; with a Sharpe ratio of 0.5 and 10% volatility, the chance of a −20% or worse drawdown over 10 years is 43%. Harvey, Sanchez Martin, Yawitch, Van Hemert (Man Group), "You're Fired!". https://www.man.com/insights/youre-fired . Specific thresholds at named firms (5%, 7.5%): `(not verified)`, not used.
- Recovery arithmetic `(computed)`: −10% needs +11.1%; −20% needs +25%; −50% needs +100%.
- High-water mark (performance fee charged only above the previous peak) and prime broker (the bank that lends to the fund, holds its assets and settles its trades): standard industry terms, used as definitions only; `(not verified on a primary page here)`.
- Federal funds target, upper limit, at each year-end (FRED DFEDTAR to 2007, DFEDTARU from 2008): 2006 5.25; 2007 4.25; 2008–2014 0.25; 2015 0.50; 2016 0.75; 2017 1.50; 2018 2.50; 2019 1.75; 2020 0.25; 2021 0.25; 2022 4.50; 2023 5.50; 2024 4.50; 2025 3.75; 23 Nov 2026 4.00.
- NBER recessions since 1970 total 85 months (computed).

## 9. History

- **Bretton Woods.** July 1944, 44 nations; currencies fixed but adjustable to the dollar within 1%; dollar fixed to gold at $35 an ounce. https://www.federalreservehistory.org/essays/bretton-woods-created
- 15 Aug 1971: Nixon closed the gold window; 10% import surcharge; 90-day wage and price freeze. https://www.federalreservehistory.org/essays/gold-convertibility-ends
- Dec 1971 Smithsonian Agreement: dollar devalued about 8.5% to $38 an ounce; 12 Feb 1973 a further 10% to $42; within a month nearly all major currencies floated. https://www.federalreservehistory.org/essays/smithsonian-agreement
- **Plaza.** 22 Sep 1985, Plaza Hotel, New York, G-5. Dollar had risen 44% against major currencies in the five years to its Feb 1985 peak; fell 4% on the day the statement was published; fell 40% over 1985–87. Frankel, NBER Working Paper 21813. https://www.nber.org/papers/w21813
- Yen per dollar 236.53 (Sep 1985 average) to 153.41 (Feb 1987): −35%. Marks per dollar 2.8381 to 1.8239: −36% (computed). FRED EXJPUS, EXGEUS. https://fred.stlouisfed.org/series/EXGEUS
- **1987.** 19 Oct 1987: Dow −22.6% (508 points). 20 Oct: Fed statement of readiness to supply liquidity. Dow regained 288 points (57% of the fall) in two sessions; pre-crash highs passed in under two years. https://www.federalreservehistory.org/essays/stock-market-crash-of-1987 . S&P 500 total return for 1987: +5.81% (Damodaran).
- **1994.** Fed funds target 3.00% to 6.00% in seven steps, 4 Feb 1994 to 1 Feb 1995 (FRED DFEDTAR). 10-year yield 5.75% (Jan 1994 average) to 7.96% (Nov 1994) (FRED GS10). 10-year Treasury total return −8.04%; S&P 500 +1.33% (Damodaran). Bloomberg Aggregate −2.9% in 1994 (Carlson, below).
- **1997–98.** Thailand devalued on 2 Jul 1997; $118bn of international loans arranged for Thailand, Indonesia and South Korea. https://www.federalreservehistory.org/essays/asian-financial-crisis . LTCM lost 44% in August 1998 after Russia devalued and stopped paying its debt; 23 Sep 1998 fourteen firms put in $3.6bn. https://www.federalreservehistory.org/essays/ltcm-near-failure . Fed cut 5.50% to 4.75% in three steps, 29 Sep, 15 Oct, 17 Nov 1998 (FRED DFEDTAR). VIX closing high 45.74 on 8 Oct 1998 (FRED VIXCLS).
- **2008.** S&P 500 total return −36.55% (Damodaran; −36.99% in HFR's table). 10-year Treasury +20.10%. VIX closing high 80.86 on 20 Nov 2008. HFRI Macro +4.83%, HFRI Macro Systematic Diversified +18.06%, HFRI Fund Weighted Composite −19.03% (HFR guides above).
- **2020.** S&P 500 −33.9% from 19 Feb to 23 Mar 2020 (computed from FRED SP500). VIX record close 82.69 on 16 Mar 2020. 10-year yield 0.62% (Jul 2020 average). Full year: S&P +18.02% (Damodaran), HFRI Macro +5.38%.
- **2022.** S&P 500 −18.04%, 10-year Treasury −17.83%, Baa corporate bonds −15.23% (Damodaran). 60% S&P / 40% 10-year Treasuries: −17.96% (computed), third worst since 1928 after 1931 (−27.33%) and 1937 (−20.65%); 2008 was −13.89%. Both fell in the same year only in 1931, 1941, 1969, 2018 (bonds −0.02%) and 2022 (computed from Damodaran). Bloomberg US Aggregate −13%, worst year since the index began in 1976; a 60/40 with that index was down more than 16%. Ben Carlson, 2 Jan 2023. https://awealthofcommonsense.com/2023/01/2022-was-one-of-the-worst-years-ever-for-markets/ . S&P 500 −25.4% from 3 Jan to 12 Oct 2022 (computed). HFRI Macro +8.98% (first reported +9.3%, https://www.hfr.com/?p=20650).

## 10. Performance of the style

HFRI Macro (Total) Index, net of fees, equal-weighted, % per calendar year; S&P 500 with dividends from Damodaran.

| Year | HFRI Macro | S&P 500 | Source for HFRI |
|---|---|---|---|
| 2004 | 4.63 | 10.74 | HFR guide May 2011 |
| 2005 | 6.79 | 4.83 | same |
| 2006 | 8.15 | 15.61 | same |
| 2007 | 11.11 | 5.48 | same |
| 2008 | 4.83 | −36.55 | same |
| 2009 | 4.34 | 25.94 | same |
| 2010 | 8.06 | 14.82 | same |
| 2011 | −3.6 (first estimate) | 2.10 | Hedgeweek, 10 Jan 2012, https://www.hedgeweek.com/hedge-funds-conclude-challenging-2011-position-2012/ |
| 2012 | −0.2 (first estimate) | 15.89 | Opalesque, 8 Jan 2013, https://www.opalesque.com/industry-updates/3059/hedge-funds-post-december-gains-as-fiscal-cliff.html |
| 2013 | −0.44 | 32.15 | HFR guide Jan 2024 |
| 2014 | 5.58 | 13.52 | same |
| 2015 | −1.26 | 1.38 | same |
| 2016 | 1.03 | 11.77 | same |
| 2017 | 2.20 | 21.61 | same |
| 2018 | −4.08 | −4.23 | same |
| 2019 | 6.50 | 31.21 | same |
| 2020 | 5.38 | 18.02 | same |
| 2021 | 7.72 | 28.47 | same (7.60 in the Jan 2022 guide) |
| 2022 | 8.98 | −18.04 | same (asset-weighted version 8.60) |
| 2023 | −0.56 (December estimated) | 26.06 | same |
| 2024 | 5.95 (first estimate; later HFR release 5.65) | 24.88 | https://thefullfx.com/hedge-funds-end-2024-on-a-mixed-note-hfr/ |
| 2025 | 7.16 (first estimate) | 17.78 | https://thefullfx.com/macro-funds-end-2025-strongly-as-hedge-funds-thrive/ |

- 2011 and 2012: HFR's later restated figures (about −4.2% and −0.1%) `(not verified)`.
- Compounded `(computed)`: 2010–2019 HFRI Macro +1.30% a year against S&P 500 +13.44% a year. 2020–2025: +5.73% against +14.93%. 2008–2025: +3.12% against +10.96%.
- HFRI Macro 10-year annualised to 31 Mar 2026: 4.19%; 5-year 5.75%; net of fees. UBS hedge fund bulletin, March 2026. https://www.ubs.com/ch/en/assetmanagement/insights/asset-class-perspectives/hedge-funds/articles/uga-hf-bulletin-march-2026.html
- HFRI Fund Weighted Composite: −19.03% (2008), −4.14% (2022), +12.64% (2025, first estimate). HFR guide Jan 2024; The Full FX.
- Bias: backfilled hedge fund returns were over 5 points a year higher than returns reported as they happened; survivorship bias averaged 3.74 points a year, 1996–2003 (TASS database). Malkiel and Saha, *Financial Analysts Journal* 61(6), 2005. https://ideas.repec.org/a/taf/ufajxx/v61y2005i6p80-88.html ; working paper https://gceps.princeton.edu/wp-content/uploads/2017/01/104malkiel.pdf

## 11. Why macro got harder, then easier

- Federal funds target at 0–0.25% from 16 Dec 2008 to 16 Dec 2015 (FRED DFEDTARU).
- VIX yearly average (FRED VIXCLS, computed): 2008 32.7; 2009 31.5; 2010 22.5; 2011 24.2; 2012 17.8; 2013 14.2; 2014 14.2; 2015 16.7; 2016 15.8; 2017 11.1 (lowest since the series began in 1990); 2018 16.6; 2019 15.4; 2020 29.3; 2021 19.7; 2022 25.6; 2023 16.8; 2024 15.6; 2025 18.9.
- A macro manager's own account: macro returned 11% in 2007 and 5% in 2008, "more muted" after the crisis, 9% in 2022 against −17% for a 60/40 portfolio; argues returns are linked to central-bank activity and policy divergence. Graham Capital Management, Jan 2025. https://www.grahamcapital.com/blog/macro-across-monetary-regimes/ (a manager's marketing paper; treat as an interested party).

## 12. Free public signals, latest readings

- 10y−2y +0.29 points (23 Nov 2026); federal funds 3.75–4.00% after a hike on 17 Sep 2026; 10-year yield 5.13% (Oct 2026 average).
- Broad dollar index 123.60 (20 Nov 2026), 121.57 (15 Oct 2026). FRED DTWEXBGS. https://fred.stlouisfed.org/series/DTWEXBGS
- High-yield spread 3.76 points (20 Nov 2026), 3.14 (28 Oct 2026). FRED BAMLH0A0HYM2. https://fred.stlouisfed.org/series/BAMLH0A0HYM2 . Baa spread 1.61 (20 Nov 2026).
- VIX 35.89 (20 Nov 2026, 2026 closing high so far), 22.91 (16 Nov 2026); 2025 high 52.33 (8 Apr 2025).

## 13. Reading list (URLs checked)

- Schwager, *Market Wizards* (1989), *The New Market Wizards* (1992), *Hedge Fund Market Wizards* (2012), Wiley editions. https://en.wikipedia.org/wiki/Market_Wizards . Which book interviews which macro trader: `(not verified here)`.
- Mallaby, *More Money Than God* (Penguin Press, 2010). https://en.wikipedia.org/wiki/More_Money_Than_God
- Drobny, *Inside the House of Money* (Wiley, 2006; 2nd ed. March 2014), interviews with global macro managers. https://www.wiley-vch.de/en/areas-interest/finance-economics-law/inside-the-house-of-money-978-1-118-84328-4
- Dalio, "How the Economic Machine Works". https://www.economicprinciples.org/how-the-economic-machine-works
- Soros, *The Alchemy of Finance* (1987). https://en.wikipedia.org/wiki/The_Alchemy_of_Finance (redirects to the Soros article). Publisher and the real-time diary: `(not verified here)`.
- Free primary sources: FRED, NBER, Federal Reserve History, FOMC statements, BoE Quarterly Bulletin Nov 1992, BIS Bulletin 90 (all URLs above).

## Five least certain numbers

1. E-mini S&P 500 and 10-year note futures margins (broker-quoted, CME not reachable).
2. HFRI Macro 2011 (−3.6%) and 2012 (−0.2%): first estimates; HFR later restated them.
3. Quantum's profit on sterling: "$1bn" is press and self-reported; Forbes at the time gave about $1.5bn for all positions in September 1992.
4. HFRI Macro 2024 (5.95% first estimate against 5.65% in a later HFR release) and 2025 (7.16%, first estimate).
5. The 60/40 loss for 2022: −17.96% with 10-year Treasuries (computed), "more than 16%" with the aggregate bond index; other published figures range from −16.1% to −18%.
