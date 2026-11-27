---
title: "Options for someone who trades stocks: a primer"
date: 2026-11-27
order: 2
tags: [primer, options, research]
collection: options
short: Options primer
summary: An option is a rented, expiring, leveraged position in a stock; the huge gains in screenshots come from buying cheap options that expire soon, in size, just before a move larger than the market had priced in, and the same recipe loses the whole stake on most other days.
---

An option is a rented, expiring, leveraged position in a stock. Its buyer needs to be right about three things at once (direction, the size of the move and the timing) where a shareholder needs only the first. This primer assumes knowledge of stocks (long, short, stops, position size) and none of options. Every term is explained where it first appears, and one interactive figure lets the reader move the three inputs that set an option's price and watch what happens.

It is the background for a worked example on this site: [a Reddit account that went from $500 to $1 million in ten trading days of NVDA options](/blog/nvda-options-500-to-1-million).

All prices in the worked examples come from one standard pricing model (Black-Scholes) with the inputs stated, so they fit together. Real quotes differ a little.

## What an option is

An option is a contract between two people about a stock. The buyer pays a price up front and gets a right. The seller collects that price and takes on an obligation.

```figure
{ "kind": "compare", "title": "The two kinds of option",
  "cols": [
    { "title": "Call", "tag": "gains when the stock rises", "items": ["The right to **buy** 100 shares at a fixed price, up to a fixed date", "Works like a deposit: a small payment now for the right to buy later at today's terms", "If the stock never gets above the fixed price, the deposit is lost"] },
    { "title": "Put", "tag": "gains when the stock falls", "items": ["The right to **sell** 100 shares at a fixed price, up to a fixed date", "Works like insurance: a premium for the right to sell at that price however far the stock falls", "If the stock never gets below the fixed price, the premium is lost"] }
  ] }
```

Four terms describe every option:

| Term | Meaning | Example used below |
|---|---|---|
| **Underlying** | The stock or index the contract is about | A stock trading at $100 |
| **Strike** | The fixed price in the contract | $105 |
| **Expiry** | The last day the contract exists | 30 days from now |
| **Premium** | What the buyer pays the seller | $2.71 |

Premiums are quoted per share and one contract covers 100 shares, so a premium of $2.71 means the contract costs **$271**. A position of 50 contracts at $0.48 is 50 × 100 × $0.48 = $2,400.

The buyer's loss is capped at the premium. That is the feature that makes options attractive. The catch is that losing all of it is a common outcome, not a rare one.

Every option bought is an option somebody sold. The seller (also called the writer) keeps the premium if the option ends up worthless and pays out if it does not. The seller's position is the mirror image of the buyer's: a small, likely gain and a large, unlikely loss. On most retail orders the other side is a market maker (a firm that quotes buy and sell prices all day and hedges its risk with the stock).

A broker screen shows an option as something like `SPY Nov 27 '26 $600 Call`: the underlying, the expiry, the strike and the kind. Next to it are the bid and ask (the best prices to sell at and buy at; the gap between them is the spread, far wider on options than on stocks), the volume (contracts traded today) and the open interest (contracts that exist right now).

## What an option is worth at expiry

At expiry an option is worth exactly one thing: how far the stock is past the strike in the right direction, or zero. A call is worth the stock price minus the strike, if that is positive. A put is worth the strike minus the stock price, if that is positive.

{{payoff_call}}

Three things to read off the figure:

1. **The loss is flat on the left.** Below $105 the call is worthless and the buyer is out $271, whether the stock is at $104 or $85.
2. **Breakeven is strike plus premium.** The stock must be above $107.71 at expiry for the buyer to make anything. It can rise 7% and the call still loses money.
3. **Above breakeven the call gains dollar for dollar with 100 shares,** for a fraction of the money put up.

{{payoff_put}}

Few people trading for a quick gain hold to expiry or exercise (use the right to buy or sell the shares). They sell the option back in the market, the way a stock is sold.

## What it is worth before expiry

Before expiry an option is worth more than the expiry formula says, because there is still time for the stock to move. Its price has two parts: **intrinsic value** (what it would be worth if it expired right now) and **time value** (everything else: the price of the chance of a move).

Where the strike sits relative to the stock has a name. For calls, with the stock at $100 and 30 days left:

```figure
{ "kind": "hbar", "title": "Four calls on the same $100 stock", "unit": "$", "dp": 2,
  "rows": [
    ["$90 call: in the money", 11.29, "$10.00 intrinsic + $1.29 time value"],
    ["$100 call: at the money", 4.73, "all time value"],
    ["$105 call: out of the money", 2.71, "all time value"],
    ["$115 call: far out of the money", 0.70, "all time value"]
  ],
  "note": "For puts it is reversed: a put is in the money when the strike is above the stock. The far out-of-the-money option is the cheapest and needs the biggest move to pay anything. It is what most large-percentage-gain posts are holding.",
  "source": "Model values (Black-Scholes, 40% implied volatility, 30 days, 4% interest rate)" }
```

## One option, three dials

A stock's price depends on one thing: what people will pay for it. An option's price depends on three things at once: where the stock is, how much time is left, and how much movement the market expects (implied volatility, explained below). The figure prices the $105 call from the example for any combination.

{{explorer_primer}}

Things worth trying, each of which is a section of this primer:

- **Drag the stock price up from $100 to $110.** The blue curve steepens as it goes: the option gains a little on the first dollar and more on each one after. "Acts like" climbs from about 37 shares to about 69.
- **Slide the days left down to 10 with the stock at $100.** The option loses about two thirds of its value while the stock does nothing.
- **Raise implied volatility from 40% to 80%.** The option more than doubles with the stock unchanged.
- **Set days left to zero.** The curve collapses onto the grey expiry line: all the time value is gone.

## The four forces on the price

Each force has a Greek-letter name, and each is simply "how much does the option's price change if this one input changes". For the $105 call at $2.71:

| Greek | The question it answers | Value here | In dollars, per contract |
|---|---|---|---|
| **Delta** | If the stock rises $1, how much does the option gain? | 0.37 | +$37 |
| **Gamma** | How much does delta itself grow for each $1 the stock rises? | 0.033 | delta becomes 0.40 |
| **Theta** | How much does the option lose each day if nothing else changes? | −0.076 | −$7.60 a day |
| **Vega** | If implied volatility rises one point, how much does the option gain? | 0.108 | +$10.80 |

**Delta is how much stock the holder really has.** A delta of 0.37 means the contract behaves, right now, like 37 shares. It is also a rough guide to the chance the option finishes in the money: about 37%. An in-the-money $90 call has a delta of 0.84; a far out-of-the-money $115 call, 0.13.

**Gamma is why gains accelerate.** Delta is not fixed. As the stock rises toward and through the strike, the call's delta climbs toward 1. This bend in the curve is called convexity, and it is the reason a stock moving 2% can turn into an option moving 1,000%. Gamma is largest for options near the strike and close to expiry, which is exactly the kind bought for a same-day bet.

**Theta is the rent.** A stock held flat for a month costs nothing. An option held flat for a month loses most of what was paid for it.

{{decay}}

**Vega is the price of uncertainty.** It has no equivalent in stock trading and gets its own section below.

## Leverage, with numbers

{{leverage}}

The left of the figure is the appeal: a 5% move in a day returns 80%. The right is the trap: being right about direction but slow, or right but not right enough, still loses. With shares a trader needs to be right about **direction**. With a bought option the trader needs to be right about direction, the **size** of the move and the **timing**, all three.

## Implied volatility: the price tag on the option

Volatility is how much a stock moves around, expressed as a yearly percentage. A stock with 40% volatility typically moves about 2.5% a day; one with 20%, about 1.25%.

Implied volatility is the volatility the market is assuming when it prices an option. Nobody announces it. It is worked out backwards from the option's price: given this premium, what size of future move must the market be expecting? High implied volatility means options are expensive.

{{iv_price}}

Nothing about the stock price differs between those bars. So an option can gain or lose a lot while the stock stands still: with implied volatility rising from 40% to 50%, the $2.71 call becomes $3.81 (+40%); falling to 30%, it becomes $1.66 (−39%). Implied volatility rises when the market expects news or is frightened (before earnings, before a central bank decision, during a sell-off) and falls once the news is out.

### Right on direction, still a loss

Before an earnings report nobody knows which way the stock will jump, so options get expensive. The moment the number is out the uncertainty is gone and implied volatility collapses. This is called volatility crush (or IV crush).

An example. A stock is at $100 the afternoon before earnings. The $100 call with 3 days to expiry costs $5.44, an implied volatility of 150%. The $100 put costs $5.40. Buying both (a straddle) costs $10.84, which says the market is pricing a move of roughly 11% in either direction. That figure is called the **implied move**.

{{crush}}

To profit from buying options into an event, the move has to be bigger than the move already priced in. When an earnings screenshot shows a huge gain, the stock moved far more than the implied move.

## The VIX

The VIX is the implied volatility of the S&P 500. Cboe, the exchange that lists S&P 500 index options, calculates it from the prices of options with about 30 days to expiry ([Cboe VIX methodology](https://cdn.cboe.com/resources/indices/governance/Volatility_Index_Methodology_Cboe_Volatility_Index.pdf)). It is quoted as a yearly percentage, like any implied volatility, and is often called the fear gauge because it jumps when stocks fall hard.

A rule of thumb turns it into an expected daily move: **divide by 16** (roughly the square root of the number of trading days in a year).

```figure
{ "kind": "hbar", "title": "The VIX as a typical daily move in the S&P 500", "unit": "%", "dp": 2,
  "rows": [
    ["VIX 12", 0.75, "very calm"],
    ["VIX 16", 1.0, "calm to normal"],
    ["VIX 20", 1.25, "near the long-run average"],
    ["VIX 30", 1.9, "stressed"],
    ["VIX 45", 2.8, "crisis"]
  ],
  "note": "\"Typical\" means one standard deviation: the market expects a smaller move than this on about two days in three.",
  "source": "VIX divided by 16" }
```

How it behaves:

- **It moves opposite to stocks.** When the S&P 500 falls sharply the VIX rises, usually by far more in percentage terms.
- **It spikes and then fades.** Jumps are sudden and declines are slow. Its long-run average is a little under 20.
- **A high VIX means options are expensive.** A call bought with the VIX at 30 costs roughly twice what it costs at 15, so it needs twice the move.
- **It says nothing about one day's options.** For those Cboe publishes a one-day index, VIX1D, built from options expiring today and tomorrow ([Cboe 1-Day Volatility Index methodology](https://cdn.cboe.com/resources/indices/governance/Volatility_Index_Methodology_Cboe_1-Day_Volatility_Index.pdf)).

For any option trade under study, the VIX on the day answers one question: were options cheap or expensive when the position was bought?

## Options that expire the same day

**0DTE** means "zero days to expiry": an option bought on the day it expires. The S&P 500 index and the largest index funds now have an expiry every trading day. Cboe reported that such options made up 59% of all S&P 500 index option volume in 2025 ([Cboe, full-year 2025](https://ir.cboe.com/news/news-details/2026/Cboe-Global-Markets-Reports-Trading-Volume-for-December-and-Full-Year-2025/default.aspx)) and a record 66.2% in July 2026 ([Cboe, July 2026](https://ir.cboe.com/news/news-details/2026/Cboe-Global-Markets-Reports-Trading-Volume-for-July-2026/default.aspx)).

They are cheap, because with hours left there is little time value. Their gamma is at its highest: delta can go from 0.15 to 0.85 in a couple of hours. And their theta is at its highest: all the time value is gone by 4:00 pm, so a flat market is a total loss.

A worked example. SPY (the largest S&P 500 fund) is at $600 at 10:00 am. The $606 call expiring that day, 1% above the market, costs about $0.48, or $48 a contract. Its delta is only 0.16.

{{zero}}

## The strategies named in posts

Every option strategy is built from four pieces: buy a call, sell a call, buy a put, sell a put.

```figure
{ "kind": "compare", "title": "Two sides of every option",
  "cols": [
    { "title": "Buyers pay premium", "tag": "small known cost, small chance of a large gain", "items": ["**Long call / long put:** needs the stock to move enough, soon", "**Weekly or same-day \"lotto\":** cheap far out-of-the-money options; needs a large move within hours or days", "**Earnings play:** needs a move bigger than the implied move", "**Straddle:** a call and a put together; needs a big move in either direction", "**LEAPS:** a call with a year or more to expiry; low daily decay", "Most that can be lost: the premium"] },
    { "title": "Sellers collect premium", "tag": "small known gain, small chance of a large loss", "items": ["**Covered call:** own 100 shares, sell a call above the price", "**Cash-secured put:** sell a put, keep cash ready to buy the shares", "**The wheel:** sell puts until handed the shares, then sell calls on them", "**Credit spread / iron condor:** sell one option, buy a further one as protection; loss capped at several times the premium", "**Naked call or put:** no protection; the loss can be very large"] }
  ],
  "note": "Screenshots of 2,000% gains come from the left column. Screenshots of an account wiped out in a day usually come from the right." }
```

## How the screenshot gains are made

Nearly every "turned $5,000 into $150,000" post has the same five ingredients:

```figure
{ "kind": "flow", "title": "The recipe behind a 20x option screenshot", "dir": "h",
  "steps": [
    ["Out of the money", "so each contract is cheap"],
    ["Days or hours to live", "cheaper still, and gamma is high"],
    ["Size", "a large share of the account in one position"],
    ["A catalyst", "earnings, a rate decision, a news shock"],
    ["A move bigger than priced in", "in the right direction, before expiry"]
  ],
  "note": "Many big wins are also rolled: the gain from the first trade goes into a second, so two 5x trades in a row make 25x." }
```

```figure
{ "kind": "quadrant", "title": "What a bought option pays, by what the stock does",
  "xAxis": ["Move smaller than was priced in", "Move bigger than was priced in"], "yAxis": ["Direction right", "Direction wrong"],
  "cells": [
    ["Loses some or all of the premium", "Right, but not right enough or too slow"],
    ["The screenshot", "A gain of many times the stake"],
    ["Loses the premium", "The common outcome"],
    ["Loses the premium", "And no more than that, however far the stock goes"]
  ] }
```

Why it is not a repeatable method:

- **Only the winners are visible.** People post the day it worked. The days the same bet expired worthless do not get posted.
- **The typical outcome is a full loss.** The far out-of-the-money option in the same-day example had a delta of 0.16: the market gave it about a one-in-six chance of finishing in the money at all.
- **Research on retail option buyers is consistent.** A study in the *Journal of Finance* found retail investors favour cheap weekly options, pay an average bid-ask spread of 12.6%, and lose money on average ([Bryzgalova, Pavlova and Sikorskaya, 2023](https://lbsresearch.london.edu/id/eprint/2827/)). A study of earnings trades put average retail losses at 5% to 9% around announcements and 10% to 14% on the most volatile ones ([de Silva, Smith and So, summarised by Quantpedia](https://quantpedia.com/how-retail-losses-money-in-option-trading/)). A study of same-day S&P 500 options estimated that retail traders as a group lost about $358,000 a day after daily expiries began in 2022 ([Bloomberg, 21 April 2023](https://www.bloomberg.com/news/articles/2023-04-21/day-traders-lose-358-000-per-day-gambling-on-zero-day-options)).
- **The costs are large.** A 12.6% spread means a buyer is down about 6% the moment the order fills, and pays again on the way out.

None of this says options cannot be used well. It says the screenshot is the right tail of a distribution whose middle is a loss.

## Costs and traps that stocks do not have

- **Wide spreads.** A stock quoted $100.00 / $100.01 has a spread of 0.01%. An option quoted $0.45 / $0.50 has a spread of 10%.
- **Thin trading.** Far strikes and far expiries may barely trade. Volume and open interest show whether a position can be exited.
- **Stops do not work the same way.** Option prices jump, and a stop order can fill far from its level. The usual way to limit risk on a bought option is position size: the amount put in is the amount that can be lost.
- **The clock.** Being early is the same as being wrong.
- **Expiry-day handling.** Brokers may close positions in the last hour, at whatever price is available.

## Next to an intraday trade in shares

| | Shares, intraday | A bought same-day option |
|---|---|---|
| What has to be right | Direction | Direction, size and timing |
| How risk is limited | A stop price | The premium paid |
| Cost of waiting | None | Theta, by the hour |
| What a choppy day does | Small losses at stops | Premium decays toward zero |
| What a trend day does | A gain in line with the move | A gain of many times the move |
| The extra thing to watch | Volume | Implied volatility, usually highest at the open and falling through the morning |

> [!take] A checklist for reading any option gain post
> - **The contract:** underlying, call or put, strike, expiry.
> - **The stake:** contracts × 100 × cost per share, and what share of the account that was.
> - **The times:** when it was bought and sold, and how many days it had left at entry.
> - **The move:** the underlying's price at entry and exit, and how far out of the money the strike was.
> - **The price of options that day:** implied volatility at entry and exit, or failing that the VIX.
> - **The catalyst,** and the implied move before it against the move that happened.
> - **The other draws:** what the same position was worth if the stock had done nothing.

The [NVDA case study](/blog/nvda-options-500-to-1-million) works through that checklist on a real post.

## Glossary

| Term | Plain meaning |
|---|---|
| **At the money** | Strike equal to the current stock price |
| **Call** | The right to buy 100 shares at the strike. Gains when the stock rises |
| **Convexity** | Gains that speed up as the move gets bigger |
| **Delta** | Option price change per $1 change in the stock; also the share-equivalent |
| **Gamma** | How fast delta changes as the stock moves |
| **Implied move** | The size of move the options market is pricing for an event |
| **Implied volatility** | The expected future movement built into an option's price |
| **In the money** | Has intrinsic value: call strike below the stock, put strike above |
| **Intrinsic value** | What the option would be worth if it expired now |
| **Out of the money** | No intrinsic value: call strike above the stock, put strike below |
| **Premium** | The price of an option |
| **Put** | The right to sell 100 shares at the strike. Gains when the stock falls |
| **Roll** | Close one option and open another at a different strike or expiry |
| **Strike** | The fixed price in the contract |
| **Theta** | Value lost per day from time passing |
| **Time value** | The part of the premium that is not intrinsic value |
| **Vega** | Option price change per one-point change in implied volatility |
| **VIX** | The 30-day implied volatility of the S&P 500 |

## Sources and method

- Cboe: [VIX methodology](https://cdn.cboe.com/resources/indices/governance/Volatility_Index_Methodology_Cboe_Volatility_Index.pdf), [1-Day Volatility Index methodology](https://cdn.cboe.com/resources/indices/governance/Volatility_Index_Methodology_Cboe_1-Day_Volatility_Index.pdf), and trading-volume releases for [full-year 2025](https://ir.cboe.com/news/news-details/2026/Cboe-Global-Markets-Reports-Trading-Volume-for-December-and-Full-Year-2025/default.aspx) and [July 2026](https://ir.cboe.com/news/news-details/2026/Cboe-Global-Markets-Reports-Trading-Volume-for-July-2026/default.aspx).
- Bryzgalova, Pavlova and Sikorskaya, ["Retail Trading in Options and the Rise of the Big Three Wholesalers"](https://lbsresearch.london.edu/id/eprint/2827/), *Journal of Finance*, 2023.
- de Silva, Smith and So, "Losing is Optional: Retail Option Trading and Expected Announcement Volatility" ([Stanford page](https://www.gsb.stanford.edu/faculty-research/publications/losing-optional-retail-option-trading-expected-announcement); [Quantpedia summary](https://quantpedia.com/how-retail-losses-money-in-option-trading/)).
- Beckmeyer, Branger and Gayda, "Retail Traders Love 0DTE Options... But Should They?", as reported by [Bloomberg, 21 April 2023](https://www.bloomberg.com/news/articles/2023-04-21/day-traders-lose-358-000-per-day-gambling-on-zero-day-options).
- **How the numbers were made.** Every option price, Greek and chart in the worked examples is a Black-Scholes model value computed for this note (interest rate 4%, no dividends; the same-day example uses trading hours as the clock and holds implied volatility at 16%). They show how the pieces relate and are not quotes from any real day. The Cboe volume shares and the study figures were taken from the linked releases and from published summaries of the papers, not from reading each paper in full.
