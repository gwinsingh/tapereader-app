# Other drops and the evidence base on bottoming signals

Research notes for the market-drops study. Written 20 Nov 2026. Part A profiles nine drops outside 2018 and the 2000/2007 bears. Part B is the evidence on bear rallies, bottoming signals, analog charts and intraday behaviour.

## Read this first

- **Web search ran out.** The session's search budget (200 calls, shared by the three helper agents and me) was used up early. Everything after that was checked by fetching known URLs and by calculation from the local daily files. Several primary documents could not be opened; they are listed in "Could not verify" at the end.
- **Three kinds of evidence, marked in the text:**
  - a URL or a source tag in square brackets = read from that source;
  - **(calc)** = computed by a helper agent from Yahoo/FRED daily history;
  - **(computed here)** = computed by me from the project's own files in `scripts/marketdrops/.data/raw` (S&P 500 `yahoo__GSPC.csv`, Nasdaq `yahoo__IXIC.csv`, `yahoo_SPY.csv`, `cboe_VIX.csv`, `cboe_VIX3M.csv`). The scripts are in the session scratchpad and are throwaway; every definition is written out so you can recode it.
- **"Unverified"** means I could not confirm it from a source I opened. Treat it as a lead.
- **High-yield spreads.** FRED now serves only three years of the ICE BofA high-yield series, so older episodes use Moody's Baa minus 10-year Treasury [BAA] and the TED spread [TED] instead.
- **Index volume.** Yahoo's S&P 500 index volume has bad prints (it shows 8 Aug 2011 at 0.64 times average, while SPY shows 3.1 times). Volume facts below use SPY from 1998; the follow-through-day counts use index volume and are approximate.

**Source tags**

| Tag | Source |
|---|---|
| [Y] | Yahoo Finance daily history, https://finance.yahoo.com/quote/%5EGSPC/history/ (same pattern for ^VIX, ^IXIC, ^NDX, ^RUT, ETFs and stocks) |
| [F] | FRED: https://fred.stlouisfed.org/series/SP500 · https://fred.stlouisfed.org/series/VIXCLS · https://fred.stlouisfed.org/series/NASDAQCOM |
| [F-HY] | ICE BofA US High Yield OAS, https://fred.stlouisfed.org/series/BAMLH0A0HYM2 (last three years only) |
| [BAA] | Moody's Baa minus 10-year Treasury, https://fred.stlouisfed.org/series/BAA10Y |
| [TED] | TED spread, https://fred.stlouisfed.org/series/TEDRATE |
| [FedT] | Fed open-market table, https://www.federalreserve.gov/monetarypolicy/openmarket.htm (shows effective dates, usually one day after the decision) |
| [FA] | Fed archive 1990–2002, https://www.federalreserve.gov/monetarypolicy/openmarket_archive.htm |
| [EPS] | S&P 500 as-reported EPS, December trailing 12 months, https://dqydj.com/sp-500-earnings-per-share/ |
| [NBER] | https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions |
| [BAM] | Walter Deemer's breakaway-momentum list, https://www.walterdeemer.com/bam.htm |
| [QE] | Quantifiable Edges follow-through-day series, https://quantifiableedges.blogspot.com/search/label/IBD%20Follow%20Through%20Day |

---

# Part A — Other drops

## A0. Comparison table

Closing basis. Sources are in the profiles.

| | 1987 | 1990 | 1994 | 1998 | 2011 | 2015–16 | 2020 | 2022 | Apr 2025 |
|---|---|---|---|---|---|---|---|---|---|
| Depth (close) | −33.5% | −19.9% | −8.9% | −19.3% | −19.4% | −14.2% | −33.9% | −25.4% | −18.9% |
| Depth (intraday) | −35.9% | −20.4% | −9.7% | −22.4% | −21.6% | −15.2% | −35.4% | −27.5% | −21.4% |
| Peak → closing low | 25 Aug → 4 Dec 1987 | 16 Jul → 11 Oct 1990 | 2 Feb → 4 Apr 1994 | 17 Jul → 31 Aug 1998 | 29 Apr → 3 Oct 2011 | 21 May 2015 → 11 Feb 2016 | 19 Feb → 23 Mar 2020 | 3 Jan → 12 Oct 2022 | 19 Feb → 8 Apr 2025 |
| Fed before the drop | Hiking | Just began easing | Hiking | On hold | At zero | About to hike | On hold | Hiking fast | On hold |
| Recession | No | Yes | No | No | No | No | Yes (2 months) | No | No |
| S&P earnings | Rose | Fell about 30% | Rose about 40% | Fell 5% | Rose 12% | Fell 4–5 quarters | Fell 11% | Fell 3 quarters | Rose |
| Volatility closing peak | 19 Oct (VXO 150) | 23 Aug (36.5) | 4 Apr (23.9) | 8 Oct (45.7) | 8 Aug (48.0) | 24 Aug 2015 (40.7) | 16 Mar (82.7) | 7 Mar (36.5) | 8 Apr (52.3) |
| Vol peak vs final closing low | 7 weeks before | 7 weeks before | Same day | At the intraday retest | 8 weeks before | 5.5 months before | 5 days before | 7 months before | Same day |
| First low undercut? | Close marginally; intraday no | Yes, twice | No | Intraday yes; close no | Yes | Yes (Aug low undercut in Jan–Feb) | Earlier lows yes; 23 Mar never | June low undercut in Oct | No (higher low 21 Apr) |
| Credit peak vs equity low | Same day | 2–3 months after | No corporate stress | 1 week after | Before (27 Sep) and funding after | Same day | Same day | 3 months before | Same day (intraday low) |
| What turned it | Fed liquidity | Oil peak, then Fed cuts and war start | Valuation reset; hikes went on | Surprise Fed cut | Fed guidance, then ECB | Oil and credit low, G20, Fed dots | Fed credit backstop | CPI rolling over, smaller hikes | White House tariff pause |
| Low to new high | About 20 months | 4 months | 10 months | 6 weeks from the intraday low | Under 5 months | 5 months | 5 months | 15 months | 55 trading days |

---

## A1. 1987 crash

**Cause.** Prices had outrun earnings and rates were rising worldwide. On 14 Oct a House bill to end merger tax breaks and a bad trade deficit hit the market; the S&P fell over 9% that week [Carlson]. On 19 Oct portfolio-insurance selling met stale cash prices and a futures discount.
- Portfolio insurers were about 40% of non-market-maker futures sales on 19 Oct; the top ten sellers were 50% [Carlson, citing the Brady Report].
- Regulators disagreed on blame: the SEC and CME called it significant but not sufficient; the CFTC was sceptical [Carlson].

**Price** [Y]

| | Date | S&P 500 |
|---|---|---|
| Closing peak | 25 Aug 1987 | 336.77 (intraday 337.89) |
| Friday before | 16 Oct | 282.70 |
| Black Monday close | 19 Oct | 224.84 (−20.47%) |
| Intraday low | 20 Oct | 216.46 (close 236.83) |
| Closing low | 4 Dec 1987 | 223.92 (intraday 221.24) |

- Depth −33.5% closing, −35.9% intraday. 55 days to the crash, 101 days to the closing low.
- The old high was regained on 26 Jul 1989 [https://en.wikipedia.org/wiki/Black_Monday_(1987)].
- Nasdaq: 455.80 (27 Aug) to 291.90 (28 Oct), −36% [Y].

**Fed.** It had been tightening.
- Discount rate +50bp to 6% on 4 Sep 1987, the first rise since 1984 [Richmond Fed 2006, read via a search summary].
- 20 Oct, before the open: the one-sentence statement of readiness "to serve as a source of liquidity". The funds rate went from over 7.5% to about 7% that day [Carlson] and 6.5% by early November [https://www.frbsf.org/research-and-insights/publications/economic-letter/1997/10/the-october-87-crash-ten-years-later/].

**Earnings and economy.** EPS rose: $14.48 (1986), $17.50 (1987), $23.75 (1988) [EPS]. No recession [NBER].

**Credit.** TED spread 0.82 (25 Aug) → 2.26 (16 Oct) → peak 3.01 (20 Oct) → 2.38 (4 Dec) [TED]. Baa–10y peaked at 2.68 on 22 Oct [BAA].

**Order of signs at the low**
1. Record week of selling, 14–16 Oct.
2. VXO record close 150.19 on 19 Oct [https://macroption.com/vix-all-time-high]. The intraday high is disputed (172.79 on 20 Oct in one source, 152.48 on 19 Oct in another).
3. 20 Oct: Fed statement, intraday price low, TED peak, futures halted, then corporate buyback announcements [Carlson].
4. 21 Oct: +9.1% [Y].
5. 26 Oct: −8.3% to 227.67, which held above the low [Y].
6. 4 Dec: marginal closing undercut (0.9 points) on below-average volume, intraday low intact, TED lower than in October.

No breadth thrust followed in 1987–88 [BAM].

**Retest.** Yes. The closing low was undercut by 0.4% seven weeks later; the intraday low held.

**What led afterwards.** In 1988 the Russell 2000 rose 22.4% against 12.4% for the S&P [Y]. Sector detail unverified.

**Timeline**

| Date | Event |
|---|---|
| 25 Aug 1987 | S&P closing peak 336.77 |
| 4 Sep | Discount rate to 6% |
| 14–16 Oct | Merger-tax bill, trade deficit; S&P down over 9% on the week |
| 19 Oct | −20.5%; VXO closes 150.19 |
| 20 Oct | Fed liquidity statement; intraday low 216.46 |
| 21 Oct | +9.1% |
| 26 Oct | −8.3% retest holds |
| 4 Dec | Closing low 223.92 |
| 26 Jul 1989 | Old high regained |

Sources: [Carlson] Fed FEDS 2007-13, https://www.federalreserve.gov/pubs/feds/2007/200713/200713pap.pdf · https://www.federalreservehistory.org/essays/stock-market-crash-of-1987 · https://newbagehot.yale.edu/docs/federal-reserves-response-1987-market-crash · Brady Report, https://www.sechistorical.org/collection/papers/1980/1988_0101_BradyReport.pdf (not read directly).

---

## A2. 1990: Kuwait invasion and recession

**Cause.** The economy was already weak: restrictive Fed in 1989–90, overbuilt commercial property, bank failures [https://en.wikipedia.org/wiki/Early_1990s_recession_in_the_United_States]. Iraq invaded Kuwait on 2 Aug 1990.
- Oil averaged $17 in July, hit $28 on 6 Aug and peaked at $46 in mid-October [https://en.wikipedia.org/wiki/1990_oil_price_shock].
- Recession July 1990 – March 1991 [NBER]. The market peak and the cycle peak fell in the same month.
- Junk bonds: Drexel filed for bankruptcy on 13 Feb 1990 [https://en.wikipedia.org/wiki/Drexel_Burnham_Lambert]. Thrift clean-up: https://www.federalreservehistory.org/essays/savings-and-loan-crisis.

**Price** [Y]

| | Date | S&P 500 |
|---|---|---|
| Closing peak | 16 Jul 1990 | 368.95 |
| First low | 23 Aug | 307.06 (−16.8%) |
| Second low | 27–28 Sep | 300.97 close |
| Final low | 11 Oct 1990 | 295.46 (intraday 294.51) |

- Depth −19.9% closing, −20.4% intraday; 87 days. Sources argue over whether it counts as a bear market [https://globalfinancialdata.com/why-20-five-bear-markets-that-almost-occurred].
- New closing high on 13 Feb 1991, four months after the low.
- Nasdaq −30.7% (to 16 Oct).

**Fed** [FA]. One cut on 13 Jul 1990 (8.25% → 8.00%), before the invasion. Nothing during the oil spike. Then cuts from 29 Oct, 18 days after the low, down to 4.00% by 20 Dec 1991.

**Earnings.** EPS fell from $22.87 (1989) to $15.97 (1991), about −30% [EPS]. The earnings trough came well after the price low.

**Credit.** Stress peaked after the equity low: TED max 1.78 on 27 Dec 1990; Baa–10y max 2.45 on 12 Dec 1990 [TED, BAA].

**Order of signs at the low**
1. VIX closing peak 36.47 on 23 Aug, at the first low [Y].
2. Lower price lows on 28 Sep and 11 Oct with a lower VIX (33.98 on 11 Oct). Oil peaked in the same mid-October window.
3. First post-invasion Fed cut on 29 Oct.
4. Credit spreads peaked in December.
5. Higher low in January 1991 (311.49 on 9 Jan), about 5% above the October low, with the VIX back at 36.20 on 14 Jan.
6. Air war began 17 Jan 1991; S&P +3.7% that session, VIX down to 27.45 [Y].
7. Breadth thrust on 5 Feb 1991 (10-day advance/decline ratio 2.17) [BAM].
8. New high on 13 Feb.

**Retest.** The August low was undercut twice (September, October). The October low was never retested.

**What led afterwards.** Growth and Nasdaq: Nasdaq +57% from 16 Oct 1990 to 17 Apr 1991. From the 11 Oct close to 30 Dec 1991: Amgen +390%, Home Depot +271%, Microsoft +186% [Y].

**Timeline**

| Date | Event |
|---|---|
| 13 Feb 1990 | Drexel bankruptcy |
| 13 Jul | Fed cuts to 8.00% |
| 16 Jul | S&P peak 368.95 |
| 2 Aug | Iraq invades Kuwait |
| 23 Aug | First low 307.06; VIX peak 36.47 |
| 11 Oct | Final low 295.46; oil peaks mid-October |
| 29 Oct | Fed resumes cutting |
| 17 Jan 1991 | Air war starts; S&P +3.7% |
| 5 Feb | Breadth thrust |
| 13 Feb | New closing high |

---

## A3. 1994: Fed tightening and the bond massacre

**Cause.** A pre-emptive tightening after the funds rate had sat at 3%. On 4 Feb 1994 the FOMC announced its first tightening since 1989 [https://www.federalreserve.gov/fomc/19940204default.htm]. Leveraged bond positions unwound worldwide.

**Fed** [FA]

| Date | Move | Funds target |
|---|---|---|
| 4 Feb 1994 | +25bp | 3.25% |
| 22 Mar | +25bp | 3.50% |
| 18 Apr | +25bp | 3.75% |
| 17 May | +50bp | 4.25% |
| 16 Aug | +50bp | 4.75% |
| 15 Nov | +75bp | 5.50% |
| 1 Feb 1995 | +50bp (last) | 6.00% |
| 6 Jul 1995 | −25bp (first cut) | 5.75% |

**Bonds.** 10-year yield 5.81% (3 Feb 1994) → peak 8.05% (7 Nov 1994) [https://fred.stlouisfed.org/series/DGS10]. Losses of about $1.5tn globally [https://en.wikipedia.org/wiki/1994_bond_market_crisis].

**Price** [Y]

| | Date | S&P 500 |
|---|---|---|
| Closing peak | 2 Feb 1994 | 482.00 |
| Hike day | 4 Feb | 469.81 (−2.3%) |
| Low | 4 Apr 1994 | 438.92 (intraday 435.86) |
| Later higher lows | 24 Jun; 8 Dec | 442.80; 445.45 |

- Depth −8.9% closing over 61 days. The rest of the year was a range of 438–477.
- Nasdaq peaked later (18 Mar) and bottomed later (24 Jun), −13.7%.
- New S&P closing high on 14 Feb 1995, two weeks after the last hike.

**Earnings.** EPS rose about 40% in 1994 [EPS]. No recession. This was a valuation squeeze with rising profits.

**Credit.** Calm in corporates: Baa–10y narrowed through the year [BAA]. Funding stress only late: Orange County filed on 6 Dec 1994 [https://en.wikipedia.org/wiki/Robert_Citron]; Mexico devalued on 20 Dec [https://en.wikipedia.org/wiki/Mexican_peso_crisis]; TED max 0.99 on 29 Dec [TED].

**Order of signs at the low**
1. VIX 9.94 on 28 Jan, 15.25 on the hike day.
2. VIX closing peak 23.87 on 4 Apr, the same day as the price low.
3. Higher lows in June and December while bonds kept falling until 7 Nov.
4. The December shocks produced only a higher low.
5. Last hike 1 Feb 1995; new high 14 Feb.

No retest of the April low. No breadth-thrust signal in 1994–95 [BAM].

**What led afterwards.** 1995: S&P +34.1%, Nasdaq +39.9%, Intel about +78% [Y]. Broader sector leadership unverified.

**Timeline**

| Date | Event |
|---|---|
| 2 Feb 1994 | S&P closing peak 482.00 |
| 4 Feb | First hike |
| 4 Apr | Low 438.92; VIX 23.87 |
| 17 May | First 50bp hike |
| 7 Nov | 10-year yield peaks at 8.05% |
| 15 Nov | +75bp |
| 6 Dec | Orange County bankruptcy |
| 20 Dec | Peso devaluation |
| 1 Feb 1995 | Final hike, to 6.00% |
| 14 Feb 1995 | New closing high |

---

## A4. 1998: Russia and LTCM

**Cause.** On 17 Aug 1998 Russia devalued and defaulted on domestic debt [https://en.wikipedia.org/wiki/1998_Russian_financial_crisis]. A global flight to quality broke convergence trades.
- LTCM lost 44% in August. On 23 Sep, 14 firms put in about $3.6bn; the Fed brokered the deal but lent nothing [https://www.federalreservehistory.org/essays/ltcm-near-failure].
- The yen carry trade then unwound: USD/JPY fell 14% in two days to 8 Oct [Y].

**Price** [Y]

| | Date | S&P 500 |
|---|---|---|
| Closing peak | 17 Jul 1998 | 1186.75 |
| Closing low | 31 Aug 1998 | 957.28 (−6.8% that day) |
| Rescue-day bounce | 23 Sep | 1066.09 |
| Intraday low | 8 Oct 1998 | 923.32 (close 959.44) |
| New closing high | 23 Nov 1998 | 1188.21 |

- Depth −19.3% closing (to 31 Aug), −22.4% intraday (to 8 Oct). The brief's "final low 8 Oct" is right only intraday; the closing low was 31 Aug.
- Small caps peaked in April: Russell 2000 −36.9% (21 Apr → 8 Oct) and still below its April high a year later.
- Nasdaq −29.5% (20 Jul → 8 Oct).

**Fed** [FA; https://www.federalreserve.gov/boarddocs/press/general/1998/19981015/]
- 29 Sep: −25bp. The market sold off: −3.1% and −3.0% on the next two days.
- 15 Oct: intermeeting −25bp. S&P +4.2% that day.
- 17 Nov: −25bp. Hikes resumed 30 Jun 1999.

**Earnings.** EPS −5% in 1998, then +28% in 1999 [EPS]. No recession.

**Credit.** Peaked a week after the equity low and stayed wide: TED max 1.66 and Baa–10y max 2.77, both on 16 Oct [TED, BAA].

**Order of signs at the low**
1. Capitulation 31 Aug: −6.8%, VIX 44.28, SPY volume 2.5 times its 50-day average (computed here).
2. VIX stayed above 40 through September.
3. LTCM rescue 23 Sep; first cut 29 Sep disappointed.
4. 8 Oct: yen spike, intraday undercut of 3.5%, close back above the 31 Aug close, VIX closing peak 45.74.
5. The Russell 2000 and Nasdaq closed at clear new lows that day; the S&P closing low held. Large caps diverged from small caps.
6. Surprise cut on 15 Oct started the V.
7. Credit spreads peaked 16 Oct.
8. New high 23 Nov.

No breadth-thrust signal [BAM].

**What led afterwards.** Large-cap technology and internet: Nasdaq +54.5% from 8 Oct to year-end. From the 8 Oct close to 31 Dec: Amazon +273%, Cisco +99%, Microsoft +52% [Y]. Small caps lagged badly.

**Timeline**

| Date | Event |
|---|---|
| 21 Apr 1998 | Russell 2000 peak |
| 17 Jul | S&P closing peak 1186.75 |
| 17 Aug | Russia devalues and defaults |
| 31 Aug | −6.8%; closing low 957.28 |
| 23 Sep | LTCM rescue |
| 29 Sep | Fed −25bp |
| 8 Oct | Intraday low 923.32; VIX 45.74; yen spike |
| 15 Oct | Intermeeting cut |
| 17 Nov | Third cut |
| 23 Nov | New closing high |

---

## A5. 2011: debt ceiling, downgrade and the euro crisis

**Cause.** Two overlapping shocks.
- US: debt-ceiling deal signed 2 Aug; S&P cut the US to AA+ on Friday evening 5 Aug [https://en.wikipedia.org/wiki/United_States_federal_government_credit-rating_downgrades].
- Europe: contagion fears for Italy and Spain; short-selling bans on 11 Aug [https://en.wikipedia.org/wiki/August_2011_stock_markets_fall].

**Price** [Y]

| | Date | S&P 500 |
|---|---|---|
| Closing peak | 29 Apr 2011 | 1363.61 |
| Pre-slide level | 22 Jul | 1345.02 |
| First low | 8 Aug | 1119.46 (−6.66%) |
| Closing low | 3 Oct 2011 | 1099.23 |
| Intraday low | 4 Oct 2011 | 1074.77 (close 1123.95) |

- Depth −19.4% closing, −21.6% intraday. Most of the damage (−16.8%) came in 11 sessions from 22 Jul to 8 Aug.
- Then an eight-week base between roughly 1120 and 1220.
- First close above the old high: 24 Feb 2012. Russell 2000 −29.6%.

**Fed.** Already at zero, so it used guidance and the balance sheet.
- 9 Aug: rates low "at least through mid-2013" [https://www.federalreserve.gov/newsevents/pressreleases/monetary20110809a.htm]. S&P +4.7%.
- 21 Sep: Operation Twist, $400bn [https://www.federalreserve.gov/newsevents/pressreleases/monetary20110921a.htm]. S&P −2.9% then −3.2%.
- 30 Nov: six central banks cut dollar swap pricing [https://www.federalreserve.gov/newsevents/pressreleases/monetary20111130a.htm]. S&P +4.3%.

**ECB.** Draghi took office 1 Nov. Two 36-month LTROs announced 8 Dec; first allotted 21 Dec [https://www.ecb.europa.eu/press/pr/date/2011/html/pr111208_1.en.html]. "Whatever it takes" came later, 26 Jul 2012.

**Earnings.** EPS rose 12% in 2011 [EPS]. No US recession.

**Credit.** Baa–10y max 3.39 on 27 Sep, a week before the equity low [BAA]. Bank funding stress (TED) kept rising to January 2012 [TED].

**Order of signs at the low**
1. VIX closing peak 48.00 on 8 Aug, the first low. SPY volume 3.1 times average on 8 Aug and 3.2 times on 9 Aug (computed here).
2. Fed pledge and a 4.7% reversal on 9 Aug.
3. Retest on 19–22 Aug held.
4. 3–4 Oct: undercut by 1.8% closing and 2.4% intraday, with a lower VIX (45.45) and ordinary volume (SPY 1.1 times average on 3 Oct), then a reversal on 4 Oct.
5. +3.4% on 10 Oct; follow-through day on 18 Oct [QE]; +3.4% on 27 Oct.
6. Higher low 25 Nov (1158.67).
7. Swap lines 30 Nov; LTRO in December.

No breadth-thrust signal in 2011–12 [BAM]. Quantifiable Edges noted this was the first rally since 1971 to reach a 50-day high from an 8% drawdown without a follow-through day on its three indices until 18 Oct [QE].

**What led afterwards** (3 Oct 2011 – 30 Mar 2012) [Y]: homebuilders (XHB) +70%, Apple +60%, financials +40%, discretionary +33%, technology +31%, SPY +28%, utilities +7%.

**Timeline**

| Date | Event |
|---|---|
| 29 Apr 2011 | S&P closing peak 1363.61 |
| 2 Aug | Debt-ceiling law signed |
| 5 Aug | S&P downgrades the US |
| 8 Aug | −6.7%; VIX 48.00 |
| 9 Aug | Fed "mid-2013" pledge |
| 21 Sep | Operation Twist |
| 3–4 Oct | Closing low 1099.23; intraday low 1074.77 |
| 18 Oct | Follow-through day |
| 30 Nov | Dollar swap pricing cut |
| 8 and 21 Dec | LTRO announced; first allotment |
| 24 Feb 2012 | New closing high |

---

## A6. 2015–16: China, oil and the first hike

**Cause.** Slowing China and the yuan devaluation, collapsing oil, the end of QE and an approaching first hike, against an earnings recession [https://en.wikipedia.org/wiki/2015%E2%80%932016_stock_market_selloff].

**Price** [Y, calc]

| Point | Date | Level |
|---|---|---|
| Record close | 21 May 2015 | 2130.82 |
| First-leg closing low | 25 Aug 2015 | 1867.61 (−12.35%) |
| First-leg intraday low | 24 Aug 2015 | 1867.01 |
| Retest | 28–29 Sep 2015 | close 1881.77; intraday 1871.91 (held) |
| Recovery high | 3 Nov 2015 | 2109.79 (+12.97% in 49 trading days) |
| January low | 20 Jan 2016 | intraday 1812.29, close 1859.33 |
| Final low | 11 Feb 2016 | close 1829.08, intraday 1810.10 |

- Total depth −14.16% closing, −15.21% intraday, over 183 trading days. It never reached −20%. The second leg (3 Nov → 11 Feb) was −13.31%.

**The 24 Aug open** [SEC staff note, https://www.sec.gov/marketstructure/research/equity_market_volatility.pdf]. SPY opened −5.2% and hit −7.8% by 9:35. There were 1,278 limit-up/limit-down halts, 1,058 of them in 327 exchange-traded products. VIX hit 53.29 intraday and closed at 40.74 [Y].

**Fed.**
- Hiked 25bp on 16 Dec 2015 [https://www.federalreserve.gov/newsevents/pressreleases/monetary20151216a.htm].
- On 16 Mar 2016 the median end-2016 projection fell from 1.4% to 0.9%, four hikes cut to two [https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20160316.htm]. The next hike was Dec 2016.
- G20 in Shanghai 26–27 Feb 2016 pledged no competitive devaluations [https://g20.utoronto.ca/2016/160227-finance-en.html]. The "Shanghai Accord" is an analyst label.

**Earnings.** Q1 2016 was the fourth straight year-on-year decline (−6.7% blended, FactSet via https://www.cbsnews.com/amp/news/the-earnings-recession-is-a-heavy-weight-on-stocks).

**Credit.** Baa–10y rose from 2.75% to a peak of 3.63% on 11 Feb 2016, the day of the equity low [BAA]. HYG's closing low was the same day [Y]. WTI settled at $26.21 that day [https://www.ogj.com/general-interest/article/17251588/market-watch-nymex-march-crude-oil-price-settles-near-26bbl]. ICE high-yield and energy-HY peak levels unverified.

**Order of signs at the low**
1. VIX peaked in Aug 2015 (40.74 close). At the Feb low it closed at only 28.14 [Y].
2. New lows peaked on 20 Jan: about 1,350–1,400 NYSE new lows, over 42% of issues [https://sentimentrader.com/blog/breadth-flush-pt-2-new-lows].
3. The 11 Feb price low came with fewer new lows, a positive divergence [https://thereformedbroker.com/2016/02/12/a-positive-divergence-at-last/]. Oil and credit bottomed the same day.
4. 17 Feb: follow-through day, day 4, Nasdaq +2.21%.
5. 25 Feb: close above the 50-day (calc).
6. 3 Mar: breadth thrust on the S&P 1500, led by small and mid caps, unlike the failed Oct 2015 thrust [https://articles.stockcharts.com/article/articles-arthurhill-2016-03-market-environment-turns---october-vs-february---breadth-thrust-triggers/].
7. 11 Mar: close above the 200-day; Deemer 20-day breakaway momentum the same day [BAM].
8. 16 Mar: Fed dots cut.
9. 23 Mar: over 90% of S&P stocks above their 50-day [https://thereformedbroker.com/2016/03/23/chart-o-the-day-as-extended-as-it-ever-gets/].
10. 25 Apr: golden cross. 11 Jul 2016: new record close.

**Retest.** Twice. Sep 2015 held above August. Feb 2016 undercut the 20 Jan intraday low by about 2 points and reversed.

**What led afterwards** (total return from the 11 Feb 2016 close) [Y, calc]

| ETF | To 29 Apr 2016 | To 30 Dec 2016 |
|---|---|---|
| XME (metals & mining) | +73% | +115% |
| XOP (oil & gas E&P) | +50% | +75% |
| GDX (gold miners) | +41% | +14% |
| XLE (energy) | +26% | +43% |
| KRE (regional banks) | +23% | +72% |
| XLB (materials) | +22% | +31% |
| SMH (semis) | +15% | +58% |
| SPY | +13% | +25% |

The most beaten-down groups led first. Banks and semis were second-half leaders; staples and utilities lagged.

**Timeline**

| Date | Event |
|---|---|
| 21 May 2015 | Record close 2130.82 |
| 11 Aug 2015 | Yuan devalued 1.9% |
| 24–25 Aug 2015 | Flash-crash open, VIX 53.29; closing low 1867.61 |
| 28–29 Sep 2015 | Retest holds |
| 3 Nov 2015 | Rally high 2109.79 |
| 16 Dec 2015 | First hike |
| 20 Jan 2016 | New-lows climax, intraday 1812.29 |
| 11 Feb 2016 | Low 1829.08; oil and credit lows |
| 17 Feb / 3 Mar 2016 | Follow-through day / breadth thrust |
| 16 Mar 2016 | Dots cut to two hikes |

---

## A7. 2020: COVID crash

**Cause.** Pandemic shutdown, plus an oil-price war from 9 Mar [https://en.wikipedia.org/wiki/2020_stock_market_crash].

**Price** [Y, F, calc]

| Point | Date | Level |
|---|---|---|
| Record close | 19 Feb 2020 | 3386.15 |
| Low | 23 Mar 2020 | close 2237.40, intraday 2191.86 |

- Depth −33.92% closing, −35.41% intraday, in 23 trading days.
- Big days: 9 Mar −7.60%, 12 Mar −9.51%, 13 Mar +9.29%, 16 Mar −11.98%.
- Level-1 circuit breakers on 9, 12, 16 and 18 Mar.

**Fed** (press releases at https://www.federalreserve.gov/newsevents/pressreleases/)
- 3 Mar: −50bp [monetary20200303a.htm].
- 15 Mar (Sunday): −100bp to zero, plus at least $700bn of purchases [monetary20200315a.htm].
- 17–18 Mar: commercial-paper, dealer and money-fund facilities [monetary20200317a.htm, monetary20200318a.htm].
- 23 Mar, 8:00am, the morning of the low: purchases "in the amounts needed", plus corporate-credit facilities [monetary20200323b.htm].
- CARES Act ($2.2tn) signed 27 Mar [https://en.wikipedia.org/wiki/CARES_Act].

**Earnings.** CY2020 EPS −11.4% [FactSet, https://go.factset.com/hubfs/Website/Resources%20Section/Research%20Desk/Earnings%20Insight/EarningsInsight_021221.pdf].

**Credit.** ICE high-yield OAS peaked at 1,087bp on 23 Mar 2020, the same day as the equity low [https://rpc.cfainstitute.org/blogs/enterprising-investor/2025/think-weve-seen-the-last-1000-bps-high-yield-spread-think-again]. Spreads eased after the corporate-facility announcement [https://www.federalreserve.gov/econres/notes/feds-notes/the-corporate-bond-market-crises-and-the-government-response-20201007.htm].

**Order of signs**
1. VIX closing record 82.69 on 16 Mar; intraday peak 85.47 on 18 Mar. At the 23 Mar price low it was 61.59, so volatility peaked a week before price [Y, F].
2. SPY volume peaked on 12 Mar (2.6 times its 50-day average), seven sessions before the low (computed here).
3. Policy arrived at 8am on the low day; high-yield spreads peaked that day.
4. 24–26 Mar: +9.38%, +1.15%, +6.24%, a +17.55% three-day run. Each day had over 80% up issues and up volume [https://sentimentrader.com/blog/a-historic-3-day-buying-thrust-is-changing-sentiment/].
5. 2 Apr: follow-through day on the S&P (+2.28%); Nasdaq on 6 Apr (computed here; secondary blogs agree).
6. Zweig thrust: sources disagree. SentimenTrader in 2023 says none triggered because the move "took a few days too long" [https://sentimentrader.com/blog/the-holy-grail-of-breadth-thrusts-has-triggered]. Deemer's breakaway momentum fired on 3 Jun 2020 [BAM].
7. Close above the 50-day on 17 Apr and the 200-day on 27 May, by which time the index was 35.7% off the low (computed here).
8. Record close 18 Aug 2020.

**Retest.** None. The only pullback low was 2470.50 on 1 Apr, 10.4% above the low.

**What led afterwards** (total return from the 23 Mar 2020 close) [Y, calc]

| ETF / stock | To 8 Jun 2020 | To 31 Dec 2020 |
|---|---|---|
| TSLA | +119% | +712% |
| XLE | +99% | +68% |
| XHB (homebuilders) | +85% | +135% |
| ARKK | +71% | +230% |
| XME | +67% | +136% |
| NVDA | +66% | +146% |
| IWM | +54% | +99% |
| SMH | +45% | +110% |
| SPY | +45% | +70% |
| QQQ | +42% | +85% |

The first bounce was the most-crushed groups (energy, banks, homebuilders). Durable leadership was growth, semis, homebuilders and later small caps. Staples, utilities and health care lagged.

**Timeline**

| Date | Event |
|---|---|
| 19 Feb | Record 3386.15 |
| 3 Mar | Emergency −50bp |
| 9 / 12 Mar | First circuit breakers; −9.5% day |
| 15–16 Mar | Cut to zero + QE; −12% day; VIX 82.69 |
| 17–18 Mar | Funding facilities; VIX intraday 85.47 |
| 23 Mar | Unlimited QE and credit facilities; low 2237.40; HY 1,087bp |
| 24–26 Mar | +17.6% in three days |
| 27 Mar | CARES Act signed |
| 2 Apr | Follow-through day |
| 18 Aug | New record |

---

## A8. 2022: hiking-cycle bear

**Cause.** Inflation at 40-year highs, then the fastest hiking cycle since the 1980s, with balance-sheet runoff from June [https://en.wikipedia.org/wiki/2022_stock_market_decline].

**Price** [Y, F, calc]

| Point | Date | Level |
|---|---|---|
| Nasdaq Composite peak | 19 Nov 2021 | 16,057.44 |
| S&P record close | 3 Jan 2022 | 4796.56 |
| June low | 16 Jun 2022 | close 3666.77 (−23.55%) |
| Summer high | 16 Aug 2022 | 4305.20 (+17.41% in 41 trading days) |
| Closing low | 12 Oct 2022 | 3577.03 (−25.43%, 195 trading days) |
| Intraday low | 13 Oct 2022 | 3491.58 (−27.54%) |
| Nasdaq Composite closing low | 28 Dec 2022 | 10,213.29 (−36.4%) |

- The summer rally's intraday high on 16 Aug was 4325.28 against a 200-day average of 4326.18. It failed within one point.
- 13 Oct was CPI day: an outside reversal, closing +2.60%.
- The Nasdaq made its closing low on 28 Dec, but its intraday low was 13 Oct. The Russell 2000's closing low was 16 Jun and it held in October.

**Fed** [FedT]
- 16 Mar +25bp, 4 May +50bp, then +75bp on 15 Jun, 27 Jul, 21 Sep and 2 Nov; 14 Dec +50bp; then +25bp four times to 26 Jul 2023.
- Powell at Jackson Hole, 26 Aug: "pain to households and businesses" [https://www.federalreserve.gov/newsevents/speech/powell20220826a.htm]. S&P −3.4%.
- 10 Nov: October CPI 7.7% [https://www.bls.gov/news.release/archives/cpi_11102022.htm]. S&P +5.54%.
- SVB: Bank Term Funding Program on 12 Mar 2023; S&P closing low 3855.76 on 13 Mar 2023.

**Earnings.** Year-on-year declines in Q4 2022, Q1 and Q2 2023; Q3 2023 was the first growth [FactSet, https://go.factset.com/hubfs/Website/Resources%20Section/Research%20Desk/Earnings%20Insight/EarningsInsight_120123.pdf].

**Credit.** Baa–10y peaked at 2.42% in July 2022 and was lower (2.27%) at the October equity low. Credit did not confirm October [BAA]. ICE high-yield peak (about 6%, July 2022) unverified.

**No capitulation.** VIX's highest 2022 close was 36.45 on 7 Mar. At the lows it closed at 34.02 (13 Jun) and 33.57 (12 Oct) [Y]. VIX never closed more than 2% above three-month VIX during the decline (computed here). The heaviest SPY volume near the October low was on 30 Sep, not at the low (computed here).

**Bear rallies of 5% or more, closing basis** (calc)

| Dates | Size | Outcome |
|---|---|---|
| 27 Jan – 2 Feb | +6.1% | Failed |
| 8 – 29 Mar | +11.1% | Failed |
| 19 May – 2 Jun | +7.1% | Failed |
| 16 Jun – 16 Aug | +17.4% | Failed |
| 6 – 12 Sep | +5.2% | Failed |
| 30 Sep – 4 Oct | +5.7% | Failed |
| 12 Oct – 30 Nov | +14.1% | Held |

After the rally that held: −7.3% to 28 Dec, +10.5% to 2 Feb 2023, −7.8% to 13 Mar 2023.

**Follow-through days.** By my coded test, the S&P had three in 2022 before the low (9 Feb, 16 Mar, 24 Jun), all failed; the Nasdaq had four (8 Feb, 18 Mar, 17 May, 23 Jun), three failed outright and the June one rallied 2× before the index made a new low (computed here; definition in B2). A blog counted 26 May as IBD's "fourth this year" [https://stageanalysis.net/blog/294655/us-stocks-watchlist-26-may-2022]. IBD's official count is unverified. The one that worked was 21 Oct 2022 (S&P +2.37%).

**Breadth thrusts.**
- 4 Jan 2022: S&P 1500 thrust, a failure SentimenTrader itself flags [https://sentimentrader.com/blog/here-come-the-breadth-thrust-buy-signals].
- 28 Jul 2022: S&P 1500 thrust; price made new lows in October but was higher a year later [same].
- 12 Jan 2023: NYSE breakaway momentum, 2.16 [BAM], with Nasdaq, small-cap, discretionary and high-yield thrusts alongside [https://sentimentrader.com/blog/a-cluster-of-breadth-thrust-buy-signals-bodes-well-for-stocks].
- 31 Mar 2023: Zweig Breadth Thrust [https://sentimentrader.com/blog/the-holy-grail-of-breadth-thrusts-has-triggered]. A second in Nov 2023 (exact day unverified).

**When buying dips started working again** (calc from [Y])

| Period | Avg next-day return after a down day | % of next days up | Avg after a ≤−1% day |
|---|---|---|---|
| 2021 | +0.13% | 60% | +0.54% |
| H1 2022 | −0.20% | 44% | −0.47% |
| Full-year 2022 | −0.04% | 43% | −0.29% |
| 13 Oct – Dec 2022 | +0.25% | 45% | +0.64% |
| H1 2023 | +0.27% | 60% | −0.05% |

Trend evidence (calc): death cross 14 Mar 2022. First close above the 200-day on 30 Nov 2022, lost on 5 Dec. Reclaimed in January 2023; golden cross 2 Feb 2023. Lost 9–17 Mar 2023 (SVB), reclaimed 20 Mar, then held until 20 Oct 2023. Record close 19 Jan 2024.

**What led afterwards** (total return from the 12 Oct 2022 close) [Y, calc]

| ETF / stock | To 2 Feb 2023 | To 29 Dec 2023 |
|---|---|---|
| NVDA | +89% | +331% |
| META | +48% | +178% |
| SMH | +46% | +103% |
| ITB (homebuilders) | +36% | +91% |
| EFA (international) | +30% | +40% |
| XLI (industrials) | +23% | +38% |
| QQQ | +19% | +57% |
| SPY | +17% | +36% |
| XLE | +9% | +10% |
| KRE | +9% | −9% |

First off the low: semis, homebuilders, industrials and international. Mega-cap growth turned only after 28 Dec (META +23.3% on 2 Feb 2023; NVDA +24.4% on 25 May 2023). Energy, the 2022 leader, lagged.

**Timeline**

| Date | Event |
|---|---|
| 19 Nov 2021 | Nasdaq peak |
| 3 Jan 2022 | S&P peak |
| 16 Mar | First hike |
| 16 Jun | Low 3666.77 (first 75bp hike on 15 Jun) |
| 16 Aug | Fails at the 200-day |
| 26 Aug | Jackson Hole |
| 12–13 Oct | Closing and intraday lows; CPI reversal |
| 21 Oct | Follow-through day |
| 10 Nov | CPI +5.5% day |
| 28 Dec | Nasdaq low |
| 12 Jan / 2 Feb 2023 | Breadth thrusts / golden cross |
| 13 Mar 2023 | SVB low |

---

## A9. April 2025: tariff crash

**Cause.** "Liberation Day" reciprocal tariffs announced after the close on 2 Apr 2025 [https://en.wikipedia.org/wiki/2025_stock_market_crash].

**Price** [Y, F, calc]

| Point | Date | Level |
|---|---|---|
| Record close | 19 Feb 2025 | 6144.15 |
| First close below 200-day | 10 Mar 2025 | — |
| 10% correction | 13 Mar 2025 | 5521.52 (−10.13%) |
| Two-day drop | 3–4 Apr | −4.84% and −5.97% (−10.53% combined) |
| Intraday low | 7 Apr 2025 | 4835.04 (−21.35% from the intraday high) |
| Closing low | 8 Apr 2025 | 4982.77 (−18.90%, 34 trading days) |

- It reached −20% intraday but never on a close.
- 7 Apr: a false "90-day pause" headline produced a 4835–5246 range.
- 8 Apr: gapped up to 5267.47, then sold off to close −1.57%.
- 9 Apr: pause announced. S&P +9.52%; Nasdaq +12.16%, the biggest since 2008. 10 Apr: −3.46%.
- Nasdaq Composite −24.3%; Russell 2000 −27.9%.

**Fed.** On hold at 4.25–4.50%; no cut until Sep 2025 [FedT].
- Powell, 4 Apr: tariffs "significantly larger than expected"; "well positioned to wait" [https://www.federalreserve.gov/newsevents/speech/powell20250404a.htm].
- Powell, 16 Apr: goals may be "in tension" [https://www.federalreserve.gov/newsevents/speech/powell20250416a.htm]. S&P −2.24%.
- There was no Fed rescue. The policy trigger for the low was the White House.

**Treasuries and dollar** [Y]. 10-year yield 3.98% (4 Apr) → 4.49% (11 Apr). Dollar index 103.81 (2 Apr) → 98.28 (21 Apr). Stocks, bonds and the dollar fell together. A basis-trade unwind as the mechanism is unverified.

**Earnings.** No earnings recession. Q1 2025 EPS +13.3%; Q2 estimates were cut 4.0% between 31 Mar and 29 May [FactSet, https://go.factset.com/hubfs/Website/Resources%20Section/Research%20Desk/Earnings%20Insight/EarningsInsight_053025.pdf].

**Credit.** High-yield OAS rose from 2.68% (19 Feb) to a peak of 4.61% on 7 Apr, and was 3.15% by 12 May [F-HY]. Mild next to 2016 or 2020.

**Order of signs**
1. 7 Apr: VIX intraday peak 60.13 at the open, high-yield spread peak, intraday price low, and the heaviest SPY volume (4.1 times its 50-day average, computed here).
2. 8 Apr: VIX closing peak 52.33 and the closing price low. Volatility and price peaked together, unlike 2020.
3. 9 Apr: policy reversal, a +9.5% day.
4. 21 Apr: higher low at 5158.20 with VIX at 33.82, 3.5% above the closing low.
5. 22–24 Apr: +2.51%, +1.67%, +2.03%. Follow-through day 22 Apr (computed here; day 9, +2.51%).
6. 24 Apr: Zweig Breadth Thrust, the first since Nov 2023 [https://www.investing.com/analysis/sp-500-breadth-thrust-signals-a-new-bullish-phase-as-death-cross-fears-fade-200660022; https://www.fool.com/investing/2025/04/26/the-sp-500-just-did-something-thats-only-happened]. Counts of prior signals vary by source (16 to 20).
7. Nine straight up days to 2 May. Close above the 50-day on 1 May.
8. 12 May: Geneva truce [https://www.whitehouse.gov/briefings-statements/2025/05/joint-statement-on-u-s-china-economic-and-trade-meeting-in-geneva/]. S&P +3.26% and back above the 200-day.
9. Record close 27 Jun 2025, 55 trading days after the low.

Moving-average crosses were late both ways: death cross on 14 Apr, after the low; golden cross on 1 Jul, after the new high.

**What led afterwards** (total return from the 8 Apr 2025 close) [Y, calc]

| ETF / stock | To 27 Jun 2025 | To 31 Oct 2025 |
|---|---|---|
| AVGO | +73% | +138% |
| ARKK | +72% | +120% |
| PLTR | +69% | +159% |
| NVDA | +64% | +110% |
| SMH | +55% | +102% |
| XLK | +40% | +68% |
| XME | +36% | +99% |
| QQQ | +32% | +52% |
| XLI | +27% | +34% |
| SPY | +24% | +38% |
| XLP | +6% | +1% |
| XLV | +1% | +10% |

The prior leaders (AI, semis) led again. This was an event shock, not a leadership change.

**Timeline**

| Date | Event |
|---|---|
| 19 Feb | Record 6144.15 |
| 13 Mar | −10% correction |
| 2 Apr | Tariff announcement (after close) |
| 3–4 Apr | −10.5% in two days; Powell "wait" |
| 7 Apr | Intraday low 4835.04; fake headline; VIX 60.13 |
| 8 Apr | Closing low 4982.77; VIX close 52.33 |
| 9 Apr | Pause; +9.5% |
| 21 Apr | Higher low |
| 22 / 24 Apr | Follow-through day / Zweig thrust |
| 12 May | Geneva truce; back above the 200-day |
| 27 Jun | New record |

---

## A10. Corrections during Fed hiking cycles

Closing basis [Y, calc]; hike dates from [FedT]. "What ended it" is a reading of the dates unless a source is given.

| Episode | Peak → trough (close) | Depth | What ended it |
|---|---|---|---|
| **1987** | 25 Aug → 4 Dec 1987 | −33.5% | Fed's 20 Oct liquidity statement and easing. |
| **1994** | 2 Feb → 4 Apr 1994 | −8.9% | The low came after the second hike. The index then ranged through five more hikes and made a new high two weeks after the last one. |
| **1997** (single hike, 25 Mar) | 18 Feb → 11 Apr 1997 | −9.6% | No further hikes; new high 5 May 1997. |
| **1999** (hikes 30 Jun, 24 Aug, 16 Nov) | 16 Jul → 15 Oct 1999 | −12.1% | No policy change. New high on 16 Nov 1999, the day of the third hike. |
| **2000, Jan–Feb** (hike 2 Feb) | 31 Dec 1999 → 25 Feb 2000 | −9.3% | New high 21 Mar 2000, also a hike day. |
| **2000 top** | 24 Mar → 14 Apr 2000 | −11.2%, then −49.1% to 9 Oct 2002 | Nothing ended it. The last hike (16 May 2000) came after the top; cuts from Jan 2001 did not stop the bear. |
| **2004** (first hike 30 Jun) | 11 Feb → 12 Aug 2004 | −8.2% over 126 trading days | The low came two days after the second hike. Hikes continued at 25bp a meeting; new high 4 Nov 2004. |
| **2005** | 7 Mar → 20 Apr 2005 | −7.2% | Hikes continued; new high 14 Jul 2005. |
| **2006** | 5 May → 13 Jun 2006 | −7.7% in 26 trading days | The low came two weeks before the 17th and last hike (29 Jun). Pause on 8 Aug 2006 [https://www.federalreserve.gov/newsevents/pressreleases/monetary20060808a.htm]. |
| **2015–16** (one hike, 16 Dec 2015) | 21 May 2015 → 11 Feb 2016 | −14.2% | Oil and credit low on 11 Feb; G20; dots cut from four hikes to two on 16 Mar 2016. |
| **2018, Feb** | 26 Jan → 8 Feb 2018 | −10.2% in 9 trading days | A volatility unwind, not a policy change. Retest held on 2 Apr 2018; hikes continued. |
| **2018, Q4** | 20 Sep → 24 Dec 2018 | −19.8% | Last hike 19 Dec 2018. "Patient" FOMC statement on 30 Jan 2019 [https://www.federalreserve.gov/newsevents/pressreleases/monetary20190130a.htm]. |
| **2022** | 3 Jan → 12 Oct 2022 | −25.4% | Inflation rolling over (10 Nov CPI) and smaller hikes. The last hike was Jul 2023, nine months after the price low. |

**Pattern in these rows**
- In 1994, 2004 and 2006 the correction was 8–9% and bottomed while hikes were still under way. Earnings were rising in each.
- Drops of 19% or more (1987, Q4 2018, 2022) needed a Fed change of stance or pace.
- In 2000 the end of hiking did not help.
- **The present decline is also inside a hiking phase.** The Fed's table shows a 25bp increase effective 17 Sep 2026, to 3.75–4.00% [FedT], and the local effective-funds series steps from 3.63% to 3.88% that day (`fred_DFF.csv`). The S&P's record close was 7818.93 on 6 Oct 2026; the 20 Nov close of 6910.39 is −11.6% (local data). The other agent's `now-2026.md` covers this.

---

# Part B — Evidence base

## B1. Bear-market rallies versus durable lows

### Published statistics on bear rallies

| Source | Finding | Status |
|---|---|---|
| Goldman Sachs (Oppenheimer) | About 19 global bear-market rallies since the early 1980s; average length 44 days; MSCI AC World gained 10–15% on average. "Sharp rallies within bear markets are the norm." | Read via search summaries of https://www.goldmansachs.com/insights/articles/are-bear-markets-in-stocks-an-investment-opportunity and https://www.bloomberg.com/news/articles/2025-05-06/goldman-says-bear-market-rallies-are-norm-as-pain-trade-thriving. Goldman's own pages returned 403, so not read directly. |
| Goldman bear types | Structural: about −60%, 3.5 years, about a decade to recover. Cyclical: about −30%, about 2 years, 4–5 years to recover. Event-driven: about −30%, 8–9 months, recover in about a year. An event-driven bear can turn cyclical if recession follows. | Same; figures differ slightly between Goldman notes. |
| Bank of America | 43 bear rallies of more than 10% since 1929 averaged +17.2% over 39 days. | Search snippet of a Business Insider report; unverified. |
| 2022, S&P 500 | Six rallies of 5–17% failed before the seventh held (table in A8). | (calc) |
| 2000–02 and 2007–09 | Covered by the other agents. By my coded test the S&P had 7 follow-through days in each bear and all 14 failed (B2). | (computed here) |

One error to avoid: an Investing.com piece says "the average bear market lasts 44 days". The 44 days is the average bear rally.

### What separated the rallies that failed from the ones that held

No source I could open tests this directly. The pieces of evidence that bear on it:

| Feature | Evidence | Source |
|---|---|---|
| Depth of the prior decline | Follow-through days succeeded 63.5% of the time after declines of 5% or more, 54.7% after 8%, 48% after 10%, 44.4% after 12% (1971–2008). Deeper declines produce more failed rally signals. | [QE], 15 Feb 2008 |
| Position versus the 200-day | Follow-through days above the 200-day: 14 of 23 worked (61%). Below it: 23 of 48 (48%). | [QE], 16 Feb 2010 |
| Breadth on the signal day | Up-issues share in the top 5% of the past year: 22 of 35 worked (63%). Otherwise about 41–44%. | [QE], 22 Jun 2011 |
| Behaviour in the first three days | Closed above the signal-day close on day 3: 27 of 46 worked (59%). Below: 12 of 34 (35%). Three straight down days after a signal: only 3 of 11 worked. | [QE], 18 Jun 2012 and 27 Jun 2011 |
| New highs on the signal day | No predictive value (2.1% vs 2.0% of NYSE stocks). | [QE], 7 Feb 2008 |
| NYSE breadth thrust | Deemer's list has no signal between Jan 1992 and 23 Mar 2009. None of the rallies inside the 2000–02 or 2007–09 bears produced one. | [BAM] |
| Cause removed | Every durable low in Part A coincided with the cause easing: Fed liquidity (1987), a surprise cut (1998), oil and credit turning (2016), a credit backstop (2020), inflation rolling over (2022), the tariff pause (2025). The failed 2022 summer rally ended when Powell repeated the cause on 26 Aug. | Part A; this row is inference. |
| Credit | Spreads peaked with or before the equity low in 1987, 2011, 2016, 2020, 2022 and 2025. In 1990 and 1998 they peaked after it. | Part A |
| The 200-day | The 2022 summer rally stopped one point under it. Durable lows reclaimed it in 16–45 trading days in 1998, 2011, 2016, 2019, 2020, 2022 and 2025, but took 58–126 days in 1988, 2003 and 2009 (table in B6). | (computed here) |

### How often a 10% decline becomes 20%

The answer depends on how a "correction" is counted, which is why published figures range from 22% to 46%.

| Source | Count | Conversion to −20% |
|---|---|---|
| Carson Group (Detrick), cited by Yahoo Finance 15 Mar 2025 | 48 corrections of 10% since WWII; 12 became bear markets | 25% [https://finance.yahoo.com/news/corrections-usually-dont-amount-to-much-chart-of-the-week-100044475.html] |
| 24/7 Wall St, since 1974 | 27 corrections; 6 became bear markets | 22% (search summary; not opened) |
| Plus500 / Stacker, since 1950 | About 38 corrections; 14 bear markets | About 37% (search summary; not opened) |
| All-time-high method, since 1950 (computed here) | 26 episodes reached −10%; 12 reached −20% | 46% |

**All-time-high method (computed here).** An episode starts at an all-time closing high and ends only at the next one. This merges every correction inside a long recovery into one episode, so it counts fewer shallow declines than Carson's method and gives higher conversion rates. Use it as the upper bound.

| Once the S&P was down… | Episodes since 1950 | Went on to −15% | to −20% | to −30% |
|---|---|---|---|---|
| −8% | 36 | 44% | 33% | 19% |
| −10% | 26 | 62% | 46% | 27% |
| −12% | 20 | 80% | 60% | 35% |
| −15% | 16 | — | 75% | 44% |
| −20% | 12 | — | — | 58% |

Final depth of the 36 episodes that reached −8%: 16 ended between 8% and 12%, 4 between 12% and 15% (1959–60, 1983–84, 1999, 2015–16), 4 between 15% and 20% (1990, 1998, 2018, 2025), 5 between 20% and 30% (1957, 1962, 1966, 1982, 2022), 7 beyond 30% (the 1929 carry-over, 1970, 1974, 1987, 2002, 2009, 2020).

A reading of the two methods together: most declines that stop near 10% stop there. Once a decline passes about 12–15% from an all-time high, it has usually gone on to 20%.

### Retests and undercuts: V-bottoms versus W-bottoms

I found no openable Ned Davis, Bespoke or SentimenTrader count. The table below is computed here on 19 episodes (the 16 all-time-high episodes of 12% or more since 1956 with a clean low, plus 2010, 2011 and Feb 2018). Closing basis. A "bounce" is a rally of 7% or more off a low.

| Episode | Before the final low | After the final low: lowest close once a 7% bounce had happened |
|---|---|---|
| 1957 | 1 failed bounce | +1.0% (retest) |
| 1962 | 1 failed bounce; final low 5.7% under the prior low | +2.2% (retest, Oct 1962) |
| 1966 | 1 failed bounce | +6.3% |
| 1970 | 2 failed bounces | +2.8% (retest) |
| 1974 | 6 failed bounces | +4.4% (Dec 1974) |
| 1982 | 4 failed bounces | +10.3% (no retest) |
| 1987 | 2 failed bounces; final low 1.6% under the 26 Oct low | +8.2% (no retest) |
| 1990 | 23 Aug and 28 Sep lows undercut; bounces under 7% | +5.4% (Jan 1991) |
| 1998 | None (straight down) | +0.2% (8 Oct retest) |
| 2002 | 10 failed bounces | +3.1% (Mar 2003 retest) |
| 2009 | 11 failed bounces | +11.0% (no retest) |
| 2010 | None | +2.4% (retest, Aug 2010) |
| 2011 | 2 failed bounces; final low 2.2% under the Aug low | +5.4% |
| 2015–16 | 1 failed bounce; final low 2.1% under the Aug 2015 low | +8.2% (no retest) |
| Feb 2018 | None | Retest held on 2 Apr 2018 (0.03% above); undercut in Dec |
| Q4 2018 | None | +7.7% (no retest) |
| 2020 | 1 failed bounce (13 Mar) | +9.4% (no retest) |
| 2022 | 3 failed bounces of 7%+ | +4.0% (3 Nov), then +7% (28 Dec) |
| 2025 | None | +3.5% (21 Apr) |

Counts from this table:
- **The first bounce of 7% or more started from the final low in 6 of 19** (1990 by this rule, 1998, 2010, Feb 2018, Q4 2018, 2025). In the other 13 the first sharp bounce failed and the low was undercut.
- **After the final low, price came back within 3.5% of it in 8 of 19** (1957, 1962, 1970, 1998, 2002, 2010, Feb 2018, 2025), within 4–6.5% in another 5, and never within 7% in 6 (1982, 1987, 2009, 2016, Q4 2018, 2020).
- **A clean V with no failed bounce before and no retest after happened once** (Q4 2018), or twice if a 3.5% higher low counts (2025).
- Of the six no-retest cases, the December 1987 low was itself the retest of October. The others had a large policy or cause change at the low: 2016 (oil and credit turn, then the Fed's dots), Q4 2018 (Fed pause), 2020 (credit backstop); 1982 and 2009 are outside Part A and not sourced here.

Definitions to code:
- *Final low*: lowest close between an all-time high and the next one.
- *Failed bounce*: a close-to-close rally of at least 7% off a low that is later undercut on a close.
- *Retest*: after the first 7% rally off the final low, the lowest later close (within 250 trading days) is within X% above the final low. Report X = 2, 3.5, 5.

## B2. Follow-through day (IBD / O'Neil)

**Definition as used now.**
- Day 1 is the first up-close after a correction low (IBD also accepts a day that undercuts the low and closes in the upper half of its range). The attempt stays alive while the index holds above the Day 1 low.
- The follow-through is a strong gain on Day 4 or later, on volume higher than the previous session's (not necessarily above average). Either the S&P 500 or the Nasdaq Composite qualifies.
- The gain threshold has moved: 1% in O'Neil's original rule, 1.7% by the mid-2000s, about 1.25% in recent descriptions. Days 4–7 are preferred, but later days count.
- Source: Rob Hanna's reading of IBD's rules [http://quantifiableedges.blogspot.com/2008/01/ibd-follow-through-days-pt-1-are-they.html] and a secondary summary [https://www.luxalgo.com/library/concept/follow-through-day/]. I could not open IBD's own page.

**IBD's claims.** "No major rally has begun without one", and a 70–80% success rate (as quoted by Hanna and by the secondary summary; IBD's own text not opened).

**Independent test: Quantifiable Edges (Rob Hanna), Dec 1971 – 2008, extended to 2012.**
- Setup: an 8% S&P decline; signal on any of the Dow, S&P or Nasdaq; S&P used for the outcome.
- Success: the rally reaches twice the distance from the signal-day close to the low, or a new 200-day high. Failure: a close below the low.
- Result: 35 of 64 worked at a 1% threshold (54.7%); 29 of 52 at 1.7% (55.7%). With failure defined as an intraday break of the low, about 45%. "IBD's claims are not supported."
- With a 1% threshold, every rally since 1971 began with one. The 1.7% rule missed or came late to several.
- Average bull move after a successful signal 28.8%; the signal came about 5.2% above the low on average; average loss on failures about 5.6%. Hanna's rough expected value: about +5%.
- By era: worked well in the 1980s and 1990s, struggled in the 1970s and since 2000.
- Dow, 1929–32: 13 failed signals before the one that worked.
- All from [QE].

**My coded check (computed here).** Rule: closing decline of 8% or more from the running high; Day 1 = first up-close after the low; signal = Day 4 or later, gain ≥ threshold, volume above the prior day; failure = close below the low day's intraday low; success = Hanna's two conditions.

| Index, threshold | Resolved signals | Worked |
|---|---|---|
| S&P 500, 1.25% (1971–2026) | 75 | 38 (51%) |
| S&P 500, 1.7% | 62 | 32 (52%) |
| Nasdaq Composite, 1.25% (1985–2026) | 87 | 50 (57%) |
| Nasdaq Composite, 1.7% | 79 | 43 (54%) |

This reproduces Hanna's coin-flip result on 18 more years of data.

**Failed signals inside the named declines (computed here, 1.25% threshold).**

| Decline | S&P 500 | Nasdaq Composite |
|---|---|---|
| Mar 2000 – Oct 2002 | 7 signals, 7 failed (25 Apr 2000, 30 Oct 2000, 8 Dec 2000, 3 Jan 2001, 10 Apr 2001, 28 Sep 2001, 6 Aug 2002) | 14 signals, 11 failed; 3 met the 2× target before new lows (30 May 2000, 9 Jan 2001, 28 Sep 2001) |
| Oct 2007 – Mar 2009 | 7 signals, 7 failed (5 Dec 2007, 31 Jan, 20 Mar, 22 Jul, 25 Sep, 16 Oct, 2 Dec 2008) | 7 signals, 6 failed (18 Mar 2008 met the target) |
| 2018 | 2 signals: 14 Feb worked, 7 Nov failed | 4 signals: 14 Feb and 10 Apr worked; 7 Nov and 28 Nov failed |
| Jan – Oct 2022 | 3 signals, 3 failed (9 Feb, 16 Mar, 24 Jun) | 4 signals, 3 failed (23 Jun met the target before new lows) |

**Signals at the real lows (computed here).** S&P: 18 Oct 1990, 15 Oct 2002, 18 Mar 2009, 18 Oct 2011, 4 Jan 2019, 2 Apr 2020, 21 Oct 2022, 22 Apr 2025. All came 4–11 days after the low and 5–20% above it.

Caveats: these are not IBD's official counts; Yahoo index volume has errors; "met the 2× target" counts some bear rallies as successes, as Hanna's rule also does.

**Verdict.** A necessary-not-sufficient filter. Nearly every durable low had one within two weeks, but in the big bears 85–100% of them failed. Its usable content is the stop it implies (the rally low) and the three refinements in B1: shallow prior decline, strong breadth on the day, and no close below the signal-day close in the next three sessions.

## B3. Breadth thrusts

### Definitions

| Signal | Definition | Source and status |
|---|---|---|
| Zweig Breadth Thrust | 10-day moving average of NYSE advances ÷ (advances + declines) rises from below 0.40 to above 0.615 within 10 trading days. Zweig used an exponential average; several vendors use a simple one. | https://sentimentrader.com/blog/the-holy-grail-of-breadth-thrusts-has-triggered (quoting Investopedia). EMA versus SMA and NYSE-all versus common-only change the signal list. |
| Deemer breakaway momentum | 10-day sum of NYSE advances > 1.97 × 10-day sum of declines. Since Jan 2019 also: 20-day sum > 1.72 ×. | [BAM], read directly |
| S&P 1500 version of Deemer | Same 1.97 ratio on S&P 1500 issues, with a reset when the ratio falls below 0.8. | https://sentimentrader.com/blog/here-come-the-breadth-thrust-buy-signals |
| Whaley ADT / UDT / SPT | 5-day advances ÷ (advances + declines) above 73.66% (thrust) or below 19.05% (capitulation). 5-day up volume ÷ (up + down) above 77.88% or below 16.41%. 5-day S&P change above +10.05% or below −13.85%. | A TradingView implementation of Whaley's 2010 Dow Award paper [https://in.tradingview.com/script/7fj0ePjF-Whaley-Thrust-ADT-UDT-SPT-2010-EDT-EMA-Info-Box]. The paper itself is behind the CMT member wall; thresholds unverified against it. |
| Lowry 90% days (Desmond) | 90% downside day: down volume ≥ 90% of up + down volume **and** points lost ≥ 90% of points gained + lost. 90% upside day is the mirror. | Desmond's 2002 Dow Award paper, read via secondary summaries [https://thedowtheory.com/portal/special-reports/capitulation-the-ultimate-bear-market-low-indicator/]. |
| Desmond's sequence | One or more 90% downside days (panic selling), then a 90% upside day or two back-to-back 80% upside days (panic buying). A single 90% downside day means nothing by itself. Declines with two or more tend to produce a series, sometimes 30 trading days apart. In about half of the cases over 69 years the confirming upside day came within five trading days of the low. | Same; quoted in search summaries of the paper. |
| deGraaf thrust | More than 55% of S&P 500 stocks at 20-day highs. | As stated in the brief; I found no source I could open. Unverified. |
| % above 50-day | From a washout (commonly under 10–20%) to over 90% of S&P 500 stocks above their 50-day average. | Example reading: 23 Mar 2016 [https://thereformedbroker.com/2016/03/23/chart-o-the-day-as-extended-as-it-ever-gets/]. No signal list retrieved. |
| Coppock curve | Monthly: 10-month weighted average of (14-month rate of change + 11-month rate of change); buy when it turns up from below zero. | From memory; not fetched. Unverified. |

### Deemer breakaway momentum: every signal since 1990 [BAM]

5 Feb 1991 (2.17) · 6 Jan 1992 (1.974) · 23 Mar 2009 (2.22) · 23 Jul 2009 (2.17) · 16 Sep 2009 (2.12) · 11 Mar 2016 (20-day, 1.80) · 12 Jul 2016 (2.19) · 9 Jan 2019 (2.18) · 3 Jun 2020 (2.07) · 12 Jan 2023 (2.16).

- Full list from 1949: 25 signals. None between 1992 and 2009, so none in 2000–03 (not even at the 2002–03 low) and none in 1998 or 2011.
- The page gives no forward returns. Deemer describes declines after a signal as "brief and shallow".
- The page's table ends at Jan 2023. Whether one fired in 2025 is unverified.

### Which signals fired at each low

| Low | Follow-through day | Deemer (NYSE) | Zweig thrust | Other |
|---|---|---|---|---|
| Oct 2002 / Mar 2003 | 15 Oct 2002 (computed) | None | Unverified | Lowry's confirming signal came in March 2003, within 10% of the low [thedowtheory report] |
| Mar 2009 | 18 Mar 2009 by my rule (IBD's own date unverified) | 23 Mar 2009, then twice more in 2009 | Commonly cited for March 2009; unverified here | S&P 1500 thrusts had also fired in Dec 2008 and on 2 Jan 2009, before the final low [SentimenTrader] |
| Oct 2011 | 18 Oct 2011 [QE] | None | Unverified | — |
| Feb 2016 | 17 Feb 2016 | 11 Mar (20-day) and 12 Jul 2016 | Unverified | S&P 1500 thrust 3 Mar; over 90% above 50-day on 23 Mar |
| Dec 2018 | 4 Jan 2019 (computed) | 9 Jan 2019 | Yes, January 2019, per SentimenTrader (combined issues and volume thrust) | — |
| Mar 2020 | 2 Apr (S&P), 6 Apr (Nasdaq) | 3 Jun 2020 | Did not trigger on NYSE data per SentimenTrader 2023 ("a few days too long") | Three straight 80% up days, 24–26 Mar |
| Oct 2022 | 21 Oct 2022 | 12 Jan 2023 | 31 Mar 2023; again Nov 2023 | S&P 1500 thrust 28 Jul 2022 (three months early) |
| Apr 2025 | 22 Apr 2025 (computed) | Not on the fetched list | 24 Apr 2025 | — |

### Forward returns and false signals

| Signal | Reported record | Failures and caveats |
|---|---|---|
| Zweig (NYSE) | Since 1962, "no losses of any magnitude" at any horizon; worst pullback within a year 9.2% [SentimenTrader, Apr 2023]. Other counts: 16 signals since 1950, or 17 since WWII, all higher 6 and 12 months later (search summaries of Investing.com and InvestorPlace pieces). | Sample of under 20. Counts differ by data source. It did not fire at the 2020 low, and I could not confirm it for 2002–03, 2009, 2011 or 2016. Volume-based versions "included false positives with double-digit losses over 6 to 12 months" [SentimenTrader]. |
| Deemer (NYSE) | SentimenTrader's NYSE model (their threshold; 46 signals since 1932): every signal since 1942 higher 12 months later [Jan 2023 note]. | Fires weeks to months after the low: 10 trading days after in 2009, 10 in 2019, 20 in 2016 (20-day version), 50 in 2020, 63 in 2022–23. Absent in 2002–03, 2011, 1998, 1987. |
| S&P 1500 version | 35 signals in 52 years; S&P higher a year later 97% of the time; 8 signals after 20% declines all higher at 6 and 12 months [SentimenTrader, Jul 2022]. | 4 Jan 2022 fired the day after the bull-market top and failed. Dec 2008 and 2 Jan 2009 fired before the final 25% leg down. 28 Jul 2022 preceded new lows. |
| Lowry 90% sequence | Per a third-party audit since 1960: 9 bottoms identified, 3 missed, 16 extraneous signals, 3 false [thedowtheory report; its text and exhibit disagree on 8 versus 9]. | Many extra signals. 90% days have become more common with ETF and index trading (a common practitioner point; unverified here). |
| Whaley thrusts | Not retrieved. | — |

**Verdict.** Thrusts are confirmation, not timing. They have an excellent 6–12 month record, a small sample, and they arrive after the first 10–25% of the advance. Their absence does not veto a low (2002–03, 2011). The documented failures share one feature: the Fed was still tightening or the credit problem was unresolved (Jan 2022, Dec 2008). SentimenTrader's own caveat: "no single indicator is infallible, especially when Federal Reserve policy is unfriendly."

## B4. VIX through declines

### VIX peak versus the price low (computed here from Cboe closes)

| Episode | VIX highest close | Trading days before the S&P closing low | VIX on the low day |
|---|---|---|---|
| 1990 | 36.47 (23 Aug) | 34 | 33.98 |
| 1998 | 45.74 (8 Oct, at the intraday retest) | After the 31 Aug closing low | 44.28 |
| 2002 | 45.08 (5 Aug) | 46 | 42.13 |
| 2008–09 | 80.86 (20 Nov 2008) | 72 | 49.68 |
| 2010 | 45.79 (20 May) | 30 | 30.12 |
| 2011 | 48.00 (8 Aug) | 39 | 45.45 |
| 2015–16 | 40.74 (24 Aug 2015) | 118 | 28.14 |
| Feb 2018 | 37.32 (5 Feb) | 3 | 33.46 |
| Q4 2018 | 36.07 (24 Dec) | 0 | 36.07 |
| 2020 | 82.69 (16 Mar) | 5 | 61.59 |
| 2022 | 36.45 (7 Mar) | 156 | 33.57 |
| Apr 2025 | 52.33 (8 Apr) | 0 | 52.33 |

- **Peak levels do not sort corrections from bears.** Corrections and event shocks peaked at 36–52. The two crisis bears peaked above 80. The 2022 bear never closed above 36.5, and 2002 peaked at 45. 1994 bottomed at 24.
- **In 7 of 12 the VIX peaked a month or more before the final price low** (1990, 2002, 2008–09, 2010, 2011, 2015–16, 2022). In those, the final low came on a lower VIX. This is the "positive divergence": less fear at a lower price means forced selling is fading.
- **In the fast shocks the peak and the low coincided** within a week (Feb 2018, Q4 2018, 2020, 2025).
- Caution: a lower VIX at a lower low is seen at every final low of a multi-leg decline, but it is also seen at intermediate lows (Sep 2001 → Jul 2002 → Oct 2002 each had this property against the one before). It marks the type of decline, not the date.

### Term structure: VIX above three-month VIX (computed here, Sep 2009 – Nov 2026)

| Episode | First close above 1.0 | Highest ratio | Ratio on the low day | Days inverted before the low | First close back below 1.0 after the low |
|---|---|---|---|---|---|
| 2010 | 27 Apr | 1.24 (6 May) | 0.90 | 16 | — |
| 2011 | 16 Jun | 1.26 (8 Aug) | 1.05 | 42 | 5 Oct (2 days after) |
| 2015–16 | 29 Jun 2015 | 1.31 (24 Aug 2015) | 1.02 | 24 | 12 Feb (next day) |
| Feb 2018 | 2 Feb | 1.33 (5 Feb) | 1.22 | 5 | 14 Feb |
| Q4 2018 | 10 Oct | 1.25 (24 Dec) | 1.25 | 27 | 4 Jan 2019 |
| 2020 | 24 Feb | 1.34 (28 Feb) | 1.09 | 21 | 24 Apr |
| 2022 | 26 Jan | 1.02 (1 Mar) | 1.01 | 14 | 14 Oct |
| Apr 2025 | 3 Mar | 1.27 (7 Apr) | 1.26 | 15 | 25 Apr |

- VIX closed above three-month VIX on 329 of 4,320 days (7.6%).
- S&P return after an inverted close: +3.0% mean over 21 trading days (72% positive) against +1.1% (67%) for all days; +7.3% over 63 days (82%) against +3.1% (75%). These are overlapping days from about eight episodes, so the effective sample is small.
- Inversion starts weeks before the low (5 to 42 inverted days first). It is a stress gauge that says "you are in the zone where lows form and where the biggest down days also happen", not a bottom signal.
- The return to contango came 1–9 days after the low in most cases, but a month after in 2020 and 12 days after in 2025. I did not count the false "back below 1.0" events inside declines; in 2011, 2015 and 2018 there were several.
- The 2022 bear barely inverted at all. A slow, policy-driven bear can run its whole course without this signal.

### What the literature says

| Study | Finding |
|---|---|
| Simon & Wiggins (J. Futures Markets 2001; 1989–99) | VIX, put/call ratio and TRIN had "statistically and economically significant" contrarian forecasting power for S&P futures over 10–30 days; buying when fear was high improved risk-adjusted profits out of sample [https://ideas.repec.org/a/wly/jfutmk/v21y2001i5p447-462.html]. |
| Moreira & Muir (J. Finance 2017) | Expected returns do not rise in proportion to volatility. Cutting exposure when volatility is high raises Sharpe ratios [https://www.nber.org/papers/w22208]. This is the opposite lesson: high VIX is a reason for smaller size, not a buy signal in itself. |
| Johnson (JFQA 2017) | The slope of the VIX term structure predicts returns on variance assets (VIX futures, straddles) [https://ideas.repec.org/a/cup/jfinqa/v52y2017i06p2461-2490_00.html]. It is evidence about volatility products, not about the timing of equity lows. |
| SentimenTrader, 16 Nov 2026 | "VIX reversed from the top of its 84-day range" buy signal; the one prior case named (April 2026) was followed by +14.6% in six months. No full table in the text [https://sentimentrader.com/blog/the-fear-gauge-triggered-a-buy-signal-for-stocks--16-11-2026]. The S&P fell another 3.7% on 20 Nov 2026 (local data), four days after it. |

"VIX spike then close back below X" rules and VVIX: I retrieved no tested study. Local `cboe_VVIX.csv` runs from 2006 if you want to test them. Unverified as timing tools.

**Evidence quality.** Moderate for "extreme fear is followed by above-average returns over 1–3 months". Weak for any exact rule. The two reliable statements are structural: the VIX usually peaks before the final low in multi-leg declines, and position size should fall as VIX rises.

## B5. Volume and capitulation

### Is a volume climax needed at the low? No. (computed here; SPY volume ÷ its 50-day average)

| Low | Volume on the low day | Heaviest day within 15 sessions |
|---|---|---|
| 31 Aug 1998 | 2.5× | 27 Aug (2.8×) |
| 8 Oct 1998 | 1.6× | Same day |
| 23 Jul 2002 | 2.5× | 24 Jul (3.6×) |
| 9 Oct 2002 | 1.7× | 15 Oct (1.7×), on the way up |
| 10 Oct 2008 | 2.7× | Same day, five months before the final low |
| 20 Nov 2008 | 1.7× | Same day |
| 9 Mar 2009 | 1.1× | 6 Mar (1.4×) |
| 2 Jul 2010 | 0.8× | 1 Jul (1.3×) |
| 8 Aug 2011 | 3.1× | 9 Aug (3.2×), eight weeks before the final low |
| 3 Oct 2011 | 1.1× | 22 Sep (1.6×) |
| 24 Aug 2015 | 4.3× | Same day, five months before the final low |
| 20 Jan 2016 | 2.1× | 15 Jan (2.4×) |
| 11 Feb 2016 | 1.35× | Same day |
| 8 Feb 2018 | 2.4× | 6 Feb (3.5×) |
| 24 Dec 2018 | 1.1× (a half day) | 21 Dec (2.0×, quarterly expiry) |
| 23 Mar 2020 | 2.2× | 12 Mar (2.6×) |
| 16 Jun 2022 | 1.3× | 13 Jun (1.65×) |
| 12–13 Oct 2022 | 1.0× and 1.8× | 30 Sep (1.9×) |
| 7–8 Apr 2025 | 4.1× and 2.5× | 7 Apr |

- The volume climax usually marks the **first** low or the momentum low, not the final one. Final lows in multi-leg declines came on ordinary volume: Mar 2009 (1.1×), Oct 2011 (1.1×), Feb 2016 (1.35×), Dec 1987 (0.84× on index volume), Oct 2022 (1.0×).
- Single-leg shocks do bottom on the climax: Oct 1998 retest, Feb 2018, Apr 2025.
- So "no capitulation yet" was a wrong reason to stay out in 2009, 2011, 2016, 2018 and 2022.

### Other capitulation gauges

| Gauge | What it showed at lows | What careful work says |
|---|---|---|
| New 52-week lows | New lows peaked before the final price low: 20 Jan 2016 versus 11 Feb 2016 (A6). The same pattern is widely reported for Oct 2008 versus Mar 2009 and Jul 2002 versus Oct 2002 (unverified here). | The divergence is a description of multi-leg lows. No tested hit rate found. Code it as: new lows on the final low day below half the episode's peak count. |
| Lowry 90% days | See B3. | 16 extraneous signals in one audit. |
| TRIN (Arms), put/call | Significant contrarian power at 10–30 days in 1989–99 [Simon & Wiggins]. | Pan & Poteshman (RFS 2006): the predictive part of option volume is the non-public part (who is opening what); the public ratio adds little [https://ideas.repec.org/a/oup/rfinst/v19y2006i3p871-908.html]. Local Cboe put/call files run 1995/2003–2019. |
| AAII bearish % | Record 70.3% on 5 Mar 2009; 67.0% on 19 Oct 1990; 61.9% on 3 Apr 2025; 60.9% on 22 Sep 2022; 60.8% on 9 Oct 2008; only 52.1% at the March 2020 low (computed by a helper from https://www.aaii.com/files/surveys/sentiment.xls). | AAII's own study, 1987–2013: readings above 50.8% were followed by only +2.8% over 6 months, 60% winners, because of the Nov 2007 – Feb 2009 run of early signals. Excluding that run: +14.2% [https://www.aaii.com/journal/article/is-the-aaii-sentiment-survey-a-contrarian-indicator]. False positives: 59% in Jan and Mar 2008, a year early; 60.6% on 27 Feb 2025, six weeks early. |
| NAAIM exposure | Readings near 10–35 at the 2020, 2022 and 2025 lows (from memory; unverified). | NAAIM says it shows positioning, not direction [https://naaim.org/programs/naaim-exposure-index/]. |
| Investors Intelligence "selling climax" | A stock makes a 12-month low during the week and closes the week higher. | From memory; their page is a login wall. Unverified. |
| Insider buying | Seyhun (J. Business 1988) asks whether aggregate insider trading predicts the market; the abstract does not state the answer [https://ideas.repec.org/a/ucp/jnlbus/v61y1988i1p1-24.html]. | Unverified here. Commonly cited spikes: Nov 2008, Mar 2009, Aug 2011, Mar 2020. |
| Fund flows | Ben-Rephael, Kandel & Wohl (JFE 2012): flows into equity funds go with a same-month return that reverses 85% within four months [https://ideas.repec.org/a/eee/jfinec/v104y2012i2p363-382.html]. | Flows chase and reverse. No clean low signal. |
| Margin debt | See B12. | Confirms, lags by a month. |

**Verdict.** Sentiment extremes mark a zone, and the zone opened a year early in 2008. Each gauge works as a filter against selling into the hole, not as a trigger to buy. The combination that recurred at final lows in Part A is: a lower price low on lower VIX, fewer new lows, ordinary volume, and credit no longer widening.

## B6. Moving averages as a filter for longs

### The 10-month / 200-day rule

Faber, "A Quantitative Approach to Tactical Asset Allocation" (read from the paper, https://mebfaber.com/wp-content/uploads/2016/05/SSRN-id962461.pdf; SSRN 962461):
- Rule: at month-end, hold the S&P 500 if price is above its 10-month simple average; otherwise hold cash.
- S&P 500 total return, 1901–2012: compound return 10.18% for timing against 9.32% for buy-and-hold. The **average** annual returns are the same (11.22% against 11.26%); the gain is from lower volatility.
- In the market about 70% of the time; less than one round trip a year.
- It **underperformed the index in roughly half of all years**.
- Drawdowns: 1929–32, 42.24% against 83.66%. 2000–02, 16.52% against 44.73%. It exited on 31 Dec 2007 and missed the 50.95% fall.
- Faber's own summary: "a risk-reduction technique with no adverse impact on return", which lags in roaring bull markets and suffers whipsaws when a market oscillates.

Other literature:
- Brock, Lakonishok & LeBaron (J. Finance 1992), Dow 1897–1986: returns after moving-average buy signals were higher and less volatile than after sell signals; returns after sell signals were negative [https://ideas.repec.org/a/bla/jfinan/v47y1992i5p1731-64.html].
- Sullivan, Timmermann & White (J. Finance 1999) re-tested those rules with a data-snooping correction on 100 years of Dow data [https://ideas.repec.org/a/bla/jfinan/v54y1999i5p1647-1691.html]. Their finding that the best rules did not hold up in the following decade is from memory; the abstract I could open does not state it. Unverified.
- Faber, "Where the Black Swans Hide" (2011): about 60–80% of both the best and the worst days occur below the 200-day average [via https://www.cxoadvisory.com/big-ideas/effects-and-prediction-of-extreme-returns]. Batnick: 46 of the 50 best and worst S&P days since 1997 were below it [https://www.theirrelevantinvestor.com/p/miss-worst-days-miss-best-days]. Below the 200-day is where both tails live.
- Siegel's 200-day test in *Stocks for the Long Run*: not retrieved. Unverified.

### The cost at lows: how late the reclaim comes (computed here, S&P closes)

| Closing low | First close above 50-day | First close above 200-day | Held 60 days? | 10-month rule back in (month-end) |
|---|---|---|---|---|
| 4 Dec 1987 | 10 days, +11.3% off the low | 126 days, +19.3% | Lost next day | Jun 1988, +22.1% |
| 11 Oct 1990 | 17 days, +6.5% | 72 days, +13.3% | Held | Jan 1991, +16.4% |
| 31 Aug 1998 | 32 days, +9.4% | 16 days, +11.4% (then the Oct retest) | Lost next day | Oct 1998, +14.8% |
| 9 Oct 2002 | 4 days, +13.5% | 112 days, +15.3% | Lost next day | Apr 2003, +18.0% |
| 9 Mar 2009 | 10 days, +21.6% | 58 days, +39.4% | Lost 22 Jun | Jun 2009, +35.9% |
| 3 Oct 2011 | 5 days, +8.7% | 18 days, +16.9% | Lost 31 Oct | Jan 2012, +19.4% |
| 11 Feb 2016 | 9 days, +6.7% | 20 days, +10.6% | Lost 15 Mar | Mar 2016, +12.6% |
| 24 Dec 2018 | 16 days, +12.1% | 33 days, +16.7% | Lost 7 Mar | Feb 2019, +18.4% |
| 23 Mar 2020 | 18 days, +28.5% | 45 days, +35.7% | Lost 11 Jun | May 2020, +36.1% |
| 12 Oct 2022 | 12 days, +9.1% | 34 days, +14.1% | Lost 5 Dec | Nov 2022, +14.1% |
| 8 Apr 2025 | 16 days, +12.5% | 23 days, +17.3% | Held | May 2025, +18.6% |

- The 200-day or 10-month re-entry cost 11–39% off the low, median about 17%. In the V-bottoms of 2009 and 2020 it cost over 35%.
- The first reclaim of the 200-day was lost again within 60 days in 9 of 11 cases. Expect at least one whipsaw.
- The 50-day reclaim came 4–32 days after the low at +6.5% to +28.5%. It is the cheaper filter and the noisier one: 2022 produced several 50-day reclaims that failed.
- What the filter bought: it kept a follower out of all 7 failed follow-through days in each of 2000–02 and 2007–09, and out of the 2022 summer rally, which stopped one point under the 200-day.

### Death cross and golden cross (computed here, 50-day below 200-day simple averages, S&P 1950–2026)

- 38 death crosses.

| After a death cross | 1 month | 3 months | 6 months | 12 months |
|---|---|---|---|---|
| Mean S&P return | −0.1% | +2.7% | +4.8% | +6.6% |
| Median | −0.2% | +2.0% | +2.6% | +10.6% |
| % positive | 47% | 58% | 55% | 71% |
| All days, for comparison | | | +4.6%, 71% | +9.4%, 75% |

- In 16 of 38 the index fell less than 5% further before the next golden cross. The cross was at or after the low in Jul 2010 (the exact low day), Mar 2020 (a week after) and Apr 2025 (four days after), and 11 days before it in Dec 2018.
- Three of the 18 since 1987 preceded large further falls: 30 Oct 2000 (−44.5% more), 21 Dec 2007 (−54.4% more), 14 Mar 2022 (−14.3% more). Those three are why the average is poor.
- A death cross that arrives when the index is already down 15–20% in a few weeks (2010, 2018, 2020, 2025) has been a late signal. One that arrives 5–10% off the high after a slow roll-over (2000, 2007) has been the dangerous kind. Sample of three; treat as a hypothesis.

### 20/21-day reclaim and "close above the 21-EMA after an undercut"

No tested study found. Unverified as a signal. To code: after a decline of 8% or more, the first close above the 21-day exponential average following a low that undercut a prior swing low; measure the forward 5/20/60-day return and the share that made a new low first.

### Verdict

- **Benefit:** the long-only trend filter roughly halves the worst drawdowns and keeps a trader out of the serial failed rallies of structural bears. Returns are about equal to buy-and-hold; risk is lower.
- **Cost:** it gives up a median of about 17% off the low, over 35% in fast V-bottoms, and whipsaws at least once on most re-entries.
- For a short-term trader the practical reading is as a regime switch: below a falling 200-day, both tails are fat, rallies fail more often, and size should be smaller. It is not an entry signal.

## B7. Credit, rates and macro as turn signals

### Credit spreads against the equity low (Part A)

| Episode | Credit peak relative to the S&P closing low |
|---|---|
| 1987 | Same day as the intraday low (TED) |
| 1990 | 2–3 months after |
| 1998 | One week after the intraday low |
| 2011 | Corporate spread one week before; bank funding stress three months after |
| 2016 | Same day |
| 2020 | Same day (high-yield 1,087bp) |
| 2022 | Three months before (July); credit did not confirm October |
| 2025 | Same day as the intraday low |

Credit peaked with or before equities in six of eight. It is a coincident confirmation, not a lead. The useful form is negative: an equity low while spreads are still making new wides (1990, 1998's first low) tended to be tested again.

### Fed pivots: how soon after did stocks bottom?

| Pivot | S&P that day | Low | Further fall after the pivot | Recession? |
|---|---|---|---|---|
| 29 Sep 1998, first cut | 1049.02 | 8 Oct 1998 (7 trading days) | −8.5% close, −12% intraday | No |
| 19 Dec 2018, last hike; "patient" on 30 Jan 2019 | 2506.96 | 24 Dec 2018 (3 trading days) | −6.2% | No |
| 3 Jan 2001, first cut | 1347.56 | 9 Oct 2002 (21 months) | −42.4% | Yes, Mar–Nov 2001 |
| 18 Sep 2007, first cut | 1519.78 | 9 Mar 2009 (18 months) | −55.5% | Yes, Dec 2007 – Jun 2009 |
| 1 Feb 1995, last hike | — | Low was already in (Apr 1994) | None | No |
| 29 Oct 1990, first cut after the invasion | — | Low was 11 Oct | None | Yes, already under way |

Sources: [FA], [FedT], [NBER], local S&P closes.

Why it worked in two and not in two (inference from the profiles and the other agents' ground):
- In 1998 and 2018 the problem was liquidity and positioning. Earnings were flat to rising, no recession followed, and the cut removed the cause.
- In 2001 and 2007 the cut was a response to a profits and credit collapse that had only begun. Earnings fell for two years and valuations or balance sheets had to reset. The cut did not remove the cause.
- A rule to test: a pivot is bullish within weeks when earnings estimates are not falling and credit spreads stop widening; it is not when a recession is starting.

### Lows against the business cycle [NBER; local S&P lows]

| Market low | Recession end | Lead |
|---|---|---|
| May 1970 | Nov 1970 | 6 months |
| Oct 1974 | Mar 1975 | 5 months |
| Aug 1982 | Nov 1982 | 3 months |
| Oct 1990 | Mar 1991 | 5 months |
| Oct 2002 | Nov 2001 | Low came 11 months **after** |
| Mar 2009 | Jun 2009 | 3 months |
| Mar 2020 | Apr 2020 | 1 month |

Six of seven lows came 1–6 months before the recession ended, when earnings and jobs data were still getting worse. Earnings troughed after the price low in 1990–91, 2009, 2020 and 2022–23 (Part A).

### Not verified

Two-year yield turning, ISM lows, jobless-claims peaks and earnings-revision breadth troughs as timing tools: no source retrieved. The local files `fred_DGS2.csv` and `fred_ICSA.csv` are there to test them. Unverified.

## B8. Leadership at lows

### Two views

**O'Neil / IBD (practitioner).** The first stocks to break out of sound bases to new highs in the weeks after a follow-through day tend to be the new leaders, and their relative-strength lines often reach new highs before price does. Source: O'Neil, *How to Make Money in Stocks*; I could not open an IBD page. No independent test found. The one related test is negative: the share of NYSE stocks at 52-week highs on the signal day did not separate successful from failed signals (2.1% against 2.0%), and "leadership may emerge later" [QE].

**Daniel & Moskowitz, "Momentum Crashes" (NBER w20439; JFE 2016), read from the paper** [https://www.nber.org/papers/w20439]:
- Momentum's worst losses come in "panic states, following market declines and when market volatility is high, and are contemporaneous with market rebounds".
- July–August 1932: the market rose 82%; past winners rose 32%; past losers rose 232%.
- March–May 2009: the market rose 26%; past winners rose 8%; past losers rose 163%. Three of the ten worst momentum months since 1927 are from 2009.
- The crash is on the short side: "the losers are crashing up".
- In bear markets (past two-year market return negative) the momentum portfolio's up-market beta is −1.51 against a down-market beta of −0.70. Losers behave like call options on the market.
- At the start of March 2009 the loser decile was down 84% from its peak on average (Citigroup, Bank of America, Ford, GM); the winner decile was defensives.

### What Part A shows

| Low | First 6–10 weeks | 6–12 months |
|---|---|---|
| Feb 2016 | Most beaten-down: miners +73%, E&P +50%, energy +26% | Banks +72%, semis +58% caught up; miners kept leading |
| Mar 2020 | Mixed: Tesla +119%, energy +99%, homebuilders +85%, ARKK +71% | Growth and semis; energy faded to +68% |
| Oct 2022 | Semis +46%, homebuilders +36%, international +30% | Nvidia +331%, Meta +178%; energy +10% |
| Apr 2025 | Prior leaders: Broadcom +73%, Palantir +69%, Nvidia +64%, semis +55% | Same |
| Oct 1998 | Internet and large-cap tech | Same |

### Reading both together

- After a **deep, long bear with a credit or solvency element** (1932, 2009, to a degree 2016 and March 2020), the hardest-hit, most levered groups rally most in the first weeks. Relative-strength leaders lag badly, and a momentum screen run in the first month is a list of defensives.
- After a **short event shock inside an intact bull** (1998, 2018, 2025), the prior leaders resume. There was no long loser list to rebound.
- The lists converge after roughly two to three months: stocks breaking to new highs by then (semis and banks in 2016, Nvidia and Meta in 2023) were the durable leaders, which is O'Neil's claim on a slower clock.
- For the first weeks off a low: the beaten-down trade is a short, violent, high-beta trade; the new-high leaders are the position trade that appears later. Inference, not tested here.

### Do prior leaders lead the next bull?

No study retrieved. Unverified as a general rule. From Part A: leadership changed after the recession bears the other agents cover and after 2022 (energy led 2022 and lagged afterwards), and did not change after 1998, 2020 or 2025. The pattern fits "leadership changes when the decline was caused by the leaders' own excess or by a regime change in rates, not when it was an outside shock".

## B9. News reaction as a signal

**Earnings-reaction asymmetry (FactSet).** FactSet measures the average price change from two days before an earnings report to two days after, split by positive and negative surprises, against a five-year average. Latest reading, 13 Nov 2026 (Q3 2026, 91% reported): positive surprises +1.1% against a five-year average of +0.9%; negative surprises −1.1% against −3.1%. The seven largest stocks were the exception: −0.2% on beats and −7.8% on misses [https://insight.factset.com/market-is-punishing-negative-eps-surprises-less-than-average-for-sp-500-companies-for-q3]. I found no study testing this asymmetry as a market-timing signal. Unverified as a tool.

**"Stops falling on bad news" in Part A.** These are observations, not a tested rule.

| Date | News | Reaction |
|---|---|---|
| 13 Oct 2022 | CPI hotter than expected | Opened at a new low, closed +2.6%: the intraday low of the bear |
| 4 Oct 2011 | Euro-crisis headlines | Undercut the August low, closed +2.3% |
| 8 Oct 1998 | Yen spike, small caps at new lows | S&P held its 31 Aug close |
| 11 Feb 2016 | Oil at $26, bank fears | Low on fewer new lows |

**"Good news sold" in Part A.**

| Date | News | Reaction |
|---|---|---|
| 29 Sep 1998 | First Fed cut | −3.1% and −3.0% the next two days; the low was 7 days later |
| 21 Sep 2011 | Operation Twist | −2.9% and −3.2%; the low was 8 days later |
| 8 Apr 2025 | Gap up on tariff-talk hopes | Reversed to −1.6%; closing low that day |
| 16 Aug 2022 | Soft CPI rally reaches the 200-day | Failed; −17% to October |

- In three of the four, good news being sold came within two weeks **before** the final low. It was a sign of exhaustion near the end as often as a sign of more downside.
- The bad-news reversal day was the low or within a day of it in all four, but each is selected with hindsight. Many reversal days fail; a count needs a coded definition (new 20-day low intraday, close in the top quarter of the range and above the prior close) run on the daily data.

**Reliability.** Low as a stand-alone rule; no base rate found. It is best used as a tie-breaker when the gauges in B5 already say "zone".

## B10. Chart analogs and overlays

### The famous failure

- In late 2013 and early 2014 a chart overlaying the Dow of 1928–29 on 2012–14 circulated widely; a MarketWatch story of 11 Feb 2014 was titled "Scary 1929 market chart gains traction" (title via The Reformed Broker; MarketWatch itself could not be fetched). Tom DeMark was among those comparing the market to 1929 [https://thereformedbroker.com/2014/01/29/games-people-play-that-1929-analogy/]. No crash followed.
- The scaling trick: the two lines were drawn on different axes. Jon Krinsky's normalised version showed the Dow up over 230% from 1925 to 1929 against 156% from the 2009 low to the 2013 high; on a common percentage scale the paths look quite different [same post].
- Shiller's *Irrational Exuberance* notes the Wall Street Journal ran a 1920s overlay on the morning of the 1987 crash; similar charts circulated in 2009 and 2010 [https://thereformedbroker.com/2014/02/13/the-chart-that-wouldnt-die/].
- 2008 overlays posted in 2011, 2016, 2018 and 2022: I could not source the individual charts. The outcomes are in Part A: none of those declines became 2008. Unverified as to who posted what.

### Why a high correlation over 40 days says little about day 41

Three reasons, then a test.
1. **Search bias.** With about 19,000 historical windows to choose from, a close match always exists. The match measures how hard you looked.
2. **Trending series correlate by construction.** Two unrelated random walks routinely show high correlation in levels (the "spurious regression" problem of Granger and Newbold, 1974; cited from memory, not fetched).
3. **Free parameters.** Start date, window length, axis scale and time-stretch are all chosen after seeing the data.

**Test on the S&P 500 (computed here).** For each of about 1,430 target dates from 1970 to 2026 (every tenth trading day), take the last W days of the log-price path, find the best-correlated W-day path in all earlier history (at least 250 days earlier), and compare what happened next.

| Window W, horizon H | Median correlation of the best match | Analog and target moved the same way | Simply saying "up" was right | Correlation of analog's next move with the target's |
|---|---|---|---|---|
| 40 days, next 20 | 0.92 | 54% | 61% | +0.07 |
| 60 days, next 20 | 0.91 | 53% | 61% | −0.01 |
| 60 days, next 60 | 0.91 | 54% | 67% | −0.02 |
| 120 days, next 60 | 0.90 | 57% | 67% | +0.03 |

- The best historical match correlates about 0.9 with the present path almost every time.
- Its next move predicted the direction of the target's next move 53–57% of the time, **worse than always saying "up"**.
- Matches above 0.95 did no better (54–59%).
- Averaging the ten best matches did not help (correlations of −0.01 to +0.03).
- Caveat: this is one simple matcher on one index. It does not test volume, breadth or macro conditioning.

Academic context: Lo, Mamaysky & Wang (2000) found that some algorithmically defined chart patterns in US stocks, 1962–96, "do provide incremental information", meaning the return distribution after a pattern differs from the unconditional one. That is a statement about distributions, not a forecast of the path [https://www.nber.org/papers/w7613].

### When analog thinking is useful

- As a **scenario library**: Part A is one. It answers "what sequences have happened", "what did the low look like in each type", "what is the range of outcomes from −12%".
- As a **conditional base rate** built on causes, not shapes: declines during hiking with rising earnings (1994, 2004, 2006) against declines with a credit event (1998, 2011, 2020) against earnings recessions.
- As a **checklist of what would have to be true**: for "this is 2022" the Fed must keep tightening into falling earnings estimates; for "this is 1998" a policy pivot must be available.
- Never as a path forecast with dates.

## B11. Intraday and short-horizon behaviour in declines

Compiled by a helper agent; its full table of sources is kept here in short form. Numbers for Gao et al. are from the December 2015 working paper.

### Overnight versus intraday

| Source | Finding |
|---|---|
| NY Fed, "The Overnight Drift" (2021; RFS 2023) | 1998–2019: the full overnight session earned 2.6% of a 4.3% annual close-to-close return. After the heaviest sell-imbalance closes, overnight returns were strongest (+7.6% annualised in Asian hours, +12.4% in European hours). Unconditionally, returns are negative from before the open to about noon and positive only in the last 75 minutes [https://libertystreeteconomics.newyorkfed.org/2021/05/the-overnight-drift-in-us-equity-returns]. |
| NY Fed, "The Disappearing Overnight Drift" (Jul 2026) | The drift was about 3.7% a year in 1998–2020 and close to zero in 2021–25 [https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/]. |
| Lou, Polk & Skouras (2026 working paper) | The 2008 crisis was primarily an intraday decline; in COVID the overnight leg moved sharply [https://personal.lse.ac.uk/POLK/research/LPS_ClientelePerspectiveOnEquityPremium_20260603.pdf]. |
| Bondarenko & Muravyev (JFQA 2023) | The four hours around the European open account for the whole average E-mini return; stronger in the 2020 crisis [https://ideas.repec.org/a/cup/jfinqa/v58y2023i3p939-967_1.html]. |
| Lachance (J. Fin. Markets 2021) | Spread and imbalance effects inflate measured ETF overnight returns by over 6% a year; part of the "premium" cannot be captured [https://ideas.repec.org/a/eee/finmar/v52y2021ics138641812030032x.html]. |
| Kelly & Clark (2011) | QQQ 1999–2006: close-to-open +23.7% a year, open-to-close −23.3% [https://ideas.repec.org/a/pal/assmgt/v12y2011i2d10.1057_jam.2011.2.html]. |
| Bespoke via Bloomberg | SPY 1993–2019: overnight over +670%, intraday about −11% [https://www.bnnbloomberg.ca/for-monster-gains-with-world-s-largest-etf-trade-it-after-hours-1.1292620]. |
| Elm Wealth (2022) | Index-level effect has a t-statistic of only 2–3, has waned for a decade and reversed in early 2020 [https://elmwealth.com/?p=5383]. |

SPY in the 2025 decline (calc from local bars): 20 Feb – 8 Apr 2025, overnight −9.7%, intraday −10.3%; 5 of 8 gap-ups over 0.3% closed below the open. In the rebound to 30 Jun, overnight +4.8%, intraday +18.7%. Overnight holding gave no shelter in the decline, and the rebound came in the day session. One episode.

A per-bear table for 2008, 2020 and 2022 was not found. Cliff, Cooper & Gulen's numbers were not retrieved (SSRN 1004081 returned 403).

### Gap-ups sold, last-hour selling, the Smart Money Index

The index subtracts the first half-hour move and adds the last hour's. It dates from a 1988 Barron's piece and was popularised by Don Hays [https://ritholtz.com/2015/09/recalling-the-smart-money-index]. No published statistical test was found. SentimenTrader calls its record mixed: it peaked 3.5 years before the 2007 top, and over a quarter of S&P volume now trades in the last half hour, which undermines the premise [https://sentimentrader.com/blog/smart-money-index-everything-you-should-know/]. Verdict: lore.

### Intraday momentum

**Gao, Han, Li & Zhou (JFE 2018), SPY 1993–2013** [https://econpapers.repec.org/RePEc:eee:jfinec:v:129:y:2018:i:2:p:394-414]. The first half-hour return (from the prior close) predicts the last half-hour return.

| Condition | R² for the last half hour |
|---|---|
| First half hour alone | 1.6% |
| Plus the second-to-last half hour | 2.6% |
| Dec 2007 – Jun 2009 | 4.1% alone; 6.9% combined |
| Excluding the crisis | 0.8%; 1.1% |
| First-half-hour volatility low / mid / high | 0.6% / 1.0% / 3.3% |
| Expansions against recessions (combined) | 1.0% against 6.6% |

Trading the last half hour on the sign of the first earned 6.67% a year (Sharpe 1.08) against −1.11% for always-long; in recessions 16.79% (Sharpe 2.10). Much of the effect comes from the crisis.

**Baltussen, Da, Lammers & Martens (JFE 2021)**, over 60 futures, 1974–2020: the return from the prior close to 30 minutes before the close predicts the last 30 minutes and then **reverts over the following days**. The effect appears when dealer net gamma is negative and scales with leveraged-ETF size [https://academicweb.nd.edu/~zda/intramom.pdf].

**Zarattini, Aziz & Barbon (2024)**, SPY 2007–24, an intraday breakout backtest: 19.6% a year, Sharpe 1.33, hit rate about 43%. Sharpe about 3.5 when VIX opens above 40. Short trades showed no extra edge at high VIX [https://alexandria.unisg.ch/server/api/core/bitstreams/a99aba00-f967-49b3-aceb-f544dc386e0b/content]. A backtest by a trading educator; a hypothesis.

### Big days cluster

- J.P. Morgan Guide to Retirement 2024: 7 of the 10 best S&P days fell within two weeks of the 10 worst [https://401kspecialistmag.com/folly-of-timing-the-market-explained-in-jpmams-2024-guide-to-retirement/].
- Hartford Funds / Ned Davis: 42% of the best days from 2003 to March 2025 came in bear markets and another 36% in the first two months of a bull [https://www.hartfordfunds.com/practice-management/client-conversations/managing-volatility/bear-markets.html].
- See also Faber and Batnick in B6.

### Turnaround Tuesday

- Schaeffer's, S&P since 2010: after a Monday drop of 1.5% or more, Tuesday averaged +0.9% and was up just over 70% of the time [https://schaeffersresearch.com/content/analysis/2021/09/22/is-turnaround-thursday-a-real-thing]. Count not stated.
- Abraham & Ikenberry (JFQA 1994): after a negative Friday, Monday is negative nearly 80% of the time [https://ideas.repec.org/a/cup/jfinqa/v29y1994i02p263-277_00.html].
- No bear-market-only test found. Small, unstable, practitioner-grade.

### Dealer gamma, expiry, leveraged ETFs, 0DTE

- Negative dealer gamma goes with intraday momentum, positive with reversal [Barbon & Buraschi, https://abarbon.com/papers/gamma-fragility; Baltussen et al.]. Hedge rebalancing raises the chance of large moves [Ni, Pearson, Poteshman & White, RFS 2021, https://ideas.repec.org/a/oup/rfinst/v34y2021i4p1952-1986..html].
- **Leveraged-ETF rebalance demand = (L² − L) × assets × index return**, always in the direction of the day's move, done near the close. Multiplier 2 for a 2× or −1× fund, 6 for 3× or −2×, 12 for −3×. A $10bn 3× fund on a −4% day sells about $2.4bn.
- Tuzun (Fed FEDS 2013-48): a 1% index move generated $1.04bn of rebalancing, done in the last hour, adding 22.7bp of daily volatility in the average large cap [https://www.federalreserve.gov/pubs/feds/2013/201348/201348pap.pdf]. Shum et al. (2016): the end-of-day effect is largest on the most volatile days [https://ideas.repec.org/a/oup/revfin/v20y2016i6p2379-2409..html].

| Date | Estimated leveraged-ETF selling into the close | Source |
|---|---|---|
| 13 Sep 2022 | $15.5bn (Nomura) | https://www.bloomberg.com/news/articles/2022-09-14/leveraged-etfs-added-to-stock-chaos-with-15-5-billion-selling |
| 3 Sep 2024 | About $15bn (JPMorgan); assets a record $117bn | https://www.investmentnews.com/etfs/juiced-up-etfs-blamed-for-market-volatility/257139 |
| 3 Apr 2025 | Over $20bn; about $5bn per 1% decline (JPMorgan) | https://news.bloomberglaw.com/capital-markets/jpmorgan-says-levered-etfs-set-to-sell-billions-into-stock-close |
| 5 Nov 2026 | $56.4bn (Barclays), about 3.1% of cash turnover; dealer negative gamma about $7bn per 1% (Nomura) | https://www.home.saxo/en-gb/content/articles/equities/who-moves-markets---inside-the-mechanics-of-a-sell-off-11112026 (single source) |

- 0DTE options: Cboe finds balanced flow and hedging of at most about 0.2% of S&P liquidity, even in April 2025 [https://www.cboe.com/insights/posts/0-dt-es-decoded-positioning-trends-and-market-impact]. Cboe is an interested party. Adams et al. find index volatility lower on 0DTE days [via https://quantpedia.com/do-sp500-0dtes-options-increase-market-volatility/]. Brogaard, Han & Won reportedly find the opposite (unverified). Mixed; the better-identified work leans towards dampening on average.

### Daily reversal at high volatility

Nagel, "Evaporating Liquidity" (RFS 2012): returns to short-term reversal strategies are highly predictable with VIX and rose enormously in 2007–09 [https://www.nber.org/papers/w17653]. It is a cross-sectional stock result. LeBaron (1992) relates serial correlation to volatility; the direction is unverified.

### What this implies for intraday style in high-volatility declines (inference)

- **Trend days both ways.** Intraday momentum is strongest in high-volatility and recession regimes, and the mechanical flows (negative gamma, leveraged-ETF rebalancing now in the tens of billions) push with the day's direction into the close. That favours with-trend trades from the first half hour held into the last half hour, over fading afternoon extremes.
- **The same mechanics cut upward.** The best days sit beside the worst, mostly below the 200-day. A fixed short bias is as exposed as dip-buying.
- **Failed gaps.** Evidence that gap-ups get sold is thin: the unconditional morning weakness plus a 5-of-8 count in one decline. A tactic that needs confirmation on the day.
- **Overnight longs.** The overnight premium was conditionally strongest after heavy-selling closes through 2020, but it has been flat since 2021 and gave no shelter in 2008 or in February–April 2025. An overnight long after a liquidation close is a reversal bet with gap risk.
- **Within the day momentum, across days reversal.** The last-half-hour move tends to revert over the following days, and reversal pays most at high VIX.
- **2× and 3× ETFs.** Daily reset buys highs and sells lows, so alternating big days erode multi-day holds. This argues for intraday or very short holds in these products during whipsaw. (The usual drag formula was not sourced.)

## B12. Leverage-cycle gauges and where to get them free

| Gauge | URL | History | Lag | At peaks and lows | As a timing tool |
|---|---|---|---|---|---|
| FINRA margin debt | Page https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics · file https://www.finra.org/sites/default/files/2021-03/margin-statistics.xlsx | Monthly from Jan 1997 | About three weeks | Table below | Growth above 50–80% a year marked 2000, 2007 and 2021, months early or late. Declines confirm; they do not lead. |
| Broker-dealer margin loans (Fed Z.1) | https://fred.stlouisfed.org/series/BOGZ1FL663067003Q | Quarterly from 1945 | About ten weeks | 2007-Q2 $299bn → 2009-Q1 $120bn; 2021-Q4 $518bn → 2022-Q4 $382bn; 2026-Q2 $742bn | Slow cross-check |
| OFR Hedge Fund Monitor | https://www.financialresearch.gov/hedge-fund-monitor/ · API https://data.financialresearch.gov/hf/v1 | Quarterly from 2013 | About two quarters | Equity-strategy leverage 1.65 (2016-Q2 low), 3.30 (2025-Q2 high), 2.73 (2026-Q2) | Structural; no timing evidence |
| Fed Financial Stability Report | https://www.federalreserve.gov/publications/financial-stability-report.htm | Twice a year | Two quarters on fund data | Nov 2026: hedge-fund leverage at its highest since 2013 | Vulnerability, not a forecast |
| Fed dealer survey (SCOOS) | https://www.federalreserve.gov/data/scoos.htm | Quarterly from 2010 | A quarter | Sep 2026: most dealers put hedge-fund leverage above its 10-year midpoint | Qualitative |
| NAAIM Exposure Index | https://naaim.org/programs/naaim-exposure-index/ | Weekly | Public page delayed three months since Aug 2026 | Low readings at 2020, 2022, 2025 lows (levels unverified) | Positioning, not direction |
| AAII survey | https://www.aaii.com/sentimentsurvey · file https://www.aaii.com/files/surveys/sentiment.xls | Weekly from Jul 1987 | Thursday | See B5 | Zone marker; failed through 2008 |
| Cboe put/call | https://www.cboe.com/us/options/market_statistics/historical_data/ | Total from 1995; equity and index from 2003; CSV archive ends Oct 2019 | Daily | Not assessed | Not assessed |
| ICI fund flows | https://www.ici.org/research/stats/flows | Weekly | One week | Week to 11 Nov 2026: equity mutual funds −$8.2bn, equity including ETFs +$37.0bn | Flows chase and reverse |
| CFTC positioning (TFF) | https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm | From Jun 2006 | Friday for Tuesday | Not assessed | Not assessed |
| Leveraged-ETF assets | No free aggregate series found | — | — | Record $117bn in Sep 2024; later figures unverified | Sizes the closing flow through the formula in B11 |
| Investors Intelligence | https://www.investorsintelligence.com/x/us_advisors_sentiment.html | Subscription | — | Unverified | — |

**FINRA margin debt (computed by a helper from the FINRA file)**

| Peak month | Level | Year-on-year at peak | Trough | Decline |
|---|---|---|---|---|
| Mar 2000 | $300bn | +80.5% | Sep 2002, $136bn | −54.6% |
| Jul 2007 | $416bn | +62.6% | Feb 2009, $200bn | −52.1% |
| Dec 2019 | $579bn | — | Mar 2020, $479bn | −17.3% |
| Oct 2021 | $936bn | +41.9% (maximum +71.6% in Mar 2021) | Dec 2022, $607bn | −35.2% |
| Jan 2025 | $937bn | +33.5% | Apr 2025, $851bn | −9.2% |
| Jun 2026 | $1,502bn (record) | +49.0% (maximum +53.7% in May 2026) | Oct 2026: $1,448bn | −3.6% so far |

- Year-on-year change at the lows: −47.1% (Feb 2009), −33.3% (Dec 2022), −16.5% (Mar 2020), +9.7% (Apr 2025).
- Bear-market lows came after margin debt had fallen 35–55%; event-shock lows after 9–17%.
- As of October 2026, margin debt is 3.6% off a record and growth peaked above 50% in May. Leverage has only begun to contract.

**OFR API series confirmed by live query:** `FPF-STRATEGY_EQUITY_LEVERAGERATIO_GAVWMEAN`, `FPF-ALLQHF_GAVN10_LEVERAGERATIO_AVERAGE`, `FPF-BORROW_PRIMEBROKER_SUM`, `FPF-BORROW_REPO_SUM`, `FPF-STRATEGY_EQUITY_BORROWING_SUM`, `FICC-SPONSORED_REPO_VOL`, `SCOOS-NET_HF_LEVERAGEUSE`. Endpoint pattern `/series/timeseries?mnemonic=` [https://www.financialresearch.gov/hedge-fund-monitor/api/]. `FPF-ALLQHF_LEVERAGERATIO_GAVWMEAN` returns an error; do not use it.

Pre-1997 NYSE margin debt: no live official host found; Yardeni has charts only [https://yardeni.com/charts/margin-debt/].

## B13. Seasonality and the midterm year

### Midterm years (computed here, S&P closes, 1950–2022, 19 midterm years)

| Statistic | Midterm years | Other years |
|---|---|---|
| Average peak-to-trough fall within the calendar year | −17.5% (median −16.6%) | −12.4% (median −9.9%) |
| Return from the year's closing low to 252 trading days later | +31.5% average; lowest +12.8% (1978); 19 of 19 positive | +21.5% average; lowest −26.9%; n = 56 |
| Month of the year's closing low | October 5 (1966, 1974, 1990, 2002, 2022); January 5; June 2; one each in Feb, Mar, Apr, May, Jul, Aug, Dec | January 27 of 56 |
| Following (pre-election) calendar year, price return | +17.2% average; 17 of 19 positive (flat in 2011 and 2015) | — |

Per-year detail: 1962 −26.4% (low 26 Jun), 1966 −22.2% (7 Oct), 1970 −25.9% (26 May), 1974 −37.6% (3 Oct), 1982 −16.6% (12 Aug), 1990 −19.9% (11 Oct), 1994 −8.9% (4 Apr), 1998 −19.3% (year low 9 Jan; the autumn low was higher), 2002 −33.8% (9 Oct), 2006 −7.7% (13 Jun), 2010 −16.0% (2 Jul), 2014 −7.4% (3 Feb), 2018 −19.8% (24 Dec), 2022 −25.4% (12 Oct).

- The well-known claim checks out: midterm years have deeper intra-year falls (about 17% against 12%) and the 12 months after the midterm-year low have been strong (about +31%).
- **Two cautions.** The "+31% from the low" is measured from a point known only afterwards; any year's low is followed by a gain on average (+21.5% in other years). The honest midterm premium is about 10 points, on 19 observations. And the low has come in every month from January to December; October is the mode at 5 of 19.
- **2026 so far (local data to 20 Nov):** year's closing low 6343.72 on 30 Mar; record close 7818.93 on 6 Oct; 6910.39 on 20 Nov, −11.6% from the record, which is now the year's largest fall. The year's low has not been broken.

### Month of major lows

October lows in this report: 1957, 1966, 1974, 1987 (crash low), 1990, 1998 (intraday), 2002, 2011, 2022. Other major lows: Dec 1987 (close), Aug 1982, Mar 2009, Feb 2016, Dec 2018, Mar 2020, Apr 2025, May 1970, Jun 1962. The Stock Trader's Almanac "October is the bear killer" claim fits about half of the list. Its exact count was not retrieved. Unverified.

### Present context, for the reader of this file

- SentimenTrader's blog on 17–20 Nov 2026 carries the titles "Half the Nasdaq 100 Is in a Bear Market", "High-beta leadership is over" and "Inflation rears its ugly head" [https://sentimentrader.com/blog]. Titles only; not read.
- FactSet, 9 Nov 2026: "Lowest forward 12-month P/E ratio for the S&P 500 in more than 3 years"; 4 Nov 2026: analysts raising quarterly EPS estimates for a third straight quarter [https://insight.factset.com/topic/earnings]. Titles only.
- Local data: VIX closed 28.44 on 19 Nov 2026 and above three-month VIX (27.03).

---

# Could not verify

| Item | Why |
|---|---|
| Goldman's bear-rally table and "conditions for a trough" | Goldman pages and PDF returned 403. Figures are from search summaries of Goldman and Bloomberg pages. |
| Bank of America "43 rallies, 17.2%, 39 days" | Search snippet only. |
| Ned Davis, Bespoke or SentimenTrader counts of retests and V-bottoms | None found that I could open. The table in B1 is my own calculation. |
| IBD's own follow-through-day definition page, its 70–80% claim in its own words, and IBD's official counts of failed signals in 2000–02, 2008, 2018, 2022 | Not opened. Counts in B2 are my coded approximation. |
| Full Zweig Breadth Thrust date list and forward-return table | SentimenTrader's tables are images. Dates confirmed: January 2019, 31 Mar 2023, 24 Apr 2025. Nov 2023 day unverified. 2002–03, Mar 2009, Oct 2011, 2016 unverified. |
| Whaley's paper (definitions, signal list, returns) | Behind the CMT member wall; thresholds from a third-party script. |
| Desmond's paper | Read through secondary summaries only. |
| deGraaf thrust, Coppock curve, Investors Intelligence selling climax | Definitions from the brief or from memory; no source opened. |
| New-low counts for 2002, 2008–09, 2020, 2022 | Not retrieved. Only 2016 is sourced. |
| High-yield OAS peaks for 2011, 2016, 2022 | FRED serves three years only. Baa spread used instead. |
| Insider buying, ISM, jobless claims, two-year yield, earnings-revision breadth as timing tools | No source retrieved. |
| VVIX and "VIX spike then close below X" rules | No tested study retrieved. |
| 21-EMA reclaim after an undercut | No evidence found. |
| Evidence that prior leaders rarely lead the next bull | No study retrieved; Part A tally only. |
| Who posted the 2008 overlays in 2011, 2016, 2018, 2022; the MarketWatch 1929 story text | MarketWatch not fetchable. |
| Siegel's 200-day results; Sullivan–Timmermann–White out-of-sample result; Granger–Newbold | Cited from memory. |
| Cliff–Cooper–Gulen numbers; Brogaard–Han–Won; Cheng–Madhavan original; LeBaron direction | Not retrieved. |
| NAAIM readings at lows; leveraged-ETF assets after Sep 2024; pre-1997 margin debt source | Not retrieved. |
| Powell's 4 Jan 2019 remarks; Sept 1987 discount-rate rise in a primary source; Apr 2025 basis-trade unwind | Not checked against a primary source. |
| 5 Nov 2026 Nasdaq-100 fall and Barclays/Nomura flow figures | Single source (Saxo). |

# Source list

**Fed, official and academic**
- Carlson, "A Brief History of the 1987 Stock Market Crash", FEDS 2007-13: https://www.federalreserve.gov/pubs/feds/2007/200713/200713pap.pdf
- Federal Reserve History: https://www.federalreservehistory.org/essays/stock-market-crash-of-1987 · https://www.federalreservehistory.org/essays/ltcm-near-failure · https://www.federalreservehistory.org/essays/savings-and-loan-crisis
- Fed open-market tables: https://www.federalreserve.gov/monetarypolicy/openmarket.htm · https://www.federalreserve.gov/monetarypolicy/openmarket_archive.htm
- Fed press releases and speeches cited inline (1994, 1998, 2011, 2015, 2016, 2019, 2020, 2022, 2023, 2025)
- Fed note on the 2020 corporate bond market: https://www.federalreserve.gov/econres/notes/feds-notes/the-corporate-bond-market-crises-and-the-government-response-20201007.htm
- Tuzun, FEDS 2013-48: https://www.federalreserve.gov/pubs/feds/2013/201348/201348pap.pdf
- Fed Financial Stability Report: https://www.federalreserve.gov/publications/financial-stability-report.htm
- NY Fed Liberty Street: https://libertystreeteconomics.newyorkfed.org/2021/05/the-overnight-drift-in-us-equity-returns · https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/
- FRBSF 1997 letter on the 1987 crash: https://www.frbsf.org/research-and-insights/publications/economic-letter/1997/10/the-october-87-crash-ten-years-later/
- SEC staff note on 24 Aug 2015: https://www.sec.gov/marketstructure/research/equity_market_volatility.pdf
- NBER business-cycle dates: https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions
- Daniel & Moskowitz, "Momentum Crashes": https://www.nber.org/papers/w20439
- Moreira & Muir, "Volatility Managed Portfolios": https://www.nber.org/papers/w22208
- Lo, Mamaysky & Wang, "Foundations of Technical Analysis": https://www.nber.org/papers/w7613
- Nagel, "Evaporating Liquidity": https://www.nber.org/papers/w17653
- Johnson, "Risk Premia and the VIX Term Structure": https://ideas.repec.org/a/cup/jfinqa/v52y2017i06p2461-2490_00.html
- Simon & Wiggins, "S&P futures returns and contrary sentiment indicators": https://ideas.repec.org/a/wly/jfutmk/v21y2001i5p447-462.html
- Pan & Poteshman, "The Information in Option Volume": https://ideas.repec.org/a/oup/rfinst/v19y2006i3p871-908.html
- Seyhun, "The Information Content of Aggregate Insider Trading": https://ideas.repec.org/a/ucp/jnlbus/v61y1988i1p1-24.html
- Brock, Lakonishok & LeBaron: https://ideas.repec.org/a/bla/jfinan/v47y1992i5p1731-64.html
- Sullivan, Timmermann & White: https://ideas.repec.org/a/bla/jfinan/v54y1999i5p1647-1691.html
- Ben-Rephael, Kandel & Wohl: https://ideas.repec.org/a/eee/jfinec/v104y2012i2p363-382.html
- Gao, Han, Li & Zhou: https://econpapers.repec.org/RePEc:eee:jfinec:v:129:y:2018:i:2:p:394-414
- Baltussen, Da, Lammers & Martens: https://academicweb.nd.edu/~zda/intramom.pdf
- Bondarenko & Muravyev: https://ideas.repec.org/a/cup/jfinqa/v58y2023i3p939-967_1.html
- Lachance: https://ideas.repec.org/a/eee/finmar/v52y2021ics138641812030032x.html
- Kelly & Clark: https://ideas.repec.org/a/pal/assmgt/v12y2011i2d10.1057_jam.2011.2.html
- Lou, Polk & Skouras (2026): https://personal.lse.ac.uk/POLK/research/LPS_ClientelePerspectiveOnEquityPremium_20260603.pdf
- Ni, Pearson, Poteshman & White: https://ideas.repec.org/a/oup/rfinst/v34y2021i4p1952-1986..html
- Shum et al.: https://ideas.repec.org/a/oup/revfin/v20y2016i6p2379-2409..html
- Abraham & Ikenberry: https://ideas.repec.org/a/cup/jfinqa/v29y1994i02p263-277_00.html
- Barbon & Buraschi, "Gamma Fragility": https://abarbon.com/papers/gamma-fragility
- Zarattini, Aziz & Barbon: https://alexandria.unisg.ch/server/api/core/bitstreams/a99aba00-f967-49b3-aceb-f544dc386e0b/content

**Data**
- Yahoo Finance history, FRED series (SP500, VIXCLS, NASDAQCOM, BAA10Y, TEDRATE, DGS10, BAMLH0A0HYM2, BOGZ1FL663067003Q), as tagged
- Cboe: https://www.cboe.com/us/options/market_statistics/historical_data/
- FINRA margin statistics: https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics
- OFR Hedge Fund Monitor: https://www.financialresearch.gov/hedge-fund-monitor/
- AAII: https://www.aaii.com/sentimentsurvey · https://www.aaii.com/journal/article/is-the-aaii-sentiment-survey-a-contrarian-indicator
- NAAIM: https://naaim.org/programs/naaim-exposure-index/
- ICI: https://www.ici.org/research/stats/flows
- CFTC: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm
- S&P EPS: https://dqydj.com/sp-500-earnings-per-share/
- FactSet Earnings Insight: https://insight.factset.com/topic/earnings and the PDFs cited inline
- BLS CPI release, 10 Nov 2022: https://www.bls.gov/news.release/archives/cpi_11102022.htm

**Practitioner research**
- Walter Deemer, breakaway momentum: https://www.walterdeemer.com/bam.htm
- Quantifiable Edges (Rob Hanna), follow-through-day series: https://quantifiableedges.blogspot.com/search/label/IBD%20Follow%20Through%20Day · http://quantifiableedges.blogspot.com/2008/01/ibd-follow-through-days-pt-1-are-they.html · https://quantifiableedges.blogspot.com/2008/01/follow-through-days-pt-3-do-they-miss.html · https://quantifiableedges.blogspot.com/2008/02/follow-through-days-better-after-small.html
- SentimenTrader: https://sentimentrader.com/blog/the-holy-grail-of-breadth-thrusts-has-triggered · https://sentimentrader.com/blog/a-cluster-of-breadth-thrust-buy-signals-bodes-well-for-stocks · https://sentimentrader.com/blog/here-come-the-breadth-thrust-buy-signals · https://sentimentrader.com/blog/a-historic-3-day-buying-thrust-is-changing-sentiment/ · https://sentimentrader.com/blog/breadth-flush-pt-2-new-lows · https://sentimentrader.com/blog/smart-money-index-everything-you-should-know/ · https://sentimentrader.com/blog/the-fear-gauge-triggered-a-buy-signal-for-stocks--16-11-2026
- Meb Faber, "A Quantitative Approach to Tactical Asset Allocation": https://mebfaber.com/wp-content/uploads/2016/05/SSRN-id962461.pdf · https://mebfaber.com/timing-model/
- Carson Group (Detrick) via Yahoo Finance: https://finance.yahoo.com/news/corrections-usually-dont-amount-to-much-chart-of-the-week-100044475.html
- Yardeni on the April 2025 thrust: https://www.investing.com/analysis/sp-500-breadth-thrust-signals-a-new-bullish-phase-as-death-cross-fears-fade-200660022
- Goldman Sachs (not opened; 403): https://www.goldmansachs.com/insights/articles/are-bear-markets-in-stocks-an-investment-opportunity · https://www.goldmansachs.com/intelligence/pages/gs-research/bear-repair-the-bumpy-road-to-recovery/report.pdf
- The Dow Theory capitulation report (audit of Lowry signals): https://thedowtheory.com/portal/special-reports/capitulation-the-ultimate-bear-market-low-indicator/
- The Reformed Broker on the 1929 overlay: https://thereformedbroker.com/2014/01/29/games-people-play-that-1929-analogy/ · https://thereformedbroker.com/2014/02/13/the-chart-that-wouldnt-die/ · other posts cited inline
- StockCharts (Arthur Hill), 2016 thrust: https://articles.stockcharts.com/article/articles-arthurhill-2016-03-market-environment-turns---october-vs-february---breadth-thrust-triggers/
- Global Financial Data, near-bear markets: https://globalfinancialdata.com/why-20-five-bear-markets-that-almost-occurred
- LuxAlgo summary of the follow-through day: https://www.luxalgo.com/library/concept/follow-through-day/
- Whaley thresholds (third-party script): https://in.tradingview.com/script/7fj0ePjF-Whaley-Thrust-ADT-UDT-SPT-2010-EDT-EMA-Info-Box
- Cboe on 0DTE: https://www.cboe.com/insights/posts/0-dt-es-decoded-positioning-trends-and-market-impact
- Hartford Funds, J.P. Morgan, Schaeffer's, Elm Wealth, Ritholtz, Saxo, Bloomberg and InvestmentNews items cited inline in B11
- Wikipedia pages cited inline for dates (1987, 1990, 1994, 1998, 2011, 2015–16, 2020, 2022, 2025)
