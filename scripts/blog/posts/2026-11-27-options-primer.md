---
title: "Options for someone who trades stocks: a primer"
date: 2026-11-27
order: 2
tags: [primer, options, research]
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

```figure
{"kind":"line","title":"Profit or loss at expiry: one $105 call against 100 shares","sub":"Stock at $100 today. The call costs $2.71 a share, $271 for the contract. The shares cost $10,000.","unit":"$","x":["$85","$86","$87","$88","$89","$90","$91","$92","$93","$94","$95","$96","$97","$98","$99","$100","$101","$102","$103","$104","$105","$106","$107","$108","$109","$110","$111","$112","$113","$114","$115","$116","$117","$118","$119","$120","$121","$122","$123","$124","$125"],"xName":"Stock price at expiry","series":[{"name":"One $105 call","values":[-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-271,-171,-71,29,129,229,329,429,529,629,729,829,929,1029,1129,1229,1329,1429,1529,1629,1729]},{"name":"100 shares","values":[-1500,-1400,-1300,-1200,-1100,-1000,-900,-800,-700,-600,-500,-400,-300,-200,-100,0,100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2100,2200,2300,2400,2500],"dash":true}],"marks":[["$105","strike"],["$108","breakeven $107.71"]],"endValues":false,"note":"Below the strike the call's loss is flat at the premium. Above the breakeven it gains dollar for dollar with 100 shares.","source":"Model values (Black-Scholes, 40% implied volatility, 30 days, 4% interest rate)"}
```

Three things to read off the figure:

1. **The loss is flat on the left.** Below $105 the call is worthless and the buyer is out $271, whether the stock is at $104 or $85.
2. **Breakeven is strike plus premium.** The stock must be above $107.71 at expiry for the buyer to make anything. It can rise 7% and the call still loses money.
3. **Above breakeven the call gains dollar for dollar with 100 shares,** for a fraction of the money put up.

```figure
{"kind":"line","title":"The same picture flipped: one $95 put against 100 shares sold short","sub":"The put costs $2.29 a share, $229 for the contract.","unit":"$","x":["$75","$76","$77","$78","$79","$80","$81","$82","$83","$84","$85","$86","$87","$88","$89","$90","$91","$92","$93","$94","$95","$96","$97","$98","$99","$100","$101","$102","$103","$104","$105","$106","$107","$108","$109","$110","$111","$112","$113","$114","$115"],"xName":"Stock price at expiry","series":[{"name":"One $95 put","values":[1771,1671,1571,1471,1371,1271,1171,1071,971,871,771,671,571,471,371,271,171,71,-29,-129,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229,-229]},{"name":"100 shares short","values":[2500,2400,2300,2200,2100,2000,1900,1800,1700,1600,1500,1400,1300,1200,1100,1000,900,800,700,600,500,400,300,200,100,0,-100,-200,-300,-400,-500,-600,-700,-800,-900,-1000,-1100,-1200,-1300,-1400,-1500],"dash":true}],"marks":[["$95","strike"],["$93","breakeven $92.71"]],"endValues":false,"source":"Model values (Black-Scholes, 40% implied volatility, 30 days, 4% interest rate)"}
```

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

```figure
{"kind":"explorer","title":"One option, three dials: a $105 call on a $100 stock","sub":"Everything in this primer can be seen by moving these three sliders.","type":"call","strike":105,"contracts":1,"cost":2.7143,"underlying":"Stock","price":{"min":85,"max":125,"value":100,"step":0.1},"days":{"max":30,"value":30,"step":0.25},"iv":{"min":10,"max":100,"value":40},"presets":[["Start: $100, 30 days",100,30,40],["+5% the next day",105,29,40],["Flat for 20 days",100,10,40],["+7% at expiry",107,0,40],["Fear doubles",100,30,80]],"ymax":16,"note":"A Black-Scholes model with a 4% interest rate and no dividends. Real quotes differ a little."}
```

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

```figure
{"kind":"line","title":"Time decay: an at-the-money call with the stock frozen at $100","sub":"Price per share as the days run out. Nothing else changes.","unit":"$","x":["60","59","58","57","56","55","54","53","52","51","50","49","48","47","46","45","44","43","42","41","40","39","38","37","36","35","34","33","32","31","30","29","28","27","26","25","24","23","22","21","20","19","18","17","16","15","14","13","12","11","10","9","8","7","6","5","4","3","2","1","0"],"xName":"Days left","series":[{"name":"$100 call","values":[6.77,6.72,6.66,6.6,6.54,6.47,6.41,6.35,6.29,6.23,6.16,6.1,6.03,5.97,5.9,5.83,5.77,5.7,5.63,5.56,5.49,5.42,5.35,5.27,5.2,5.12,5.05,4.97,4.89,4.81,4.73,4.65,4.57,4.48,4.39,4.31,4.22,4.13,4.03,3.94,3.84,3.74,3.64,3.53,3.43,3.31,3.2,3.08,2.96,2.83,2.69,2.55,2.41,2.25,2.08,1.89,1.69,1.46,1.19,0.84,0]}],"marks":[["30","30 days left"],["10","10 days left"]],"note":"The last 10 days remove $2.69; the 30 days before them remove $2.79. Read left to right: 60 days left down to none.","source":"Model values (Black-Scholes, 40% implied volatility, 4% interest rate)"}
```

**Vega is the price of uncertainty.** It has no equivalent in stock trading and gets its own section below.

## Leverage, with numbers

```figure
{"kind":"bar","title":"The same stock moves, as a return on the call and on the shares","sub":"Percent gain or loss. $105 call bought at $2.71 with the stock at $100.","unit":"%","x":["+5% next day","+10% in 10 days","Flat for 10 days","Flat for 20 days","−5% in 10 days","+7% at expiry"],"xName":"What the stock does","series":[{"name":"$105 call","values":[80,164,-30,-66,-74,-26]},{"name":"100 shares","values":[5,10,0,0,-5,7]}],"labels":"all","height":300,"note":"The last pair is the trap: the stock rose 7% by expiry and the call still lost 26%. Had it risen 4%, the call would have lost everything.","source":"Model values (Black-Scholes, 40% implied volatility, 4% interest rate)"}
```

The left of the figure is the appeal: a 5% move in a day returns 80%. The right is the trap: being right about direction but slow, or right but not right enough, still loses. With shares a trader needs to be right about **direction**. With a bought option the trader needs to be right about direction, the **size** of the move and the **timing**, all three.

## Implied volatility: the price tag on the option

Volatility is how much a stock moves around, expressed as a yearly percentage. A stock with 40% volatility typically moves about 2.5% a day; one with 20%, about 1.25%.

Implied volatility is the volatility the market is assuming when it prices an option. Nobody announces it. It is worked out backwards from the option's price: given this premium, what size of future move must the market be expecting? High implied volatility means options are expensive.

```figure
{"kind":"hbar","title":"Same stock, same strike, same 30 days: only the expected movement differs","unit":"$","dp":2,"rows":[["Implied volatility 20%",0.71,"about 1.3% a day"],["Implied volatility 40%",2.71,"about 2.5% a day"],["Implied volatility 80%",7.2,"about 5.0% a day"]],"source":"Model values (Black-Scholes, $105 call, stock $100, 4% interest rate)"}
```

Nothing about the stock price differs between those bars. So an option can gain or lose a lot while the stock stands still: with implied volatility rising from 40% to 50%, the $2.71 call becomes $3.81 (+40%); falling to 30%, it becomes $1.66 (−39%). Implied volatility rises when the market expects news or is frightened (before earnings, before a central bank decision, during a sell-off) and falls once the news is out.

### Right on direction, still a loss

Before an earnings report nobody knows which way the stock will jump, so options get expensive. The moment the number is out the uncertainty is gone and implied volatility collapses. This is called volatility crush (or IV crush).

An example. A stock is at $100 the afternoon before earnings. The $100 call with 3 days to expiry costs $5.44, an implied volatility of 150%. The $100 put costs $5.40. Buying both (a straddle) costs $10.84, which says the market is pricing a move of roughly 11% in either direction. That figure is called the **implied move**.

```figure
{"kind":"bar","title":"Volatility crush: a call bought before earnings, the morning after","sub":"Bought at $5.44 with implied volatility at 150%. The next morning implied volatility is 45%.","unit":"%","sign":true,"x":["−5%","+3%","+5%","+8%","+12%"],"xName":"Stock move on the report","series":[{"name":"Return on the call","values":[-98,-38,-6,48,121]}],"note":"The stock rose 3% and 5% and the call buyer still lost. The move has to beat what was already priced in, here about 11%.","source":"Model values (Black-Scholes, $100 call, 3 days to expiry at purchase, 4% interest rate)"}
```

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

```figure
{"kind":"bar","title":"A same-day call: what $0.48 becomes by 2:00 pm","sub":"SPY at $600 at 10:00 am; the $606 call expiring that day. Value at 2:00 pm as a multiple of the price paid.","unit":"x","x":["flat","+0.5%","+1.0%","+1.5%","+2.0%"],"xName":"SPY move by 2:00 pm","series":[{"name":"Multiple of cost","values":[0.1,0.7,2.9,7.1,12.8]}],"note":"A 2% up day is rare: at a VIX of 16 the market prices a typical day of about 1%. Held to the close with SPY at $606 or lower, the call expires worthless.","source":"Model values (Black-Scholes, implied volatility held at 16%, trading hours as the clock)"}
```

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
