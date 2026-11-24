---
title: "Jim Simons: a small edge, repeated millions of times"
date: 2026-11-23
order: 9
tags: [research, profile, investor-styles, quant]
series: investor-styles
summary: Medallion's reported 66% a year before fees is not in audited public filings but is corroborated by a Senate report and by the firm's own statements to a US regulator; it came from being right slightly more than half the time on millions of small, short, heavily borrowed trades in a fund capped near $10bn and closed to outsiders, and the funds Renaissance sold to the public did not repeat it.
vault: Studies/30 Investor Styles/20 Profiles/Jim Simons
---

Jim Simons (1938–2024) was a mathematician who founded Renaissance Technologies, a hedge fund firm (a private investment firm for wealthy and institutional clients) on Long Island, New York. Its Medallion fund is reported to have made about 66% a year before fees and 39% after fees from 1988 to 2018, with one losing year. It did so with a computer model that was right only slightly more often than wrong, applied to millions of small, short trades, with borrowed money and very low trading costs. The one thing worth taking from him is that arithmetic: a small tested edge, many independent repetitions, and costs counted as carefully as signals. Most of the rest cannot be copied, and the firm itself could not repeat it in the larger funds it sold to outside investors.

The vocabulary for this profile (Sharpe ratio, statistical arbitrage, leverage, backtests, overfitting, market making) is explained in the [quantitative investing primer](/blog/quant-primer). Each term is still defined briefly here the first time it appears.

## At a glance

| What | Detail |
|---|---|
| Style | Systematic trading: a computer model forecasts short-term price moves and trades them without human stock picking |
| Markets | Stocks bought and sold short, futures on commodities, bonds and currencies, in the US and abroad |
| Holding period | Seconds to weeks; the stock portfolio turned over almost completely every three months |
| Borrowed money | Stock positions of 4 to 5 times the fund's capital; 12 to 17 times inside the bank contracts it used from 2000 |
| Size | Medallion: $20m in 1988, about $5bn from 2002, about $10bn from 2010; profits paid out every year |
| Headline record | Medallion, 1988–2018: 66% a year before fees, 39% after; one losing year (1989) |
| Who could invest | Closed to new investors in 1993; outsiders bought out by 2005; since then staff and the firm |
| Status, November 2026 | Simons died on 10 May 2024, aged 86. The firm is run by Peter Brown and David Lippe as joint chief executives |

Sources: a long profile for which Simons was interviewed ([Institutional Investor, Nov 2000](https://people.duke.edu/~charvey/Teaching/BA453_2005/II_On_Jim_.pdf)); the firm's statements to the US Labor Department ([Federal Register, 20 Jan 2012](https://www.govinfo.gov/content/pkg/FR-2012-01-20/pdf/2012-932.pdf)); a US Senate staff report ([Senate report, 22 Jul 2014](https://www.hsgac.senate.gov/wp-content/uploads/imo/media/doc/REPORT-Abuse%20of%20Structured%20Financial%20Products%20%28Basket%20Options%29%20%287-22-14,%20updated%209-30-14%29.pdf)); the firm's registration form ([SEC Form ADV, 1 Jul 2026](https://reports.adviserinfo.sec.gov/reports/ADV/106661/PDF/106661.pdf)); and an obituary ([Fortune, 10 May 2024](https://fortune.com/2024/05/10/jim-simons-obituary-renaissance-technologies-quant-king/)).

```figure
{
 "kind": "timeline",
 "title": "Simons's three careers, 1938–2024",
 "note": "Ten years passed between leaving mathematics and launching Medallion, and two more before the fund worked.",
 "events": [
  ["1938", "Born near Boston, Massachusetts"],
  ["1958", "Mathematics degree from MIT", "A doctorate from Berkeley follows in 1961, at 23."],
  ["1964", "Code breaker", "Institute for Defense Analyses, working for the National Security Agency."],
  ["1968", "Fired; heads mathematics at Stony Brook", "He had publicly opposed the Vietnam War."],
  ["1974–76", "Chern–Simons theory; Veblen Prize", "His best-known mathematics."],
  ["1978", "Leaves academia", "Starts Monemetrics, a currency trading firm, and a fund called Limroy."],
  ["1982", "Firm renamed Renaissance Technologies"],
  ["March 1988", "Medallion launched", "A futures fund with about $20m."],
  ["1989", "Loss of about 30%; trading stopped", "The system is rebuilt for short-term trading."],
  ["1990", "First big year: about 56% after fees"],
  ["1993", "Closed to new investors", "Peter Brown and Robert Mercer arrive from IBM to work on stocks."],
  ["2000", "98.5% after fees", "After very large losses in March. First bank option contract in September."],
  ["2005", "Outside investors bought out", "A separate fund for institutions, RIEF, opens."],
  ["August 2007", "The quant quake", "About 20% lost in a week; Simons overrides the model."],
  ["2010", "Retires as chief executive", "Stays chairman until 1 January 2021."],
  ["September 2021", "Tax settlement", "Insiders agree to pay up to about $7bn."],
  ["10 May 2024", "Dies in New York City, aged 86"]
 ]
}
```

## How he got started

### Mathematics and code breaking

Simons took a mathematics degree at the Massachusetts Institute of Technology (MIT) in 1958 and a doctorate at Berkeley three years later. He taught at MIT and Harvard, then in 1964 joined the Institute for Defense Analyses, a contractor that broke codes for the US government (Institutional Investor 2000, above).

He lost that job for opposing the Vietnam War in public. He wrote a letter answering a 1967 magazine article by the institute's president, a general, and then gave remarks to a news magazine. Most accounts date the dismissal to 1968 (Fortune, above); one says 1967 ([Bloomberg, 27 Nov 2007](https://web.stanford.edu/class/archive/cs/cs224n/cs224n.1114/renaissance.html)). He became head of mathematics at Stony Brook University the same year.

His 1974 paper with Shiing-Shen Chern founded what is now called Chern–Simons theory, later used widely in physics. In 1976 he won the Veblen Prize, the main award in geometry (Institutional Investor 2000, above). Asked in 2000 whether that mathematics had anything to do with his trading, he said it had none. What carried over was the code breaker's habit of building models to find patterns in data ([Simons Foundation, 28 Sep 2012](https://www.simonsfoundation.org/2012/09/28/simons-foundation-chair-jim-simons-on-his-career-in-mathematics/)).

### Ten slow years

Most accounts skip from the prize to the returns. The record shows a decade of ordinary and sometimes poor results first.

- **1978.** He left Stony Brook to trade full time through a firm called Monemetrics and a fund called Limroy. The timeline in his biography gives 1978; Bloomberg gives 1977 ([Zuckerman, *The Man Who Solved the Market*, publisher's sample](https://cdn.penguin.co.uk/dam-assets/books/9780241309735/9780241309735-sample.pdf)).
- **Judgement, not models.** At first he traded on views about interest rates and central bank policy. Limroy also held venture capital stakes (shares in young private companies). It multiplied its capital 25 times in ten years, according to the 2000 profile (Institutional Investor 2000, above).
- **Lenny Baum.** A former code-breaking colleague, Leonard Baum, joined in 1979. He built a model for currencies but preferred to trade on his own judgement (Bloomberg 2007, above). He left in 1984 after steep losses (Zuckerman's timeline, above). A widely repeated detail, that his portfolio fell 40% on a bond position, comes from the biography and was not checked against it (not verified).
- **James Ax.** Another mathematician, James Ax, ran the model trading from California from 1985 through a company called Axcom.

Simons shut Limroy and launched Medallion in March 1988 as a fund for model trading in futures (contracts to buy or sell a commodity, bond or currency at a later date). It was named after the mathematics medals he and Ax had won.

### Medallion fails, then works

Medallion made 8.8% after fees in 1988 and then lost steadily. By April 1989 it was about 30% below its peak (Bloomberg 2007, above). Simons stopped trading in June. Ax left after a dispute.

Elwyn Berlekamp, a Berkeley mathematician who had advised Axcom since 1986, bought the largest share of it and moved it to Berkeley. With Simons, the data specialist Sandor Straus and the mathematician Henry Laufer he rebuilt the system around much shorter trades. Trading resumed late in 1989. In 1990 the fund returned 55% after fees of 5% of assets and 20% of profits, by Berlekamp's own account. He sold his share to Simons 16 months after buying it, at six times the price ([Berlekamp's business biography](https://math.berkeley.edu/~berlek/bus.html)).

Two more steps followed:

- **1993.** Simons hired Peter Brown and Robert Mercer from IBM's speech-recognition group to make the method work in stocks. The fund stopped taking new money that year, at about $270m.
- **1995–2000.** The biography dates the breakthrough in stocks to 1995. A separate stock fund was folded into Medallion in 1997 after three middling years (Institutional Investor 2000, above). Stocks gave the fund room to grow: from about $0.8bn in 1997 to $5.2bn in 2002.

By his own later summary, the decision in 1988 to trade wholly on models was the turning point (Simons Foundation 2012, above).

## Where the edge came from

The returns came from statistical analysis, technology, low trading costs and several structural advantages. Simons himself added luck.

| Edge | Evidence | Open to an individual? |
|---|---|---|
| Analysis: many weak, short-lived price patterns combined in one model | The firm's own description to the Senate in 2014; Simons's interviews | The idea, yes. The scale, no |
| Data and technology | Price data collected and cleaned since the 1980s; over a million lines of code by 2014 | No |
| Trading cost | An in-house desk whose only job is cheap execution without moving prices | Partly: costs can be measured |
| Structure: cheap borrowing | Bank contracts that lent 9 dollars for each dollar put up, with the loss limited to that dollar | No |
| Structure: small size, no outside money | Capped near $5bn, then $10bn; all profits paid out each year | No |
| Behaviour | The model is left alone in normal times; exposure is cut when survival is in doubt | Yes |
| Luck or era | His own word for it. Early markets had simple mispricings that are gone | No |

Sources: Renaissance's written statement to the Senate ([Renaissance, 22 Jul 2014](https://www.hsgac.senate.gov/wp-content/uploads/imo/media/doc/STMT%20-%20Renaissance%20%28July%2022%202014%29.pdf)); the hearing record with Peter Brown's sworn testimony ([Senate hearing, 22 Jul 2014](https://www.govinfo.gov/content/pkg/CHRG-113shrg89882/html/CHRG-113shrg89882.htm)); Senate report, Federal Register and Institutional Investor 2000, above.

> [!define] Statistical arbitrage
> Trading on small, repeatable relationships between prices, found by studying history. A typical case: two related stocks drift apart and the model bets that the gap closes. No single bet is reliable. The method depends on making very many of them.

### Right slightly more than half the time

The firm described its own edge in its written statement to the Senate in 2014. Its model's predictions are profitable "only slightly more often than not". It makes a very large number of them, so that the average result becomes steady. Without borrowed money the return would be very small (Renaissance statement, above).

A more exact figure is often quoted. Robert Mercer is reported to have told a friend that Medallion was right 50.75% of the time. The remark comes from the 2019 biography and has no other source ([Institutional Investor, 26 Jan 2020](https://www.institutionalinvestor.com/article/b1k2fymby99nj0/Famed-Medallion-Fund-Stretches-Explanation-to-the-Limit-Professor-Claims)) (not verified). It agrees with the firm's own statement in direction.

```figure
{
 "kind": "bar",
 "title": "What a 50.75% win rate is worth",
 "sub": "Chance of ending with more wins than losses, percent, by number of bets",
 "unit": "%",
 "x": ["100", "1,000", "10,000", "100,000"],
 "xName": "Number of bets",
 "series": [
  {"name": "Chance of being ahead", "values": [52.0, 67.1, 93.2, 100]}
 ],
 "note": "After 100 bets a 50.75% edge is hard to tell from a coin: ahead 52 times in 100, level 8 times and behind 40 times. After 100,000 it is close to certain. The Senate found that Medallion made more than 100,000 trades a day. The calculation assumes bets of equal size that do not depend on each other. When they do move together, as in August 2007, the protection disappears.",
 "source": "Calculated for this profile: exact binomial odds, and a normal approximation for 100,000 bets"
}
```

### Costs as part of the edge

An edge this thin survives only if trading costs less than the edge. Renaissance moved its trading in-house in 1995 and built early electronic links to exchanges. In 2000 it had 20 traders among 140 staff, and their job was to execute at the lowest cost without moving the market (Institutional Investor 2000, above). Campbell Harvey, a finance professor at Duke University, names very low execution costs as one likely reason for the record (Institutional Investor 2020, above).

### Luck, in his own words

In 2000 Simons told potential investors that luck was largely responsible for his reputation, and that each morning he wondered whether he would be lucky that day. He gave an example: in 1990 the fund happened to own oil futures when Iraq invaded Kuwait (Institutional Investor 2000, above).

## The process

```figure
{
 "kind": "flow",
 "title": "How a Medallion trade comes about",
 "note": "No step involves a person deciding to buy a particular stock. The human work is in steps 1 to 4 and in step 8.",
 "steps": [
  ["Collect and clean data", "Decades of prices, plus news, company filings, analyst reports and weather, crop and energy reports."],
  ["Search for patterns", "Start from the data, not from a theory. Look for behaviour that would not occur by chance."],
  ["Test", "Statistical significance, and consistency across time. Only then ask whether some human behaviour could explain it."],
  ["Add to the single model", "Check that the signal is new and not already inside the model. Give it a weight."],
  ["Forecast", "Each forecast has a short, fixed time frame."],
  ["Size and net", "The model sets position sizes from forecast strength, risk and trading cost. Longs and shorts offset each other."],
  ["Execute", "Automated orders, 100,000 or more a day, routed to keep cost and price impact low."],
  ["Re-forecast and watch", "The model revises all day. People monitor and, rarely, cut the whole book."]
 ]
}
```

### Data first

Simons described the method as starting with data and no preconceived ideas, and looking for things that can be repeated thousands of times. A pattern had to pass statistical tests and hold over time before anyone asked why it existed (Institutional Investor 2000, above). The firm told the Senate that it collects every public source it can find that might bear on prices (Renaissance statement, above).

This is a backtest (a trial of a rule on past data) used with discipline. The danger in any backtest is overfitting (finding patterns that are only noise). The checks he named, significance and consistency over time, are the standard defences.

### One model, many signals

New signals were added to one combined system. He called it layering. Each candidate was tested for whether it was truly new or already inside the model, then weighted and added (Institutional Investor 2000, above).

By 2014 the system had over a million lines of code and about a thousand years of people's work in it. Researchers made one or two small changes a week (Senate hearing, above). The biography adds that all researchers could see the whole code base, which could not be confirmed elsewhere (not verified).

### A deadline on every trade

Simons contrasted his method with convergence trading, the style of the failed fund Long-Term Capital Management, which bet that two prices would come together eventually. His objection was that such a bet has no time limit. Renaissance required each forecast to pay off within a set, short period, and revised it constantly (Institutional Investor 2000, above).

### What the signals are

This is where knowledge ends. The firm has never published a signal. The Labor Department filing describes the stock strategies as based mainly on technical methods, meaning forecasts made from prices and trading data (Federal Register 2012, above). Simons said in 2000 that commodities used to trend strongly and no longer did, and that the anomalies were small and brief. Everything more specific in print is inference.

### Sizing and borrowed money

Position sizes come from the model. One glimpse exists: a sister stock fund in 2000 held about 1,000 positions, none above 5% of the fund, with the net exposure of almost every industry within 2% (Institutional Investor 2000, above).

Two people link the firm to the Kelly criterion (a formula that sets bet size in proportion to the edge). William Ziemba, an academic, writes that he taught it to Simons in 1992 ([Ziemba, Jan 2016](https://eprints.lse.ac.uk/119002/1/dp_52.pdf)). Berlekamp had worked under John Kelly at Bell Labs. The firm has confirmed neither.

The larger lever was leverage (trading with borrowed money, which multiplies gains and losses).

```figure
{
 "kind": "hbar",
 "title": "How much Medallion could borrow, by route",
 "sub": "Dollars of stock positions per dollar of the fund's own money",
 "unit": "x",
 "rows": [
  ["Ordinary US brokerage account", 2, "the legal limit for customers"],
  ["Medallion's broker-dealer route, average 2005–06", 4.6, "legal limit about 7.6"],
  ["Deutsche Bank options, average 2005–06", 11.7, "peak 15.9"],
  ["Barclays options, average 2005–06", 12.9, "peak 16.8"],
  ["Upper limit in the Barclays contracts", 20]
 ],
 "highlight": ["Deutsche Bank options, average 2005–06", "Barclays options, average 2005–06"],
 "note": "The bank contracts, described in the section on the tax case, let the fund run six times the borrowing of an ordinary account. At their peak the positions inside them were worth more than $50bn.",
 "source": "US Senate Permanent Subcommittee on Investigations, staff report, 22 Jul 2014"
}
```

Seen from the whole fund the figure is lower. In 2011 the firm told the Labor Department that stock positions were generally 4 to 5 times investor capital (Federal Register 2012, above). The two numbers measure different things: positions against all the fund's capital, and positions against the cash placed in each bank contract.

### Managing and exiting

The stock book is market-neutral (owned shares and shares sold short are balanced, so a general rise or fall should matter little). Exits are made by the model when a forecast expires or changes. There are no discretionary profit targets and no stop orders in any published account.

People intervene at the level of the whole book. The clearest statement comes from a recorded call in November 2008. Brown told Deutsche Bank that the models were working well, but that the firm was trading at reduced levels because "the models don't see the government intervention but we do" (Senate report, above).

## Risk and drawdowns

The stated rules are few.

- **Never trust a model fully.** After the losses of March 2000, Brown offered to resign. His boss refused, telling him that he was worth more now that he knew never to put full faith in a model (Senate hearing, above). The testimony does not name the boss; accounts of the firm take it to be Simons.
- **Survive first.** His words to staff in August 2007 were "Our job is to survive" ([excerpt of Zuckerman's book, Institutional Investor, 6 Nov 2019](https://www.institutionalinvestor.com/article/2bswabr234orjmebrnbb4/culture/bitter-lawsuits-epic-meltdowns-vicious-arguments-jim-simons-renaissance-made-him-billions-but-it-came-at-a-price)).
- **Limit the loss by contract.** From September 2000 the largest positions sat in bank contracts under which the fund could lose only the cash it had put up.

| Episode | Loss | What the firm did |
|---|---|---|
| Early 1989 | About 30% from the peak by April | Stopped trading for about six months; rebuilt the system |
| March 2000 | Very large losses in a few days (amounts not verified) | Found the failing hedge and removed it; bought loss-limiting contracts six months later |
| August 2007 | Over $1bn in a week, about 20% | Simons overrode the model and cut positions |
| November 2008 | None; the year's gross return was 152% | Traded at reduced levels by management decision |
| 2020 | None in Medallion: about +76% after fees | The slower funds for outsiders lost 19% to 32% |

Sources: Bloomberg 2007, Senate hearing, Zuckerman excerpt and Senate report, above; for 2020, [Institutional Investor, 13 Jan 2021](https://www.institutionalinvestor.com/article/b1q3fndg77d0tg/Renaissance-s-Medallion-Fund-Surged-76-in-2020-But-Funds-Open-to-Outsiders-Tanked).

Losses were rare month by month. From January 1993 to April 2005, the only period for which monthly figures have been published, Medallion lost money in 17 months of 148 and in 3 quarters of 49 ([Wikipedia, citing Ziemba and Ziemba, 2007](https://en.wikipedia.org/wiki/Renaissance_Technologies)).

The risk the firm's lenders worried about was not a market crash. A Barclays risk officer told the Senate that his one real concern was duplication: other funds running the same strategies and affecting each other (Senate report, above). August 2007 was that risk arriving.

## The record

### The headline numbers

From 1988 to 2018 Medallion's yearly returns averaged 66% before fees and 39% after. Its trading profits over those 31 years came to about $104.5bn. These figures come from the appendix of Gregory Zuckerman's 2019 biography, which lists the fund's size and trading profit for each year. An academic note reproduces that table ([Guo and Liu, arXiv, 2024](https://arxiv.org/pdf/2405.10917v2)).

The two charts below are built from it. The return before fees is each year's profit divided by the fund's size. The return after fees takes off 5 percentage points and then the performance fee: 20% of profit until 2000, 36% in 2001 and 44% from 2002.

```figure
{
 "kind": "bar",
 "title": "Medallion by year, 1988–2003",
 "sub": "Return per calendar year, percent, before and after fees",
 "unit": "%",
 "x": ["88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "00", "01", "02", "03"],
 "xName": "Year",
 "series": [
  {"name": "Before fees", "values": [15.0, 0.0, 76.7, 54.8, 47.3, 54.1, 93.5, 52.8, 44.4, 31.5, 57.1, 35.6, 128.1, 56.6, 51.1, 44.1]},
  {"name": "After fees", "values": [8.8, -4.1, 55.9, 39.4, 34.0, 39.1, 71.0, 38.3, 31.5, 21.2, 41.7, 24.5, 98.5, 33.0, 25.8, 21.9]}
 ],
 "note": "One losing year after fees, 1989, and none before fees. The fund grew from $20m to $5bn over these years. After-fee figures for 1988, 1989, 1990–94 and 2000 are as published in 2000 and 2007; the others are calculated from the before-fee figure and the fee terms.",
 "source": "Zuckerman (2019), Appendix 1, as reproduced by Guo and Liu; Institutional Investor, Nov 2000; Bloomberg, 27 Nov 2007",
 "sourceUrl": "https://arxiv.org/pdf/2405.10917v2"
}
```

```figure
{
 "kind": "bar",
 "title": "Medallion by year, 2004–2018",
 "sub": "Return per calendar year, percent, before and after fees",
 "unit": "%",
 "x": ["04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"],
 "xName": "Year",
 "series": [
  {"name": "Before fees", "values": [49.5, 57.7, 84.1, 136.6, 152.1, 74.6, 57.5, 71.1, 56.8, 88.8, 75.0, 69.3, 68.6, 85.4, 76.4]},
  {"name": "After fees", "values": [24.9, 29.5, 44.3, 73.7, 82.4, 39.0, 29.4, 37.0, 29.0, 46.9, 39.2, 36.0, 35.6, 45.0, 40.0]}
 ],
 "note": "The two best years were 2007 and 2008, the years of the quant quake and the financial crisis. From 2002 nearly half of each year's profit went to the firm as fees, which is why the two series sit so far apart. After-fee figures are at the 44% fee; some investors paid less.",
 "source": "Zuckerman (2019), Appendix 1, as reproduced by Guo and Liu; after-fee figures for 2006 and 2008 as published by Bloomberg and Institutional Investor",
 "sourceUrl": "https://arxiv.org/pdf/2405.10917v2"
}
```

After 2018 only scattered figures exist: about 76% after fees in 2020, from one investor (Institutional Investor 2021, above), and 30% in 2024, from a social media post by the biographer ([Hedgeweek, 14 Jan 2025](https://www.hedgeweek.com/renaissance-tech-and-two-sigma-lead-2024-quant-gains/)). A figure of 18% for 2022 appears in an unsourced chart (not verified). Nothing was found for 2019, 2021, 2023 or 2025.

### What can be checked

Medallion is a private fund. Its returns are not in public audited filings. The yearly figures reached the public through documents sent to investors and seen by journalists, and through the biography. Four checks against independent sources were possible, and the table passes them. A fifth figure does not fit.

```figure
{
 "kind": "tiles",
 "title": "Four checks on the yearly table",
 "tiles": [
  ["38.5% against 38.5%", "Compound return after fees, 1990–2006", "The table gives 38.4% to 38.6% a year, depending on which published figure is used for 1990. Bloomberg published 38.5% in 2007."],
  ["2,480% against 2,479%", "Total gain after fees, 1989–1999", "The table gives 2,460% to 2,510%, depending on the figures used for 1989 and 1990. A database of offshore funds quoted in 2000 gave 2,478.6%."],
  ["71.2% against 71.9%", "Average return before fees, 1994–2013", "The table against the figure the firm gave the US Labor Department in 2014."],
  ["$34.2bn", "Paid by two banks, 2000–2013", "Profits on contracts held over a year, from bank records obtained by the Senate. The table shows $65.8bn of total profit for those years."]
 ],
 "note": "The first three are calculations made for this profile from the published table. One figure does not fit: in 2012 the firm told the Labor Department that returns before fees had averaged 76.91% over the past twenty years, about 8 points above the table for any such period. The reason is not known.",
 "source": "Bloomberg 2007; Institutional Investor 2000; Federal Register, 14 Aug 2014; Senate report 2014",
 "sourceUrl": "https://www.govinfo.gov/content/pkg/FR-2014-08-14/pdf/2014-19212.pdf"
}
```

The Labor Department papers exist because the firm asked permission for staff retirement accounts to invest in Medallion. They state that the fund is "audited annually by a nationally-recognized accounting firm" (Federal Register 2012, above; a second notice followed on [14 Aug 2014](https://www.govinfo.gov/content/pkg/FR-2014-08-14/pdf/2014-19212.pdf)). The audits themselves are not public.

> [!warn] Record confidence
> - The yearly table, 1988–2018: grade B. Reported consistently by Institutional Investor (2000), Bloomberg (2007) and the biography (2019), from investor documents. Not publicly audited.
> - The scale of the profits and the long-run average before fees: close to grade A. They rest on the firm's own statements to a US regulator and on bank records in a Senate report.
> - Any single year after 2018, monthly returns after April 2005, and the method itself: cannot be checked.

### Fees

The fees were among the highest in the industry and rose with success.

| When | Yearly fee on assets | Share of profits | Source |
|---|---|---|---|
| 1990 | 5% | 20% | Berlekamp |
| 2000 | 5% | 20% | Institutional Investor |
| 2001, 2002 | 5% | 36%, then 44% | Zuckerman, as retold by [Acquired, 2024](https://www.acquired.fm/episodes/renaissance-technologies) |
| 2007 | 5% | 36% | Bloomberg |
| 2011 | 5% | 20% to 44% depending on the investor; 36% overall | Federal Register |
| 2025 | 4% | 36% to 44% | [Institutional Investor, 12 Nov 2025](https://www.institutionalinvestor.com/article/renaissance-suffers-huge-losses-october) |

The range by investor explains a conflict between sources. The biography gives 82.4% after fees for 2008. Reports based on the Labor Department papers give about 98%, and those papers say returns after fees ranged from about 33% to 98% in 2005–2010. Both fit a return before fees of about 152% with different fee rates. Since 2005 the question is mostly internal: the staff pay the fees to their own firm.

### Size, and where the profit was made

```figure
{
 "kind": "line",
 "title": "Fund size and yearly trading profit, 1988–2018",
 "sub": "Billions of US dollars. Size at the start of each year; profit before fees",
 "unit": "$bn",
 "x": ["88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"],
 "xName": "Year",
 "series": [
  {"name": "Fund size", "values": [0.02, 0.02, 0.03, 0.042, 0.074, 0.122, 0.276, 0.462, 0.637, 0.829, 1.1, 1.54, 1.9, 3.8, 5.24, 5.09, 5.2, 5.2, 5.2, 5.2, 5.2, 5.2, 10, 10, 10, 10, 9.5, 9.5, 9.5, 10, 10]},
  {"name": "Trading profit", "values": [0.003, 0, 0.023, 0.023, 0.035, 0.066, 0.258, 0.244, 0.283, 0.261, 0.628, 0.549, 2.434, 2.149, 2.676, 2.245, 2.572, 2.999, 4.374, 7.104, 7.911, 3.881, 5.75, 7.107, 5.679, 8.875, 7.125, 6.582, 6.514, 8.536, 7.643]}
 ],
 "marks": [["93", "Closed to new money"], ["02", "Capped near $5bn"], ["10", "Cap raised to $10bn"]],
 "note": "The fund's size is flat for eight years and then flat again. Profit was paid out, not left to grow. In 2000, 2007 and 2008 the fund earned more than its own size.",
 "source": "Zuckerman (2019), Appendix 1, as reproduced by Guo and Liu",
 "sourceUrl": "https://arxiv.org/pdf/2405.10917v2"
}
```

The firm told the Labor Department that capacity limits (the amount a strategy can trade before its own orders erase the edge) had led it to return all or nearly all profits to investors for years (Federal Register 2012, above).

```figure
{
 "kind": "stack",
 "title": "Where the $104.5bn was made",
 "sub": "Share of total trading profit before fees, 1988–2018, percent",
 "unit": "%",
 "parts": [
  ["1988–1999: fund of $20m to $1.5bn", 2.3],
  ["2000–2009: about $5bn", 36.7],
  ["2010–2018: about $10bn", 61.0]
 ],
 "note": "The opposite of most famous records. Peter Lynch earned most of his margin on a small fund. Medallion made 98% of its dollars from 2000 on, at full size, and its average return before fees was higher in 2000–2018 (about 78%) than in 1988–1999 (47%).",
 "source": "Calculated from Zuckerman (2019), Appendix 1, as reproduced by Guo and Liu"
}
```

The contrast with [Peter Lynch](/blog/peter-lynch) holds only because the fund refused to grow. The dollar size of the stock book seems hardly to have changed when capital doubled in 2010: over $60bn of positions on about $5bn in 2002, by the biography's account (Acquired, above), and 4 to 5 times $10bn in 2011. That reading is an inference from two sources, not a statement by the firm.

### The compounding caveat

Bradford Cornell of the University of California, Los Angeles, calculated that $100 growing at Medallion's yearly returns before fees would have become $398.7m by the end of 2018. He found a standard deviation (the usual measure of how much yearly returns vary) of 31.7%, and a beta (sensitivity to the stock market) of about −1.0: on yearly figures the fund tended to do better when stocks did worse. He concluded that no adequate explanation exists within standard finance (Institutional Investor 2020, above; [CXO Advisory summary](https://www.cxoadvisory.com/?p=33535)).

No investor received that. Profits were paid out every year, so nobody could compound at 66%. Guo and Liu estimate that the money actually in the fund grew by 31.8% a year before fees over the 31 years: 51.8% a year to 2001 and 19.1% a year from 2002, once the size was capped (arXiv, above). The yearly returns are real. The compound figure is a thought experiment.

### In the stress years

```figure
{
 "kind": "bar",
 "title": "Medallion in years of market stress",
 "sub": "Return per calendar year, percent. Medallion after fees; S&P 500 with dividends",
 "unit": "%",
 "x": ["1994", "1998", "2000", "2001", "2002", "2008", "2020"],
 "xName": "Year",
 "series": [
  {"name": "Medallion", "values": [71.0, 41.7, 98.5, 33.0, 25.8, 82.4, 76.0]},
  {"name": "S&P 500", "values": [1.3, 28.3, -9.0, -11.9, -22.0, -36.6, 18.0]}
 ],
 "note": "Turmoil helped. Simons said in 2000 that the fund liked a reasonable amount of volatility and had done very well in 1994 and 1998. Over the 31 years to 2018 the fund trailed the index in four: 1988, 1989, 1997 and 2003. The 2020 figure comes from a single investor.",
 "source": "Medallion as in the charts above; S&P 500 from NYU Stern",
 "sourceUrl": "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html"
}
```

Its Sharpe ratio (return above the risk-free rate, divided by the variability of returns) was 1.89 for the 1990s and 2.52 for 1995–99, against 0.4 to 0.6 for the best-known stock funds of the time (Institutional Investor 2000, above).

### The funds for outside money

Renaissance opened the Renaissance Institutional Equities Fund (RIEF) to outside investors in August 2005, and the Diversified Alpha fund (RIDA) in 2012. Simons said at RIEF's launch that it could in theory manage $100bn. It held $25.6bn by September 2007 (Bloomberg 2007, above).

```figure
{
 "kind": "bar",
 "title": "Medallion, RIEF and the index in selected years",
 "sub": "Return per calendar year, percent, after fees",
 "unit": "%",
 "x": ["2008", "2009", "2011", "2016", "2018", "2020", "2024"],
 "xName": "Year",
 "series": [
  {"name": "Medallion (staff only)", "values": [82.4, 39.0, 37.0, 35.6, 40.0, 76.0, 30.0]},
  {"name": "RIEF (outside money)", "values": [-16.0, -6.2, 34.0, 20.6, 8.5, -19.4, 22.7]},
  {"name": "S&P 500", "values": [-36.6, 25.9, 2.1, 11.8, -4.2, 18.0, 24.9]}
 ],
 "note": "Same firm, same people, different funds. RIEF lost money in Medallion's two best years since 2005, and fell 35.7% from May 2007 to April 2009. From its launch to the end of 2020 it returned 8.05% a year, against 9.6% for the index. Years shown are those for which a RIEF figure was found. Medallion's figures for 2020 and 2024 each rest on a single report.",
 "source": "Institutional Investor, 2017, 2020, 2021, 2024 and 2025; Hedgeweek 2025; NYU Stern"
}
```

Sources for RIEF: Institutional Investor 2021, above; [Institutional Investor, 24 Apr 2017](https://www.institutionalinvestor.com/article/b18bk2mvthrj0q/renaissance-bucks-trend-with-a-surge-in-assets); [Institutional Investor, 14 Nov 2024](https://www.institutionalinvestor.com/article/2e0uykr3vn5booz0smrcw/hedge-funds/renaissances-2024-rebirth). A second data set puts RIEF's 2020 loss at 22.6% to 25 December. For 2016 one report gives Medallion about 25% after fees, below the table's 35.6% ([Morningstar, 29 Dec 2017](https://www.morningstar.com/columns/rekenthaler-report/medallion-fund-is-like-no-other)); the difference was not resolved.

The pattern has continued. In 2020 RIDA lost 31.6%. RIEF's assets fell from nearly $36bn at the start of 2020 to under $20bn by late 2024. In October 2025 RIEF lost 14.4% and RIDA 15.6% in a single month. RIEF then gained 12.65% in November and stood 2.34% up for the year at the end of that month (Institutional Investor 2024 and 2025, above; [Institutional Investor, 8 Dec 2025](https://www.institutionalinvestor.com/article/premium/renaissances-public-funds-stage-double-digit-comeback-november)).

```figure
{
 "kind": "compare",
 "title": "Two products from one firm",
 "cols": [
  {
   "title": "Medallion",
   "tag": "staff and the firm",
   "items": [
    "Holds positions for seconds to weeks.",
    "Stocks, futures, currencies and bonds.",
    "Capital capped near $10bn; all profit paid out.",
    "Borrowing of 12 to 17 times inside the bank contracts.",
    "Balanced between rising and falling bets.",
    "No reported losing year since 1989."
   ]
  },
  {
   "title": "RIEF",
   "tag": "outside investors",
   "items": [
    "Holds positions for six months to a year.",
    "Almost only stocks.",
    "Built to take tens of billions.",
    "Borrowing of about 2.5 times.",
    "Leans towards owning stocks; aims to beat the S&P 500 with lower risk.",
    "Lost 16% in 2008 and 19.4% in 2020."
   ]
  }
 ],
 "note": "The holding period for RIEF is as described by a Medallion investor in January 2021; the rest is from fund documents quoted by Institutional Investor. The usual explanation: a fast pattern can be traded only in small size, so a fund built for more money has to trade slower patterns, which are weaker and shared with other funds."
}
```

The firm's own filing for RIEF warns that large positions can be hard to exit quickly without moving prices (Institutional Investor 2025, above).

## Signature episodes

A quantitative fund has no famous single trades. Its history is a set of episodes in which the system was built, failed or was overruled.

### Win: the rebuild of 1989–90

The first Medallion system traded less often and held positions for longer. It lost about 30% in early 1989. Simons stopped it instead of waiting for a recovery. The rebuilt system traded far more often and held for far less time. The result was about 56% after fees in 1990 and no reported losing year since. He later called the move to trading wholly on models a wonderful decision (Simons Foundation 2012, above). The step that made it possible was stopping.

### Win: stocks, 1993–2000

The fund had closed to new money at $270m, trading mainly futures. Brown and Mercer spent about two years making the method work in stocks, where there are thousands of instruments and far more capacity. The first separate stock fund was a disappointment and was merged into Medallion in 1997. By 2000 the fund made 128% before fees on $1.9bn, a profit of $2.4bn in a year when the index fell 9%.

### Win: 2007 and 2008

The fund's two highest returns came in the worst conditions for most investors: 137% before fees in 2007 and 152% in 2008. The profits, $7.1bn and $7.9bn, were each larger than the fund's own $5.2bn. Simons had said in 2000 that tumult was usually good for the fund (Institutional Investor 2000, above).

### Loss: March 2000

The technology bubble peaked on 10 March 2000. Peter Brown told the Senate that his wake-up call came on 13 March: the fund took very large losses in a very short time. Staff worked for days to find the cause. The model held positions in Nasdaq stocks that it believed were hedged by positions on the New York Stock Exchange, and the two markets separated faster than anything in its history. Brown offered to resign and was refused (Senate hearing, above).

The dollar figures usually quoted, about $90m in one day and close to $300m within days, come from the biography and could not be checked (not verified). The year still ended at 98.5% after fees. Six months later the fund bought its first loss-limiting bank contract.

### Loss: August 2007

```figure
{
 "kind": "timeline",
 "title": "The quant quake, 6 to 13 August 2007",
 "note": "The Senate report notes that the market as a whole stayed roughly neutral through the event. The losses came from many funds holding the same positions and selling them at once.",
 "events": [
  ["Fri 3 Aug", "The Dow falls 281 points", "Worries about the bank Bear Stearns."],
  ["Mon 6 Aug", "Sudden losses at quantitative funds", "Medallion and RIEF are both hit."],
  ["Tue 7 Aug", "Losses grow", "Nobody at the firm can explain them."],
  ["Wed 8 Aug", "Lenders ask for more collateral", "One block of stocks has fallen far enough to require it."],
  ["Thu 9 Aug", "Simons orders positions cut", "Brown and Mercer argue for holding or adding. Laufer says to trust the models. Medallion is down over $1bn for the week, about 20%; RIEF nearly $3bn, about 10%."],
  ["Fri 10 Aug", "Medallion stabilises"],
  ["Mon 13 Aug", "Both funds are profitable again"]
 ],
 "source": "Zuckerman (2019), excerpt in Institutional Investor, 6 Nov 2019",
 "sourceUrl": "https://www.institutionalinvestor.com/article/2bswabr234orjmebrnbb4/culture/bitter-lawsuits-epic-meltdowns-vicious-arguments-jim-simons-renaissance-made-him-billions-but-it-came-at-a-price"
}
```

The moves were more than twenty standard deviations from normal, which means the model's picture of risk was simply wrong for that week. A researcher e-mailed Simons that he was dead wrong to sell. Some staff later argued that the override cost money, since prices recovered within days. Simons said he would make the same decision again (Zuckerman excerpt, above).

Medallion ended August up 3.9% (Bloomberg 2007, above) and the year up about 74% after fees, on the table above. Both banks then rewrote the terms of their contracts with the fund (Renaissance statement, above).

The evidence on overriding is therefore mixed, and worth stating exactly. The override reduced risk when the fund's survival was in question, and it probably reduced that month's profit. Every documented override in the record is of this kind: a cut in size. None is a discretionary trade.

### Loss: the outside-money funds in 2020

In 2020 Medallion made about 76% while RIEF lost 19.4% and RIDA 31.6%. A Medallion investor's explanation was that the slower funds relied on models of long-run relationships between stocks, and that the pandemic and the policy response broke those relationships. Renaissance declined to comment (Institutional Investor 2021, above). Clients withdrew about $5bn in the two months from 1 December 2020 ([Wikipedia, citing Bloomberg](https://en.wikipedia.org/wiki/Renaissance_Technologies)).

## Criticism and mistakes

```figure
{
 "kind": "compare",
 "title": "The legend and the record",
 "cols": [
  {
   "title": "What is usually said",
   "tag": "legend",
   "items": [
    "66% a year for three decades.",
    "A mathematician solved the market.",
    "The model is never overridden.",
    "Renaissance is the best place to invest.",
    "The returns are unverifiable.",
    "It is right 50.75% of the time."
   ]
  },
  {
   "title": "What the sources show",
   "tag": "record",
   "items": [
    "True of yearly returns before fees. After fees, 39%. Nobody compounded at either rate, because profits were paid out; the money in the fund grew about 32% a year.",
    "Ten years of mixed results, a 30% loss in 1989, and a rebuild by a team. He named hiring and culture as his own contribution.",
    "Overridden in August 2007 and run at reduced size in November 2008. Each time to cut risk.",
    "Medallion has been closed since 1993. The fund sold to outsiders made 8.05% a year from 2005 to 2020, behind the index.",
    "Not publicly audited, but the scale is confirmed by bank records and by the firm's statements to a regulator.",
    "A reported remark with one source. The firm's own wording is that it is right slightly more often than not."
   ]
  }
 ],
 "note": "Each row on the right is sourced in the sections above."
}
```

### The basket options and the tax case

From 2000 Medallion held a large part of its stock positions through contracts with Deutsche Bank and Barclays. The Senate called them basket options. The firm called them barrier options.

> [!define] Option, premium, capital gains
> An option is a contract that pays its holder if a price ends above (or below) an agreed level. The premium is the price paid for the option, and the most the holder can lose. Capital gains are profits from selling an asset. In the US, gains on assets held over a year are taxed at a lower rate than short-term gains.

```figure
{
 "kind": "flow",
 "title": "How a basket option worked",
 "dir": "h",
 "steps": [
  ["The fund pays a premium", "For example $10m, into an account in the bank's name."],
  ["The bank adds its own money", "$90m, so $100m of stocks can be held. The fund pays a financing fee."],
  ["Renaissance trades the account", "Its model makes every decision, over 100,000 trades a day."],
  ["The option is exercised after a year or more", "The bank pays the fund the account's net profit."],
  ["The profit is reported as long-term", "Taxed at 15% instead of 35%, although the trades inside lasted days or seconds."]
 ],
 "note": "If the account fell by the amount of the premium, the bank could close it and the fund lost only the premium. That was the loss protection. The bank's money was the leverage. The one-year holding period was the tax effect.",
 "source": "US Senate Permanent Subcommittee on Investigations, staff report and hearing, 22 Jul 2014"
}
```

The Senate's findings, published in July 2014:

- Renaissance exercised 60 such options held for more than a year between 2000 and 2013. The banks paid it $34.2bn in net profit on them.
- Treating that profit as long-term reduced tax by an estimated $6.8bn.
- The contracts allowed borrowing of up to 20 times, against a legal limit of 2 times for an ordinary customer account. The banks earned about $570m (Deutsche Bank) and $655m (Barclays) in fees.
- None of the 60 contracts was ever closed by the bank for losses.

Renaissance answered that it bought the options for leverage and loss protection, that it would have bought them whatever the tax treatment, and that it followed the law as written (Senate report, hearing and Renaissance statement, above).

The tax authority disagreed. In September 2021 the seven people who had sat on the firm's board, and their spouses, agreed to pay tax, interest and penalties reported at up to about $7bn in total, for the years 2005 to 2015. Simons agreed to pay a further $670m. Other investors in the fund owed tax and interest without penalties ([CNBC, citing Reuters, 3 Sep 2021](https://www.cnbc.com/2021/09/03/renaissance-executives-agree-to-pay-7-billion-to-settle-tax-dispute.html)). It is among the largest tax settlements on record.

Two points follow for judging the record. Part of what insiders kept in those years was a tax saving later paid back. And the leverage and the cap on losses were supplied by banks on terms no ordinary investor can get.

### Other criticism

**The edge is partly structure.** Zuckerman's own view is that cheap leverage plays a key part in the returns. Harvey adds low costs, low staff turnover that protects secrets, and discipline about size (Institutional Investor 2020, above).

**It adds little to the world.** William Bernstein, reviewing the biography, calls the business zero-sum (one side's gain is another's loss): the profits are a transfer from less skilled traders. He doubts the defence that such funds supply liquidity, since it vanishes when most needed ([CFA Institute, 1 May 2020](https://rpc.cfainstitute.org/blogs/enterprising-investor/2020/book-review-the-man-who-solved-the-market)).

**Robert Mercer.** Mercer, joint chief executive from 2010, became one of the largest funders of right-wing causes in the US, including the news site Breitbart. On 2 November 2017 he told staff that he would step down as joint chief executive and leave the board, remaining as a researcher ([Fortune, 2 Nov 2017](https://fortune.com/2017/11/02/robert-mercer-renaissance-technologies-breitbart-news-steve-bannon/)). Bloomberg reported that Simons had urged it, out of concern for morale and recruiting ([CNBC, 7 Nov 2017](https://www.cnbc.com/2017/11/07/mercer-reportedly-pushed-out-of-renaissance-by-simons.html)). Simons himself gave more than $109m to Democratic candidates and committees from 2015 (Fortune 2024, above).

**Secrecy.** Staff sign long non-disclosure agreements. The firm sued two researchers who left for a rival; the rival paid $20m in 2007 to settle (Zuckerman excerpt, above). Secrecy protects the edge and also prevents outside checking.

**Survivorship.** The story is told from the end. Many funds used similar methods in the 1990s. This is the one that never had a bad decade, and Simons was the first to say that luck had a part.

## Routine and mindset

Little is documented about his day. He was a heavy smoker all his life, held a weekly meeting with the research group, and ran the firm from Long Island and New York (Institutional Investor 2000 and Bloomberg 2007, above).

What he did say, repeatedly, is that his contribution was the organisation and not the models.

- **Hiring.** He hired people who had done good science, and almost nobody from finance. In 2000 two of 140 employees had worked on Wall Street. Candidates presented their research to the whole firm.
- **Openness inside, secrecy outside.** New ideas were shared quickly across the firm. He credited the results to the scientists and the collaborative atmosphere (Simons Foundation 2012, above).
- **Pay tied to the whole.** Staff were paid bonuses twice a year on the fund's performance, and most held shares in the firm. Pay followed the result of the one fund, not of a person's own signals (Institutional Investor 2000, above; [notes on his MIT talk of December 2010](https://infoproc.blogspot.com/2014/07/james-simons-mathematics-common-sense.html)).
- **Principles.** He ended that talk with five: do something new, work with the best people available, be guided by beauty, do not give up easily, and hope for good luck.

On the model he said in 2000, "We don't override the models." The same article notes that the firm sometimes cut back by hand in extreme volatility. The record since then shows where the line ran: the model chose every trade, and people chose how much of the model to run.

He retired as chief executive on 1 January 2010 and remained chairman until 1 January 2021. Brown has been chief executive since then: jointly with Mercer to 2017, alone from 2018, and jointly with David Lippe from 1 July 2024. Simons's estate still holds between a quarter and a half of the holding company (Form ADV, above).

He gave away more than $4bn. With his wife Marilyn he founded the Simons Foundation in 1994, which funds mathematics, basic science and autism research. He started Math for America in 2004 to pay and train mathematics teachers, and the Flatiron Institute for computational science in 2016. In June 2023 the foundation gave $500m to Stony Brook University ([Wikipedia](https://en.wikipedia.org/wiki/Jim_Simons); Fortune 2024, above). His net worth at his death was estimated at about $31bn.

Two of his five children died young: Paul in 1996, hit by a car while cycling, and Nicholas in 2003, drowned while travelling in Indonesia. He died on 10 May 2024 in New York City. His foundation gave no cause.

## What carries over

### Investing (years)

- **The public version is not the private version.** The firm with the best record in the industry sold outsiders a fund that trailed the index over its first 15 years. A manager's best strategy is often the one with too little capacity to sell.
- **Net of everything.** From 2002 close to half of Medallion's return before fees went in fees, and part of the rest rested on a tax position that was reversed. For a long-term investor adding to index funds, the record is an argument about costs as much as about skill.
- **Staying in.** Medallion is no guide to sitting through pullbacks. It was built to carry little market exposure.

### Swing trading (days to weeks)

- **A time limit per trade.** Every forecast had a short, set horizon. A swing trade that has not worked within its expected time is, in these terms, an expired forecast.
- **Size against liquidity.** The difference between Medallion and RIEF is position size against what the market can absorb. The same applies in miniature to a trader who buys leading stocks on pullbacks: an edge measured on small size in liquid names may not survive larger size in thin ones.
- **Cut the whole book when behaviour is outside history.** In August 2007 and November 2008 the firm reduced total exposure and kept its rules for individual positions. That is one model for keeping gains when the market turns: fewer and smaller positions, with the same entry and exit rules.
- **Crowding.** The 2007 losses came from popular positions shared with similar funds. Widely followed setups in the most-watched stocks carry the same risk when many holders leave together.

### Day trading (minutes to hours)

Medallion is closer to day trading than any other name in this series: short holding, fixed rules, many repetitions. Four points fit strategies such as 5-minute opening range breakouts.

- **Expectancy and sample size.** A thin edge shows itself only over many trades. A week of results says almost nothing.
- **Costs first.** Slippage (the gap between the intended price and the fill) and commissions are a larger share of a small target than of a large one.
- **Rules written and tested before use.** Nothing entered the model without a test on history.
- **Overrides cut risk only.** Smaller size after a losing streak is the individual's version of trading at reduced levels.

### Seven questions

| Question | What the record shows |
|---|---|
| Sizing up when right, cutting when wrong | The model sizes each position. Borrowing was raised on stronger opportunities, by the biography's account. No discretionary adding to winners |
| After a string of losses | 1989: stopped trading and rebuilt. 2000: found the faulty hedge and removed it. 2007 and 2008: cut total exposure |
| Keeping gains | Not applicable per trade: the system exits on a clock. At fund level, profits were paid out every year |
| Market-wide filter | None for direction. Volatility helped. Management judged when conditions were outside the model's history |
| Separate books by horizon | Yes: Medallion for fast trades, RIEF for slow ones, never mixed |
| Record-keeping | Decades of cleaned data; every signal tested; one code base holding every decision rule |
| Preparation against execution | Almost all preparation. About 20 of 140 staff traded in 2000; execution is automated |

> [!test] Hypotheses worth checking
> - In a trader's own log, the number of trades needed before the average result is more than two standard errors from zero is far larger than the number usually used to judge a setup. For a setup that wins 45% of the time with a 2R target and a 1R stop, the first 30 trades cannot separate the edge from luck; about 75 can.
> - After subtracting measured slippage and commissions from each trade, expectancy in R falls most for the setups with the smallest targets, and for some it turns negative.
> - Trades in which a written rule was overridden (an early exit, a skipped signal, a moved stop) have a lower average result than trades that followed the rule, except where the override only reduced size.
> - On a trade history with at least one deep losing streak, halving size after a fixed loss in R reduces the deepest drawdown by more than it reduces the total result.

> [!take] What to take from it
> - A small edge is enough if it is real, repeated very often, and cheaper to trade than it is worth.
> - Sample size decides whether a result means anything. Medallion made in a day more trades than most traders make in a lifetime.
> - The model chose the trades. People chose how much risk to run, and only ever chose less.
> - Capacity is part of an edge. The same firm could not make the method work on outside billions.
> - The record is better supported than its secrecy suggests, and less transferable than its fame suggests.

## What cannot be copied

- **Borrowing.** Twelve to seventeen dollars of positions per dollar, with the loss limited by contract.
- **Costs.** An in-house execution desk and direct links to exchanges.
- **Data and people.** Decades of cleaned data, about 310 staff, and 90 with doctorates.
- **The tax treatment.** Ended by the banks in 2010–12, challenged by the tax authority, and paid back in 2021.
- **The right to stay small.** A fund owned by its staff can refuse money and pay out profits. A fund that lives on fees from outsiders cannot.

The next profile in this group, [Ken Griffin](/blog/ken-griffin), covers a quantitative firm built the other way, on outside money. The method behind the series is in the [method post](/blog/investor-styles-method).

## What to learn first

- **Expectancy and the law of large numbers:** the average result per trade, and why it only shows over many trades.
- **Leverage and margin:** trading with borrowed money, and the cash a lender demands against it.
- **Market-neutral:** balancing bought and short positions so that the market's direction matters little.
- **Backtest and overfitting:** testing a rule on past data, and the risk of fitting noise.
- **Slippage and market impact:** what trading costs beyond commission, and how it grows with size.
- **Gross and net returns:** before and after the manager's fees.
- **Sharpe ratio:** return per unit of variability.

## Sources

All are linked where first used.

- Primary: the US Senate staff report, hearing record and Renaissance's written statement of 22 July 2014; the Federal Register notices of 20 January 2012 and 14 August 2014; the firm's Form ADV of 1 July 2026; Simons's interviews in Institutional Investor (November 2000) and for the Simons Foundation (2012); Berlekamp's own account.
- Secondary: Bloomberg (27 November 2007); Gregory Zuckerman, *The Man Who Solved the Market* (2019); Guo and Liu (2024); Cornell (2020); Institutional Investor's reports on the funds, 2017 to 2025; Ziemba (2016); Fortune (2024); Wikipedia for the dates of gifts, the monthly record of 1993–2005 and the withdrawals of 2020–21.
- Limits of this research: Zuckerman's book was read through the publisher's sample, a long excerpt, a review and the Acquired podcast's retelling, not in full. Cornell's paper was read through two summaries. Claims that rest only on those routes are marked "not verified" in the text.

This is a study of how one firm and its founder invested. It is not advice.
