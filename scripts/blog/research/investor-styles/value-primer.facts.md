# Value investing primer: fact sheet

Checked 23 November 2026 (evening, after the US close). Every number below has a URL. `(computed)` = arithmetic done
here from the cited inputs. `(not verified)` = could not be confirmed on a primary page in this research round.

## 0. Sources that could not be opened, and what was used instead

- **SSRN** (Bessembinder's papers): bot check. Used the journal abstract on IDEAS/RePEc and Arizona State University's
  page for the study. The 1926–2022 figures come from a search-result summary of the paper's opening text `(not verified on the paper itself)`.
- **Morningstar** ("Mind the Gap 2026" PDF and article): HTTP 403. Figures taken from WealthManagement.com's report of the study (6 Aug 2026).
- **S&P Dow Jones Indices** SPIVA pages: HTTP 403 to plain fetches. The data page and the year-end 2025 scorecard PDF were read in a browser; figures below are from those two documents.
- **SEC www.sec.gov** archive pages: opened with the fetch tool (the Costco 10-K and 8-K). The Berkshire 10-Q text was cut short, so float comes from the 2025 annual report letter instead.
- **Shiller's own spreadsheet** (`ie_data.xls`, shillerdata.com): downloaded but could not be parsed here (no spreadsheet reader). Monthly prices and dividends were read from a public mirror of the same file (github.com/datasets/s-and-p-500), whose dividend column ends in June 2023. Used only for drawdowns that ended before then.
- **Yahoo Finance, Stooq**: refused automated requests. Costco prices from stockanalysis.com; fund returns from totalrealreturns.com and iShares.
- **FTSE Russell index returns by calendar year**: no clean table found. The two iShares funds that track the indexes are used instead (fee 0.18% a year), and said so in the post.
- **investor.gov / SEC mutual fund guide, Buffett Partnership fee terms, Lynch's Magellan record**: not opened in this round. The post describes the three structures in general terms and leaves the numbers to the two profiles.
- **Bernard and Thomas (1989)**: the paper itself was not opened; its result is given as reported by Wikipedia and by Katz, McCubbins and McMullin (2018).

## 1. Return decomposition (S&P 500)

Inputs: Damodaran, NYU Stern, "Implied ERP by year" table (year-end S&P 500 level, earnings, dividends, 1960–2025),
https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histimpl.html ; annual total returns,
https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html

Year-end level / earnings per index unit / P/E (computed as level ÷ earnings):
1960 58.11 / 3.10 / 18.7 · 1969 92.06 / 6.10 / 15.1 · 1979 107.94 / 14.55 / 7.4 · 1989 353.40 / 24.32 / 14.5 ·
1999 1,469.25 / 51.68 / 28.4 · 2009 1,115.10 / 59.65 / 18.7 · 2019 3,230.78 / 162.35 / 19.9 · 2025 6,845.50 / 271.52 / 25.2.
Dividend yield at year-end 2025: 1.15%; earnings yield 3.97% (same table).

Annualised, % a year (computed; dividends = total return over price change; the three parts multiply, so they do not sum exactly):

| Period | Total return | Dividends | Earnings growth | Change in P/E |
|---|---|---|---|---|
| 1961–2025 | 10.65 | 2.82 | 7.12 | +0.46 |
| 1970–1979 | 5.92 | 4.24 | 9.08 | −6.86 |
| 1980–1989 | 17.34 | 4.22 | 5.27 | +6.95 |
| 1990–1999 | 18.05 | 2.37 | 7.83 | +6.94 |
| 2000–2009 | −0.95 | 1.82 | 1.44 | −4.11 |
| 2010–2019 | 13.44 | 1.99 | 10.53 | +0.63 |
| 2020–2025 | 14.93 | 1.41 | 8.95 | +4.02 |

- S&P 500 total return by year used elsewhere: 2022 −18.04%, 2024 +24.88%, 2025 +17.78%. $100 at the start of 1928 → about $1,157,591 at end-2025, 10.02% a year over 98 years (computed from the same table).
- Bogle's split into "investment return" (dividend yield + earnings growth) and "speculative return" (change in P/E): 1900–2009 total 9.1% = dividends 4.3% + earnings growth 4.5% + speculative 0.3%, from Bogle's *Don't Count On It*, as reported by Ben Carlson. https://awealthofcommonsense.com/2025/06/expected-returns-in-the-stock-market/ and https://awealthofcommonsense.com/2016/09/the-john-bogle-expected-return-formula/ `(secondary; Bogle's table not opened)`

## 2. Costco Wholesale, fiscal 2026 (52 weeks ended 30 August 2026)

10-K filed 7 Oct 2026: https://www.sec.gov/Archives/edgar/data/909832/000090983226000093/cost-20260830.htm
XBRL facts (same numbers): https://data.sec.gov/api/xbrl/companyfacts/CIK0000909832.json
All $ millions unless stated; fiscal 2025 in brackets.

- Income statement: net sales 297,247 (269,912); membership fees 5,907 (5,323); total revenue 303,154 (275,235); merchandise costs 264,279 (239,886); selling, general and administrative 27,190 (24,966); operating income 11,685 (10,383); interest expense 145 (154); interest income and other 711 (589); income before taxes 12,251 (10,818); income taxes 3,025 (2,719), effective rate 24.7%; net income 9,226 (8,099); diluted EPS $20.76 ($18.21); diluted shares 444.427 million.
- Balance sheet, 30 Aug 2026 (31 Aug 2025): cash 20,207 (14,161); short-term investments 1,094 (1,123); receivables 3,959; inventories 19,324 (18,116); other current 1,998; total current assets 46,582; property and equipment net 35,633 (31,909); operating lease assets 2,697; other long-term 4,133; total assets 89,045 (77,099). Accounts payable 22,591 (19,783); accrued salaries 5,641; accrued member rewards 3,037; deferred membership fees 3,006; current portion of long-term debt 2,248; other current 7,429; total current liabilities 43,952; long-term debt 3,914 (5,713); long-term operating leases 2,414; other long-term 2,962; total liabilities 53,242 (47,935); equity 35,803 (29,164). Long-term debt carrying amount incl. current portion 6,162 (5,788); finance lease liabilities 1,413.
- Cash flow: operating cash flow 15,817 (13,335), of which depreciation and amortisation 2,674, stock-based pay 924, inventories −1,153, accounts payable +2,755; capital spending 6,435 (5,498); dividends paid 2,458; share repurchases 848; change in cash +6,046.
- Other: dividends declared $5.54 a share ($4.92); 939 warehouses; 84.1 million paid members; renewal rate 89.8% worldwide, 92.3% US and Canada; 355,000 employees; 443,129,349 shares outstanding on 29 Sep 2026 (cover page).
- Special dividend of $30 a share declared 10 Nov 2026, record date 24 Nov, payable 4 Dec 2026. 8-K: https://www.sec.gov/Archives/edgar/data/909832/000090983226000134/cost-20261107.htm . A $15 special dividend was paid in fiscal 2024 (10-K).
- Share price: closed $1,102.15 on Fri 20 Nov 2026; $1,097.91 on 23 Nov. https://stockanalysis.com/stocks/cost/history/
- Current quarterly dividend $1.47 ($5.88 a year): inferred from $5.54 declared over the year (2 × 1.30 + 2 × 1.47) `(computed, not read from a declaration)`.

Measures at $1,102.15 (all computed):
market value 443.129m × 1,102.15 = $488.4bn · EPS 9,226 ÷ 444.427 = $20.76 · P/E 53.1 · earnings yield 1.88% ·
book value per share $80.80 · price-to-book 13.6 · dividend yield 0.50% on $5.54 (0.53% on $5.88); special dividend = 2.7% of price, about $13.3bn ·
free cash flow 15,817 − 6,435 = 9,382; FCF yield 1.92% · net margin 3.04% · operating margin 3.85% · merchandise costs 87.18% and SG&A 8.97% of revenue ·
return on equity 9,226 ÷ average equity 32,484 = 28.4% · NOPAT 11,685 × (1 − 0.247) = 8,799; invested capital (equity + long-term debt) average 38,459; ROIC 22.9% (19.1% on year-end capital including all leases) ·
debt 6,162 ÷ EBITDA (11,685 + 2,674 = 14,359) = 0.43 years; interest cover 81× ; cash and investments exceed debt by 15,139 ·
membership fees = 50.6% of operating income · revenue +10.1%, net income +13.9%, EPS +14.0% · PEG on last year's EPS growth = 53.1 ÷ 14.0 = 3.8.

## 3. Market-wide valuation (multpl.com, read 23 Nov 2026 after the close; Shiller and S&P data)

- S&P 500 trailing P/E 24.69; mean 16.24, median 15.08, min 5.31 (Dec 1917), max 123.73 (May 2009). 1 Jan 2026: 27.98. https://www.multpl.com/s-p-500-pe-ratio
- Shiller P/E (CAPE) 38.21; mean 17.45, median 16.14, min 4.78 (Dec 1920), max 44.19 (Dec 1999). 1 Jan 2026: 39.65. https://www.multpl.com/shiller-pe
- Earnings yield 4.05% (mean 7.19%). https://www.multpl.com/s-p-500-earnings-yield
- Dividend yield 1.12% (mean 4.20%, min 1.06% Oct 2026, max 13.84% Jun 1932). https://www.multpl.com/s-p-500-dividend-yield
- Price-to-book 5.74 (estimate; mean since 1999 3.16; Dec 2025 5.39). https://www.multpl.com/s-p-500-price-to-book
- multpl shows the index at 7,291.77 on 23 Nov; FRED's last close is 6,910.39 on 20 Nov 2026 (https://fred.stlouisfed.org/series/SP500). The two were not reconciled; ratios are quoted "about".
- 10-year Treasury yield 4.92% on 20 Nov 2026. FRED DGS10. https://fred.stlouisfed.org/series/DGS10
- Damodaran, returns on capital by industry (US, January 2026 data set): total market excluding financials ROC 15.07% against cost of capital 7.72%; soft drinks 29.03% / 6.33%; software 29.32% / 9.34%; household products 34.42% / 7.03%; railroads 14.24% / 7.27%; general retail 13.59% / 7.27%; air transport 7.93% / 6.72%; steel 6.72% / 7.76%; auto and truck 2.25% / 9.38%. https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/EVA.html

## 4. Worked arithmetic (all computed here)

- Discounting at 9%: $100 in one year = $91.74 today; $100 in ten years = $42.24.
- DCF: cash of $100 in year 1 growing 6% a year to year 10 ($168.9), then 3% a year for ever; discount rate 9%. Present value of years 1–10 = $811.8; terminal value at year 10 = $2,900.3, worth $1,225.1 today; total $2,037 (60% from the terminal value).
- Sensitivity (value in $): discount 8%: 2,183 / 2,465 / 2,887 for long-run growth 2% / 3% / 4%; discount 9%: 1,852 / 2,037 / 2,296; discount 10%: 1,604 / 1,732 / 1,903.
- Compounding $10,000: 10% → 25,937 / 67,275 / 174,494 / 452,593 after 10 / 20 / 30 / 40 years; 15% → 40,456 / 163,665 / 662,118 / 2,678,635; 20% → 61,917 / 383,376 / 2,373,763 / 14,697,716.
- Fee: 10% a year for 40 years = $452,593; 9% = $314,094; difference $138,498 = 30.6%. At 10%, 62.8% of the 40-year gain arrives in the last ten years. Rule of 72: 7.2, 4.8, 3.6 years to double at 10%, 15%, 20% (exact: 7.27, 4.96, 3.80).

## 5. Graham, Fisher, Munger, Lynch, Fama–French

- *Security Analysis*, Graham and Dodd, 1934; net current asset value (current assets minus all liabilities) popularised there. Oppenheimer (1986): net-net stocks 33.7% a year against 12.1% for the benchmark, 1971–1983. https://en.wikipedia.org/wiki/Net_current_asset_value . Graham's "two-thirds of net current assets" buying rule: `(not verified in this round)`.
- *The Intelligent Investor*, 1949 (Harper & Brothers); last revised by Graham 1971–72; ch. 8 "The Investor and Market Fluctuations", ch. 20 "'Margin of Safety' as the Central Concept of Investment". https://en.wikipedia.org/wiki/The_Intelligent_Investor . Mr. Market: https://en.wikipedia.org/wiki/Mr._Market
- Philip Fisher (1907–2004), Fisher & Co. 1931, *Common Stocks and Uncommon Profits* 1958 (Wikipedia's works list shows a 1960 edition; 1958 is the first edition), "scuttlebutt", Motorola bought 1955 and held to his death. https://en.wikipedia.org/wiki/Philip_Arthur_Fisher
- Buffett, 1989 letter, "Mistakes of the First Twenty-five Years": the "cigar butt" approach; control of Berkshire (textiles) bought in 1965 because it looked cheap; credits Munger with seeing the point early; quote "a wonderful company at a fair price". https://www.berkshirehathaway.com/letters/1989.html
- Buffett, 1992 letter: "value investing" is a redundant term; growth is a component of value; low P/E, low price-to-book or a high dividend yield do not settle whether a purchase is good value; intrinsic value = cash the asset will produce, discounted (John Burr Williams). https://www.berkshirehathaway.com/letters/1992.html
- "The Superinvestors of Graham-and-Doddsville": talk at Columbia Business School, 17 May 1984, for the 50th anniversary of *Security Analysis*; printed in *Hermes*, fall 1984; nine records. https://en.wikipedia.org/wiki/The_Superinvestors_of_Graham-and-Doddsville
- PEG ratio = P/E ÷ yearly earnings growth in percent; popularised by Lynch, *One Up on Wall Street*, 1989; a fairly priced company's P/E equals its growth rate; first described by Mario Farina, 1969. https://en.wikipedia.org/wiki/PEG_ratio
- Fama and French, "The Cross-Section of Expected Stock Returns", *Journal of Finance* 47(2), June 1992, p. 427; three-factor model 1993, *Journal of Financial Economics* 33, 3–56. HML = high minus low book-to-market (top 30% minus bottom 30%). Five-factor model 2015: HML redundant in US data 1963–2013. https://en.wikipedia.org/wiki/Fama%E2%80%93French_three-factor_model
- Moat: term associated with Buffett's letters from 1986; types listed: intangible assets (brands, patents, licences), switching costs, network effect, cost advantage, efficient scale; examples named there: Nike and Apple (brand), Amazon (network), Walmart (cost), utilities (scale). https://en.wikipedia.org/wiki/Economic_moat . Other company examples in the post are illustrations chosen for this primer.

## 6. Does value work

- Kenneth French data library, "Fama/French 3 Factors" (file built on the September 2026 CRSP database), annual HML, %: average by period (computed): 1927–29 +1.08; 1930s +0.04; 1940s +10.77; 1950s +5.51; 1960s +4.12; 1970s +7.84; 1980s +7.25; 1990s +0.92; 2000s +8.28; 2010s −2.30; 2020–25 −1.56. 1927–2025 +4.22 (positive in 59 of 99 years); 1927–2006 +5.93; 2007–2020 −6.70 (positive in 4 of 14); 2007–2025 −2.96. Single years: 2007 −16.82, 2016 +22.80, 2020 −46.94, 2021 +25.60, 2022 +25.70, 2023 −13.98, 2024 −8.43, 2025 +8.71. Monthly HML Jan–Sep 2026: +3.80, +2.80, +3.29, −1.37, −2.31, +3.58, +2.11, −3.54, −1.55. https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
- iShares Russell 1000 Value ETF (IWD) and Growth ETF (IWF), total return by calendar year, %, data to 20 Nov 2026. https://totalrealreturns.com/n/IWD,IWF

| Year | Value (IWD) | Growth (IWF) |
|---|---|---|
| 2007 | −0.73 | +11.48 |
| 2008 | −36.48 | −38.22 |
| 2009 | +19.13 | +36.68 |
| 2010 | +15.48 | +16.51 |
| 2011 | +0.13 | +2.34 |
| 2012 | +17.46 | +15.21 |
| 2013 | +32.09 | +33.14 |
| 2014 | +13.17 | +12.79 |
| 2015 | −3.97 | +5.49 |
| 2016 | +17.25 | +7.01 |
| 2017 | +13.45 | +29.95 |
| 2018 | −8.45 | −1.67 |
| 2019 | +26.12 | +35.86 |
| 2020 | +2.73 | +38.25 |
| 2021 | +24.95 | +27.43 |
| 2022 | −7.75 | −29.31 |
| 2023 | +11.34 | +42.59 |
| 2024 | +14.17 | +33.12 |
| 2025 | +15.68 | +18.33 |
| 2026 to 20 Nov | +18.88 | −13.80 |

- Computed: 2007–2020 value ×2.31 (6.2% a year), growth ×5.26 (12.6%); 2007–2025 value ×3.92 (7.5%), growth ×10.64 (13.3%). Value led in 5 of 19 full years (2008, 2012, 2014, 2016, 2022).
- Fund facts, 20 Nov 2026: IWD P/E 23.05, price-to-book 3.27, 868 holdings, year to date +18.74%; IWF P/E 32.66, price-to-book 12.82, 372 holdings, year to date −13.75%; fee 0.18% each. https://www.ishares.com/us/products/239708/ishares-russell-1000-value-etf , https://www.ishares.com/us/products/239706/ishares-russell-1000-growth-etf
- Russell style method: one value variable (book-to-price) and two growth variables (I/B/E/S two-year forecast growth, five-year sales-per-share growth), combined into a composite value score; about 30% of Russell 1000 Growth stocks sit in both indexes. https://www.lseg.com/content/dam/ftse-russell/en_us/documents/other/ftse-russell-your-index-matters-styles.pdf `(from a search summary of FTSE Russell documents; PDF not parsed)`
- Value traps. Eastman Kodak: revenue peak about $16bn in 1996; first hand-held digital camera prototype built there in 1975; Chapter 11 on 19 Jan 2012. https://en.wikipedia.org/wiki/Kodak . Sears Holdings: formed 24 Mar 2005; revenue about $53.0bn in 2007 and $16.7bn in 2018; 235 properties spun into Seritage in 2015; Chapter 11 on 15 Oct 2018. https://en.wikipedia.org/wiki/Sears_Holdings . Berkshire's textile business as Buffett's own example: 1989 letter above.

## 7. Base rates for stock picking

- SPIVA U.S. Year-End 2025 (S&P Dow Jones Indices, 3 Mar 2026), Report 1a, share of funds that underperformed over 1 / 3 / 5 / 10 / 15 / 20 years to 31 Dec 2025: all large-cap funds against the S&P 500: 78.78 / 66.84 / 88.96 / 85.59 / 89.93 / 92.89%; all domestic funds against the S&P 1500: 79.83 / 80.40 / 91.47 / 90.43 / 93.15 / 95.01%; large-cap value funds against the S&P 500 Value: 41.30 / 80.51 / 83.03 / 88.45 / 93.29 / 87.01%. Report 2: of 760 large-cap funds at the start of the 20 years, 34.61% survived. S&P 500 +18% in 2025. https://www.spglobal.com/spdji/en/spiva/article/spiva-us-year-end-2025/ (PDF: https://www.spglobal.com/spdji/en/documents/spiva/spiva-us-year-end-2025.pdf)
- SPIVA data page, as of 30 Jun 2026: all large-cap 78.69 / 76.63 / 89.32 / 83.33 / 90.49% over 1 / 3 / 5 / 10 / 15 years. https://www.spglobal.com/spdji/en/research-insights/spiva/ . Mid-Year 2026 report (17 Sep 2026): 67% of large-cap funds lagged in the first half of 2026. https://www.spglobal.com/spdji/en/spiva/article/spiva-us
- Bessembinder, "Do stocks outperform Treasury bills?", *Journal of Financial Economics* 129(3), 2018, 440–457: most US common stocks since 1926 had lifetime returns below one-month Treasury bills; the best 4% of companies account for the whole net gain. https://ideas.repec.org/a/eee/jfinec/v129y2018i3p440-457.html . Net wealth created $34.824 trillion to Dec 2016; half of it from 86 stocks; all of it from about the top 1,000; update to Dec 2019 $47.381 trillion. https://wpcarey.asu.edu/department-finance/faculty-research/do-stocks-outperform-treasury-bills . Update 1926–2022: $55.11 trillion; 58.6% of 28,114 stocks reduced shareholder wealth `(from a search summary of the paper; not verified on the paper)`.
- Morningstar "Mind the Gap 2026": ten years to 31 Dec 2025, average dollar in US funds and ETFs earned 8.7% a year against 9.9% for the funds, gap 1.2 points (about 12% of the return); nearly 23,000 funds; gap 0.4 for US equity funds, 0.7 allocation, 1.2 sector equity, 1.6 alternatives. As reported: https://www.wealthmanagement.com/investing-strategies/investors-miss-out-on-12-of-fund-returns-over-decade (6 Aug 2026). Morningstar's own PDF: https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt852a4301adc2f5db/6a7373d51f7b5ae2da78e1e8/US_Mind_the_Gap_2026.pdf `(not opened)`

## 8. Structures and float

- Berkshire Hathaway insurance float $176bn at end-2025, $171bn at end-2024, $88bn at end-2015; the 2025 annual report letter is signed by Gregory Abel. https://www.berkshirehathaway.com/2025ar/2025ar.pdf
- Berkshire cash, cash equivalents and Treasury bills $377.4bn at 30 Sep 2026 (computed from balance-sheet lines of the 10-Q). https://www.sec.gov/Archives/edgar/data/1067983/000119312526452412/brka-20260930.htm
- Buffett's partnership ran 1956–1969; control of Berkshire 1965. https://en.wikipedia.org/wiki/Warren_Buffett . Fee terms of the partnership and of Lynch's fund: see the two profiles `(not verified here)`.
- Float example in the post: $1,000 of premiums, $970 of claims and costs paid on average a year later, 5% earned meanwhile (computed, invented numbers).

## 9. Drawdowns (S&P 500 with dividends, monthly data)

Computed here from Shiller's monthly series (prices are monthly averages of daily closes, so depths are shallower than
the day-to-day figures) via https://github.com/datasets/s-and-p-500 ; original at https://shillerdata.com/ . Nominal, dividends reinvested monthly.

| Peak month | Low month | Fall with dividends | Months to low | Months from peak to a new high |
|---|---|---|---|---|
| Sep 1929 | Jun 1932 | −81.8% | 33 | 184 (Jan 1945) |
| Oct 2007 | Mar 2009 | −49.0% | 17 | 58 (Aug 2012) |
| Aug 2000 | Feb 2003 | −41.6% | 30 | 74 (Oct 2006) |
| Jan 1973 | Dec 1974 | −39.2% | 23 | 42 (Jul 1976) |
| Aug 1987 | Dec 1987 | −26.0% | 4 | 21 (May 1989) |

Price only (no dividends): −84.8% (new high Sep 1954), −50.8% (Mar 2013), −43.7% (May 2007), −43.4% (Jul 1980), −26.8% (Jul 1989).
Daily closes for comparison: the 2020 fall was 33.9% (3,386.15 on 19 Feb to 2,237.40 on 23 Mar 2020, FRED SP500, as in the macro primer); on monthly averages it shows as 19%.

## 10. Post-earnings-announcement drift

- First documented by Ball and Brown, *Journal of Accounting Research*, 1968. Bernard and Thomas, "Post-Earnings-Announcement Drift: Delayed Price Response or Risk Premium?", *Journal of Accounting Research* 27 (1989), 1–36: the spread between the top and bottom tenths by earnings surprise was positive in 41 of 48 quarters, 1974–1985, and in 11 of 16 quarters when the NYSE index fell. https://en.wikipedia.org/wiki/Post%E2%80%93earnings-announcement_drift ; citation https://econpapers.repec.org/RePEc:bla:joares:v:27:y:1989:i::p:1-36
- Garfinkel, Hribar and Hsiao (2024): 5.1% risk-adjusted over three months for top minus bottom tenth (same Wikipedia page).
- Katz, McCubbins and McMullin (2018): the literature reports 10% to 25% a year for the long–short portfolio; their own finding is that the pattern is much weaker stock by stock than in portfolio averages. https://jkatz.caltech.edu/documents/28622/peads.pdf
