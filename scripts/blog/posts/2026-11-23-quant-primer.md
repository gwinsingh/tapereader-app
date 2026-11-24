---
title: "Quantitative and multi-strategy investing: a primer on small edges, many bets and tight risk limits"
date: 2026-11-23
order: 8
tags: [research, primer, investor-styles, quant]
series: investor-styles
summary: Quantitative investing turns a small tested edge into a return by repeating it many thousands of times with borrowed money and strict loss limits, and the record shows that most edges found in old data shrink once they are traded and that the average quant product has trailed a plain index fund.
vault: Studies/30 Investor Styles/10 Primers/Quant and Multi-Strategy — Primer
---

Quantitative investing means writing trading rules down, testing them on past prices and letting computers apply them to thousands of small bets. Multi-strategy firms run many such books side by side, with borrowed money, under one central risk desk that cuts any team that loses a few percent. [Jim Simons](/blog/jim-simons) of Renaissance Technologies and [Ken Griffin](/blog/ken-griffin) of Citadel, both profiled in this series, built the two best-known firms of this kind. The one thing worth taking from the style: a small edge is worth something only when it is repeated many times and measured honestly, and both the counting and the measuring can be done with a spreadsheet.

This primer is the background for those two profiles. It is a study, not advice.

## What "quant" means

A quantitative investor (a "quant") follows three steps. A rule is written down exactly. The rule is tested on past data. A computer then applies it to every case that fits, without a person deciding trade by trade.

The earlier primers covered discretionary styles (a person makes each decision). A value investor studies one business for weeks and may own twenty shares for years (see the [value investing primer](/blog/value-investing-primer)). A macro trader backs a view on interest rates or a currency with a few large positions (see the [global macro primer](/blog/global-macro-primer)). A quant holds no strong view on any single position. The view is on the rule, and the rule is expected to be right only slightly more often than it is wrong.

```figure
{
 "kind": "compare",
 "title": "Three ways to run money",
 "cols": [
  {
   "title": "Discretionary",
   "tag": "A person decides each trade",
   "items": [
    "A few dozen positions, each well understood",
    "Holds for months to years",
    "Each decision carries real weight in the result",
    "Wrong when the judgement is wrong"
   ]
  },
  {
   "title": "Quantitative",
   "tag": "A tested rule decides every trade",
   "items": [
    "Thousands of positions, none important alone",
    "Holds for seconds to months",
    "Right barely more than half the time",
    "Wrong when the past stops describing the present"
   ]
  },
  {
   "title": "Multi-strategy firm",
   "tag": "Many teams, one risk desk",
   "items": [
    "100 to 300 small teams, some quant and some discretionary",
    "Each team hedged so that market direction matters little",
    "Heavy borrowing; teams are cut after small losses",
    "Wrong when many teams, or many firms, hold the same trades"
   ]
  }
 ],
 "note": "General descriptions, not measurements. The profiles give the details for Renaissance and Citadel."
}
```

## The arithmetic of a small edge

### Expected value

The **expected value** of a bet is what it pays on average if repeated many times: each outcome multiplied by its probability, added up.

Take a bet of $1 at even money (win $1 or lose $1) that wins 51% of the time. The expected value is 0.51 × $1 − 0.49 × $1 = $0.02. The edge is 2 cents per dollar staked.

### Why the number of bets decides everything

Over 10 such bets the expected profit is 20 cents. The luck in 10 coin-like bets is far larger: a typical swing is about $3 either way. The chance of being ahead after 10 bets is 40%, the chance of being behind is 35%, and the rest are ties. The edge cannot be seen.

Over 100,000 bets the expected profit is $2,000 and a typical swing is about $316. The result lands between about +$1,370 and +$2,630 in 95 cases out of 100. The edge has swamped the luck.

This is the **law of large numbers** (the average of many independent results settles close to the expected value). Expected profit grows in step with the number of bets. Luck grows only with its square root: 10,000 times as many bets bring 10,000 times the expected profit and 100 times the luck (all calculated here).

```figure
{
 "kind": "bar",
 "title": "Chance of being ahead after a number of even-money bets",
 "sub": "Percent, for a bet that wins 51% of the time and one that wins 50.75% of the time",
 "unit": "%",
 "x": ["10 bets", "100", "1,000", "10,000", "100,000"],
 "xName": "Number of bets",
 "series": [
  {"name": "Wins 51%", "values": [40.2, 54.0, 72.6, 97.7, 100]},
  {"name": "Wins 50.75%", "values": [39.6, 52.0, 67.1, 93.2, 100]}
 ],
 "labels": "all",
 "note": "After 10 bets a tie is likely, which is why both figures are below 50%. At 100,000 bets both chances are above 99.99% and are shown as 100. Calculated here: exact binomial odds up to 10,000 bets, a normal approximation above. The bets are assumed independent, which real trades are not."
}
```

### The Mercer remark

Robert Mercer was co-chief executive of Renaissance Technologies. Gregory Zuckerman's book *The Man Who Solved the Market* (2019) reports that Mercer told a friend the firm was right about 50.75% of the time, and that this was enough to make billions ([review of the book, CFA Institute](https://rpc.cfainstitute.org/blogs/enterprising-investor/2020/book-review-the-man-who-solved-the-market)). On an even-money bet that is an edge of 1.5 cents per dollar. Over 100,000 independent bets the expected profit is $1,500 against typical luck of $316, almost five times larger.

> [!warn] Legend against record
> The figure is second-hand: Mercer to an unnamed friend, the friend to Zuckerman, who reads it as an illustration and not the firm's real number. The wording was not checked against the book (not verified).

### The fundamental law of active management

Richard Grinold put the same idea into one formula in 1989. In plain words: the quality of a strategy is roughly its skill per bet multiplied by the square root of the number of independent bets it makes in a year ([CFA Institute reading](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2025/analysis-active-portfolio-management)). Skill is the correlation between forecasts and outcomes, from 0 (none) to 1 (perfect). Quality is return per unit of risk, explained in the next section.

Take a skill of 0.05, which is very low. With 4 independent bets a year the formula gives 0.05 × √4 = 0.10. With 100 bets it gives 0.50, and with 10,000 it gives 5.0 (calculated here). Four large decisions a year with that skill are worth almost nothing. Ten thousand small ones are an exceptional business, on paper.

> [!warn] The word that carries the weight is "independent"
> Ten thousand trades that all depend on technology shares rising are one bet made ten thousand times. Most of the disasters later in this primer are cases where bets thought to be independent were not.

## Risk-adjusted return

A return means little without the risk taken to earn it.

**Volatility** is how much returns swing, measured as their standard deviation (the typical distance of a year's return from the average). From 1927 to 2025 the US stock market returned 8.86 percentage points a year more than Treasury bills (short US government loans, the usual stand-in for cash), with a volatility of 20.13% ([Kenneth French's data library](https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html); averages calculated here).

> [!define] The Sharpe ratio
> Return above cash, divided by volatility, named after the economist William Sharpe. For the US stock market from 1927 to 2025: 8.86 ÷ 20.13 = **0.44**. A higher number means more return for each unit of swing.

| What | Period | Sharpe ratio |
|---|---|---|
| US stock market | 1927–2025 | 0.44 |
| Momentum factor (defined below) | 1927–2025 | 0.55 |
| Value factor (defined below) | 1927–2025 | 0.28 |
| Berkshire Hathaway | several decades | 0.76 |

The first three rows were calculated here from French's yearly data. The Berkshire figure is from researchers at the fund manager AQR ([Frazzini, Kabiller and Pedersen, 2018](https://www.aqr.com/Insights/Research/Journal-Article/Buffetts-Alpha)); its period was not confirmed (not verified). The long-run figure for owning shares is about 0.4 to 0.5. From 2011 to 2025 it was 0.91, an unusually kind period.

**Drawdown** is the fall from a peak to the next low. A fund that tracks the S&P 500 (an index of 500 large US companies) fell 33.7% from 19 February to 23 March 2020 ([fund returns](https://totalrealreturns.com/n/SPY,MTUM,VLUE,QUAL,USMV,SIZE)).

**Correlation** measures whether two things move together, from +1 (always together) through 0 (unrelated) to −1 (always opposite).

### Why uncorrelated bets shrink risk

Suppose each bet has a volatility of 10% and a Sharpe ratio of 0.2, which is poor. Put equal money into several such bets that are unrelated to one another. The expected return stays the same. The swings partly cancel, and volatility falls with the square root of the number of bets.

```figure
{
 "kind": "bar",
 "title": "Volatility of a portfolio of equal bets, each with 10% volatility",
 "sub": "Percent a year, for unrelated bets and for bets with a correlation of 0.2",
 "unit": "%",
 "x": ["1 bet", "4 bets", "16 bets", "100 bets"],
 "xName": "Number of bets",
 "series": [
  {"name": "Unrelated (correlation 0)", "values": [10, 5, 2.5, 1]},
  {"name": "Mildly related (correlation 0.2)", "values": [10, 6.32, 5, 4.56]}
 ],
 "labels": "all",
 "note": "Unrelated bets: 10 ÷ √N. With a correlation of 0.2 the volatility cannot fall below 4.47% however many bets are added. The Sharpe ratio moves the other way: 0.2, 0.4, 0.8 and 2.0 for unrelated bets; 0.20, 0.32, 0.40 and 0.44 at a correlation of 0.2. Calculated here."
}
```

One hundred unrelated bets, each poor, make a portfolio with a Sharpe ratio of 2.0. With a correlation of only 0.2 between them, the same hundred give 0.44, no better than the stock market. That gap explains the constant search for new, unrelated sources of return, and the damage done when hidden correlation appears.

> [!take] What to take from it
> - An edge of one or two percent per bet is invisible over tens of bets and decisive over tens of thousands.
> - Return is judged against the swings taken to earn it. The stock market's long-run Sharpe ratio is about 0.4 to 0.5.
> - Many unrelated bets cut risk sharply. Mildly related bets cut it far less.

## Leverage

A book of many small hedged bets can have a high Sharpe ratio and a tiny return. A book with 1% volatility and a Sharpe ratio of 2 earns only 2 percentage points over cash.

The usual answer is **leverage** (holding positions larger than the fund's own money, with the difference borrowed). At ten times leverage the same book has 10% volatility and earns 20 points over cash, before the cost of borrowing. Leverage leaves the Sharpe ratio unchanged and scales gains and losses alike.

The borrower posts **margin** (its own money, held by the lender as a deposit against losses). When losses eat into the margin, the lender makes a **margin call** (a demand for more money at once). If the money does not arrive, the lender sells the positions.

A US individual may borrow up to 50% of the price of a share purchase, must keep equity of at least 25% of the account's value, and can be sold out by the broker without being consulted ([SEC, margin guide](https://www.sec.gov/investor/pubs/margin.htm)). Hedge funds borrow from **prime brokers** (the divisions of large banks that lend money and shares to funds) on far looser terms. Two researchers at MIT took 8 to 1 as typical for hedged share books in 2007 ([Khandani and Lo, 2007](https://web.mit.edu/Alo/www/Papers/august07.pdf)). Long-Term Capital Management, described below, ran at 25 to 30 to 1 ([Federal Reserve History](https://www.federalreservehistory.org/essays/ltcm-near-failure)).

```figure
{
 "kind": "flow",
 "title": "How a 4% loss forces the sale of 17% of a leveraged book",
 "steps": [
  ["Start: $100 of capital holds $500 of positions", "Leverage is 5 times. The lender allows no more than 5."],
  ["The positions lose 4%: $20", "Capital falls to $80, a loss of 20%. Positions are now worth $480."],
  ["Leverage has risen to 6 times", "$480 ÷ $80. The limit is broken although nothing was bought."],
  ["The fund must cut to $400 of positions", "5 × $80. It sells $80, which is 17% of the book, at once."],
  ["The selling moves prices", "Other funds holding the same positions now show losses and face the same step."]
 ],
 "note": "An illustration with round numbers, calculated here. The last step is the mechanism behind August 2007, described below."
}
```

## The main families of strategy

| Family | How it makes money | Typical holding period | What kills it |
|---|---|---|---|
| Statistical arbitrage | Prices of related shares drift apart and come back | Seconds to days | Crowding; a forced seller; real news |
| Trend following | Markets that have risen keep rising for a while | Weeks to months | Sideways markets; sharp reversals |
| Factor investing | Groups of shares with a shared trait earn more over decades | Months to years | Droughts of ten years or more |
| Convertible and merger arbitrage | A known price gap closes | Weeks to months | A credit panic; a broken deal |
| High-frequency trading | Tiny price differences, captured first | Milliseconds to minutes | Faster rivals; software faults |
| Market making | The gap between buying and selling prices | Seconds to hours | Trading against better-informed parties |

```figure
{
 "kind": "quadrant",
 "title": "The families sorted by what they bet on and for how long",
 "xAxis": ["Holds seconds to days", "Holds weeks to years"],
 "yAxis": ["Bets that prices snap back", "Bets that prices keep going"],
 "cells": [
  ["Market making, statistical arbitrage", "Paid for supplying trades to those in a hurry"],
  ["Value factor, merger and convertible arbitrage", "Paid for waiting until a gap closes"],
  ["Short-term momentum and order-flow signals", "Paid for speed"],
  ["Trend following, momentum factor", "Paid for staying with a move"]
 ],
 "note": "A simplification made for this primer. Large firms run all four at once because the four behave differently."
}
```

### Statistical arbitrage and pairs trading

**Mean reversion** is the tendency of a stretched price to drift back toward normal. The simplest form is the pairs trade. Two similar companies, such as two large oil producers, usually move together. Over a week, with no news, share A rises 5% and share B is flat. The trader sells $10,000 of A short (sells borrowed shares, to buy them back later) and buys $10,000 of B.

If half of the gap closes, the pair earns about $250 before costs, whichever leg moves. If the gap doubles because A had real news, it loses about $500. The position is **market-neutral** (equal money long and short, so a general rise or fall in the market cancels out).

A study of this rule on US shares from 1962 to 1997 found that the best-matched pairs earned up to 12% a year above cash ([Gatev, Goetzmann and Rouwenhorst](https://www.nber.org/papers/w7032)). Statistical arbitrage is the same idea applied by computer to hundreds or thousands of shares at once ([overview](https://en.wikipedia.org/wiki/Statistical_arbitrage)).

Known edges wear away. Khandani and Lo tested a simple daily rule: buy yesterday's losers and sell short yesterday's winners. Before costs it earned 1.38% a day in 1995 and 0.13% a day in 2007 ([Khandani and Lo, 2007](https://web.mit.edu/Alo/www/Papers/august07.pdf)). Leverage of almost 9 to 1 was needed in 2007 to match the return that 2 to 1 gave in 1998.

```figure
{
 "kind": "line",
 "title": "A known edge wearing away: a simple mean-reversion rule, 1995–2007",
 "sub": "Average daily return in percent, before all costs, of buying the previous day's losers and shorting its winners among US shares",
 "unit": "%",
 "x": ["1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007"],
 "xName": "Year",
 "series": [
  {"name": "Average daily return", "values": [1.38, 1.17, 0.88, 0.57, 0.44, 0.44, 0.31, 0.45, 0.21, 0.37, 0.26, 0.15, 0.13]}
 ],
 "note": "The authors stress that the early figures could never have been earned in practice, because trading costs are left out. The direction is the point: the return fell by nine tenths in twelve years as more money and faster computers chased it. 2007 is to 31 August.",
 "source": "Khandani and Lo, What Happened to the Quants in August 2007?, tables 2 and 6",
 "sourceUrl": "https://web.mit.edu/Alo/www/Papers/august07.pdf"
}
```

### Trend following

Trend followers buy markets that have been rising and sell short markets that have been falling. Most trade **futures** (contracts to buy or sell something at a set price on a later date, which need only a small deposit) on share indexes, bonds, currencies and commodities. The funds are called managed futures funds or CTAs (commodity trading advisors, the US regulatory name).

A study of 58 futures markets found that a market's return over the past 12 months predicted its next return, an effect that lasted about a year before partly reversing ([Moskowitz, Ooi and Pedersen, 2012](https://www.aqr.com/Insights/Research/Journal-Article/Time-Series-Momentum)).

The style earns its keep in long one-way moves. In 2022, when shares and bonds fell together, the SG CTA Index (the 20 largest such funds, tracked by the bank Société Générale) gained 20.1%, its best year since it began in 2000 ([Hedgeweek, Jan 2023](https://www.hedgeweek.com/trend-followers-turn-leaders-ctas-deliver-record-returns-2022/)). It loses in markets that keep reversing: the index was down more than 8% for 2025 by late May ([Alternatives Watch, 2 Jun 2025](https://www.alternativeswatch.com/2025/06/02/trend-following-hedge-funds-endure-more-pain-societe-generale-indices/)).

### Factor investing

A **factor** is a trait shared by a group of shares that has gone with higher returns over long periods. The economists Eugene Fama and Kenneth French showed in 1992 that small companies and cheap companies had earned more than large and dear ones ([three-factor model](https://en.wikipedia.org/wiki/Fama%E2%80%93French_three-factor_model)). Later work added momentum (shares that rose over the past year keep rising for some months), profitability (often called quality), low investment and low volatility ([momentum](https://en.wikipedia.org/wiki/Momentum_investing); [low volatility](https://www.aqr.com/Insights/Research/Journal-Article/Betting-Against-Beta)).

Each factor is measured as a **long-short** portfolio: buy the shares with the trait, sell short the shares with the opposite trait, and record the difference. French publishes the results back to 1927.

```figure
{
 "kind": "bar",
 "title": "US factor premiums: the full record against 2007–2025",
 "sub": "Average yearly return in percentage points. The market is measured over cash; each factor is one group of shares minus its opposite.",
 "unit": "%",
 "x": ["Market", "Size", "Value", "Momentum", "Profitability", "Low investment"],
 "xName": "Factor",
 "series": [
  {"name": "Full record", "values": [8.86, 2.50, 4.22, 8.58, 3.38, 2.92]},
  {"name": "2007–2025", "values": [11.05, -1.29, -2.96, 0.03, 3.56, -0.79]}
 ],
 "labels": "all",
 "note": "The full record runs from 1927 for the first four and from 1964 for the last two. Momentum was positive in 78 of 99 years, value in 59, size in 49. From 2007 to 2025 only the market itself and profitability paid; value was positive in 7 of 19 years. These are paper portfolios before trading costs. Averages calculated here.",
 "source": "Kenneth R. French data library (three-factor, five-factor and momentum files)",
 "sourceUrl": "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html"
}
```

The premiums are real over a century and unreliable over two decades. And momentum, the strongest, has the worst accidents: the yearly factor file shows −83.48% for 2009, and −34.36% for April 2009 alone, when the most beaten-down shares rebounded and the short side of the portfolio soared.

### Convertible and merger arbitrage

A convertible bond is a bond that can be swapped for shares of the company that issued it. Convertible arbitrage buys the bond and sells the shares short, collecting the bond's interest while the two legs offset each other; it fails when lenders pull back and every holder sells at once ([overview](https://en.wikipedia.org/wiki/Convertible_arbitrage)).

After a takeover is announced, the target's shares trade a little below the offer price because the deal may fail. Merger arbitrage buys the target and earns that gap if the deal closes; one broken deal can cost several times the gain from one that completes ([overview](https://en.wikipedia.org/wiki/Risk_arbitrage)).

### High-frequency trading

High-frequency trading (HFT) is computer trading in which positions are held for seconds or less and nothing is kept overnight. Speed is the edge. Firms pay for **co-location** (space for their computers inside the exchange's own data centre) and for microwave links between cities, which carry signals at within 1% of the speed of light while optical fibre is more than 30% slower ([overview](https://en.wikipedia.org/wiki/High-frequency_trading)).

One research firm put HFT at 56% of US share trading by value in 2010. Estimated profits fell from about $5 billion in 2009 to about $1.25 billion in 2012 as more firms competed (same source).

### Market making

A market maker stands ready to buy and to sell the same share all day. The **bid** is the price at which it will buy. The **ask** is the higher price at which it will sell. The gap is the **spread**.

A worked example: the bid is $50.00 and the ask is $50.02. One customer sells 100 shares to the market maker at $50.00. A moment later another buys 100 from it at $50.02. The market maker has earned $2 and holds nothing. Two things go wrong:

- **Inventory risk.** After the market maker buys at $50.00, the price drops 5 cents before a buyer appears. The $5 loss is two and a half times the hoped-for $2.
- **Adverse selection.** The seller may know something, or may be the first slice of a 500,000-share order. The market maker then buys on the way down again and again.

The business is the law of large numbers in its purest form. When the market maker Virtu Financial applied to list its shares in 2014, it disclosed one losing day in 1,238 trading days from 2009 to 2013 ([Virtu S-1 filing](https://www.sec.gov/Archives/edgar/data/1592386/000104746914002070/a2218589zs-1.htm)).

Adverse selection explains the market for retail orders. Orders from individuals are small and, on average, carry no information about the next few seconds, so they are the safest to trade against. A **wholesaler** is a market maker that fills retail orders itself, away from the exchanges. Many brokers are paid by wholesalers for sending them customers' orders, which is called **payment for order flow**.

The Securities and Exchange Commission (SEC, the US markets regulator) measured this market for the first quarter of 2022 ([SEC release 34-96495, Dec 2022](https://www.sec.gov/files/rules/proposed/2022/34-96495.pdf)):

- Brokers sent more than 90% of individuals' marketable orders (orders to trade at once at the going price) to six wholesalers.
- Two of the six handled about 66% of the wholesalers' volume. The SEC does not name them; a 2024 academic paper names Citadel Securities and Virtu (not verified).
- Payment for order flow in listed shares came to $235 million in the quarter.
- The SEC estimated that order-by-order competition would have given individuals about $1.5 billion a year in better prices.

```figure
{
 "kind": "stack",
 "title": "Where US shares changed hands, first quarter of 2022",
 "sub": "Percent of all share volume in US listed stocks, by type of venue",
 "unit": "%",
 "parts": [
  ["16 exchanges", 59.7],
  ["6 wholesalers", 23.9],
  ["32 private trading systems (dark pools)", 10.2],
  ["232 other dealers", 6.3]
 ],
 "note": "Six firms that fill retail orders traded almost a quarter of all US share volume. The figures are the SEC's and are the latest it has published in this form.",
 "source": "SEC, Order Competition Rule proposal, release 34-96495, table 1",
 "sourceUrl": "https://www.sec.gov/files/rules/proposed/2022/34-96495.pdf"
}
```

Citadel Securities is a separate company from the Citadel hedge fund, with the same majority owner. It is reported to take part in about one in four US share trades as of 2026 ([overview](https://en.wikipedia.org/wiki/Citadel_Securities)).

SEC Rule 606 requires every broker to publish each quarter where it sent orders and what it was paid. Rule 605 requires trading venues to publish the quality of their fills.

## How a backtest works and how it lies

A **backtest** applies a rule to past data to see what it would have earned. It is the main tool of the style and its main source of error.

```figure
{
 "kind": "flow",
 "title": "An honest test of a trading rule",
 "steps": [
  ["Write the rule down before looking at results", "Entry, exit, size and markets, exact enough for a computer or a stranger to follow."],
  ["Split the data", "For example 2010–2019 for building the rule (in-sample) and 2020–2025 locked away (out-of-sample)."],
  ["Build and adjust on the first part only", "Keep a count of every version tried."],
  ["Run the final rule once on the second part", "No changes afterwards. If it is changed, the second part is no longer unseen."],
  ["Subtract costs", "Commissions, the spread and slippage on every trade."],
  ["Ask how much money the rule can take", "A rule that works on 100 shares may not work on 100,000."],
  ["Trade it small, live", "The only data that is truly out of sample is the future."]
 ],
 "note": "A general description of good practice as set out in the papers cited in this section."
}
```

**In-sample** data is what the rule was built on. **Out-of-sample** data is anything the builder had not seen. A rule always looks best in-sample, because it was shaped to fit. The five usual lies:

- **Overfitting.** A rule adjusted until it fits the past has learned the noise of that period along with any real pattern. Many precise settings, such as "buy after a 3.7% drop on a Tuesday", are a warning sign.
- **Look-ahead bias.** The test uses something not known at the time, such as the day's closing price to decide a trade made at the open.
- **Survivorship bias.** The test covers only companies or funds that exist today. The failures have dropped out, so the past looks safer than it was.
- **Costs and slippage.** Slippage is the difference between the price expected and the price received. A rule that earns 0.05% per trade before costs loses money if trading costs 0.10%.
- **Capacity.** The amount of money a rule can absorb before its own orders move the price and erase the edge.

### A hundred random rules

Take 100 rules that are pure chance: each buys or sells on a coin flip and makes 250 trades, each winning or losing one unit.

By luck alone, one rule in 44 will pass the usual statistical test (a t-statistic above 2, explained in the next section). The chance that at least one of 100 passes is 1 − 0.977 to the power of 100, which is 90%. The expected result of the best of the hundred is a gain of about 40 units with 58% of its trades winning. It looks like a discovery and is worth nothing (calculated here).

```figure
{
 "kind": "bar",
 "title": "Chance that at least one worthless rule passes the usual test",
 "sub": "Percent, by the number of rules tried. Each rule has no edge; the test is a t-statistic above 2.",
 "unit": "%",
 "x": ["1 rule", "10", "20", "45", "100"],
 "xName": "Rules tried",
 "series": [
  {"name": "At least one passes by luck", "values": [2.3, 20.6, 36.9, 64.5, 90.0]}
 ],
 "labels": "all",
 "note": "Calculated here, assuming the rules are independent. To keep the chance of a false discovery at 5% the hurdle must rise with the number of trials: a t-statistic of about 2.6 for 10 trials, 3.3 for 100 and 3.9 for 1,000."
}
```

### The evidence from published research

Academic finance has run this experiment on itself.

- **Harvey, Liu and Zhu (2016)** reviewed the hundreds of factors published in journals. Because so many had been tried, they argued that a new factor should clear a t-statistic above 3.0, not the customary 2.0, and concluded that "most claimed research findings in financial economics are likely false" ([NBER working paper 20592](https://www.nber.org/papers/w20592)).
- **McLean and Pontiff (2016)** followed 97 published predictors of share returns. Returns were 26% lower after the sample ended but before publication, and 58% lower after publication ([Journal of Finance](https://ideas.repec.org/a/bla/jfinan/v71y2016i1p5-32.html)). The first drop is their upper estimate of overfitting. The further 32 points they attribute to investors trading on the published result.
- **Bailey and López de Prado (2014)** showed that the best Sharpe ratio among many trials rises with the number of trials even when every rule is worthless. In their example a Sharpe ratio of 2.5 on five years of daily data fails their test as the best of 100 trials and would have passed as the best of 46 ([paper](https://www.davidhbailey.com/dhbpapers/deflated-sharpe.pdf)).

```figure
{
 "kind": "bar",
 "title": "What happened to 97 published stock-market patterns",
 "sub": "Average return as a percent of the return in the original study",
 "unit": "%",
 "x": ["In the original sample", "After the sample, before publication", "After publication"],
 "series": [
  {"name": "Return kept", "values": [100, 74, 42]}
 ],
 "labels": "all",
 "note": "A pattern that earned 10% a year in the study earned on average 7.4% in fresh data and 4.2% once it was public knowledge.",
 "source": "McLean and Pontiff, Journal of Finance, 2016",
 "sourceUrl": "https://ideas.repec.org/a/bla/jfinan/v71y2016i1p5-32.html"
}
```

> [!warn] The number of trials is part of the result
> A backtest without the number of versions tried cannot be judged. The same holds for a trading system sold with a chart of past results, and for a pattern noticed after scanning hundreds of charts.

## How many trades it takes to tell edge from luck

The **t-statistic** is the average result divided by the luck expected in an average of that many trades. A t-statistic of 2 means a result this good would arise by chance about one time in 44 if there were no edge. It is the customary pass mark for a single rule tested once.

> [!define] The formula
> Measure every trade in units of the amount risked, written R. A loss at the stop is −1R.
> - **Expectancy** E = win rate × average win − loss rate × average loss.
> - **Spread of results** s = the standard deviation of the trade results.
> - **t-statistic** = E ÷ s × √(number of trades).
> - **Trades needed** for a t-statistic of 2 = (2 × s ÷ E)².
>
> Example: 40% of trades win 2R and 60% lose 1R. E = 0.4 × 2 − 0.6 × 1 = +0.2R and s = 1.47R, so trades needed = (2 × 1.47 ÷ 0.2)² = 216.

| Win rate | Wins 1R | Wins 1.5R | Wins 2R | Wins 3R |
|---|---|---|---|---|
| 30% | – | – | – | 337 |
| 35% | – | – | 3,277 | 92 |
| 40% | – | – | 216 | 43 |
| 45% | – | 396 | 73 | 25 |
| 50% | – | 100 | 36 | 16 |
| 55% | 396 | 44 | 22 | 11 |
| 60% | 97 | 25 | 14 | 8 |

The table gives the trades needed before a system with that true win rate and payoff reaches a t-statistic of 2. Losses are 1R; a dash means no edge. It was calculated here and assumes every win is the same size, which flatters real trading.

- A modest edge needs hundreds of trades. A system that wins 40% of the time at 2R needs 216: most of a year at one trade a day.
- Thin edges need thousands. At 35% and 2R the expectancy is +0.05R and the count is 3,277.
- A result built on 20 or 30 trades says almost nothing unless the edge is very large.

Where several setups or settings were tried before one was chosen, the hurdle of 3 applies, which multiplies every number by 2.25: 216 becomes 486.

## The multi-strategy "pod" model

A multi-strategy firm, also called a pod shop, divides its money among many small teams. Each team is a **pod**: a portfolio manager with a few analysts, a slice of capital and a narrow mandate, such as European bank shares. Millennium Management had about 280 such teams in 2018 ([overview](https://en.wikipedia.org/wiki/Millennium_Management,_LLC)).

```figure
{
 "kind": "flow",
 "title": "How a pod firm is put together",
 "dir": "h",
 "steps": [
  ["Investors", "Mostly large institutions."],
  ["The centre", "Raises money, borrows from banks, sets every limit and moves capital between teams."],
  ["Pods", "100 to 300 teams, each hedged so that market direction matters little."],
  ["Loss limits", "A team that loses a few percent has its capital cut. A little more and it is closed."],
  ["Fees", "All costs are charged to the fund, then a share of the profit."]
 ],
 "note": "A general description. Firms differ in how mechanical the limits are."
}
```

**Hedged books.** Each pod is kept market-neutral and usually factor-neutral (no net tilt toward cheap shares, momentum shares or any other common trait). What remains is meant to be skill in picking one share against another.

**High leverage.** A hedged book has low volatility, so it is levered many times. At the end of 2025 Goldman Sachs reported gross leverage across the funds it finances of about 293% of capital, a record ([Reuters via Kitco, 7 Jan 2026](https://www.kitco.com/news/off-the-wire/2026-01-07/hedge-funds-rode-buoyant-stock-market-deliver-double-digit-gains-2025); not verified at the source).

**Tight loss limits.** The best-known rules are those reported for Millennium. A manager who loses about 5% of the allocation has the capital cut, often by half. At about 7.5% the manager is usually out. The Wall Street Journal's reporting, as relayed by a trade publication, is that managers down more than 7.5% are almost certainly dismissed and that 15% to 20% of staff leave each year ([eFinancialCareers, 30 Sep 2024](https://www.efinancialcareers.com/news/millennium-hedge-fund-jobs)). Other accounts give 7.5% to 10% across firms, and Citadel is described as less mechanical.

> [!warn] Reported, not published
> No firm publishes these limits. The 5% step was not found in a primary report (not verified). Confidence: C on the scale in the [method post](/blog/investor-styles-method).

The arithmetic of the cut: a manager with $1,000 million who loses 5% is down $50 million. With capital halved to $500 million, earning it back takes a 10% gain. Bets shrink exactly when the manager is trading worst.

**Pass-through fees.** The classic hedge fund fee is "2 and 20": 2% of assets each year and 20% of the profit. Pod firms use a **pass-through**: every cost of running the firm, including pay, data and technology, is charged to the fund, and a performance fee is taken on what is left.

```figure
{
 "kind": "stack",
 "title": "Where a 20% gross return goes under two fee models",
 "sub": "Dollars per $100 invested, for a year in which the fund earns $20 before fees",
 "unit": "$",
 "bars": [
  {"name": "2 and 20", "parts": [["Investor keeps", 14.4], ["Management fee", 2.0], ["Performance fee", 3.6]]},
  {"name": "Pass-through", "parts": [["Investor keeps", 10.4], ["Costs passed through", 7.0], ["Performance fee", 2.6]]}
 ],
 "note": "An illustration calculated here. The pass-through example assumes costs of 7% of assets and a 20% performance fee on the rest; real figures vary by firm and year. The investor keeps 72% of the gross return in the first case and 52% in the second."
}
```

The real figure is lower. At multi-strategy funds that pass on all costs, investors received 41 cents of each dollar of gross profit in 2023, down from 54 cents in 2021, by the figures of the bank BNP Paribas ([Bloomberg, 12 Feb 2024](https://www.bloomberg.com/news/articles/2024-02-12/some-multistrategy-hedge-funds-keep-over-half-their-profits-via-customer-fees); [Hedgeweek, 22 Aug 2025](https://hedgeweek.com/news/investors-push-back-on-multi-strategy-hedge-fund-fee-structures)).

### Growth

| Firm | Assets | As of |
|---|---|---|
| Millennium | about $97 billion | Sep 2026 |
| Citadel | about $65 billion | Dec 2025 |
| Point72 | about $46 billion (not verified) | early 2026 |
| Balyasny | about $31 billion | Jan 2026 |

Sources: a Bloomberg figure for [Millennium](https://en.wikipedia.org/wiki/Millennium_Management,_LLC) as cited by Wikipedia; Citadel's own regulatory brochure, which gives $65.0 billion at 31 December 2025 (linked in the [Ken Griffin profile](/blog/ken-griffin)); [Business Insider, Jan 2026](https://finance.yahoo.com/news/2025-returns-hedge-funds-rolling-234728986.html) for the rest. Press reports of Citadel's assets during 2026 run from $67 billion to $77 billion. Multi-strategy funds as a group were put at a record $428 billion by a Goldman Sachs report in 2026 (not verified at the source).

LCH Investments, a firm that invests in hedge funds, estimated that Citadel made $16 billion for its clients in 2022, the largest yearly gain by any hedge fund firm ([Fortune, 23 Jan 2023](https://fortune.com/2023/01/23/how-ken-griffins-citadel-beat-the-rest-of-the-hedge-fund-industry-and-soared-to-a-16-billion-return-in-2022/)).

```figure
{
 "kind": "hbar",
 "title": "Multi-strategy funds in 2025 against a plain index fund",
 "sub": "Net return for the calendar year, percent",
 "unit": "%",
 "highlight": ["S&P 500 index fund"],
 "rows": [
  ["AQR Apex", 19.6],
  ["D.E. Shaw Composite", 18.5],
  ["ExodusPoint", 18.0],
  ["S&P 500 index fund", 17.7, "with dividends"],
  ["Point72", 17.5],
  ["Balyasny", 16.7],
  ["Walleye", 15.5],
  ["Schonfeld", 12.5],
  ["Millennium", 10.5],
  ["Citadel Wellington", 10.2],
  ["Verition", 7.5],
  ["Jain Global", 3.7]
 ],
 "note": "The funds aim for steady returns unrelated to the stock market, so trailing the index in a strong year is expected and is not a failure by their own measure. Three of the eleven beat it. Fund returns are press reports of figures sent to investors.",
 "source": "Business Insider, January 2026; index fund from totalrealreturns.com",
 "sourceUrl": "https://finance.yahoo.com/news/2025-returns-hedge-funds-rolling-234728986.html"
}
```

### The criticisms

- **Cost drag.** When investors keep 41 cents of each dollar, the teams must earn a great deal before the client earns a little. Fee disclosures at five of the largest firms rose almost 40% over seven years ([Hedgeweek, 22 Aug 2025](https://hedgeweek.com/news/investors-push-back-on-multi-strategy-hedge-fund-fee-structures)).
- **Talent wars.** Firms bid for the same managers, and the pass-through charges the cost to investors.
- **Crowding.** Hundreds of pods have similar mandates, risk models and loss limits. They end up in similar positions and must cut them at the same moment, as in 2007, 2025 and 2026 below.
- **Leverage.** Central banks and the Bank for International Settlements have warned that concentrated, leveraged hedge fund positions can deepen market stress ([Reuters, 9 Jul 2026](https://live.euronext.com/en/financial-news/ai-selloff-drives-quant-funds-worst-performance-august)).

## When quant went wrong

```figure
{
 "kind": "timeline",
 "title": "Nine bad episodes for quantitative strategies",
 "events": [
  ["23 Sep 1998", "Long-Term Capital Management is rescued", "A bond fund levered 25 to 30 times loses 44% in a month. Fourteen banks put in $3.625 billion."],
  ["7–9 Aug 2007", "The quant quake", "Hedged share portfolios lose for three days as similar funds sell the same positions."],
  ["Mar–May 2009", "The momentum crash", "The US momentum factor loses about 49% in three months as beaten-down shares rebound."],
  ["6 May 2010", "The flash crash", "The Dow Jones index falls about 9% and recovers most of it within about 36 minutes."],
  ["1 Aug 2012", "Knight Capital", "Faulty software sends millions of orders in 45 minutes. Loss: more than $460 million."],
  ["2018–2020", "The quant winter", "The US value factor loses 9.6%, 10.4% and 46.9% in three successive years."],
  ["Mar 2020", "The pandemic crash", "Value loses 13.8% in the month. Funds built on cheap shares fall with the market."],
  ["Jun–Jul 2025", "The summer wobble", "Quant share funds lose an estimated 4.2% while the market rises 8%."],
  ["Jul 2026", "The AI trade reverses", "Quant funds give back a quarter of the year's gain. Momentum loses 12.2% in the month."]
 ],
 "note": "Sources for each episode are given in the text below. Factor figures are calculated from Kenneth French's data.",
 "source": "Federal Reserve History; Khandani and Lo; SEC; MSCI; Reuters; Kenneth R. French data library",
 "sourceUrl": "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html"
}
```

### Long-Term Capital Management, 1998

LTCM was founded in February 1994 by John Meriwether, a former Salomon Brothers bond trader. It bet that small gaps between similar bonds would close, and borrowed heavily because the gaps were small. It returned about 20%, 43%, 41% and 17% in its first four years ([Federal Reserve History](https://www.federalreservehistory.org/essays/ltcm-near-failure)). At the start of 1998 it held about $129 billion of assets on $4.7 billion of capital ([overview](https://en.wikipedia.org/wiki/Long-Term_Capital_Management)).

In August 1998 Russia devalued its currency and stopped paying some of its debts. Investors everywhere sold risky bonds and bought safe ones. Every gap LTCM had bet on widened at once, and the fund lost 44% in that month. On 23 September, 14 banks and brokers put in $3.625 billion in a rescue arranged by the Federal Reserve Bank of New York. The lesson: positions that look unrelated in calm markets become one position when everyone needs cash.

### The quant quake, August 2007

In the week of 6 August 2007 several large market-neutral share funds lost heavily while the stock market itself was calm. Khandani and Lo rebuilt the week with their simple mean-reversion rule ([paper](https://web.mit.edu/Alo/www/Papers/august07.pdf)). Without leverage it lost 1.16%, 2.83% and 2.86% on Tuesday, Wednesday and Thursday: 6.85% in three days, about 12 times its normal daily swing. On Friday it gained 5.92%.

```figure
{
 "kind": "bar",
 "title": "Five days in August 2007: one mean-reversion rule, without and with leverage",
 "sub": "Daily return in percent. The paper measures the plain return per dollar of shares owned. At 8 to 1 a fund holds $4 of owned shares and $4 of shorts per dollar of capital, so each day's result is multiplied by four.",
 "unit": "%",
 "x": ["Mon 6 Aug", "Tue 7 Aug", "Wed 8 Aug", "Thu 9 Aug", "Fri 10 Aug"],
 "xName": "Day",
 "series": [
  {"name": "No leverage", "values": [0.50, -1.16, -2.83, -2.86, 5.92]},
  {"name": "Leverage of 8 to 1", "values": [2.00, -4.64, -11.33, -11.43, 23.68]}
 ],
 "labels": "all",
 "note": "Without leverage the week ended down 0.43%, an ordinary result. A fund at 8 to 1 lost a little over a quarter of its capital by Thursday night. A fund that was forced to sell on Thursday missed Friday's rebound. Monday's figure is read from the paper's table 3; the leveraged Monday and Friday figures are calculated here.",
 "source": "Khandani and Lo, What Happened to the Quants in August 2007?, tables 3 and 7",
 "sourceUrl": "https://web.mit.edu/Alo/www/Papers/august07.pdf"
}
```

Their explanation: one large holder, probably a multi-strategy fund or a bank's trading desk raising cash or cutting risk after trouble in other markets, sold a market-neutral share portfolio quickly. That pushed prices against every fund holding similar positions. Their loss limits forced them to sell too. In the authors' view the funds' being quantitative was incidental; the cause was that they all held the same things with borrowed money.

### The flash crash, 6 May 2010

At 2:32 pm a mutual fund began selling 75,000 futures contracts on the S&P 500, worth about $4.1 billion, by computer program over about 20 minutes. High-frequency traders then sold alongside it, which sped the fall. The Dow Jones index fell 998.5 points, about 9%, and recovered most of it by 3:07 pm. Some shares traded at one cent and others at $100,000 ([account of the joint SEC and CFTC report](https://en.wikipedia.org/wiki/2010_flash_crash)). The lesson: buyers supplied by computers can vanish within minutes.

### Knight Capital, 1 August 2012

Knight was a large US market maker. A fault in software installed in late July 2012 hit its order router. In the first 45 minutes of trading the system sent more than 4 million orders while trying to fill 212 customer orders, and built up several billion dollars of unwanted positions. The loss was more than $460 million ([SEC, 16 Oct 2013](https://www.sec.gov/news/press-release/2013-222)); Knight's own first estimate was $440 million. The lesson: at computer speed an operational mistake can cost more in an hour than a bad strategy costs in a year.

### The quant winter, 2018–2020, and March 2020

French's value factor lost 9.63% in 2018, 10.36% in 2019 and 46.94% in 2020. In March 2020 alone it lost 13.83% while the market fell 13.37%, so a hedged book of cheap shares lost as much as the market it was hedged against. The AQR Equity Market Neutral fund, which is open to the public, lost 11.7%, 11.3% and 19.6% in those three years, 37% in all ([fund returns](https://totalrealreturns.com/n/SPY,AQMIX,PQTIX,QMNIX,BTAL,DBMF); total calculated here).

In 2020 Renaissance's main fund for outside investors lost about 19%, while Medallion, its fund for staff, is reported to have gained about 76% (sources in the [Jim Simons profile](/blog/jim-simons)). The lesson: a factor with a 90-year record can fail for longer than most clients will wait. The AQR fund then returned 17% to 27% a year from 2021 to 2025.

### Summer 2025 and July 2026

From 1 June to 25 July 2025, Goldman Sachs estimated that quant share funds lost 4.2% while US shares rose about 8%. Heavily shorted, unprofitable, volatile shares rallied together, which hurt the short side of many quant books at once ([MSCI, 30 Oct 2025](https://www.msci.com/research-and-insights/blog-post/unraveling-summer-2025s-quant-fund-wobble)).

A year later it happened again. A Goldman Sachs note of 8 July 2026 said that systematic funds' return for the year had fallen from 14.4% on 22 June to 10.8% as crowded positions in technology and chip shares reversed ([Reuters, 9 Jul 2026](https://live.euronext.com/en/financial-news/ai-selloff-drives-quant-funds-worst-performance-august)). For the full month the shares most widely held by hedge funds had their worst result against the S&P 500 in more than 20 years of Goldman's data ([Hedgeweek, 21 Aug 2026](https://www.hedgeweek.com/hedge-funds-suffer-historic-july-setback-as-ai-trade-unravels/)). French's momentum factor lost 12.21% in July 2026 and 5.60% in August.

> [!take] The common thread
> In most of these episodes the strategy was sound on paper and the loss came from other holders of the same positions being forced to sell. Leverage set the size of the loss. Crowding set the timing.

## The base rates

A base rate is how often something has happened in the past. This section covers the average product an outside investor could buy, not the famous exceptions.

**Hedge fund indexes.** The firm HFR tracks groups of hedge funds by style. Over the ten years to December 2025:

| Index | 10 years, % a year | 2025, % |
|---|---|---|
| Systematic trend-following funds | 2.12 | −0.65 |
| Relative-value funds | 5.29 | 7.49 |
| Share-picking hedge funds | 8.11 | 17.34 |
| World shares (MSCI World) | 12.17 | 21.09 |

Source: the HFRI Macro: Systematic Diversified, Relative Value and Equity Hedge indexes in the [UBS hedge fund bulletin, December 2025](https://www.ubs.com/global/en/assetmanagement/insights/asset-class-perspectives/hedge-funds/articles/uga-hf-bulletin-dec-2025.html). No index of market-neutral share funds was found.

**A trend-following fund by year.** The AQR Managed Futures Strategy fund is open to the public. From 2010 to 2025 it returned 4.31% a year. A fund tracking the S&P 500 returned 14.02% (calculated here).

```figure
{
 "kind": "bar",
 "title": "A public trend-following fund against the S&P 500, 2010–2025",
 "sub": "Total return per calendar year, percent, after fees. AQR Managed Futures Strategy fund and the SPDR S&P 500 fund.",
 "unit": "%",
 "x": ["2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
 "xName": "Year",
 "series": [
  {"name": "Trend-following fund", "values": [7.74, -6.03, 2.99, 10.53, 15.10, 4.05, -8.43, -0.97, -8.88, 1.92, -0.43, -1.04, 35.47, 1.83, 8.40, 14.62]},
  {"name": "S&P 500 fund", "values": [15.06, 1.89, 15.99, 32.31, 13.46, 1.23, 12.00, 21.71, -4.57, 31.22, 18.33, 28.73, -18.18, 26.18, 24.89, 17.72]}
 ],
 "note": "From 2011 to 2021 the trend fund returned 0.56% a year. In 2022, the one year in the period when shares and bonds both fell hard, it gained 35.47% while the index fund lost 18.18%. One dollar grew to $1.96 in the trend fund and to $8.16 in the index fund. In 2026 to 23 November the trend fund is up 11.81% and the index fund 6.75%.",
 "source": "totalrealreturns.com (fund total returns, data to 23 November 2026)",
 "sourceUrl": "https://totalrealreturns.com/n/SPY,AQMIX,PQTIX,QMNIX,BTAL,DBMF"
}
```

**A market-neutral fund.** The AQR Equity Market Neutral fund returned 7.89% a year from 2015 to 2025, against 13.42% for the S&P 500 fund (calculated here). The path was three gains, three losses totalling −37%, then five years averaging 22.7%.

**Factor funds.** Since July 2013 one fund family has offered a fund for each of five factors in US shares. These hold the favoured shares only, with no short side.

```figure
{
 "kind": "hbar",
 "title": "Five factor funds against the plain index, July 2013 to November 2026",
 "sub": "Total return, percent a year, after fees. iShares MSCI USA factor funds and the SPDR S&P 500 fund.",
 "unit": "%",
 "highlight": ["S&P 500 index fund"],
 "rows": [
  ["Momentum", 13.60, "$10,000 became $54,795"],
  ["S&P 500 index fund", 13.36, "$10,000 became $53,272"],
  ["Quality", 13.30, "$10,000 became $52,870"],
  ["Value", 12.00, "$10,000 became $45,349"],
  ["Size", 11.05, "$10,000 became $40,496"],
  ["Minimum volatility", 10.50, "$10,000 became $37,885"]
 ],
 "note": "One of five beat the index, by 0.24 points a year. All six fell between 33% and 39% in the crash that ended on 23 March 2020, the minimum-volatility fund included. The value fund gained 32.67% in 2025 and 32.95% in 2026 to 23 November, after trailing for most of the period.",
 "source": "totalrealreturns.com (22 July 2013 to 23 November 2026)",
 "sourceUrl": "https://totalrealreturns.com/n/SPY,MTUM,VLUE,QUAL,USMV,SIZE"
}
```

**Multi-strategy funds.** The 2025 chart above is representative: steady positive years, mostly below the index in strong markets. Citadel's main fund is reported to have returned about 38% in 2022, 15.3% in 2023, 15.1% in 2024 and 10.2% in 2025; Millennium about 10%, 15% and 10.5% in the last three of those years ([Bloomberg, 3 Jan 2024](https://www.bloomberg.com/news/articles/2024-01-03/hedge-funds-millennium-eisler-close-out-2023-with-10-gains); [Hedgeweek, 3 Jan 2025](https://www.hedgeweek.com/multi-strats-make-their-mark-in-2024/)). None of these funds is open to the public.

> [!warn] What the investor in the average quant product got
> Over the last ten to fifteen years: less than a cheap index fund, in every category found for this primer. What was bought was a different pattern of returns, which paid off mainly in 2022. The records that made the style famous belong to a few firms closed to the public.

## What an individual can and cannot take from the style

**Cannot be copied:**

- **Speed.** Co-location and microwave links buy an edge measured in millionths of a second.
- **Data and people.** Millennium alone had more than 6,800 staff in July 2026 ([overview](https://en.wikipedia.org/wiki/Millennium_Management,_LLC)).
- **Financing.** An individual may borrow half the price of a share purchase. A hedged fund borrows many times that.
- **Being the house.** Market makers and wholesalers earn the spread. An individual pays it.

**Can be copied, with a spreadsheet:** writing each rule down before trading it; testing on one period and checking on another kept unseen; counting the versions tried and the trades made before trusting a result; working out expectancy per setup with costs included; and cutting size after losses by a fixed rule, as pods are made to do.

## What carries over

### Investing (years)

- **The index fund is the cheapest form of many small bets.** It holds hundreds of positions, none of which matters alone, at a fee near zero.
- **Factor tilts have not paid recently.** Four of the five factor funds trailed the index from 2013 to 2026. The value factor was negative in 12 of the 19 years from 2007 to 2025, then led strongly.
- **A schedule is a rule.** Buying a fixed amount on fixed dates is a written rule applied without discretion: the quant method at its simplest.
- **Trend-following funds are different, not better.** Their record is a low long-run return with one very good year when shares and bonds fell together.

> [!test] A hypothesis to check
> A portfolio of 90% index fund and 10% trend-following fund, rebalanced yearly, had a smaller worst drawdown from 2010 to 2025 than the index fund alone, and a lower total return. The yearly figures in the chart above are enough to check it.

### Swing trading (days to weeks)

- **Buying leading shares is the momentum factor by hand.** Its record is the strongest of the factors: 8.58 points a year since 1927, positive in 78 of 99 years. Its accidents come when leadership turns over sharply: April 2009 (−34.36%), November 2020 (−12.60%) and July 2026 (−12.21%).
- **Crowding reaches outsiders.** In the summer of 2025 and in July 2026 crowded hedge fund positions reversed together while the index held up. A swing trader in leading shares holds many of the same names as the pods.
- **Loss limits by rule.** The pod structure can be written for one account: a drawdown at which size is halved, and a second at which trading stops for a set time.
- **Each setup is its own strategy.** Pullbacks, breakouts and earnings gaps each have their own win rate and payoff. Pooled results hide which one carries the edge.

> [!test] Two hypotheses to check
> - In a trade history, the setups differ in expectancy by more than chance, once each has the number of trades the table above requires.
> - Breakouts entered in the 20 sessions after a month in which French's momentum factor lost more than 5% had a lower win rate than breakouts entered at other times.

### Day trading (minutes to hours)

**Who is on the other side.** A retail market order in a US share is, more than nine times in ten, sent to a wholesaler, and in most cases filled by that firm from its own account (SEC figures above). The wholesaler needs no view on direction. It earns the spread. The day trader's profit has to come from being right about direction by more than the spread and slippage paid on the way in and out.

**The open.** At 9:30 am each US exchange runs an opening auction: orders queued before the open are matched at one price. Nasdaq publishes the balance of buy and sell orders from 9:25 am ([Nasdaq, Opening Cross](https://www.nasdaqtrader.com/Trader.aspx?id=OpenClose)). The minutes that follow have the widest spreads of the day. A study of New York Stock Exchange quotes found a "crude reverse J-shaped pattern": spreads highest at the open, lower at midday, higher again into the close ([McInish and Wood, Journal of Finance, 1992](https://digitalcommons.memphis.edu/facpubs/11507)). The data is old and spreads are far narrower now.

A strategy built on the first 5-minute range meets this directly. The range forms while spreads are widest. The entry, a buy order above the range high, becomes a market order at the breakout and pays the ask. The exit at a stop sells at the bid.

An illustration, not a measurement: with a stop $0.25 from entry, 1R is $0.25 a share. A round trip by market orders costs about one spread: 0.08R at 2 cents, 0.24R at 6 cents. A gross expectancy of +0.15R per trade becomes +0.07R in the first case and −0.09R in the second.

**R and expectancy are the retail form of quant thinking.** A fixed risk unit makes every trade the same size of bet, as a quant book does when it sizes each position to the same risk. Results in R can then be added, averaged and tested like the coin bets at the start of this primer. Expectancy in R is the edge per bet, and the trade count says whether it can be told from luck. A daily trade limit and smaller size after a losing streak are the pod's loss limit applied to one account.

> [!test] Two hypotheses to check
> - For 5-minute opening range breakouts in a trade history, expectancy in R after measured slippage is lower where the spread at entry was above 0.1R than where it was below.
> - A rule that halves size after a drawdown of 5R, and restores it at a new high, would have cut the deepest drawdown in the history by more than it cut the total result.

## What to learn first

Eight terms carry most of the two profiles: **expectancy** (the average result per bet), **Sharpe ratio** (return above cash divided by volatility), **leverage** (positions divided by own capital), **market-neutral** (equal money long and short), **out-of-sample** (data the rule had not seen), **overfitting** (shaping a rule to past noise), **crowding** (many funds in the same positions) and **pass-through fees** (all of a firm's costs charged to its investors).

A reading list:

1. **Gregory Zuckerman, *The Man Who Solved the Market*** (2019). The history of Renaissance. [Review](https://rpc.cfainstitute.org/blogs/enterprising-investor/2020/book-review-the-man-who-solved-the-market)
2. **Edward Thorp, *A Man for All Markets*** (2017). An early quant investor in his own words. [Author](https://en.wikipedia.org/wiki/Edward_O._Thorp)
3. **Roger Lowenstein, *When Genius Failed*** (2000). Long-Term Capital Management. [Overview](https://en.wikipedia.org/wiki/When_Genius_Failed)
4. **Scott Patterson, *The Quants*** (2010). August 2007 through the people involved. [Overview](https://en.wikipedia.org/wiki/The_Quants)
5. **Andrew Lo, *Adaptive Markets*** (2017). Why edges appear, get crowded and fade. [Overview](https://en.wikipedia.org/wiki/Adaptive_market_hypothesis)
6. **Khandani and Lo** on August 2007. Readable, with every number shown. [Paper](https://web.mit.edu/Alo/www/Papers/august07.pdf)
7. **Bailey and López de Prado, "The Deflated Sharpe Ratio"** (2014). The cost of trying many versions. [Paper](https://www.davidhbailey.com/dhbpapers/deflated-sharpe.pdf)
8. **AQR's papers** on [value and momentum](https://www.aqr.com/Insights/Research/Journal-Article/Value-and-Momentum-Everywhere), [trend following](https://www.aqr.com/Insights/Research/Journal-Article/Time-Series-Momentum) and [quality](https://www.aqr.com/Insights/Research/Journal-Article/Quality-Minus-Junk).

Free primary sources: [Kenneth French's data library](https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html) for factor returns since 1927; the [SEC's margin guide](https://www.sec.gov/investor/pubs/margin.htm); [SEC release 34-96495](https://www.sec.gov/files/rules/proposed/2022/34-96495.pdf) on how retail orders are handled; and the Rule 606 report on every US broker's site.

## Sources and limits

Sources are linked after each claim. Calculated for this primer: the figures on the small edge, diversification, leverage, random rules and trades needed; the factor averages and Sharpe ratios; the multi-year fund returns; and the fee and spread illustrations.

Limits and items not confirmed on a primary page:

- The Mercer remark and the loss limits at multi-strategy firms are second-hand reports.
- Returns of the multi-strategy firms are press reports of figures sent to investors. Point72's assets, the $428 billion industry total and the Goldman Sachs leverage figure were seen only in secondary summaries.
- The SEC's figures on wholesalers are for early 2022. The names of the two largest are from a secondary source.
- The SG CTA Index was found only for some years, and no index of market-neutral share funds was found. One public fund stands in for each.
- The flash crash account relies on Wikipedia's summary of the official report. Berkshire Hathaway's Sharpe ratio comes without its period.
- The study of intraday spreads dates from 1992, and the spread example uses invented round numbers.

This is a study of a style of investing. It is not advice to buy or sell anything.
