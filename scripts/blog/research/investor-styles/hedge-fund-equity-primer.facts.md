# Hedge funds, concentrated bets and short selling primer: fact sheet

Checked 24 November 2026. Every number below has a URL. `(computed)` = arithmetic done here from the cited inputs.
`(not verified)` = could not be confirmed on a primary or reliable page in this research round. Section 99 lists them all.

## 1. Disclosure rules

- **Schedule 13D** (SEC press release 2023-219, 10 Oct 2023, https://www.sec.gov/newsroom/press-releases/2023-219): initial filing deadline shortened from 10 days to **five business days** after crossing 5%; amendments within **two business days** of a material change. Rules effective 90 days after Federal Register publication (5 Feb 2024); revised 13G deadlines complied with from 30 Sept 2024; structured data from 18 Dec 2024.
- **Form 13F** (SEC staff FAQ, https://www.sec.gov/rules-regulations/staff-guidance/division-investment-management-frequently-asked-questions/frequently-asked-questions-about-form-13f):
  - Q2: managers who "exercise investment discretion over $100 million or more in Section 13(f) securities" must file.
  - Q25: due within 45 days after the end of each calendar quarter.
  - Q7: Section 13(f) securities = the SEC's Official List: mainly US exchange-traded shares, closed-end funds, ETFs, some options and convertibles.
  - Q41: short positions are not reported and are not subtracted from long positions.
  - Q40: shares of a foreign issuer are reported only if they trade on a US exchange.
  - Q43/Q44: options held (bought) on listed securities are reported under the CUSIP of the underlying share; written options are not reported.
  - Cash, bonds, swaps and other non-13(f) holdings are simply not on the list (the FAQ does not mention them because they are out of scope).

## 2. Buffett's ten-year bet (Berkshire Hathaway 2017 letter, pp. 11–12, https://www.berkshirehathaway.com/letters/2017ltr.pdf)

- Bet made 19 Dec 2007 with Protégé Partners; Buffett's outlay $318,250; proceeds to Girls Inc. of Omaha. Vanguard S&P 500 index fund against five funds of funds that held interests in more than 200 hedge funds. Period 2008–2017.
- Final gain / average annual gain: Fund A 21.7% / 2.0%; B 42.3% / 3.6%; C 87.7% / 6.5%; D 2.8% / 0.3% (liquidated 2017, nine years); E 27.0% / 2.4%; **S&P index fund 125.8% / 8.5%**.
- 2008: funds −16.5, −22.3, −21.3, −29.3, −30.1; index fund −37.0. In each of the nine following years the funds of funds as a group trailed the index fund.
- Buffett: fixed fees averaged about 2.5% of assets a year across the two layers.
- Simple average of the five funds' average annual gains: (2.0+3.6+6.5+0.3+2.4)/5 = 2.96% `(computed)`.

## 3. GameStop, January 2021 (SEC staff report, 14 Oct 2021, https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf)

- Short interest as a percent of float reached **122.97%** in January 2021; as a percent of shares outstanding the high was 109.26% on 31 Dec 2020.
- How it exceeds 100%: the same shares are lent more than once. A buyer of a share sold short can lend it again; each loan counts.
- Close $19.95 on 12 Jan 2021 → closing high **$347.51** on 27 Jan (more than 1,600% above the 11 Jan close) → intraday high **$483.00** on 28 Jan. Average ~100 million shares a day traded 13–29 Jan.
- Staff conclusion: short sellers' buying was a small share of total buying; "a short squeeze did not appear to be the main driver"; no evidence of a gamma squeeze. Positive sentiment sustained the rise.
- Typical short interest: for large stocks under a few percent; few stocks above 50% on any date.

## 4. Regulation SHO (SEC, Key Points About Regulation SHO, https://www.sec.gov/investor/pubs/regsho.htm)

- Locate (Rule 203(b)(1)): broker must have reasonable grounds to believe the share can be borrowed, documented before the short sale.
- Close-out (Rule 204): fails on short sales closed out by the start of trading on the settlement day after settlement date.
- Rule 201: triggered when a share falls **10% or more in one day** from the prior close; restriction applies for the rest of that day and the next day. (Permitted price: above the national best bid; see SEC Rule 201 FAQ.)
- Naked shorting = selling short without borrowing in time to deliver; not always illegal, but may break the locate and close-out rules.

## 5. Diversification arithmetic

- Elton and Gruber (1977), "Risk Reduction and Portfolio Size", Journal of Business 50, table reproduced at https://en.wikipedia.org/wiki/Diversification_(finance): average standard deviation of annual returns of random equal-weighted portfolios: 1 stock 49.24%; 2: 37.36; 4: 29.69; 6: 26.64; 8: 24.98; 10: 23.93; 20: 21.68; 30: 20.87; 40: 20.46; 50: 20.20; 400: 19.29; 500: 19.27; 1,000: 19.21.
- Share of diversifiable risk removed `(computed: (49.24 − sd_N) / (49.24 − 19.21))`: 10 stocks 84.3%; 20 stocks 91.8%; 30 stocks 94.5%; 50 stocks 96.7%.

## 6. Copying filings and forecasters

- totalrealreturns.com (https://totalrealreturns.com/n/SPY,VBINX,GVIP,GURU), common period 3 Nov 2016 – 23 Nov 2026: SPY +14.93%/yr ($10,000 → $40,511); GVIP (Goldman Sachs Hedge Industry VIP ETF, the shares that appear most often among hedge funds' top ten 13F holdings) +14.68%/yr ($39,633); GURU (Global X Guru Index ETF, built from 13F filings) +11.30%/yr ($29,351); VBINX (Vanguard Balanced Index, 60% US shares / 40% US bonds) +9.28%/yr ($24,395).
- Calendar years, SPY / VBINX / GVIP / GURU: 2017 21.71/13.75/25.79/24.26; 2018 −4.57/−2.98/−6.85/−6.57; 2019 31.22/21.67/30.21/30.99; 2020 18.33/16.26/44.12/25.27; 2021 28.73/14.08/11.86/8.19; 2022 −18.18/−16.98/−31.95/−27.94; 2023 26.18/17.41/39.15/19.29; 2024 24.89/14.45/29.82/23.76; 2025 17.72/13.47/25.27/25.44; 2026 to 23 Nov 6.75/4.04/−3.08/−0.70.
- SPY and VBINX by year 2005–2016: SPY 4.83, 15.85, 5.15, −36.79, 26.35, 15.06, 1.89, 15.99, 32.31, 13.46, 1.23, 12.00; VBINX 4.65, 11.03, 6.17, −22.21, 20.09, 13.13, 4.14, 11.33, 17.96, 9.81, 0.36, 8.64.
- CXO Advisory, Guru Grades (https://www.cxoadvisory.com/gurus/): 68 forecasters, 6,582 US stock market forecasts collected 2005–2012 (oldest from late 1998); accuracy over all forecasts 46.9%, average by guru 47.4%. Best David Nassar 68.2% (44 forecasts); worst Robert Prechter 20.8% (24). Bearish names: Marc Faber 44.6% (164), Jeremy Grantham 44.2% (40), Bill Fleckenstein 37.3% (148).

## 7. HFRI indices, ten years to Dec 2025 (UBS hedge fund bulletin Dec 2025, https://www.ubs.com/global/en/assetmanagement/insights/asset-class-perspectives/hedge-funds/articles/uga-hf-bulletin-dec-2025.html)

| Index | 2025 | 3y ann. | 5y ann. | 10y ann. | 10y vol |
|---|---|---|---|---|---|
| HFRI Fund of Funds Composite | 10.52 | 8.57 | 5.10 | 4.82 | 4.95 |
| HFRI Equity Hedge (Total) | 17.34 | 13.49 | 7.95 | 8.11 | 8.72 |
| HFRI Event-Driven (Total) | 11.00 | 10.39 | 7.57 | 7.02 | 7.03 |
| MSCI World (net, USD) | 21.09 | 21.17 | 12.15 | 12.17 | 14.71 |
| 3-month T-bills | 4.18 | 4.81 | 3.17 | 2.18 | 0.56 |

## 8. Lazard, Annual Review of Shareholder Activism 2025 (5 Jan 2026, https://www.lazard.com/research-insights/annual-review-of-shareholder-activism-2025/)

- 297 campaigns worldwide in 2025, a third record year in a row. North America 173 (135 in 2024, +28%). Japan 56 new campaigns (record). Europe −19%.
- Objectives: board change 37% of campaigns; M&A 35% (five-year average 29%); capital allocation 31%.

- H1 2026 review (1 Jul 2026, https://www.lazard.com/research-insights/review-of-shareholder-activism-h1-2026/): 184 new campaigns worldwide, +20% on H1 2025 and 38% above the five-year H1 average. North America 94 (record), Europe 23 (−23%), Asia-Pacific 65, of which Japan 52 (record). Objectives: M&A 40%, capital allocation 39%, board change 35%.
- 2023 review (8 Jan 2024, https://www.lazard.com/research-insights/annual-review-of-shareholder-activism-2023): 252 campaigns in 2023 (+7%, above the 2018 record); 122 board seats won (five-year average 122), a record 31% of them through proxy contests against a historical 17% (so about two thirds or more came through settlements).
- 2024 review (7 Jan 2025, https://www.lazard.com/research-insights/annual-review-of-shareholder-activism-2024/): second record year in a row; US 123 campaigns, Europe 62, Asia-Pacific 57; 186 investors launched campaigns; first-time activists 47% of activists. Global total for 2024 NOT on the page (243 from memory: not verified, not used).
- Proxy fights under the universal proxy card (Sidley Austin via Harvard Law School Forum, 9 Sep 2025, https://corpgov.law.harvard.edu/2025/09/09/how-three-years-of-the-secs-universal-proxy-card-have-changed-proxy-contests/): US board contests 1 Jan 2018 – 31 Aug 2025: 45 before the rule, 31 under it. At least one activist nominee elected in 39% of contests before and 48% under it. Management won every seat in 61% before and 52% under. Activist clean sweeps 29% before, none under (Masimo aside).
- Universal proxy rule (SEC press release 2021-235, https://www.sec.gov/newsroom/press-releases/2021-235): both sides' nominees on one card; required for contested elections at meetings held after 31 Aug 2022.

## 9. Activism: the academic evidence

- Brav, Jiang, Partnoy, Thomas, "Hedge Fund Activism, Corporate Governance, and Firm Performance", Journal of Finance 63(4), 2008 (https://ideas.repec.org/a/bla/jfinan/v63y2008i4p1729-1775.html): US activist funds 2001–2006; abnormal return "approximately 7%" around the announcement, no reversal in the following year; activists succeed fully or partly in about two thirds of cases; rarely seek control. Window: (−20, +20) trading days around the 13D filing per the paper body (window from memory of the paper: not verified on the abstract page).
- Bebchuk, Brav, Jiang, "The Long-Term Effects of Hedge Fund Activism", NBER WP 21227 / Columbia Law Review 2015 (https://www.nber.org/papers/w21227): about 2,000 interventions 1994–2007; five-year window; no evidence that the initial price jump is reversed; operating performance (return on assets, Tobin's Q) not worse and on their measures better three to five years later.
- deHaan, Larcker, McClure, "Long-term economic consequences of hedge fund activist interventions", Review of Accounting Studies 24(2), 2019 (https://www.gsb.stanford.edu/faculty-research/publications/long-term-economic-consequences-hedge-fund-activist-interventions): the positive equal-weighted long-run returns come from the smallest 20% of targets (average market value $22 million); the larger 80% show insignificant negative long-run returns; value-weighted long-run returns not different from zero; no abnormal operating improvement against a matched sample. No evidence of harm either.

## 10. Short sellers: the academic evidence

- Boehmer, Jones, Zhang, "Which Shorts Are Informed?", Journal of Finance 63(2), 2008 (https://ideas.repec.org/a/bla/jfinan/v63y2008i2p491-527.html): NYSE order data 2000–2004; short sales more than 12.9% of NYSE volume; heavily shorted stocks underperform lightly shorted by a risk-adjusted 1.16% over the next 20 trading days (15.6% annualised); institutional non-program shorts 1.43% (19.6% annualised).
- Asquith, Pathak, Ritter, "Short Interest and Stock Returns", NBER WP 10434, 2004 (published as "Short interest, institutional ownership, and stock returns", JFE 2005) (https://www.nber.org/papers/w10434): 1976–2002; stocks in the top 1% by short interest: abnormal return −53 basis points a month equal-weighted (t = −2.44), −5 basis points value-weighted (not significant). Equal-weighted high-short-interest portfolios underperform; value-weighted do not.
- Ljungqvist and Qian, "How Constraining Are Limits to Arbitrage?", NBER WP 19834, 2014 (https://www.nber.org/papers/w19834): 17 small short sellers, 113 US-listed targets, 332 public reports, July 2006 – Dec 2011. Target prices fell 21.9% over 3 months and 56.8% over 12 months net of the market; the short sellers earned 18.2% abnormal over three months net of borrow fees.
- De Bondt and Thaler, "Does the Stock Market Overreact?", Journal of Finance 40(3), 1985 (https://ideas.repec.org/a/bla/jfinan/v40y1985i3p793-805.html): the 35 worst NYSE performers of the past three years beat the market by 19.6% over the next 36 months; the 35 best trailed by about 5.0%; gap 24.6% (numbers from the paper's abstract as widely quoted; abstract not on the page fetched: not verified).
- Shleifer and Vishny, "The Limits of Arbitrage", Journal of Finance 52(1), 1997 (https://ideas.repec.org/a/bla/jfinan/v52y1997i1p35-55.html): arbitrage needs capital, carries risk, and is done by specialists with other people's money; it becomes ineffective in extreme circumstances when prices move far from value (because investors judge by recent results and withdraw).
- Antón, Cohen, Polk, "Best Ideas", draft April 2021 (earlier version with Bernhard Silli, 2008–2010) (https://personal.lse.ac.uk/polk/research/bestideas.pdf): managers' highest-conviction holdings beat the market and the rest of their portfolios by 2.8 to 4.5% a year; most other holdings show no significant outperformance.
- Bessembinder, "Do stocks outperform Treasury bills?", JFE 129(3), 2018 (https://ideas.repec.org/a/eee/jfinec/v129y2018i3p440-457.html): US stocks since 1926; most had lifetime returns below one-month T-bills; the best 4% of companies account for the whole net gain of the market over bills.
- Agarwal, Jiang, Tang, Yang, "Uncovering Hedge Fund Skill from the Portfolio Holdings They Hide", Journal of Finance 2013 (https://business.columbia.edu/sites/default/files-efs/pubfiles/6037/Hedge_fund_skill.pdf): holdings that funds were allowed to keep confidential (filed late by amendment) outperform for up to twelve months.

## 11. Squeezes and blow-ups

- **Volkswagen, Oct 2008** (Allen, Haas, Nowak, Tengulov, "Market efficiency and limits to arbitrage: Evidence from the Volkswagen short squeeze", JFE 2021, https://feeds.usi.ch/documents/attachment/2670/market-efficiency-and-limits-to-arbitrage.pdf; summary https://corpgov.law.harvard.edu/2021/09/15/market-efficiency-and-limits-to-arbitrage-evidence-from-the-volkswagen-short-squeeze/): Sunday 26 Oct 2008 Porsche disclosed 42.6% of VW ordinary shares plus cash-settled options on 31.5% = 74.1%. Lower Saxony held 20.3%. At most 5.6% of shares in free float. About 12.8% of VW's market value was on loan (sold short) as of 25 Oct. Price: €211 at Friday's close → above €1,005 on Tuesday 28 Oct; VW briefly the most valuable listed company in the world. Short sellers' losses estimated at more than €20 billion.
- **Sequoia Fund and Valeant** (Fortune, 13 Jul 2016, https://fortune.com/2016/07/13/valeant-sequoia-fund/; https://en.wikipedia.org/wiki/Sequoia_Fund citing Bloomberg): Valeant was more than 30% of the fund in mid-2015; share fell from a high of $265.52 (Aug 2015) to $33.43 (Mar 2016), −87%; the fund fell 22% over that period, worse than 99% of peers; lost $1.26bn in one day; two of five independent directors resigned Oct 2015; Robert Goldfarb retired March 2016; position sold completely by mid-June 2016; first half 2016 −13.2% against +3.8% for the S&P 500 (+2.3% without Valeant); losses above $1bn.
- **Melvin Capital** (https://en.wikipedia.org/wiki/Melvin_Capital citing WSJ): about $8bn (Jan 2021 reports say $12.5bn: conflict, see s.99); lost 53% in January 2021; $2.75bn from Citadel and Point72 on 25 Jan 2021; 2021 −39%; closure announced 18 May 2022.
- **Archegos** (https://en.wikipedia.org/wiki/Archegos_Capital_Management): family office of Bill Hwang; positions via total return swaps (banks held the shares), so no public disclosure; default on margin calls 26 Mar 2021; losses: Credit Suisse $5.5bn, Nomura $2.85bn, Morgan Stanley $911m, UBS $774m, MUFG about $300m; total about $10.3bn (computed). Hwang sentenced to 18 years, 20 Nov 2024.
- **Tiger Global** (https://en.wikipedia.org/wiki/Tiger_Global_Management citing WSJ 6 Jun 2022): hedge fund −52% and long-only fund −62% for 2022 to end May. Full-year 2022: −56% (press; see s.12 if confirmed).
- **Chanos** (Hedgeweek 20 Nov 2023 citing WSJ, https://hedgeweek.com/news/short-seller-chanos-to-close-hedge-funds-after-almost-40-years): Kynikos founded 1985; assets about $8bn in 2008, under $200m in Nov 2023; fund down about 4% in 2023 to date; 90% of capital returned by end 2023.
- **Hindenburg Research** (https://en.wikipedia.org/wiki/Hindenburg_Research): founded 2017 by Nathan Anderson; Nikola report Sept 2020 (shares −40%; founder later convicted of fraud); Adani report Jan 2023 (group lost about $150bn of market value by end Feb 2023); Icahn Enterprises May 2023 (−50% in a month); closure announced 15 Jan 2025; 11 staff.
- **Andrew Left / Citron** (US Attorney C.D. Cal. press release, https://www.justice.gov/usao-cdca/pr/founder-citron-research-found-guilty-scheming-manipulate-stock-market-media-campaigns; Fortune 3 Jun 2026 https://fortune.com/2026/06/03/andrew-left-citron-research-securities-fraud-conviction/): charged July 2024; convicted by a Los Angeles jury 1 June 2026 on one count of a securities fraud scheme and 12 counts of securities fraud, acquitted on four; sentencing was set for 31 Aug 2026; appeal announced. Outcome of sentencing: see s.12 / s.99.

## 12. HFRI indices by calendar year (HFR Media Reference Guide, 9 Sep 2024, https://mondovisione.com/_assets/files/HFR-Media-Reference-Guide-2024.09.09.pdf)

- **HFRI Fund Weighted Composite**, % per year: 2005 9.30; 2006 12.89; 2007 9.96; 2008 −19.03; 2009 19.98; 2010 10.25; 2011 −5.25; 2012 6.36; 2013 9.13; 2014 2.98; 2015 −1.12; 2016 5.44; 2017 8.59; 2018 −4.75; 2019 10.45; 2020 11.83; 2021 10.16; 2022 −4.14; 2023 8.12. 2024: +9.8 (HFR commentary Jan 2025, https://www.hfr.com/media/market-commentary/hedge-fund-assets-surge-to-record-as-trump-administration-takes-office/; seen in search summary). 2025: +12.6 (Hedgeweek 9 Jan 2026 citing HFR, https://hedgeweek.com/news/hedge-funds-post-strongest-annual-gains-since-2009-says-hfr). 2026 Jan–Sep: +6.88 (HFR special report Oct 2026, https://mondovisione.com/_assets/files/Hedge-Funds-and-U.S.-Presidential-Politics---2026-Midterm-Edition.pdf).
- **HFRI Equity Hedge (Total)**: 2015 −0.97; 2016 5.47; 2017 13.29; 2018 −7.14; 2019 13.71; 2020 17.89; 2021 11.67; 2022 −10.13; 2023 11.37; 2025 17.34 (UBS). 2024: 12.0 to 12.3 (HFR / press).
- **HFRI ED: Activist**: 2013 16.05; 2014 6.57; 2015 1.15; 2016 10.38; 2017 5.45; 2018 −10.42; 2019 17.26; 2020 10.31; 2021 16.09; 2022 −8.16; 2023 18.07.
- **HFRI EH: Short Bias**: 2013 −18.60; 2014 −3.89; 2015 −1.58; 2016 +1.22; 2017 −9.75 (the index does not appear in the guide's tables after 2017).
- HFR industry facts: 562 launches and about 287 liquidations in 2025 (406 liquidations in 2024); industry capital about $5.16tn at start of 2026 (Hedgeweek 27 Mar 2026 citing HFR, https://hedgeweek.com/news/hedge-fund-launches-hit-four-year-high-as-investors-position-for-volatility). Average fees 4Q25: management 1.33%, incentive 15.83% (HFR release March 2026, seen in search summary only: not verified at source).
- Top and bottom deciles of HFRI funds in 2025: +62.7% and −12.8% (Hedgeweek 9 Jan 2026).

## 13. Other

- UK investment trusts, average discount to NAV by decade (AIC, 5 Jan 2026, unweighted, https://www.theaic.co.uk/aic/news/press-releases/aic-releases-53-years-of-investment-trust-discount-history): 1970s 26%; 1980s 20%; 1990s 10%; 2000s 10%; 2010s 8%; 2020s so far 13%. Widest 41% (Oct 1976); narrowest 2% (Dec 1993). Double-digit from May 2022 to Dec 2025.
- Goldman Sachs prime brokerage, US fundamental long/short clients, early Nov 2026: gross leverage 208% (down 9 points in a week), net leverage 43% (down 4 points) (Beinsure 18 Nov 2026 citing Bloomberg, https://beinsure.com/news/hedge-funds-cut-leverage-at-fastest-pace-amid-tech-selloff/). Secondary source.
- Rule 13f-2 / Form SHO (Morgan Lewis, Dec 2025, https://www.morganlewis.com/pubs/2025/12/short-sale-reporting-on-form-sho-compliance-date-further-extended-to-2028; SEC press release 2023-221 https://www.sec.gov/newsroom/press-releases/2023-221): adopted 13 Oct 2023; managers with large short positions report monthly; SEC publishes totals per security with a delay, no names. Compliance first due 2 Jan 2025; exempted to 2 Jan 2026 (Feb 2025); Fifth Circuit sent the rule back to the SEC on 25 Aug 2025 to assess its combined economic effect with the securities-lending rule; on 3 Dec 2025 the SEC extended the exemption to 2 Jan 2028, first filings due 14 Feb 2028.
- SEC investor bulletin, Hedge Funds (https://www.sec.gov/files/ib_hedgefunds.pdf): investors must generally be accredited; funds use leverage, short selling; typical fee 1–2% of assets plus 20% of profit; redemptions monthly, quarterly or annually; lock-ups often one year or more; may suspend redemptions in market distress.
- Berkshire Hathaway 1993 letter (https://www.berkshirehathaway.com/letters/1993.html): concentration may reduce risk if it raises the intensity of study; an investor who knows nothing should own an index fund; one who can judge businesses needs five to ten sensibly priced companies; buying a 20th-best idea makes little sense.

## 14. Activism counts (Barclays Shareholder Advisory Group, via Harvard Law School Forum)

- 2025 review (memo 9 Jan 2026; forum post 27 Jan 2026, http://corpgov.law.harvard.edu/2026/01/27/2025-review-of-shareholder-activism/; PDF https://pcg.law.harvard.edu/wp-content/uploads/2026/01/Barclays-2025-Review-of-Shareholder-Activism_vF.pdf). Campaigns at companies above $500m market value, worldwide, by year: 2016 187; 2017 212; 2018 249; 2019 209; 2020 184; 2021 186; 2022 234; 2023 229; 2024 244; 2025 **255** (record). US 141 in 2025 (115 in 2024); Japan 56; Europe 40.
- 2025: 120 board seats won; record 52 US settlements (35 in 2024), nearly half without prior public agitation; activists won 75% of board seats first sought at US targets where demands were public (four-year average 64%); in proxy fights and major withhold campaigns activists won about a third of seats sought and won seats in half of the situations; record 32 US chief executives resigned within a year of a campaign (27 in 2024); 142 activists launched campaigns, 29% first-timers; Elliott 18 campaigns, $19.0bn deployed.
- 2024 review (PDF https://corpgov.law.harvard.edu/wp-content/uploads/2025/01/Barclays-2024-Review-of-Shareholder-Activism_vF.pdf): 243 campaigns (later revised to 244); 119 board seats, 24% through proxy fights and 76% through settlements; in ten US proxy fights activists won seats in three.
- **Conflict:** Lazard counts 297 campaigns in 2025 and 252 in 2023; Barclays counts 255 and 229. Different screens (Barclays: targets above $500m). Both say 2025 was a record. The post uses Barclays for the yearly series (one consistent definition, all ten years on one chart) and quotes Lazard's 2025 and H1 2026 totals beside it.

## 15. Rules: further details

- Schedule 13G (SEC fact sheet, Oct 2023, https://www.sec.gov/files/33-11253-fact-sheet.pdf): filed instead of 13D by investors above 5% without control intent. Passive investors: five business days (was 10 days). Qualified institutional and exempt investors: 45 days after the quarter end in which they cross 5%. Schedule 13D item 6 must disclose cash-settled derivatives that reference the shares.
- Form 13F instructions (https://www.sec.gov/files/form13f.pdf), special instruction on options: columns 1–5 (including column 4, fair market value) are given "in terms of the securities underlying the options, not the options themselves". Value = closing price on the last trading day of the quarter. Positions under 10,000 shares and under $200,000 may be left out.
- Rule 201 (SEC press release 2010-26, 24 Feb 2010, https://www.sec.gov/news/press/2010/2010-26.htm): triggered by a fall of 10% or more from the prior day's close; short sales then allowed only at a price above the current national best bid; lasts the rest of that day and the next day.
- Limit up-limit down (https://www.luldplan.com/): bands around the average price of the prior five minutes: 5% for Tier 1 shares (S&P 500, Russell 1000, some ETPs) above $3; 10% for other shares above $3; 20% for shares $0.75–$3. Bands doubled in the last 25 minutes for Tier 1 and for Tier 2 below $3. If quotes sit at the band for 15 seconds, a five-minute trading pause follows. (The page as fetched does not mention doubling at the open; the plan has doubled bands 9:30–9:45: not verified here, not used.)
- Regulation T (12 CFR 220.12, https://www.law.cornell.edu/cfr/text/12/220.12): margin for a short sale = 150% of the current market value (the sale proceeds plus 50%). Long purchase: 50%.
- FINRA Rule 4210 (https://www.finra.org/rules-guidance/rulebooks/finra-rules/4210): maintenance margin on short shares at $5 or above: the greater of $5 a share or 30% of market value; under $5: greater of $2.50 a share or 100%. Long: 25%.
- FINRA short interest (https://www.finra.org/investors/insights/short-interest): brokers report open short positions twice a month (mid-month and month-end); FINRA publishes them free.
- Mutual fund limits: Investment Company Act s.18(f) (https://www.law.cornell.edu/uscode/text/15/80a-18): an open-end fund may borrow only from a bank and must keep asset coverage of at least 300% (so borrowing at most one third of assets). s.5(b)(1) (https://www.law.cornell.edu/uscode/text/15/80a-5): a "diversified" fund must have at least 75% of assets in holdings each no larger than 5% of assets and no more than 10% of an issuer's voting shares.
- Accredited investor (SEC, https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/accredited-investors): income above $200,000 ($300,000 with spouse or partner) in each of the past two years, or net worth above $1 million excluding the home; or certain licences (Series 7, 65, 82). Qualified purchaser: $5 million of investments (https://en.wikipedia.org/wiki/Hedge_fund).
- Hart-Scott-Rodino (FTC, https://www.ftc.gov/enforcement/premerger-notification-program/current-thresholds): thresholds effective 17 Feb 2026; the $200m threshold is now $535.5m, so the base $50m threshold is $133.9m `(computed: 535.5 ÷ 4; matches the FTC's published $133.9m from memory)`.
- Hedge fund terms (https://en.wikipedia.org/wiki/Hedge_fund): general partner manages, limited partners invest and risk only their stake; A. W. Jones 1949 first "hedged fund" and the 20% profit share; management fee typically 2% (range 1–4%), performance fee typically 20% (10–50%); high-water mark; hurdle rate (hard/soft); side pocket = illiquid or hard-to-value assets separated from the main portfolio, no ordinary redemption rights, shared only among investors present when created; many funds restricted withdrawals in 2008.
- Poison pill (https://en.wikipedia.org/wiki/Shareholder_rights_plan): invented by Martin Lipton, 1982; if one holder passes a set stake (20% in the article's example) all others may buy new shares at a discount. Staggered board: e.g. nine directors, three elected each year.
- Credit default swap (https://en.wikipedia.org/wiki/Credit_default_swap): buyer pays a yearly premium ("spread", in basis points of the amount insured, usually paid quarterly); seller pays if the borrower defaults; buyer need not own the debt ("naked" CDS); $10m of protection at 50 basis points costs $50,000 a year; outstanding notional $62.2tn at end 2007 (ISDA).
- Kelly criterion (https://en.wikipedia.org/wiki/Kelly_criterion): f = p − q/b. Even-money bet with p = 0.6: f = 0.2. `(computed)` p = 0.55: 0.10; p = 0.5: 0. Half-Kelly commonly used because the inputs are estimates; betting above Kelly raises risk of ruin.
- Stock loans (D'Avolio, "The market for borrowing stock", JFE 2002, abstract at https://www.aqr.com/insights/research/journal-article/the-market-for-borrowing-stock): 91% of stocks lent are "general collateral" costing about 0.17% a year; about 9% are "specials" averaging 4.3% a year; 16% of listed stocks potentially impossible to borrow (tiny, under 0.6% of market value). About 2% of loans recalled in a month (secondary citation: not verified).
- Statman (1987), JFQA 22(3) (https://ideas.repec.org/a/cup/jfinqa/v22y1987i03p353-363_01.html): a well-diversified portfolio of randomly chosen stocks needs at least 30 (borrowing investor) to 40 (lending investor) stocks; the earlier accepted view was about 10.
- Sapp and Yan (2008), Financial Review 43(1) (https://ideas.repec.org/a/bla/finrev/v43y2008i1p27-49.html): US mutual funds with few holdings do not outperform before costs and underperform after costs; higher attrition.
- Kacperczyk, Sialm, Zheng (2005), Journal of Finance 60(4) (https://ideas.repec.org/a/bla/jfinan/v60y2005i4p1983-2011.html): US funds 1984–1999; funds concentrated in a few industries performed better after adjusting for risk and style.
- Getmansky, Lo, Mei (2004) (https://web.mit.edu/Alo/www/Papers/fail5.html): TASS database 1994–2004, 1,765 dead funds; attrition by style from 5.2% a year (convertible arbitrage) to 14.4% (managed futures).

## 16. Market data used in worked examples (24 Nov 2026)

- SPY (SPDR S&P 500 ETF) $718.73 at 10:13 am New York time (https://finance.yahoo.com/quote/SPY/options/).
- SPY put, strike $650, expiring 19 March 2027 (115 days): bid $14.57, ask $14.68 (https://optioncharts.io/options/SPY/option-chain?option_type=put&expiration_dates=2027-03-19:m&view=list&strike_range=all). Snapshots at slightly different minutes of the same morning.
- `(computed)` strike is 9.6% below the price; one contract (100 shares) costs $1,468 at the ask and covers shares worth $71,873 (49 times the cost; cost = 2.04% of the shares' value); break-even at expiry $635.32 (−11.6%); at $600 (−16.5%) the put is worth $50, profit $35.32 a share = +241%; at $575 (−20.0%) +411%; at $650 or higher −100%. 20,000 contracts: cost $29.4m, reported on a 13F as $1,437m.

## 17. Calculations for the post `(all computed)`

- Annualised from calendar-year returns: HFRI FWC 2016–2025 6.64% (×1.90); 2006–2025 5.34% (×2.83). S&P 500 fund (SPY) 2016–2025 14.72% (×3.95); 2006–2025 10.91% (×7.93). 60/40 fund (VBINX) 2016–2025 9.37% (×2.45); 2006–2025 7.93% (×4.60). HFRI Equity Hedge 10 years to Dec 2025: 8.11% (UBS, not computed).
- $100 from end 2005 to end 2025: HFRI FWC $283; SPY $793; VBINX $460.
- HFRI Activist 2014–2023: 6.23% a year (×1.83); SPY same years 11.92% (×3.08); HFRI FWC same years 4.59%.
- HFRI Short Bias 2013–2017: −6.80% a year (−29.7% in total); SPY same years +15.68% a year (+107.2%).
- Fees, "2 and 20", management fee on opening assets, performance fee on the gain left after it, above the high-water mark: 10% gross year on $100 → fee $2.00 + $1.60 = $3.60; investor keeps $6.40 (64% of the gross gain). +30% then −20% gross: year 1 $130 → fees $2.00 + $5.60 → $122.40; year 2 gross $97.92 → fee $2.448 → $95.47. Gross two-year result +4.0%; investor −4.5%; fees $10.05. Recovery needed to regain the high-water mark: 122.40 ÷ 95.47 = +28.2%.
- Ten years at 10% gross: gross $259.37; index fund at 0.05% a year $258.08; "2 and 20" $185.96; average fees 1.33% and 15.83% $202.25.
- Concentration: equal weights, one holding to zero: 10 holdings −10% (rest must rise 11.1% to recover); 100 holdings −1%.
- Elton and Gruber: share of removable risk gone: 4 stocks 65.1%; 8: 80.8%; 10: 84.3%; 20: 91.8%; 30: 94.5%; 50: 96.7%.
- Short sale: 100 shares at $20 with $1,000 deposit (Regulation T minimum): credit $3,000; maintenance call when 3,000 − 100P < 0.30 × 100P → P > $23.08 (+15.4%).
- GameStop $19.95 → $347.51: +1,642%; a short of 100 shares ($1,995) lost $32,756. Volkswagen €211 → €1,005: ×4.76.
- Archegos bank losses listed: $10.3bn.
- Buffett bet: five funds of funds simple average 2.96% a year against 8.5%.

## 18. Burry and Ackman (numbers kept out of the post; the profiles own them)

- Burry: bought credit default swaps on subprime mortgage bonds from 2005; while paying premiums, investors asked to withdraw (https://en.wikipedia.org/wiki/Scion_Asset_Management, citing Lewis). Side pocket: Lewis, The Big Short; not confirmed on a page fetched in this round (Vanity Fair blocked): not verified here.
- Ackman: bought credit protection in late February / early March 2020, disclosed 3 March 2020, sold within about a month (https://en.wikipedia.org/wiki/Bill_Ackman citing the 25 March 2020 investor letter, Reuters and WSJ). Instrument (credit default swap indices): from the letter; Business Wire page blocked: not verified here.

## 19. Late checks

- Muddy Waters Research: founded by Carson Block in 2010; latest listed campaign June 2024 (https://en.wikipedia.org/wiki/Muddy_Waters_Research).
- Pershing Square Holdings: Guernsey investment trust managed by Bill Ackman, listed on the London Stock Exchange (https://en.wikipedia.org/wiki/Pershing_Square_Holdings). Its discount to NAV and its share of the firm's assets were NOT checked here; the post makes no claim about either and leaves them to the Ackman profile.
- Andrew Left: 19-count indictment 25 July 2024, SEC suit 26 July 2024 (https://en.wikipedia.org/wiki/Andrew_Left); DOJ release of 2 June 2026 gives profits of more than $21 million and a 25-year maximum (https://www.justice.gov/opa/pr/activist-short-seller-convicted-21m-stock-market-manipulation-scheme).
- Valeant: Citron report 21 Oct 2015 alleging false sales through the pharmacy Philidor; shares down more than 90% from 2015 to 2017 (https://en.wikipedia.org/wiki/Bausch_Health).
- Post as built on 24 Nov 2026: 6,968 words by the build's count, 18 figures; `node scripts/blog/build.js --drafts --loose` reported no problems.
- Items in section 99 that the finished post does NOT use: 5 (recall rate), 10 (Berkshire copying study), 13, 14, 15.

## 99. Not verified, or weaker than a primary page

1. Brav et al. (2008): the event window (20 days before to 20 days after the 13D filing) is from memory of the paper; the abstract page gives only "approximately 7%".
2. De Bondt and Thaler (1985): 19.6% / 5.0% / 24.6% over 36 months are the abstract's figures as widely quoted; the page fetched had no abstract.
3. HFRI Fund Weighted Composite for 2024 (+9.8%) and average fees for 4Q25 (1.33% / 15.83%): from search summaries of HFR releases; HFR's site returned "page not found" to direct fetches.
4. Goldman Sachs net and gross leverage for US fundamental long/short funds (43% / 208%, Nov 2026): Beinsure citing Bloomberg; the Bloomberg article was not opened.
5. D'Avolio: 2% of stock loans recalled per month (secondary citation).
6. Tiger Global full-year 2022 loss (56% widely reported): not confirmed; the post uses −52% to end May (WSJ via Wikipedia) and Bloomberg's "more than half" for the year (headline, 30 Dec 2022, https://www.bloomberg.com/news/articles/2022-12-30/vc-investments-now-make-up-most-of-tiger-global-s-assets-after-a-brutal-2022).
7. Melvin Capital's assets at the start of 2021: Wikipedia gives $8bn "as of January 2021"; a 53% loss of $6.8bn implies about $12.8bn. The post gives the loss only.
8. Andrew Left's sentence: hearing was set for 31 Aug 2026; NOT FOUND in two searches (results all pre-date the hearing).
9. Burry's side pocket and the instrument in Ackman's 2020 hedge: see section 18.
10. Martin and Puthenpurackal (2008) on copying Berkshire's 13F (10.75 points a year above the S&P 500, 1976–2006): secondary sources only (SSRN blocked).
11. CXO Advisory's "graded since 2022" tally (1,206 predictions, 41% right, always-bullish 62%): read on the page on 24 Nov 2026 through a summarising fetch; method not examined. Confidence C.
12. Volkswagen short sellers' losses "more than €20bn": the paper's estimate; other estimates run to $30bn.
13. Lazard global campaign total for 2024: not on the page; not used.
14. Goldman Sachs most-shorted basket +13% in a week in April 2026: Bloomberg headline in search results only; not used in the post.
15. Limit up-limit down doubling at the open: not on the page fetched; the post mentions only the last 25 minutes.
