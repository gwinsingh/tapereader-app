---
title: "From $500 to $1 million in ten trading days: a Reddit options run, read off NVDA's chart"
date: 2026-11-27
order: 1
tags: [analysis, options, technical]
summary: A Reddit account went from about $2,600 to $1,021,075 between 11 and 25 November 2026 by buying cheap, short-dated NVDA options with a fifth to a half of the account each time; four overnight gaps produced 81% of the profit shown, and the last position was worth $740,000 at 9:32 am and $95,000 by the close.
---

A poster on Reddit's r/wallstreetbets turned about $2,600 into $1,021,075 in ten trading days in November 2026 ([the post](https://www.reddit.com/r/wallstreetbets/s/RuTqga4mRm)). Nothing more complex was done than buying calls and buying puts on Nvidia (NVDA): options far from the market price, with two to five days to live, bought with 20% to 55% of the account and sold within a day. Three bets carried it, and each was opened the session before a move nobody could have scheduled. This note rebuilds every trade from the post's 19 broker screenshots and from minute-by-minute market data, and reads each one on NVDA's own price chart, the way a stock trader would.

It is a study of what happened and how much risk was carried. It is not a method, and the last section says why.

```figure
{ "kind": "tiles", "title": "The run in four numbers",
  "tiles": [
    ["$2,600 → $1.02m", "Account value, 11 to 25 November 2026", "ten trading days"],
    ["44.5x · 20.7x · 2.06x", "The three bets that made it", "each on a larger base than the last"],
    ["81%", "Share of the profit shown that came from four overnight gaps", "$877,850 of $1,083,419"],
    ["−$264,000", "The last bet's result if held to that day's close", "it was sold at 9:32 am for +$381,099"]
  ],
  "source": "The post's screenshots; Yahoo Finance prices; calculations in this note" }
```

Options vocabulary is explained in a companion note, [Options for someone who trades stocks](/blog/options-primer). The five words this note leans on, translated into chart terms:

| Option word | What it means on a price chart |
|---|---|
| **Delta** | The position's size in shares, right now. A delta of 0.10 on 5,000 contracts (each covers 100 shares) acts like 50,000 shares |
| **Gamma** | The size changes by itself: it grows when price goes the holder's way and shrinks when it goes against |
| **Theta** | A holding cost, charged every hour, whether price moves or not |
| **Implied volatility** | The size of move already priced in. The buyer pays for the expected range up front |
| **Strike** | A level price has to travel toward. The option wakes up as price approaches it |

## What can and cannot be checked

| Item | Status |
|---|---|
| The fills (strike, expiry, quantity, price, time of sale) | From the post's 19 screenshots, all read. Screenshots can be edited; they cannot be verified |
| NVDA prices, gaps and times | Checked against Yahoo Finance daily and 1-minute data. They match the fills |
| Option prices at those minutes | Checked against 1-minute history for the same contracts (20 to 25 November). The sales appear as volume spikes of the right size in the right minute |
| The news | Reported by CNBC and Yahoo Finance (links at the end) |
| Buy times | **Not shown** in the screenshots. Inferred from the cost per contract and the option's trading by minute, and marked "inferred" throughout |
| A fall from $77,655 to about $40,000 on 20 November | **Not shown.** Taken from the post's text |

The ten winning sales in the screenshots add up to **$1,083,419**. The account rose by about **$1,018,400**. So roughly **$65,000 of net losses were left out**, most of it on Friday 20 November.

## The backdrop: a once-in-decades fortnight in one stock

Nvidia is the largest company in the S&P 500. In eleven sessions its shares opened 13% lower, fell 14% in a day, rose 31.5% in a day and opened 7.3% lower again.

```figure
{ "kind": "timeline", "title": "What happened to Nvidia, 5 to 25 November 2026",
  "events": [
    ["Thu 5 Nov", "Market-wide sell-off", "NVDA falls 9.3% and closes at $181.60."],
    ["Sun 8 Nov", "A personal disclosure by the chief executive, Jensen Huang, in a note to staff", "The stock opens 7.3% lower on Monday."],
    ["Wed 11 Nov, about 5 pm", "After-hours trading drops from $174 to $159 within half an hour"],
    ["Thu 12 Nov", "Huang's resignation is reported; the finance chief becomes interim chief executive", "NVDA opens **−13.1%** at $151.01 and closes at $166.19. Reports differ on the date (12 or 13 November)."],
    ["16–19 Nov", "The board says it is not considering his return", "The stock drifts from $156 to $146 as the wider market falls."],
    ["Fri 20 Nov", "S&P 500 −3.7%; no trigger specific to Nvidia is named in the reports read", "NVDA **−14.0%**, closing at $125.53."],
    ["Mon 23 Nov, before the open", "Nvidia announces that Huang is reinstated", "NVDA opens **+33.1%** at $167.04 and closes +31.5%, its best day since 2003."],
    ["Tue 24 Nov", "No single trigger reported", "NVDA −5.9%, closing at $155.38."],
    ["Wed 25 Nov", "Renewed worry about the AI trade is the reason given", "NVDA opens **−7.3%** at $144.06, low $141.17 at 9:45 am, closes at $149.30."]
  ],
  "source": "CNBC, 23 Nov 2026; Yahoo Finance, 23 to 27 Nov 2026 (linked at the end); prices from Yahoo Finance", "sourceUrl": "https://www.cnbc.com/2026/11/23/nvidia-jensen-huang-ceo.html" }
```

{{daily}}

Two readings of the lower panel. First, the VIX (the implied volatility of the S&P 500, a yearly percentage) turns into an expected daily move when divided by 16: 16.6 on 4 November priced a typical day of about 1%, and 35.9 on 20 November priced about 2.2%. Second, Nvidia's own options were far more expensive than the index's: their implied volatility ran at about 95% to 105%, which prices a typical daily move of about 6%.

So the poster was not buying cheap options. Every option in the market was expensive. The bets paid because the moves that came (−13%, +33%, −7% at the open) were much larger than even those prices assumed. NVDA's realised volatility (how much it actually moved, as a yearly rate) was about 28% in September and October and about 140% from 5 to 25 November.

## The account, step by step

```figure
{ "kind": "line", "title": "Account value at each step", "sub": "Log scale: each gridline is ten times the one below. Three of the values are worked out from the screenshots and marked \"about\" in the text.",
  "unit": "$", "log": true, "points": true, "xName": "Step",
  "x": ["11 Nov", "12 Nov", "19 Nov open", "19 Nov", "20 Nov", "23 Nov", "24 Nov 11 am", "24 Nov close", "25 Nov"],
  "series": [ { "name": "Account", "values": [2636, 24337, 30846, 77655, 40000, 415863, 668000, 473514, 1021075] } ],
  "marks": [ ["20 Nov", "about $40,000, from the post's text"], ["24 Nov close", "down $179,000 on the last bet"] ],
  "note": "The two dips are the unshown losses of 20 November and the last position marked at Tuesday's close.",
  "source": "Account screenshots in the post; values for 11 Nov, 20 Nov and 24 Nov 11 am are estimates" }
```

```figure
{ "kind": "hbar", "title": "The three bets that made it: money back per dollar put in", "unit": "x", "dp": 2,
  "rows": [
    ["$160 puts, 11–12 Nov", 44.5, "$499 → $22,199"],
    ["$145 calls, 20–23 Nov", 20.7, "$19,100 → $395,892"],
    ["$135 puts, 24–25 Nov", 2.06, "$358,901 → $739,898"]
  ],
  "note": "Multiplying them is what made the million: each win was put into a larger position. A put gains when the stock falls; a call gains when it rises.",
  "source": "Fills in the post's screenshots" }
```

### Every trade in the screenshots

| # | Contract | Contracts | Bought | Cost a share | Money in | Sold | Price | Profit |
|---|---|---|---|---|---|---|---|---|
| 1 | $160 put, expiring Fri 13 Nov | 20 | Wed 11 Nov | $0.25 | $499 | Thu 12 Nov 9:31 | $11.10 | +$21,701 |
| 2a | $157.50 call, expiring Fri 20 Nov | 150 | not shown | $1.47 | $21,975 | Thu 19 Nov 9:33 | $2.30 | +$12,525 |
| 2b | $150 put, expiring Mon 23 Nov | 200 | Thu 19 Nov (inferred) | $1.19 | $23,850 | Thu 19 Nov 10:42 | $2.63 | +$28,750 |
| 3 | $145 call, expiring Wed 25 Nov | 200 | Fri 20 Nov, 2:25–3:55 pm (inferred) | $0.955 | $19,100 | Mon 23 Nov 9:31 | $19.80 | +$376,900 |
| 4a | $145 put, expiring Fri 27 Nov | 1,000 | Mon 23 Nov (inferred) | $0.86 | $85,850 | Tue 24 Nov 9:37 | $1.84 | +$98,150 |
| 4b | same | 2,000 | Tue, about 10:05 (inferred) | $1.54 | $307,307 | Tue 10:32 | $1.87 | +$66,693 |
| 4c | same | 2,100 | Tue, about 10:34 (inferred) | $1.85 | $388,849 | Tue 10:45 | $2.14 | +$60,551 |
| 4d | same | 1,000 | Tue, about 10:50 (inferred) | $2.20 | $219,500 | Tue 11:01 | $2.40 | +$20,500 |
| 4e | same | 800 | same | $2.13 | $170,650 | Tue 11:02 | $2.34 | +$16,550 |
| 5 | $135 put, expiring Fri 27 Nov | 5,000 | Tue 24 Nov, 11:13–12:14 (inferred) | $0.718 | $358,901 | Wed 25 Nov 9:32 | $1.48 | +$381,099 |

Option prices are quoted per share and one contract covers 100 shares, so 5,000 contracts at $0.718 cost 5,000 × 100 × $0.718 = $358,901 after rounding.

## Bet 1: $499 of puts, the day before the resignation

On Wednesday 11 November the poster bought 20 contracts of the $160 put expiring two days later, at $0.25. NVDA was near $174, so the strike was 8% below the market. The option's delta was about −0.06, which is also a rough reading of the chance the market gave it of finishing in the money (worth something at expiry): about 6%. Its time decay was about $0.25 a day on a $0.25 option. Had nothing happened, it would have been close to worthless by Thursday night.

Around 5 pm that evening the stock fell $15 in after-hours trading, and it opened at $151 the next morning. A put with a $160 strike was now $9 in the money. It was sold at $11.10 in the first minute: 44.5 times the cost. There is no minute-by-minute data for this contract, so it has no chart here. It is the only one of the three bets where the amount at risk was small in absolute terms.

## Bet 2: calls bought into a trend day down

By the post's account the balance had fallen from $77,655 on Thursday to about $40,000 on Friday 20 November, on trades that are not shown. NVDA was down 14% on the day. The poster then put $19,100, about 48% of what was left, into 200 contracts of the $145 call expiring the following Wednesday.

{{tape_call}}

**What the stock's chart said on Friday.** The open was the high of the day. NVDA lost VWAP (the volume-weighted average price, the day's average cost for everyone who traded) at 10:09 and never touched it again: a trend day down in three legs, closing about 1% off the low and 6% under VWAP. There was no higher low, no reclaim and no base.

**Where the calls were bought.** The call traded between $0.91 and $1.00 from 2:24 pm to the close, so the purchase at $0.955 falls in that window, during the third leg down, with price 5% to 7% below VWAP and still falling. In share terms it was about 2,800 shares ($359,000 of stock) with no stop, in a $40,000 account, losing about $6,300 a day to time decay. The strike was 11% to 14% above the market and the option's delta was 0.14.

**Why the call barely moved while the stock kept falling.** NVDA fell another $2 to $5 after the entry and the call stayed near $0.95. Implied volatility rose from about 82% to 97% into the close as the market paid up for protection over the weekend, and that offset the falling price. An out-of-the-money call 13% away has so little delta that a few dollars in the stock hardly register.

**Monday.** The reinstatement was announced before the open and NVDA gapped up 33%. The call was now deep in the money with a delta of 0.95: it had stopped behaving like an option and was tracking the stock almost dollar for dollar, as about 19,000 shares. It was sold at $19.80 one minute after the open. Nine minutes later, in the opening flush, the same call traded at $14.66, a $100,000 swing on 200 contracts. At 10:20 it traded at $25.07.

{{explorer_call}}

```figure
{ "kind": "bar", "title": "What the $19,100 of calls would have been worth at other Monday opens", "sub": "Profit or loss on the position, by where NVDA opened. Friday's close was $125.53.",
  "unit": "$", "sign": true, "xName": "NVDA at Monday's open",
  "x": ["$120", "$125.50 (flat)", "$130", "$135", "$145", "$165 (what happened)"],
  "series": [ { "name": "Profit or loss", "values": [-18500, -16300, -10800, 2900, 72500, 387000] } ],
  "note": "A flat open leaves about $2,800 of the $19,100. The stock needed a 7% jump just to return the stake.",
  "source": "Model values (Black-Scholes, implied volatility held at 100%)" }
```

## Monday and Tuesday: fading a rally, then scalping a trend

After selling the calls the poster turned bearish and bought 1,000 of the $145 puts for $85,850, about a fifth of the account, with NVDA near $165.

{{tape_put145}}

**Monday's entry** came at about 9:54, with NVDA above VWAP and halfway through its rally off the 9:41 low. On a price chart that is a fade of a strong move 30 minutes before the high of the day. NVDA ran another $6.50 against it and the put fell from $0.86 to $0.48, down 44%. Gamma softened the loss here, as it does on any losing option: a short of 10,000 shares would have lost $65,000 on that run, and the puts lost $38,000, because the position shrank as price moved away from the strike.

**Monday afternoon.** NVDA sat on VWAP in a range of a few dollars for five hours. The put drifted between $0.70 and $0.88 and closed below cost. A pinned, sideways tape is the worst one for an option buyer: there is no movement to collect and the holding cost is still charged.

**Tuesday.** The open was the high of the day again. NVDA stayed below VWAP from 9:31 until 3:50 pm, apart from a brief touch around 1:45, stepping down in lower highs from $159.80 to the low at $150.50 at 11:37. For a stock trader this was a clean short off the open with VWAP as the lid.

{{tape_scalps}}

The first sale at 9:37 closed Monday's position for more than double. Then came four more round trips in 85 minutes, each re-entered at a higher put price than the last: in at $1.54, out at $1.87; in at $1.85, out at $2.14; in at $2.13 to $2.20, out at $2.34 to $2.40. On a price chart that is adding to a short as it extends, with size growing, in the last third of the move. Each trip put $170,000 to $390,000, up to about two thirds of the account, into options with three days to live, for gains of 9% to 22%. The morning's total was **+$262,444**.

The tape shows the size of this relative to the market: 1,104 contracts traded in the minute of the first sale, 2,102 in the minute of the second and 2,259 in the third. The poster was most of the volume in those minutes.

## Bet 3: the puts bought at the low, and a 50% overnight loss

Next came the largest position: 5,000 contracts of the $135 put expiring Friday, for $358,901, about 54% of a $668,000 account. One screenshot is an error message from the broker: 5,000 contracts was its cap on NVDA options, and the poster had tried to buy more.

{{tape_put135}}

**Where they were bought, on the stock's chart.** The option's trading shows about 3,000 contracts changing hands between 11:13 and 11:26 at around $0.81, and about 2,000 more between 12:07 and 12:14 at around $0.59, which averages to the $0.718 in the screenshots. The first block was bought with NVDA at $150.90 to $152.00: within 25 minutes and $1.50 of the low of the day, 2.6% below VWAP and 8% below the prior close. That is a short opened at the bottom of an extended move. The second block was added as the stock bounced off that low, still about 1% under VWAP: the downtrend had stalled, and the 11:37 low held on a retest and was not broken again.

**Tuesday afternoon.** NVDA based just under VWAP with no new low, broke above it at 3:50 pm and ramped into the close at $155.47. A short in shares from $151.80 would have been down 2.4%. The puts closed at $0.37, down 50%: the position had lost **$179,000** and the account was back to $473,514. Thursday was a market holiday and Friday a half day, so the options had about one full session left, and one more day with nothing else changing would have taken about $118,000 off a position then worth $185,000.

**Wednesday.** NVDA opened 7.3% lower. All 5,000 puts were sold at $1.48 at 9:32, for $739,898. The stock made its low at 9:45, bounced, came back to test it at 11:45 and held, reclaimed VWAP at 12:05 and closed at the high of the day: a gap-down reversal.

The put against those same points:

| Time | NVDA | What the stock did | The put |
|---|---|---|---|
| 9:32 | $143.56 | two minutes after the open | **$1.48** (sold here) |
| 9:43–9:45 | $141.17–141.49 | low of the day | **$1.89**, its peak |
| 10:00 | $145.18 | first bounce | $0.97 |
| 11:45 | $141.74 | retest, within $0.57 of the low | **$1.43**, a lower high |
| 12:05 | $143.18 | VWAP reclaimed | $1.17 |
| 1:00 pm | $145.38 | trending up | $0.74 |
| 3:59 pm | $149.29 | closes at the high | **$0.19** |

The retest is the row to remember. The stock came back to within 0.4% of its low, a near double bottom. The put reached only three quarters of its earlier peak, because two hours of holding cost and a slightly calmer market had come out of it. An option does not respect the stock's levels: the same price later is a lower option price.

{{explorer_put}}

```figure
{ "kind": "bar", "title": "What the $358,901 of puts would have been worth at other Wednesday opens", "sub": "Profit or loss on the position, by where NVDA opened. Tuesday's close was $155.38.",
  "unit": "$", "sign": true, "xName": "NVDA at Wednesday's open",
  "x": ["$160", "$155.40 (flat)", "$150", "$146", "$143.50 (what happened)", "$140"],
  "series": [ { "name": "Profit or loss", "values": [-327000, -275000, -124000, 105000, 327000, 773000] } ],
  "note": "NVDA needed to open about 5% lower just to return the stake; by the options' own pricing that was roughly a one-in-five chance. The model gives +$327,000 at $143.50; the actual sale made +$381,099.",
  "source": "Model values (Black-Scholes, implied volatility held at 100%)" }
```

Three things about this trade:

1. **The option never came close to being in the money.** NVDA's low for the week was $141.17 and the strike was $135. The whole gain came from the option's time value (the part of its price paid for the chance of a move) being repriced when the stock gapped toward the strike.
2. **The window was minutes wide.** The put peaked at 9:43 am, was back below cost by 1 pm and closed at $0.19. Held to the close, the position was worth $95,000: a loss of $264,000 in place of a gain of $381,000.
3. **The belief was wrong by the close.** The post says the poster "knew in my soul" the stock would go down. It opened down, then rallied 6% off the low. The trade worked because of when it was sold.

## How tightly the options followed the stock

Measured on 5-minute changes, each option against NVDA in the same five minutes:

```figure
{ "kind": "hbar", "title": "The option's percentage move for each 1% move in NVDA", "unit": "%",
  "rows": [
    ["$145 call, Fri 20 Nov", 11, "correlation +0.82"],
    ["$145 put, Mon 23 Nov", 16, "correlation −0.87"],
    ["$145 put, Tue 24 Nov", 20, "correlation −0.89"],
    ["$135 put, Tue 24 Nov", 23, "correlation −0.86"],
    ["$135 put, Wed 25 Nov", 25, "correlation −0.88"]
  ],
  "note": "Correlation is how closely two series move together, from −1 to +1. The bar is the regression slope of the option's 5-minute percentage change on the stock's.",
  "source": "Yahoo Finance 1-minute data, regular trading hours; calculation in this note" }
```

On direction, the option is the stock. If NVDA ticked down, the put ticked up, nearly every time, and a 1% move in NVDA (about $1.50) was a 20% to 25% move in the put. That ratio is the leverage, and it is why a morning's trend in the stock was a double in the option.

The correlation is high but not 1. The missing part is where options differ from shares, and it shows up in three ways.

{{scatter}}

**The curve (gamma).** The dots bend upward. On Tuesday a $5.30 drop, from $156.20 to $150.90, added about $0.53 to the put. On Wednesday morning a smaller $3.70 drop, from $145.20 to $141.50, added about $0.92. Each dollar lower was worth more than the last, because the put's effective share count kept growing: about 29,000 shares short at Tuesday's close and about 106,000 at Wednesday's open.

**The clock (theta).** Later dots sit below earlier ones at the same stock price:

| NVDA price | Earlier | Later | Change in the put |
|---|---|---|---|
| about $143.50 | 9:32 am: $1.48 | 10:30 am: $1.23 | −17% in an hour |
| about $145.30 | 10:00 am: $0.97 | 1:00 pm: $0.74 | −24% in three hours |
| about $152.50 (Tuesday) | 10:30 am: $0.58 | 3:10 pm: $0.51 | −12% in under five hours |

**The expectation (implied volatility).** On Tuesday from 9:32 to 11:02 NVDA fell $4.40. With a delta near 0.25, the $145 put might have been expected to gain about $1.08. It gained $0.76. The rest was given back because the option market's fear eased after the open: implied volatility fell from 95% to 89%. Options are at their most expensive in the first minutes of the day.

```figure
{ "kind": "bar", "title": "The overnight win, taken apart", "sub": "The $135 put from Tuesday's close ($0.37, NVDA $155.47) to the sale at 9:32 Wednesday ($1.48, NVDA $143.56), in dollars per share of option. Delta is the position as it stood at the close times the $11.91 drop; gamma is the extra from the position growing on the way down.",
  "unit": "$", "sign": true, "dp": 2, "xName": "Piece",
  "x": ["Delta: size at the close", "Gamma: size growing", "Theta: 17 hours of cost", "Implied volatility", "Model total", "Actual"],
  "series": [ { "name": "Dollars per share", "values": [0.69, 0.57, -0.20, 0, 1.06, 1.11] } ],
  "note": "Nearly half the gain came from gamma: short 29,000 share-equivalents at the close, the position added to itself all the way down the gap until it was short 106,000.",
  "source": "Black-Scholes estimate from the option and stock price in the same minute; a second-order split, which is why it sums to $1.06 against $1.11" }
```

## The same trades as share positions

| Trade | In options | The same money in shares | Shares needed to match the option's profit |
|---|---|---|---|
| Puts, 11–12 Nov | $499 → **+$21,701** | short 3 shares, $174 → $154: about +$57 | about 1,090 shares short ($190,000 of stock) |
| Calls, 20–23 Nov | $19,100 → **+$376,900** | 149 shares, $128 → $164.50: about +$5,450 | about 10,300 shares ($1.32 million) |
| Puts, 24–25 Nov | $358,901 → **+$381,099** | short 2,364 shares, $151.80 → $143.56: about +$19,500 | about 46,250 shares short ($7.0 million) |

```figure
{ "kind": "hbar", "title": "Stock that would have had to be held to make the same profit", "sub": "Millions of dollars of NVDA shares.", "unit": "$m", "dp": 2,
  "rows": [
    ["Bet 1, account about $2,600", 0.19, "1,090 shares short"],
    ["Bet 2, account about $40,000", 1.32, "10,300 shares"],
    ["Bet 3, account about $668,000", 7.0, "46,250 shares short"]
  ],
  "highlight": ["Bet 3, account about $668,000"],
  "note": "For the last one, the largest short a $668,000 account could carry overnight on ordinary 2:1 margin is about 8,800 shares. That makes about +$72,500 on the gap, after sitting at −$32,000 at Tuesday's close. The options made roughly five times that.",
  "source": "Stock price at the inferred entry and the known exit; the 2:1 figure is the standard overnight margin limit, used only as a yardstick" }
```

The other side of the same comparison, on an open that goes nowhere:

```figure
{ "kind": "compare", "title": "What a flat open would have done",
  "cols": [
    { "title": "Short-dated options", "tag": "what was held", "items": ["Calls, flat Monday open: **−$16,300** of $19,100", "Puts, flat Wednesday open: **−$275,000** of $358,901", "Loses most of the stake when nothing happens", "Cannot lose more than the stake when the gap goes the wrong way", "Pays many times over when the gap goes the right way"] },
    { "title": "Shares", "tag": "the same view, held as stock", "items": ["Flat Monday open: **$0**", "Flat Wednesday open: **$0**", "Loses nothing when nothing happens", "Loss on a gap the wrong way is open-ended; a stop does not fill inside a gap", "Gains in line with the move"] }
  ] }
```

## Where the money came from: gaps, not intraday reads

```figure
{ "kind": "stack", "title": "Profit shown in the screenshots, by how it was made", "unit": "%",
  "parts": [ ["Four positions held overnight through a gap", 81], ["Everything else, mostly opened and closed in the same session", 19] ],
  "note": "$877,850 came from positions held through opens of −13%, +33%, about −3% and −7.3%; $205,569 from the rest. The buy time of one trade in the second group, the $157.50 calls, is not shown.",
  "source": "Fills in the post's screenshots" }
```

This is the part most at odds with day trading in shares, where the trader is flat before the gaps. Four fifths of this account's gain was made while the market was closed, on news, by holding a position whose loss was capped at its cost. The intraday reads were mixed: Monday's put entry faded a rally and went down 44% first, and the last puts were bought at the low and added to as the stock bounced off it.

## How much risk was carried

| Moment | Account | In the position | If the next open had been flat |
|---|---|---|---|
| Wed 11 Nov | about $2,600 | $499 (19%) | about −$250: half the stake gone to decay |
| Thu 19 Nov, open | $30,846 | $21,975 in calls expiring the next day (71%) | not modelled |
| Fri 20 Nov, close | about $40,000 | $19,100 (48%) | −$16,300, leaving about $23,700 |
| Mon 23 Nov | $415,863 | $85,850 (21%) | not modelled |
| Tue 24 Nov, morning | $500,000–670,000 | $170,000–390,000 per round trip | intraday |
| Tue 24 Nov, close | $473,514 | 5,000 puts, cost $358,901, marked at $185,000 | −$275,000 from cost, leaving about $393,000 |

A rough sense of the odds, using only what the option prices themselves implied: the first put had a delta of 6%, the call needed a move the market priced at about a 12% chance, and the last put one at about 21%. Treating those as independent, the chance of all three landing is in the region of one in a few hundred. That is an illustration from model prices, not a measured probability, and real odds on event days are not bell-shaped. The direction of the conclusion is not in doubt: this path was a long shot three times over.

> [!take] What carries over for someone who reads price
> - **The stock's chart is the one to read.** The option has no levels of its own. Its highs and lows are the stock's lows and highs, minus time.
> - **Direction transfers almost perfectly; size and time do not.** Correlation was 0.82 to 0.89 on 5-minute changes, at 11 to 25 times the stock's percentage move.
> - **A retest in the stock is a lower high in the option.** Time decay shows up as failed retests.
> - **Trend days and gaps pay the option buyer; pinned days bleed.** Tuesday morning against Monday afternoon, in the same contract.
> - **Size is not fixed.** 29,000 share-equivalents became 106,000 over one gap. A winner pyramids itself; a loser scales itself out.
> - **The first minutes of the day carry the highest option prices.** Part of a correct opening read is given back as implied volatility settles.
> - **The stock's own signals marked where the puts stopped working.** On Tuesday it was the low at 11:37, which held on a retest and was not broken again; on Wednesday, the higher low at 11:45 and the VWAP reclaim at 12:05. After each, the put only fell.

> [!warn] Why this is not a method
> - **Two of the three bets were opened the session before unscheduled news** (the resignation and the reinstatement). Nothing in the post could have predicted either, and nothing in it can be repeated.
> - **Position size was the whole risk.** There were no stops and there could not be: these options gap. The only control on a bought option is how much goes in, and here it was about half the account, repeatedly.
> - **The outcome hung on a sale two minutes after the open.** The same position held six and a half hours longer lost $264,000.
> - **The account's own history is the base rate.** By the poster's telling: a $9,000 loss, a $3,000 loan to pay bills, then this. About $65,000 of losses inside the winning fortnight are not in the screenshots.
> - **The post exists because all three landed.** The accounts where the same bets expired worthless do not get posted. Studies of retail option buyers find losses on average; the figures are in the [primer](/blog/options-primer#how-the-screenshot-gains-are-made).

## Sources and method

- **The post and its screenshots:** r/wallstreetbets, posted about 25 November 2026 ([link](https://www.reddit.com/r/wallstreetbets/s/RuTqga4mRm)). The text and all 19 images were read; the gallery counter suggests a twentieth image that was not available.
- **News:** [CNBC, 23 Nov 2026](https://www.cnbc.com/2026/11/23/nvidia-jensen-huang-ceo.html); Yahoo Finance on [23 Nov](https://finance.yahoo.com/technology/article/nvidia-reinstates-jensen-huang-as-ceo-stock-rockets-141145439.html), [24 Nov](https://finance.yahoo.com/markets/stocks/article/nvidia-stock-falls-after-epic-rally-on-jensen-huangs-return-as-ceo-094535877.html), [25 Nov](https://finance.yahoo.com/markets/stocks/article/nvidia-stock-stumbles-again-after-jensen-huangs-spectacular-comeback-rally-094741665.html) and [27 Nov](https://finance.yahoo.com/markets/stocks/article/nvidia-stock-is-still-paying-the-price-for-the-jensen-huang-ceo-drama-124902053.html). The reports disagree on the resignation date (12 or 13 November). The S&P 500 figure for 20 November comes from a summary of a live blog, not its full text.
- **Prices:** Yahoo Finance chart data, pulled 27 November 2026: NVDA daily and 1-minute, the VIX and VIX1D, and 1-minute history for the option contracts themselves (the $145 call expiring 25 November; the $135 and $145 puts expiring 27 November) from 20 November on. No minute data was available for the contracts in trades 1, 2a and 2b.
- **Worked out, not observed:** cost per share (sale proceeds minus the realised profit shown); buy times (cost matched to the option's trading by minute); implied volatility, delta, time decay and share-equivalents (Black-Scholes from the option price and the stock price in the same minute, 4% interest rate); the what-if charts (same model, implied volatility held at 100%); correlation and the move per 1% (5-minute percentage changes over each session); VWAP (typical price × volume from 1-minute bars, cumulative from 9:30, after repairing some impossible volume figures in the 1-minute source data against the 5-minute bars).
- **Not known:** the trades behind Friday's fall from $77,655 to about $40,000; whether the screenshots are complete or unedited.
