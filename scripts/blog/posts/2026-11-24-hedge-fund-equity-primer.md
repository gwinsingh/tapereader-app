---
title: "Hedge funds, concentrated bets and short selling: a primer on big positions, public pressure and the cost of being early"
date: 2026-11-24
order: 11
tags: [research, primer, investor-styles, activist, short-selling]
series: investor-styles
short: Hedge fund primer
summary: A hedge fund is a private partnership that may borrow, sell short and put most of its money into a few positions, and the record shows that these freedoms produced a handful of famous results while the average fund, after fees, trailed both a plain index fund and a 60/40 portfolio over the last ten and twenty years.
vault: Studies/30 Investor Styles/10 Primers/Hedge Funds, Activism and Short Selling — Primer
---

A hedge fund is a private investment partnership for wealthy investors and institutions. It may do three things an ordinary fund mostly may not: borrow, sell shares short (bet on a fall), and put most of its money into a handful of positions. Activists such as [Bill Ackman](/blog/bill-ackman) use those freedoms to buy large stakes and press companies to change. Contrarians such as [Michael Burry](/blog/michael-burry) use them to bet against prices that the crowd believes in. The one thing worth taking from the style: being right is not enough, because a concentrated or short position must also survive the time before it pays, and both the fees and the fund's own investors work against that.

This primer is the background for those two profiles. It is a study, not advice.

## What a hedge fund is

### A partnership, not a product

A hedge fund is usually a **limited partnership**. The **general partner** (the manager) makes every decision. The **limited partners** (the investors) put in money and can lose only what they put in ([overview](https://en.wikipedia.org/wiki/Hedge_fund)). Alfred Winslow Jones set up the first one in 1949. He bought shares he liked, sold short shares he disliked to "hedge" the market, and kept 20% of the profit.

The public cannot buy in. A US investor must generally be an **accredited investor**: income above $200,000 in each of the last two years, or net worth above $1 million without counting the home ([SEC](https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/accredited-investors)). Many funds accept only "qualified purchasers" with at least $5 million of investments ([overview](https://en.wikipedia.org/wiki/Hedge_fund)).

That restriction buys the freedom. A US **mutual fund** (a fund sold to the public that repays investors on any day) may borrow only from a bank and only up to one third of its assets ([Investment Company Act, section 18](https://www.law.cornell.edu/uscode/text/15/80a-18)). One that calls itself diversified must keep at least 75% of its assets in holdings of no more than 5% each ([section 5](https://www.law.cornell.edu/uscode/text/15/80a-5)). A hedge fund has no such limits.

```figure
{
 "kind": "compare",
 "title": "Three containers for other people's money",
 "cols": [
  {
   "title": "Mutual fund",
   "tag": "Open to the public",
   "items": [
    "Repays investors on any trading day",
    "Borrowing capped at one third of assets",
    "A diversified fund keeps most holdings under 5% each",
    "Fee: a fixed percent of assets, often under 1%"
   ]
  },
  {
   "title": "Hedge fund",
   "tag": "Private partnership",
   "items": [
    "Wealthy investors and institutions only",
    "May borrow, sell short and concentrate",
    "Repays monthly, quarterly or yearly, with notice",
    "Fee: a percent of assets plus a share of profit"
   ]
  },
  {
   "title": "Listed closed-end fund",
   "tag": "Permanent capital",
   "items": [
    "A fixed pool of money with shares on an exchange",
    "Investors leave by selling shares to someone else",
    "The manager is never forced to sell holdings",
    "The shares can trade below the value of the holdings"
   ]
  }
 ],
 "note": "General descriptions. The limits on US mutual funds are from the Investment Company Act of 1940; the third column is explained later in this section."
}
```

### Fees: "2 and 20"

The classic fee is **"2 and 20"**: a **management fee** of 2% of assets every year, and a **performance fee** of 20% of the profit ([SEC investor bulletin](https://www.sec.gov/files/ib_hedgefunds.pdf)). The average has drifted down. The data firm HFR put it at about 1.33% and 15.83% at the end of 2025 (HFR, March 2026; not verified at the source).

> [!define] High-water mark and hurdle rate
> - **High-water mark:** the highest value an investor's stake has reached after fees. The manager earns a performance fee only on gains above it, so losses must be recovered before the 20% applies again.
> - **Hurdle rate:** a minimum return, such as 5% or the return on cash, that must be beaten before any performance fee is charged. Many funds have none.

**A 10% year.** A fund starts the year with $100 and earns 10% before fees. The management fee takes $2.00. The performance fee is 20% of the remaining $8.00 gain, which is $1.60. The investor keeps $6.40. Fees took 36% of the gain (calculated here).

```figure
{
 "kind": "stack",
 "title": "Where a 10% gross year goes",
 "sub": "Dollars per $100 invested, for a year in which the fund earns $10 before fees",
 "unit": "$",
 "bars": [
  {"name": "2 and 20", "parts": [["Investor keeps", 6.4], ["Management fee", 2.0], ["Performance fee", 1.6]]},
  {"name": "Average fees (1.33 and 15.83)", "parts": [["Investor keeps", 7.3], ["Management fee", 1.33], ["Performance fee", 1.37]]}
 ],
 "note": "Calculated here. The management fee is charged on the opening $100; the performance fee is charged on the gain left after it. Under 2 and 20 the investor keeps 64% of the gross gain; at the reported industry average, 73%. An index fund (a fund that simply holds every share in an index) charging 0.05% a year would leave $9.95."
}
```

**A good year and a bad year.** Now take a gross gain of 30% followed by a gross loss of 20%.

- Year 1: $100 grows to $130. Fees are $2.00 plus 20% of $28.00, which is $5.60. The investor has $122.40, the new high-water mark.
- Year 2: $122.40 falls 20% to $97.92. The management fee, 2% of $122.40, takes $2.45. There is no performance fee. The investor has $95.47.

Before fees the two years made 4.0% (1.30 × 0.80 = 1.04). After fees the investor lost 4.5%. Fees came to $10.05 on $100. The performance fee on the good year is never handed back. The fund must then gain 28.2% before another performance fee is due (all calculated here).

```figure
{
 "kind": "line",
 "title": "Ten years at 10% a year before fees",
 "sub": "Value of $100 under four fee arrangements",
 "unit": "$",
 "zero": false,
 "x": ["Start", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
 "xName": "Year",
 "series": [
  {"name": "Before fees", "values": [100, 110, 121, 133.1, 146.41, 161.05, 177.16, 194.87, 214.36, 235.79, 259.37], "dash": true},
  {"name": "Index fund, 0.05% a year", "values": [100, 109.95, 120.88, 132.9, 146.12, 160.65, 176.63, 194.19, 213.5, 234.74, 258.08]},
  {"name": "Average hedge fund fees", "values": [100, 107.3, 115.13, 123.53, 132.54, 142.22, 152.59, 163.73, 175.68, 188.5, 202.25]},
  {"name": "2 and 20", "values": [100, 106.4, 113.21, 120.46, 128.16, 136.37, 145.09, 154.38, 164.26, 174.77, 185.96]}
 ],
 "note": "Calculated here, year by year: management fee on the opening value, then the performance fee on the gain left, with a high-water mark. A steady 10% is the kindest case for the investor. Under 2 and 20 the gain of $159 before fees becomes $86. To match the index fund, the 2 and 20 fund would have to earn about 14.4% a year before fees."
}
```

### Getting the money back

A hedge fund holding eight large positions cannot sell them overnight, so it sets terms ([SEC investor bulletin](https://www.sec.gov/files/ib_hedgefunds.pdf)):

- **Lock-up:** a period after investing, often a year or more, when nothing can be withdrawn.
- **Redemption notice:** withdrawals (redemptions) are allowed only monthly, quarterly or yearly, and must be requested in advance.
- **Gate:** a cap on how much of the fund can leave at one date. The rest waits for the next date.
- **Suspension:** the fund may stop all redemptions in a crisis. Many funds restricted withdrawals in 2008 ([overview](https://en.wikipedia.org/wiki/Hedge_fund)).

> [!define] Side pocket
> A separate account inside the fund for positions that cannot be sold quickly or priced reliably. Investors who were in the fund when the pocket was created keep their share of it, but cannot withdraw that share until the position is sold. Redemptions are paid from the rest of the fund only ([overview](https://en.wikipedia.org/wiki/Hedge_fund)).

A side pocket spares the investors who stay a forced sale at a bad price. It also lets a manager keep a position that investors want out of. Both profiles turn on that conflict.

### Permanent capital

Some managers avoid the conflict by raising money that can never be withdrawn. A **closed-end fund** raises a fixed sum once and lists its shares on a stock exchange. An investor who wants out sells the shares to another investor.

The price for this is the discount. **Net asset value (NAV)** is what the fund's holdings are worth per share. The share price is whatever buyers will pay, and it is often less. Nothing forces the two together, because no one can hand in a share and demand the NAV. The discount reflects fees, doubts about the manager and a lack of buyers.

```figure
{
 "kind": "bar",
 "title": "Average discount of UK listed funds to the value of their holdings",
 "sub": "Percent below net asset value, average for each decade, all investment trusts",
 "unit": "%",
 "x": ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s so far"],
 "series": [
  {"name": "Average discount", "values": [26, 20, 10, 10, 8, 13]}
 ],
 "labels": "all",
 "note": "A 13% discount means shares bought for 87 pence own 100 pence of holdings. The widest average on record was 41% in October 1976 and the narrowest 2% in December 1993. The average stayed in double digits from May 2022 to December 2025. Unweighted averages; the series begins in December 1972.",
 "source": "Association of Investment Companies, 5 January 2026",
 "sourceUrl": "https://www.theaic.co.uk/aic/news/press-releases/aic-releases-53-years-of-investment-trust-discount-history"
}
```

Pershing Square Holdings, the London-listed fund managed by Bill Ackman, is the example in his profile ([overview](https://en.wikipedia.org/wiki/Pershing_Square_Holdings)). Its investors cannot redeem. The [profile](/blog/bill-ackman) gives its size and its discount to NAV over the years.

> [!take] What to take from it
> - Under 2 and 20, fees took 36% of a 10% year, and turned a 4% gain over a good and a bad year into a 4.5% loss.
> - Gates, side pockets and listed funds are three answers to one problem: investors want their money back at the worst moment.

## Long/short equity

Most hedge fund money in shares is run **long/short**. A **long** position is shares owned. A **short** position is shares borrowed and sold, to be bought back later. Leverage, market-neutral books and the Sharpe ratio are covered in the [quant primer](/blog/quant-primer).

Two numbers describe the book, both as a percent of the fund's own capital:

- **Gross exposure** = longs + shorts. It measures how much is at work.
- **Net exposure** = longs − shorts. It measures how much the fund depends on the market rising.

A fund with $100 of capital holds $130 of longs and $70 of shorts. Gross exposure is 200%. Net exposure is 60%. If every share falls 10%, the longs lose $13 and the shorts gain $7. The fund loses 6%, not 10%.

```figure
{
 "kind": "bar",
 "title": "Three share portfolios, each with $100 of capital",
 "sub": "Dollars long, dollars short, and net exposure",
 "unit": "$",
 "x": ["Long-only fund", "Long/short fund", "Market-neutral fund"],
 "series": [
  {"name": "Long", "values": [100, 130, 100]},
  {"name": "Short", "values": [0, 70, 100]},
  {"name": "Net (long minus short)", "values": [100, 60, 0]}
 ],
 "labels": "all",
 "note": "An illustration with round numbers. In a market that falls 10% across the board the three lose $10, $6 and nothing. The long/short fund's result then depends on whether its longs do better than its shorts."
}
```

The short book is meant to do two jobs. It **funds** the long book: selling $70 of borrowed shares brings in cash that helps the fund carry $130 of longs on $100 of capital. It **hedges**: when the market falls, the shorts gain. The manager is paid for the gap between the two books. If the longs rise 12% and the shorts rise 4%, the fund above earns $15.60 − $2.80 = $12.80 on $100.

Typical levels: the US stock-picking long/short funds that Goldman Sachs finances had gross exposure of 208% and net exposure of 43% in early November 2026 ([Beinsure, 18 Nov 2026](https://beinsure.com/news/hedge-funds-cut-leverage-at-fastest-pace-amid-tech-selloff/), citing Bloomberg; not verified at the source). The average long/short fund behaves like roughly half a share portfolio.

## Concentration against diversification

### The arithmetic

Take equal positions. With 10 holdings, one company going to zero costs 10% of the fund, and the other nine must rise 11.1% to make it back. With 100 holdings the same failure costs 1% (calculated here).

Spreading money also cuts the swings. Edwin Elton and Martin Gruber measured it in 1977 with random portfolios drawn from 3,290 US shares.

```figure
{
 "kind": "bar",
 "title": "How the swings shrink as shares are added",
 "sub": "Average standard deviation of yearly returns, percent, for random equal-weighted portfolios of US shares",
 "unit": "%",
 "x": ["1 share", "2", "4", "6", "8", "10", "20", "30", "50", "1,000"],
 "xName": "Number of shares held",
 "series": [
  {"name": "Volatility", "values": [49.24, 37.36, 29.69, 26.64, 24.98, 23.93, 21.68, 20.87, 20.2, 19.21]}
 ],
 "labels": "all",
 "note": "The floor of about 19% is the risk of the market itself, which no number of shares removes. Of the risk that can be removed (49.24 minus 19.21), 8 shares remove 81%, 10 remove 84%, 20 remove 92% and 30 remove 94% (shares calculated here). The shares are picked at random; eight shares in one industry diversify far less.",
 "source": "Elton and Gruber, Journal of Business, 1977, as reproduced by Wikipedia",
 "sourceUrl": "https://en.wikipedia.org/wiki/Diversification_(finance)"
}
```

The older view was that about 10 shares were enough. Meir Statman argued in 1987 that a well-diversified portfolio needs at least 30 to 40 ([Statman, 1987](https://ideas.repec.org/a/cup/jfinqa/v22y1987i03p353-363_01.html)). A fund with 8 to 12 positions has removed most of the single-company risk, and one failure still costs it 8% to 12%.

### The case for concentration

- **Buffett.** In his 1993 letter Warren Buffett argued that concentration can lower risk if it makes the investor study each business harder. An investor who cannot judge businesses should own an index fund. One who can needs five to ten sensibly priced companies ([Berkshire Hathaway letter, 1993](https://www.berkshirehathaway.com/letters/1993.html)). See the [Buffett profile](/blog/warren-buffett) and the [value investing primer](/blog/value-investing-primer).
- **Kelly.** The Kelly criterion is a formula for bet size: the bigger the edge, the bigger the stake. For an even-money bet that wins 60% of the time it says 20% of capital ([overview](https://en.wikipedia.org/wiki/Kelly_criterion)). At 55% it says 10%, and at 50% nothing (calculated here). The catch: the formula needs the true odds, and an investor has only an estimate, so practitioners often stake half.
- **Best ideas.** A study of US fund managers found that each manager's highest-conviction holding beat the market, and the rest of that manager's portfolio, by 2.8 to 4.5 percentage points a year. Most other holdings showed no outperformance ([Antón, Cohen and Polk, 2021](https://personal.lse.ac.uk/polk/research/bestideas.pdf); earlier with Bernhard Silli).

### The case against

- **Most shares lose.** Since 1926 most US shares have returned less than Treasury bills (short US government loans) over their lives. The best 4% of companies account for the entire gain of the stock market over bills ([Bessembinder, 2018](https://ideas.repec.org/a/eee/jfinec/v129y2018i3p440-457.html)). A portfolio of eight shares can easily hold none of the 4%.
- **Focused funds have not done better.** US mutual funds with few holdings did not beat diversified funds before costs, did worse after costs, and closed more often ([Sapp and Yan, 2008](https://ideas.repec.org/a/bla/finrev/v43y2008i1p27-49.html)). Funds concentrated in a few industries did better from 1984 to 1999 ([Kacperczyk, Sialm and Zheng, 2005](https://ideas.repec.org/a/bla/jfinan/v60y2005i4p1983-2011.html)).

## Activism, step by step

An **activist** buys a large minority stake in a company it thinks is badly run or undervalued, then presses for change. The usual demands: seats on the board (the directors elected by shareholders to oversee management), a new chief executive, a **spin-off** (a division made into a separate listed company), a sale of the company, **buybacks** (the company buying its own shares) or cost cuts.

```figure
{
 "kind": "flow",
 "title": "A typical activist campaign",
 "steps": [
  ["Build the stake quietly", "Buy shares, and sometimes options or swaps, until the position is large enough to matter, often a few percent of the company."],
  ["Cross 5% and file", "A Schedule 13D is due within five business days. It names the buyer, the size and the intent."],
  ["Publish the plan", "A letter or a long presentation: what is wrong, what should change, what the shares could be worth."],
  ["Talk to the board", "Most campaigns end here, in a settlement: one or more board seats in exchange for a standstill (a promise not to escalate)."],
  ["If no deal: a proxy fight", "The activist nominates its own directors and asks all shareholders to vote for them at the annual meeting."],
  ["Change, or not", "A new chief executive, a spin-off, a sale, buybacks. The activist usually sells within a few years."]
 ],
 "note": "A general description. The filing rules are those in force in November 2026 and are sourced in the text below."
}
```

### The US disclosure rules

- **Schedule 13D.** Anyone who owns more than 5% of a US-listed company and intends to influence it must file within **five business days** of crossing 5%. The deadline was 10 days until the SEC (the US markets regulator) shortened it in rules that took effect in February 2024 ([SEC, 10 Oct 2023](https://www.sec.gov/newsroom/press-releases/2023-219)). The form must now also list cash-settled derivatives tied to the shares ([SEC fact sheet](https://www.sec.gov/files/33-11253-fact-sheet.pdf)).
- **Schedule 13G.** The shorter form for holders above 5% with no intent to influence (same fact sheet).
- **Form 13F.** A quarterly list of holdings, described in full below.
- **Hart-Scott-Rodino.** Buying voting shares worth more than $133.9 million (the 2026 threshold) can require an antitrust filing and a waiting period first ([FTC](https://www.ftc.gov/enforcement/premerger-notification-program/current-thresholds)).

```figure
{
 "kind": "tiles",
 "title": "The US filings an activist or short seller meets",
 "tiles": [
  ["5%", "Schedule 13D or 13G", "Ownership above this must be disclosed"],
  ["5 business days", "13D deadline", "Was 10 days before February 2024"],
  ["$100 million", "Form 13F threshold", "Managers above this file every quarter"],
  ["45 days", "13F delay", "After the quarter ends"],
  ["$133.9 million", "Hart-Scott-Rodino", "2026 threshold for an antitrust filing"],
  ["2 Jan 2028", "Short-position reports", "Form SHO start date after two delays"]
 ],
 "note": "Sources are linked in the text of this section and of the short-selling section."
}
```

### Form 13F: what it shows and what it leaves out

Every manager with discretion over $100 million or more of US-listed securities must file Form 13F within 45 days of each quarter's end ([SEC, Form 13F questions and answers](https://www.sec.gov/rules-regulations/staff-guidance/division-investment-management-frequently-asked-questions/frequently-asked-questions-about-form-13f)). It lists long positions in securities on an official SEC list: mainly US-listed shares, exchange-traded funds, and certain options and convertible bonds.

What it leaves out matters more:

- **No short positions.** Shorts are not reported, and are not subtracted from longs (question 41).
- **No foreign listings.** Shares that trade only outside the United States are left out (question 40).
- **No cash, ordinary bonds, swaps or credit default swaps.**
- **Options at the value of the shares they cover.** A bought put or call is entered "in terms of the securities underlying the options, not the options themselves" ([Form 13F instructions](https://www.sec.gov/files/form13f.pdf)). Options the manager has sold are not reported at all.
- **Old news.** The picture is of one day, published up to 45 days later.

### Proxy fights and defences

In a **proxy fight** the activist and the company each ask shareholders to vote for their candidates for the board (a proxy is a vote cast on a shareholder's behalf). For meetings held after 31 August 2022, US rules require a **universal proxy card**: one ballot listing both sides' candidates, so that a shareholder can pick some from each ([SEC, 17 Nov 2021](https://www.sec.gov/newsroom/press-releases/2021-235)).

Two defences recur. A **poison pill** lets all other shareholders buy new shares cheaply if one holder passes a set stake, 20% in a common example, which makes buying more pointless ([overview](https://en.wikipedia.org/wiki/Shareholder_rights_plan)). A **staggered board** puts only a third of the directors up for election each year, so control takes at least two annual meetings (same source).

Most campaigns never reach a vote. The bank Barclays counted a record 52 US settlements in 2025, nearly half reached before any public pressure ([Barclays review of 2025](https://pcg.law.harvard.edu/wp-content/uploads/2026/01/Barclays-2025-Review-of-Shareholder-Activism_vF.pdf)).

## The evidence on activism

### How much of it there is

```figure
{
 "kind": "bar",
 "title": "Activist campaigns worldwide, 2016–2025",
 "sub": "New campaigns per year at companies worth more than $500 million",
 "x": ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
 "xName": "Year",
 "series": [
  {"name": "Campaigns", "values": [187, 212, 249, 209, 184, 186, 234, 229, 244, 255]}
 ],
 "labels": "all",
 "note": "2025 passed the 2018 record. The United States had 141 of the 255, Japan a record 56 and Europe 40. The bank Lazard, which counts differently, has 297 campaigns for 2025 and 184 for the first half of 2026, both records (lazard.com, reviews of 5 January and 1 July 2026).",
 "source": "Barclays Shareholder Advisory Group, 2025 Review of Shareholder Activism",
 "sourceUrl": "https://pcg.law.harvard.edu/wp-content/uploads/2026/01/Barclays-2025-Review-of-Shareholder-Activism_vF.pdf"
}
```

Outcomes for 2025, by Barclays' count (same review): activists won 120 board seats, and a record 32 US chief executives resigned within a year of a campaign, up from 27 in 2024.

**Proxy-fight win rates.** The law firm Sidley Austin studied 76 US board contests from January 2018 to August 2025. Activists won at least one seat in 39% of contests before the universal proxy card and 48% under it. Management won every seat in 61% before and 52% after ([Sidley Austin, 9 Sep 2025](https://corpgov.law.harvard.edu/2025/09/09/how-three-years-of-the-secs-universal-proxy-card-have-changed-proxy-contests/)). In 2024, 76% of the board seats activists won came through settlements and 24% through fights ([Barclays review of 2024](https://corpgov.law.harvard.edu/wp-content/uploads/2025/01/Barclays-2024-Review-of-Shareholder-Activism_vF.pdf)).

### What happens to the share price

- **The jump at the filing.** A study of US activist hedge funds from 2001 to 2006 found that target shares gained about 7% more than the market around the 13D filing, measured from 20 days before to 20 days after, with no reversal in the following year. Activists got all or part of what they asked for in about two thirds of cases ([Brav, Jiang, Partnoy and Thomas, 2008](https://ideas.repec.org/a/bla/jfinan/v63y2008i4p1729-1775.html); the window is not in the abstract and was not verified).
- **Five years on.** A study of about 2,000 interventions from 1994 to 2007 found no sign that the early gain was given back over five years, and no decline in the targets' operating results ([Bebchuk, Brav and Jiang, 2015](https://www.nber.org/papers/w21227)).
- **The sceptics.** A later paper found that the positive long-run returns came from the smallest fifth of targets, with an average market value of $22 million. Weighted by size, long-run returns were not different from zero. It found no operating improvement against matched companies, and no harm ([deHaan, Larcker and McClure, 2019](https://www.gsb.stanford.edu/faculty-research/publications/long-term-economic-consequences-hedge-fund-activist-interventions)). The law professors John Coffee and Darius Palia argued in 2016 that the short-term gain is real and the long-term evidence weak, and that activists acting in loose groups ("wolf packs") push companies toward more debt and less investment ([Coffee and Palia, 2016](https://nowpublishers.com/article/Details/ACG-003); summary not verified against the text).

### What activist funds earned

```figure
{
 "kind": "bar",
 "title": "Activist hedge funds against the S&P 500, 2013–2023",
 "sub": "Return per calendar year, percent. HFRI ED: Activist Index (after fees) and a fund that tracks the S&P 500, an index of 500 large US companies.",
 "unit": "%",
 "x": ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"],
 "xName": "Year",
 "series": [
  {"name": "Activist funds", "values": [16.05, 6.57, 1.15, 10.38, 5.45, -10.42, 17.26, 10.31, 16.09, -8.16, 18.07]},
  {"name": "S&P 500 fund", "values": [32.31, 13.46, 1.23, 12.0, 21.71, -4.57, 31.22, 18.33, 28.73, -18.18, 26.18]}
 ],
 "note": "Over the ten years 2014 to 2023 the activist index returned 6.2% a year and the index fund 11.9% a year (calculated here from the yearly figures). The activist index beat the fund in one year of the eleven, 2022, by losing less. Later years of the index were not found.",
 "source": "HFR Media Reference Guide, 9 September 2024; totalrealreturns.com for the index fund",
 "sourceUrl": "https://mondovisione.com/_assets/files/HFR-Media-Reference-Guide-2024.09.09.pdf"
}
```

> [!take] What to take from it
> - The price jump when an activist files is well documented: about 7%.
> - Whether the companies end up better is disputed. For large targets the long-run effect is close to zero.
> - An outsider gets the jump only by owning the share before the filing. The funds as a group trailed the index.

## Short selling, step by step

```figure
{
 "kind": "flow",
 "title": "A short sale",
 "dir": "h",
 "steps": [
  ["Locate", "The broker confirms that shares can be borrowed."],
  ["Borrow and sell", "100 borrowed shares are sold at $20. The account receives $2,000."],
  ["Wait, and pay", "A borrowing fee accrues daily. Any dividend is owed to the lender."],
  ["Buy back", "The seller buys 100 shares in the market: the \"cover\"."],
  ["Return", "The shares go back to the lender. Profit or loss is $2,000 minus the cost to buy."]
 ],
 "note": "An illustration. If the shares are bought back at $14 the gain is $600 before fees. If at $26, the loss is $600."
}
```

The practical details:

- **Locate.** Before a short sale the broker must have reasonable grounds to believe the shares can be borrowed ([SEC, Regulation SHO](https://www.sec.gov/investor/pubs/regsho.htm)).
- **Margin.** The seller must hold 150% of the sale's value in the account at the start: the $2,000 of proceeds plus $1,000 of the seller's own money ([Regulation T](https://www.law.cornell.edu/cfr/text/12/220.12)). Afterwards the account's equity must stay above 30% of the shares' current value ([FINRA Rule 4210](https://www.finra.org/rules-guidance/rulebooks/finra-rules/4210)). In the example a margin call (a demand for more money) comes when the price passes $23.08, a rise of 15.4% (calculated here).
- **Borrow fees.** A study of the lending market found that 91% of shares lent were cheap to borrow, at about 0.17% a year. About 9% were "special" or **hard to borrow**, at an average of 4.3% a year ([D'Avolio, 2002](https://www.aqr.com/insights/research/journal-article/the-market-for-borrowing-stock)).
- **Dividends and recall.** The short seller pays any dividend to the lender. The lender can ask for the shares back at any time, and if no other lender is found the seller must buy at the market price.

### The asymmetry

A share can fall to zero and no further. The most a short can make is 100%. A share can rise without limit, so the loss has no ceiling.

```figure
{
 "kind": "bar",
 "title": "Profit or loss on 100 shares sold short at $20",
 "sub": "Dollars, by the price at which the shares are bought back. The position starts at $2,000.",
 "unit": "$",
 "sign": true,
 "x": ["$0", "$10", "$20", "$30", "$40", "$60", "$100"],
 "xName": "Price when bought back",
 "series": [
  {"name": "Profit or loss", "values": [2000, 1000, 0, -1000, -2000, -4000, -8000]}
 ],
 "labels": "all",
 "note": "Calculated here, before fees. The best case is a gain of $2,000. At $100 the loss is four times the original position. A position that goes wrong also grows: at $40 the short is twice as large a share of the account as when it was opened, while a losing long position shrinks."
}
```

### Short interest, days to cover and the squeeze

**Short interest** is the number of shares currently sold short. US brokers report it twice a month and FINRA (the brokers' regulator) publishes it free ([FINRA](https://www.finra.org/investors/insights/short-interest)). It is usually quoted as a percent of the **float** (the shares available to trade). **Days to cover** is short interest divided by average daily trading volume: 20 million shares short in a share that trades 4 million a day is five days.

A **short squeeze** is a rise in price that forces short sellers to buy, which pushes the price higher and forces more of them to buy. High short interest, many days to cover and a small float are the fuel.

**Volkswagen, October 2008.** On Sunday 26 October the carmaker Porsche disclosed that it held 42.6% of Volkswagen's ordinary shares and options on a further 31.5%. The state of Lower Saxony held 20.3%. At most 5.6% of the shares were left to buy, and about 12.8% had been sold short. The price went from €211 on the Friday to more than €1,005 on the Tuesday. Short sellers' losses were estimated at more than €20 billion ([Allen, Haas, Nowak and Tengulov, 2021](https://feeds.usi.ch/documents/attachment/2670/market-efficiency-and-limits-to-arbitrage.pdf)).

**GameStop, January 2021.** Short interest in the video-game retailer reached 122.97% of the float. More than 100% is possible because a borrowed share, once sold, can be lent again by its new owner, and each loan counts. The shares closed at $19.95 on 12 January and at $347.51 on 27 January ([SEC staff report, Oct 2021](https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf)). A short of 100 shares, worth $1,995, had lost $32,756 (calculated here). The SEC staff added a caution: short sellers' buying was a small part of total buying, and a short squeeze "did not appear to be the main driver" of the rise.

### The US rules a trader meets

- **The alternative uptick rule (Rule 201).** When a share falls 10% or more from the previous day's close, short sales for the rest of that day and all of the next are allowed only at a price above the current best bid (the highest price any buyer is quoting) ([SEC, 24 Feb 2010](https://www.sec.gov/news/press/2010/2010-26.htm)). A short seller can no longer sell to the bid.
- **Short-position reporting (Rule 13f-2, Form SHO).** Adopted in October 2023, it would make large managers report short positions monthly, with the SEC publishing totals per share and no names ([SEC, 13 Oct 2023](https://www.sec.gov/newsroom/press-releases/2023-221)). It has not started. A federal appeals court sent the rule back to the SEC in August 2025, and in December 2025 the SEC moved the start to 2 January 2028 ([Morgan Lewis, Dec 2025](https://www.morganlewis.com/pubs/2025/12/short-sale-reporting-on-form-sho-compliance-date-further-extended-to-2028)).

## Other ways to bet on a fall

Two other instruments limit the loss to a known amount paid up front. Both profiles depend on them.

### Put options

A **put option** is a contract that gives its buyer the right to sell a share at a fixed price (the **strike**) until a fixed date (the **expiry**). The buyer pays a **premium** for it. If the share is below the strike at expiry, the put is worth the difference. If not, it expires worthless and the premium is lost. One contract covers 100 shares.

A real example. On the morning of 24 November 2026 the largest fund tracking the S&P 500 (ticker SPY) traded at $718.73 ([Yahoo Finance](https://finance.yahoo.com/quote/SPY/options/)). A put with a strike of $650, which is 9.6% lower, expiring on 19 March 2027, was offered at $14.68 a share ([OptionCharts](https://optioncharts.io/options/SPY/option-chain?option_type=put&expiration_dates=2027-03-19:m&view=list&strike_range=all)). One contract cost $1,468.

```figure
{
 "kind": "bar",
 "title": "What a $650 put on the S&P 500 fund pays at expiry",
 "sub": "Profit or loss as a percent of the $14.68 premium, by the fund's price on 19 March 2027. The fund was at $718.73 when the put was priced.",
 "unit": "%",
 "sign": true,
 "x": ["$720 (flat)", "$680 (−5%)", "$650 (−10%)", "$635 (−12%)", "$620 (−14%)", "$600 (−17%)", "$575 (−20%)", "$550 (−23%)"],
 "xName": "Fund price at expiry",
 "series": [
  {"name": "Profit or loss on the premium", "values": [-100, -100, -100, 2, 104, 241, 411, 581]}
 ],
 "labels": "all",
 "note": "Calculated here: the put is worth the strike minus the price at expiry, or nothing. Break-even is $635.32, a fall of 11.6% in under four months. A fall of 9% loses the whole premium, the same as no fall at all. Prices are quotes from the morning of 24 November 2026.",
 "source": "OptionCharts (option quote); Yahoo Finance (fund price)",
 "sourceUrl": "https://optioncharts.io/options/SPY/option-chain?option_type=put&expiration_dates=2027-03-19:m&view=list&strike_range=all"
}
```

The loss is capped at the premium. The cost is **time decay**: an option loses value every day that the fall does not come. The buyer must be right about direction, size and timing at once.

### Credit default swaps

A **bond** is a loan that can be traded. A **credit default swap (CDS)** is insurance on a bond. The buyer pays a premium every year, quoted as a percent of the amount insured. If the borrower defaults (fails to pay), the seller pays the buyer the bond's lost value. The buyer does not need to own the bond ([overview](https://en.wikipedia.org/wiki/Credit_default_swap)). A CDS is therefore a way to bet on a default: the loss is limited to the premiums, and the payoff can be many times larger.

An invented example. A fund with $500 million of capital buys protection on $1,000 million of bonds at 2% a year. The premium is $20 million a year, which is 4% of the fund's capital.

- After three years with no default, the fund has paid $60 million and is down 12% from this position alone.
- If the bonds then default and are worth 40 cents on the dollar, the seller pays 60% of $1,000 million: $600 million, more than the whole fund.
- If the market only becomes afraid of a default, the price of protection rises and the contract can be sold at a profit.

```figure
{
 "kind": "bar",
 "title": "Paying for insurance while waiting: a fund's capital",
 "sub": "Fund capital, start = 100, when premiums on credit default swaps cost 4% of capital a year and nothing else changes",
 "x": ["Start", "Year 1", "Year 2", "Year 3", "Year 4, no default", "Year 4, default"],
 "series": [
  {"name": "Fund capital", "values": [100, 96, 92, 88, 84, 204]}
 ],
 "labels": "all",
 "note": "An invented example, calculated here: protection on bonds worth twice the fund's capital at 2% a year, and a default in year 4 that pays 60% of the amount insured (120 on a base of 100, less 16 of premiums). The last two bars show the two ways year 4 can end. The investor sees three losing years first, and has to decide in year 3 whether the manager is early or wrong."
}
```

> [!define] Negative carry
> **Carry** is what a position earns or costs while it is simply held. A share that pays a dividend has positive carry. A put option, a CDS and a short in a hard-to-borrow share have **negative carry**: they cost money every day until the event arrives. Negative carry is the price of being early.

**The two trades in the profiles.** From 2005 Michael Burry's fund bought credit default swaps on bonds backed by risky US home loans. It paid premiums for about two years while those bonds held their value, and investors asked for their money back before the bonds failed ([account of Scion](https://en.wikipedia.org/wiki/Scion_Asset_Management)). In late February 2020 Bill Ackman's funds bought credit default swaps on indexes of company debt as the pandemic spread, and sold them by 23 March, after the price of such insurance had jumped ([account of the hedge](https://en.wikipedia.org/wiki/Bill_Ackman)). The [Burry](/blog/michael-burry) and [Ackman](/blog/bill-ackman) profiles give the sizes and results.

## Reading headlines about filings

Each quarter, headlines report that a famous investor has "bet" some huge sum against the market. Most misread Form 13F, which values a put at the price of the shares it covers, not at what was paid.

Take the put above. A fund buys 20,000 contracts, covering 2 million shares, for $29.4 million. On its 13F the position appears as 2 million shares of SPY, marked "PUT", valued at $1,437 million (calculated here).

```figure
{
 "kind": "hbar",
 "title": "One position, two numbers",
 "sub": "20,000 put contracts on the S&P 500 fund, strike $650, at the prices of 24 November 2026, in millions of dollars",
 "unit": "$m",
 "highlight": ["Premium paid: the most that can be lost"],
 "rows": [
  ["Value shown on Form 13F", 1437, "2 million shares × $718.73"],
  ["Premium paid: the most that can be lost", 29.4, "2 million × $14.68"]
 ],
 "note": "Calculated here. The form shows 49 times the money at risk. The headline writes itself: a $1.4 billion bet against the market. The filing says nothing about the rest of the book: shorts, swaps, cash and foreign shares are absent, and the put may be a hedge for longs that are worth far more."
}
```

This is what happened in August 2023, when a 13F from Michael Burry's firm listing puts on two index funds was reported as a $1.6 billion bet on a crash. The [profile](/blog/michael-burry) covers it.

### Does copying 13F filings work?

- **Hidden holdings are the good ones.** Funds may ask the SEC to keep some holdings confidential for a time. Those holdings outperformed for up to twelve months ([Agarwal, Jiang, Tang and Yang, 2013](https://business.columbia.edu/sites/default/files-efs/pubfiles/6037/Hedge_fund_skill.pdf)). The public list is what remains.
- **The general case did not.** Two US exchange-traded funds (tickers GVIP and GURU) are built from hedge funds' 13F filings. From 3 November 2016 to 23 November 2026 the one holding the shares most often found among hedge funds' top ten positions returned 14.68% a year. The other returned 11.30% a year. A fund tracking the S&P 500 returned 14.93% a year ([totalrealreturns.com](https://totalrealreturns.com/n/SPY,VBINX,GVIP,GURU)). Both copycat funds fell further in 2022: 31.95% and 27.94%, against 18.18%.

Confidence: B (ten years of public prices for two funds).

## The evidence on short sellers and contrarians

### Short sellers are well informed

- A study of short sale orders on the New York Stock Exchange from 2000 to 2004 found that heavily shorted shares trailed lightly shorted shares by 1.16% over the next 20 trading days, or 15.6% a year ([Boehmer, Jones and Zhang, 2008](https://ideas.repec.org/a/bla/jfinan/v63y2008i2p491-527.html)).
- A longer study, 1976 to 2002, found that the 1% of shares with the highest short interest trailed by 0.53% a month when each share counted equally, and by only 0.05% a month weighted by size ([Asquith, Pathak and Ritter, 2004](https://www.nber.org/papers/w10434)).
- **Activist short sellers** publish a report accusing a company of fraud or overvaluation after shorting it. A study of 17 such sellers and 113 US-listed targets from 2006 to 2011 found that targets fell 21.9% over three months and 56.8% over twelve, measured against the market ([Ljungqvist and Qian, 2014](https://www.nber.org/papers/w19834)).

### Yet funds that only short have lost money

Shares rise over time, short positions cost money to hold, and the losses are uncapped. HFR's index of short-biased funds lost 18.60% in 2013, 3.89% in 2014 and 1.58% in 2015, gained 1.22% in 2016 and lost 9.75% in 2017 ([HFR Media Reference Guide, Sep 2024](https://mondovisione.com/_assets/files/HFR-Media-Reference-Guide-2024.09.09.pdf)). That is a loss of 6.8% a year for five years, while the S&P 500 fund gained 15.7% a year (calculated here). The index does not appear in HFR's tables after 2017.

| Short seller | What happened | Source |
|---|---|---|
| Jim Chanos (Kynikos, founded 1985) | Closed his funds in November 2023. Assets had fallen from about $8 billion in 2008 to under $200 million. | [Hedgeweek, 20 Nov 2023](https://hedgeweek.com/news/short-seller-chanos-to-close-hedge-funds-after-almost-40-years) |
| Hindenburg Research (founded 2017) | After its January 2023 report the Adani group lost about $150 billion of market value. The firm's closure was announced on 15 January 2025. | [Overview](https://en.wikipedia.org/wiki/Hindenburg_Research) |
| Andrew Left (Citron Research) | Charged in July 2024. Convicted by a jury on 1 June 2026 of a securities fraud scheme and 12 counts of securities fraud, for trading against his own published calls; acquitted on four counts. An appeal is promised. | [US Department of Justice, 2 Jun 2026](https://www.justice.gov/opa/pr/activist-short-seller-convicted-21m-stock-market-manipulation-scheme); [Fortune, 3 Jun 2026](https://fortune.com/2026/06/03/andrew-left-citron-research-securities-fraud-conviction/); [overview](https://en.wikipedia.org/wiki/Andrew_Left) |

Left's sentencing was set for 31 August 2026. The outcome was not found (not verified). Muddy Waters, founded by Carson Block in 2010, is another well-known firm of this kind ([overview](https://en.wikipedia.org/wiki/Muddy_Waters_Research)).

### Contrarian evidence

A **contrarian** buys what the crowd has abandoned and sells what it loves.

- **De Bondt and Thaler (1985)** formed portfolios of the 35 worst and 35 best performing New York shares of the previous three years. Over the next three years the losers beat the market by about 19.6% and the winners trailed it by about 5.0% ([Journal of Finance](https://ideas.repec.org/a/bla/jfinan/v40y1985i3p793-805.html); figures as widely quoted from the abstract, not verified on the page).
- **Lakonishok, Shleifer and Vishny (1994)** found that shares cheap against earnings, dividends or assets beat expensive "glamour" shares, and argued that this came from investors projecting recent trends too far and not from extra risk ([NBER working paper 4360](https://www.nber.org/papers/w4360)).

Both effects work over years. Over months the opposite holds: winners keep winning (the momentum effect in the [quant primer](/blog/quant-primer)).

### The limits of being right early

In 1997 Andrei Shleifer and Robert Vishny explained why mispriced assets are not corrected at once ([The Limits of Arbitrage](https://ideas.repec.org/a/bla/jfinan/v52y1997i1p35-55.html)). In plain words:

- The people best placed to correct a wrong price are specialist funds using other people's money.
- When a price is wrong and gets more wrong, the fund shows a loss.
- Investors cannot see the manager's reasoning. They see the loss, and they withdraw.
- The fund must sell at exactly the moment the bet is most attractive.

Lock-ups, gates, side pockets and listed funds are the industry's defences against its own investors. Negative carry sharpens the problem, because a put or a CDS loses money every month even when the price stands still.

## How often crash calls work

The evidence is thin and does not favour forecasters. The research firm CXO Advisory graded 6,582 public forecasts of the US stock market made by 68 commentators, collected from 2005 to 2012. Averaged by forecaster, 47.4% were right, slightly worse than a coin ([CXO Advisory, Guru Grades](https://www.cxoadvisory.com/gurus/)). Three well-known bears in the sample, Marc Faber, Jeremy Grantham and Bill Fleckenstein, were right 44.6%, 44.2% and 37.3% of the time.

The firm's current tally, which starts in 2022, shows 1,206 graded predictions, 41% of them right as of 20 November 2026. Saying "stocks will go higher" each time would have been right 62% of the time (same page).

> [!warn] Confidence: C
> One firm's grading, with its own rules. The structural point is safer than the percentages: shares have risen in most periods, so a forecaster who is always bearish is wrong most of the time and is remembered for the one crash.

## When it went wrong

```figure
{
 "kind": "timeline",
 "title": "Squeezes, blow-ups and closures, 2008–2026",
 "events": [
  ["26–28 Oct 2008", "Volkswagen", "Shares go from €211 to over €1,005 in two trading days. Short sellers lose an estimated €20 billion or more."],
  ["Aug 2015 – Mar 2016", "Valeant", "The drug company's shares fall 87%. Sequoia Fund, with more than 30% of its assets in the one share, falls 22%."],
  ["Jan 2021", "GameStop and Melvin Capital", "Short interest of 123% of the float. Melvin Capital loses 53% in the month."],
  ["26 Mar 2021", "Archegos", "A family office with a few huge positions held through swaps defaults. Banks lose about $10 billion."],
  ["2022", "Tiger Global", "A fund concentrated in fast-growing technology shares is down 52% by the end of May."],
  ["18 May 2022", "Melvin Capital closes", "Sixteen months after the squeeze."],
  ["Nov 2023", "Chanos closes his funds", "Assets under $200 million, from about $8 billion in 2008."],
  ["15 Jan 2025", "Hindenburg Research disbands", "The firm behind the Nikola and Adani reports stops."],
  ["1 Jun 2026", "Andrew Left convicted", "A jury finds the Citron founder guilty of securities fraud."],
  ["Jul and Nov 2026", "Crowded positions reverse", "The shares most held by hedge funds have their worst month against the S&P 500 in over 20 years; in November funds cut positions at the fastest pace since March 2020."]
 ],
 "note": "Sources for each episode are given in the text below and in the sections above."
}
```

**Valeant, 2015–2016.** Valeant was a drug company that grew by buying other drug makers and raising prices. Several concentrated funds held large stakes, Pershing Square among them (see the [Ackman profile](/blog/bill-ackman)). In October 2015 the short seller Citron accused it of booking false sales through a pharmacy tied to it ([overview](https://en.wikipedia.org/wiki/Bausch_Health)). The shares fell 87%, from a high of $265.52 in August 2015 to $33.43 in March 2016 ([account of Sequoia Fund](https://en.wikipedia.org/wiki/Sequoia_Fund), citing Bloomberg).

Valeant had grown to more than 30% of the assets of Sequoia Fund, a respected US mutual fund. The fund fell 22% over those months, worse than 99% of its rivals. Two of its five independent directors resigned, and its long-time manager retired in March 2016. The last shares were sold by mid-June 2016. For the first half of 2016 the fund returned −13.2% against +3.8% for the S&P 500; without Valeant it would have returned +2.3% ([Fortune, 13 Jul 2016](https://fortune.com/2016/07/13/valeant-sequoia-fund/)). The lesson: a position can become 30% of a fund by rising.

**Melvin Capital, January 2021.** Melvin was a long/short fund with a large short in GameStop. It lost 53% in January 2021, about $6.8 billion, and took $2.75 billion from two other hedge fund firms. It ended 2021 down 39% and announced its closure on 18 May 2022 ([overview](https://en.wikipedia.org/wiki/Melvin_Capital), citing the Wall Street Journal). The lesson: a short that is public and larger than the float can be attacked.

**Archegos, March 2021.** Archegos managed the fortune of Bill Hwang. It held a few very large positions through **total return swaps** (contracts in which a bank owns the shares and passes the gains and losses to the client). Because the banks held the shares, Archegos filed nothing, and no bank saw the positions at the others. On 26 March 2021 it could not meet margin calls. Credit Suisse lost $5.5 billion, Nomura $2.85 billion, Morgan Stanley $911 million and UBS $774 million: with one smaller loss, about $10.3 billion in all. Hwang was later sentenced to 18 years in prison ([overview](https://en.wikipedia.org/wiki/Archegos_Capital_Management)). The lesson: concentration and leverage together leave no time to be early.

**Tiger Global, 2022.** A fund concentrated in technology growth companies was down 52% for the year by the end of May 2022, erasing about two thirds of the gains made over its life ([overview](https://en.wikipedia.org/wiki/Tiger_Global_Management), citing the Wall Street Journal).

**2026.** In July the shares most widely held by hedge funds had their worst month against the S&P 500 in more than 20 years of Goldman Sachs data ([Hedgeweek, 21 Aug 2026](https://hedgeweek.com/news/hedge-funds-suffer-historic-july-setback-as-ai-trade-unravels)). In early November US long/short funds cut gross exposure by 9 points in a week, the most since March 2020 ([Beinsure, 18 Nov 2026](https://beinsure.com/news/hedge-funds-cut-leverage-at-fastest-pace-amid-tech-selloff/), citing Bloomberg; not verified at the source).

> [!take] The common thread
> None of these was a diversified portfolio having a bad year. Each was one position, or one crowded group, large enough to decide the result, with borrowed money or impatient investors behind it.

## The base rates

A base rate is how often something has happened in the past. This section covers the average fund, not the famous exceptions.

**Hedge fund indexes.** HFR's Fund Weighted Composite averages the after-fee returns that hedge funds report to it. The table sets it beside an S&P 500 fund and a balanced fund of 60% US shares and 40% US bonds ("60/40").

| | 10 years, 2016–2025 | 20 years, 2006–2025 |
|---|---|---|
| All hedge funds (HFRI Fund Weighted Composite) | 6.6% a year | 5.3% a year |
| Share-picking hedge funds (HFRI Equity Hedge) | 8.1% a year | not found |
| Funds of hedge funds (HFRI Fund of Funds) | 4.8% a year | not found |
| 60/40 balanced fund | 9.4% a year | 7.9% a year |
| S&P 500 index fund | 14.7% a year | 10.9% a year |

Sources: HFRI yearly returns to 2023 from the [HFR Media Reference Guide](https://mondovisione.com/_assets/files/HFR-Media-Reference-Guide-2024.09.09.pdf), 9.8% for 2024 (HFR commentary, not verified at the source) and 12.6% for 2025 ([Hedgeweek, 9 Jan 2026](https://hedgeweek.com/news/hedge-funds-post-strongest-annual-gains-since-2009-says-hfr)); rows two and three from the [UBS bulletin](https://www.ubs.com/global/en/assetmanagement/insights/asset-class-perspectives/hedge-funds/articles/uga-hf-bulletin-dec-2025.html); the public funds from [totalrealreturns.com](https://totalrealreturns.com/n/SPY,VBINX,GVIP,GURU). Annualised here from calendar-year returns.

```figure
{
 "kind": "line",
 "title": "$100 invested at the end of 2005",
 "sub": "Value at each year end to 2025: the average hedge fund after fees, a 60/40 balanced fund and an S&P 500 index fund",
 "unit": "$",
 "x": ["2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
 "xName": "Year end",
 "series": [
  {"name": "S&P 500 index fund", "values": [100, 116, 122, 77, 97, 112, 114, 132, 175, 199, 201, 225, 274, 262, 343, 406, 523, 428, 540, 674, 793]},
  {"name": "60/40 balanced fund", "values": [100, 111, 118, 92, 110, 125, 130, 144, 170, 187, 188, 204, 232, 225, 274, 318, 363, 302, 354, 405, 460]},
  {"name": "Average hedge fund (HFRI)", "values": [100, 113, 124, 101, 121, 133, 126, 134, 146, 151, 149, 157, 170, 162, 179, 201, 221, 212, 229, 251, 283]}
 ],
 "marks": [["2008", "Crisis"], ["2022", "Shares and bonds fall"]],
 "note": "Calculated here by compounding calendar-year returns. The hedge fund average did what it promises in 2008 (−19% against −37%) and in 2022 (−4% against −18%). It was ahead of both funds through 2010, behind the 60/40 fund from 2011 and behind both from 2013. The index flatters real results: funds choose whether to report, and funds that fail stop reporting.",
 "source": "HFR Media Reference Guide (HFRI to 2023), HFR and Hedgeweek (2024, 2025); totalrealreturns.com (SPY and VBINX)",
 "sourceUrl": "https://mondovisione.com/_assets/files/HFR-Media-Reference-Guide-2024.09.09.pdf"
}
```

**Buffett's bet.** On 19 December 2007 Warren Buffett bet that an S&P 500 index fund would beat a selection of hedge funds over ten years. His opponent, the advisory firm Protégé Partners, chose five funds of funds, which between them held more than 200 hedge funds ([Berkshire Hathaway letter, 2017](https://www.berkshirehathaway.com/letters/2017ltr.pdf)).

```figure
{
 "kind": "hbar",
 "title": "The ten-year bet, 2008–2017",
 "sub": "Total gain over the ten years, percent, after all fees",
 "unit": "%",
 "highlight": ["S&P 500 index fund"],
 "rows": [
  ["S&P 500 index fund", 125.8, "8.5% a year"],
  ["Fund of funds C", 87.7, "6.5% a year"],
  ["Fund of funds B", 42.3, "3.6% a year"],
  ["Fund of funds E", 27.0, "2.4% a year"],
  ["Fund of funds A", 21.7, "2.0% a year"],
  ["Fund of funds D", 2.8, "0.3% a year; closed in 2017"]
 ],
 "note": "All five beat the index fund in 2008, losing 16.5% to 30.1% against 37.0%. In each of the next nine years the five as a group trailed it. Their simple average was 3.0% a year. Buffett put the fixed fees of the two layers at about 2.5% of assets a year.",
 "source": "Berkshire Hathaway, letter to shareholders for 2017, pages 11–12",
 "sourceUrl": "https://www.berkshirehathaway.com/letters/2017ltr.pdf"
}
```

**Closures.** HFR counted about 562 new hedge funds and 287 liquidations in 2025, after 406 liquidations in 2024 ([Hedgeweek, 27 Mar 2026](https://hedgeweek.com/news/hedge-fund-launches-hit-four-year-high-as-investors-position-for-volatility)).

> [!warn] What the investor in the average equity hedge fund got
> About 8% a year after fees over the ten years to 2025, against about 15% from an index fund and 9% from a 60/40 fund. What was bought was a smaller loss in 2008 and 2022. The famous records in the two profiles are exceptions to this, not examples of it.

## What an individual can and cannot take from it

**Cannot be copied:**

- **Board seats and the power to change a company.** Part of an activist's return comes from what it makes the company do.
- **Cheap borrowing of shares**, in size, through prime brokers (the bank divisions that lend to funds).
- **Credit default swaps.** They trade between institutions under negotiated contracts.
- **Locked-up capital.** An individual's own patience is the only gate.

**Can be copied:**

- **Sizing by conviction, with a hard cap.** One failure in ten equal positions costs 10% in any account.
- **Written exit conditions:** a thesis with a date and a statement of what would prove it wrong.
- **Hedges with a known maximum loss**, such as a bought put.
- **Reading filings for what they are:** a 13F is a partial list of longs on a past date.
- **Checking short interest, days to cover and borrow cost** before trading a heavily shorted share, in either direction.

## What carries over

### Investing (years)

- **The index fund won.** Over 10 and 20 years to 2025 it beat the average hedge fund by 8.1 and 5.6 percentage points a year. Buffett's bet came out the same way.
- **Fees compound.** At 10% a year before fees, 2 and 20 leaves $186 after ten years where an index fund leaves $258.
- **The gate is a decision made in advance.** Hedge fund investors forced sales at lows by redeeming. An investor adding to index funds on a schedule faces the same urge in a pullback, and a 47% record for public market forecasts is the base rate for the headlines that feed it.

### Swing trading (days to weeks)

- **Squeezes in shares that gap up on news.** When a heavily shorted share gaps up on earnings or other news, short sellers facing margin calls and recalls become buyers. High short interest, many days to cover and a high borrow fee all raise the pressure. The same three numbers mark shares where the move can reverse fast once the forced buying ends.
- **Concentration by accident.** Sequoia's 30% position grew by rising. A swing account that adds to winners reaches the same shape unless a cap per position is checked at current prices.

> [!test] Two hypotheses to check
> - Among earnings gaps up of more than 5%, shares with short interest above 15% of the float had a wider spread of five-day outcomes, in both directions, than shares below 5%.
> - In a trade history, positions that had grown past a set share of the account before a pullback gave back more, in R, than positions trimmed to the cap.

### Day trading (minutes to hours)

**The uptick rule changes the short side intraday.** Once a share is down 10% on the day, short sales may be made only above the best bid, for the rest of that day and the next. The order rests above the bid and fills only if buyers come up to it. A day trader shorting weak shares meets this on the days the shares are weakest.

**Halts.** Under the limit up-limit down rule a share that tries to trade outside a band around its average price of the last five minutes is paused for five minutes. The band is 5% for large shares above $3 and 10% for most others ([LULD plan](https://www.luldplan.com/)). No stop order fills during a pause, and trading can resume well past the stop.

**Why a fixed risk unit matters more on the short side.** A fixed unit of risk (1R) assumes the stop is where the trade ends. An illustration: 100 shares sold short at $20.00 with a stop at $20.50 risk $50, which is 1R. News arrives, the share is halted, and it reopens at $23.00. The loss is $300, or 6R. Smaller size in shares with high short interest, a small float or pending news is the one defence that does not depend on the stop being filled.

**The cost of being early applies to any trade against the trend.** Fading a strong 5-minute opening range breakout is a small contrarian bet. Like the fund paying CDS premiums, the trader loses a little each time the trend continues and is paid only when it turns. The wins must be large and frequent enough to cover many small losses.

> [!test] Two hypotheses to check
> - In a trade history of intraday shorts, the average slippage on stops, in R, is larger than on long trades, and largest in shares with a float under 20 million.
> - Fades of a first 5-minute range breakout have a lower win rate and a higher average win, in R, than trades taken with the breakout, and the gap in expectancy is within what chance would produce at the sample size (see the table of required trades in the [quant primer](/blog/quant-primer)).

## What to learn first

Ten terms carry most of the two profiles: **gross and net exposure**, **high-water mark**, **side pocket** (a part of a fund that investors cannot redeem), **discount to NAV**, **13D and 13F** (the stake filing and the quarterly list of longs), **proxy fight**, **short squeeze**, **put option**, **credit default swap** (insurance on a bond) and **negative carry** (the cost of holding a position while waiting).

A reading list:

1. **Michael Lewis, *The Big Short*** (2010). The mortgage trade, with Burry in it. [Overview](https://en.wikipedia.org/wiki/The_Big_Short)
2. **Gregory Zuckerman, *The Greatest Trade Ever*** (2009). The same trade through John Paulson's fund. [Overview](https://en.wikipedia.org/wiki/The_Greatest_Trade_Ever)
3. **Christine Richard, *Confidence Game*** (2010). Ackman's long campaign against the bond insurer MBIA. [Background on MBIA](https://en.wikipedia.org/wiki/MBIA)
4. **David Einhorn, *Fooling Some of the People All of the Time*** (2008). One short campaign and the cost of waiting. [Author](https://en.wikipedia.org/wiki/David_Einhorn_(hedge_fund_manager))
5. **Joel Greenblatt, *You Can Be a Stock Market Genius*** (1997). Spin-offs and the other events activists create. [Author](https://en.wikipedia.org/wiki/Joel_Greenblatt)

Free primary sources: the SEC's bulletin on [hedge funds](https://www.sec.gov/files/ib_hedgefunds.pdf), FINRA's page on [short interest](https://www.finra.org/investors/insights/short-interest), and every 13D and 13F on the SEC's EDGAR system. The [method post](/blog/investor-styles-method) explains the confidence grades, and the [global macro primer](/blog/global-macro-primer) covers bonds and currencies.

## Sources

Sources are linked after each claim.

- **Primary:** SEC rules, press releases, staff answers and the GameStop staff report; the Investment Company Act, Regulation T and FINRA Rule 4210; Berkshire Hathaway's letters for 1993 and 2017; HFR's Media Reference Guide of September 2024; the academic papers named in the text.
- **Secondary:** Barclays, Lazard and Sidley Austin on activism; the UBS bulletin; Hedgeweek, Fortune and Beinsure; Wikipedia's summaries of press reports; totalrealreturns.com.
- **Calculated for this primer:** the fee, exposure, concentration, Kelly and margin arithmetic; the put pay-offs and the 13F comparison; the credit default swap example; every annualised return in the base-rate table and the growth chart.
- **Limits of this research.** Hedge fund indexes rest on returns that funds choose to report. The 2024 index return and the average fee were seen only in summaries of HFR releases. The activist index was found only to 2023 and the short-bias index only for 2013 to 2017. Barclays and Lazard count campaigns differently; the yearly chart uses Barclays alone. Goldman Sachs' exposure figures come through a secondary outlet. The event window in Brav and co-authors, the De Bondt and Thaler figures and the Coffee and Palia summary were not checked against the papers' own text. Andrew Left's sentence and Tiger Global's full-year 2022 loss were not found. The forecaster grades are one firm's method. The option prices are one morning's quotes. The Burry and Ackman trades are given in outline only; their profiles carry the sourced numbers.

This is a study of a style of investing. It is not advice to buy or sell anything.
