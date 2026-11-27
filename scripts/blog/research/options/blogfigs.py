"""Figure blocks for the two options posts on the blog, built from the saved Yahoo data. Writes figs.json next to this file."""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib as L
import cleanvol as CV  # Yahoo's 1-minute stock volumes have impossible bars; repaired against the 5-minute bars
from numbers_bs import bs, greeks

SRC = "Yahoo Finance chart data, pulled 27 Nov 2026"
nv = L.load("NVDA_1m_8d")
c145 = L.load("NVDA261125C00145000_1m_5d")
p135 = L.load("NVDA261127P00135000_1m_5d")
p145 = L.load("NVDA261127P00145000_1m_5d")
DAYNAME = {"2026-11-19": "Thu 19 Nov", "2026-11-20": "Fri 20 Nov", "2026-11-23": "Mon 23 Nov", "2026-11-24": "Tue 24 Nov", "2026-11-25": "Wed 25 Nov"}
F = {}

def hm12(t):
    h, m = int(L.et(t, "%H")), L.et(t, "%M")
    return f"{h if h <= 12 else h - 12}:{m}"

def session(d, step=5, t0="09:30", t1="16:00"):
    """Bars of `step` minutes for one date: candle, VWAP at the bar's last minute."""
    out = {}
    pv = vol = 0.0
    for r in CV.day(d):
        tp = (r["h"] + r["l"] + r["c"]) / 3
        pv += tp * r["v"]; vol += r["v"]
        hm = L.et(r["t"], "%H:%M")
        if not (t0 <= hm < t1):
            continue
        k = r["t"] - (r["t"] % (step * 60))
        b = out.get(k)
        if b is None:
            b = out[k] = dict(t=k, o=r["o"], h=r["h"], l=r["l"], c=r["c"])
        b["h"] = max(b["h"], r["h"]); b["l"] = min(b["l"], r["l"]); b["c"] = r["c"]
        b["vwap"] = pv / vol if vol else r["c"]
    return [out[k] for k in sorted(out)]

def opt_at(opt, bars, step=5):
    """Last option print inside each bar; carried forward within the session."""
    vals, last = [], None
    by = {}
    for r in opt:
        by.setdefault(r["t"] - (r["t"] % (step * 60)), []).append(r)
    day0 = None
    for b in bars:
        d = L.et(b["t"], "%Y-%m-%d")
        if d != day0:
            day0, last = d, None
        rows = by.get(b["t"])
        if rows:
            last = rows[-1]["c"]
        vals.append(None if last is None else round(last, 2))
    return vals

def tape(dates, opt, optname, optshort, title, sub, marks, levels_top=None, levels_opt=None, note=None, step=5, t0="09:30", t1="16:00",
         tick_at=("10:00", "12:00", "14:00"), heights=(280, 180), opt_max=None, opt_min=None, top_min=None, top_max=None, desc=None):
    bars, sessions = [], []
    for d in dates:
        sessions.append([len(bars), DAYNAME[d]])
        bars += session(d, step, t0, t1)
    idx = {(L.et(b["t"], "%Y-%m-%d"), L.et(b["t"], "%H:%M")): i for i, b in enumerate(bars)}
    def find(d, hm):
        t = L.ts(d + " " + hm)
        k = t - (t % (step * 60))
        return idx[(L.et(k, "%Y-%m-%d"), L.et(k, "%H:%M"))]
    x = [f"{DAYNAME[L.et(b['t'], '%Y-%m-%d')][:3]} {hm12(b['t'])}" for b in bars]
    ticks = [[i, hm12(b["t"])] for i, b in enumerate(bars) if L.et(b["t"], "%H:%M") in tick_at]
    top = {"name": "NVDA", "short": "NVDA", "desc": desc or f"{step}-minute bars", "unit": "$", "height": heights[0],
           "candles": [[round(b["o"], 2), round(b["h"], 2), round(b["l"], 2), round(b["c"], 2)] for b in bars],
           "lines": [{"name": "VWAP", "values": [round(b["vwap"], 2) for b in bars], "c": 4}]}
    if levels_top: top["levels"] = levels_top
    if top_min is not None: top["min"] = top_min
    if top_max is not None: top["max"] = top_max
    bot = {"name": optname, "short": optshort, "desc": "price per share", "unit": "$", "height": heights[1], "min": 0,
           "lines": [{"name": optshort, "values": opt_at(opt, bars, step), "c": 1, "area": True}]}
    if levels_opt: bot["levels"] = levels_opt
    if opt_max is not None: bot["max"] = opt_max
    if opt_min is not None: bot["min"] = opt_min
    spec = {"kind": "tape", "title": title, "sub": sub, "x": x, "ticks": ticks, "panels": [top, bot],
            "marks": [[find(m[0], m[1]), m[2], m[3], m[4] if len(m) > 4 else f"{DAYNAME[m[0]][:3]} {hm12(L.ts(m[0] + ' ' + m[1]))}"] for m in marks], "source": SRC}
    if len(dates) > 1: spec["sessions"] = sessions
    if note: spec["note"] = note
    return spec

# ------------------------------------------------------------------ the three two-day tapes
F["tape_call"] = tape(
    ["2026-11-20", "2026-11-23"], c145, "$145 call, expiring Wed 25 Nov", "$145 call",
    "Friday's trend day down, the weekend gap, and the $145 call",
    "NVDA with its VWAP on top, the call underneath, on the same clock. The call's Friday prices (about $1) sit almost on the zero line at this scale.",
    [("2026-11-20", "10:09", "note", "NVDA loses VWAP and does not touch it again all day"),
     ("2026-11-20", "14:25", "buy", "200 calls bought in this window at about $0.96 (time inferred), 5% to 7% under VWAP", "Fri 2:25–3:55 pm"),
     ("2026-11-23", "09:31", "sell", "All 200 sold at **$19.80**, one minute after a +33% open"),
     ("2026-11-23", "09:41", "note", "Opening flush to $156.93; the call falls to $14.66 at 9:40"),
     ("2026-11-23", "10:25", "note", "High of day $171.50; the call peaks near $25")],
    levels_top=[[145, "strike $145"]],
    note="Buy times are not in the screenshots; they are inferred from the cost per share and the option's 1-minute prices. VWAP is computed from 1-minute bars, after repairing some impossible volume figures in the source data against the 5-minute bars.")

F["tape_put145"] = tape(
    ["2026-11-23", "2026-11-24"], p145, "$145 put, expiring Fri 27 Nov", "$145 put",
    "Monday's fade and Tuesday's trend down, with the $145 put",
    "A pinned Monday afternoon bleeds the put; Tuesday's slide under VWAP pays it.",
    [("2026-11-23", "09:54", "buy", "1,000 puts bought at $0.86 (time inferred), fading the rally 30 minutes before the high", "Mon about 9:54"),
     ("2026-11-23", "10:25", "note", "High of day; the put is down 44% at $0.48"),
     ("2026-11-23", "15:55", "note", "Five hours pinned on VWAP; the put closes at $0.75, below cost", "Mon close"),
     ("2026-11-24", "09:37", "sell", "The 1,000 sold at **$1.84**"),
     ("2026-11-24", "10:05", "note", "Four more round trips in this window (next figure)", "Tue 10:05–11:02"),
     ("2026-11-24", "11:37", "note", "Low of day $150.50; the put peaks at $2.74, 35 minutes after the last sale"),
     ("2026-11-24", "15:50", "note", "First close above VWAP since 9:31; the put ends the day at $1.16", "Tue 3:50 pm")],
    levels_opt=[[0.86, "cost $0.86"]],
    note="Buy times are inferred; sale times are from the screenshots.")

F["tape_scalps"] = tape(
    ["2026-11-24"], p145, "$145 put, expiring Fri 27 Nov", "$145 put",
    "Tuesday morning, minute by minute: five sales in 85 minutes",
    "Each re-entry was at a higher put price than the last, with $170,000 to $390,000 in the position.",
    [("2026-11-24", "09:37", "sell", "1,000 sold at $1.84 (bought Monday at $0.86): **+$98,150**"),
     ("2026-11-24", "10:06", "buy", "2,000 bought near $1.54 (inferred)", "Tue about 10:06"),
     ("2026-11-24", "10:32", "sell", "2,000 sold at $1.87: **+$66,693**"),
     ("2026-11-24", "10:34", "buy", "2,100 bought near $1.85 (inferred)", "Tue about 10:34"),
     ("2026-11-24", "10:45", "sell", "2,100 sold at $2.14: **+$60,551**"),
     ("2026-11-24", "10:50", "buy", "1,800 bought near $2.13–2.20 (inferred)", "Tue about 10:50"),
     ("2026-11-24", "11:01", "sell", "1,000 sold at $2.40 and 800 at $2.34 a minute later: **+$37,050**"),
     ("2026-11-24", "11:37", "note", "Low of day; put peaks at $2.74")],
    step=1, t0="09:30", t1="12:00", tick_at=("09:30", "10:00", "10:30", "11:00", "11:30"), heights=(260, 180), desc="1-minute bars, 9:30 to 12:00",
    note="Buy times are inferred from the cost per share and the tape; sale times and prices are from the screenshots.")
F["tape_scalps"]["badgeGap"] = 2.6

F["tape_put135"] = tape(
    ["2026-11-24", "2026-11-25"], p135, "$135 put, expiring Fri 27 Nov", "$135 put",
    "The last bet: 5,000 puts bought at Tuesday's low, sold two minutes into Wednesday",
    "NVDA never came within $6 of the $135 strike. The whole gain was the put being repriced as the stock gapped toward it.",
    [("2026-11-24", "11:15", "buy", "About 3,000 bought near $0.81 (inferred), within $1.50 of the low of day", "Tue 11:13–11:26"),
     ("2026-11-24", "12:08", "buy", "About 2,000 more near $0.59 (inferred), as NVDA bounces off the low, still about 1% under VWAP", "Tue 12:07–12:14"),
     ("2026-11-24", "15:55", "note", "Put at $0.37, the position down **$179,000**", "Tue close"),
     ("2026-11-25", "09:32", "sell", "All 5,000 sold at **$1.48** after a −7.3% open: +$381,099"),
     ("2026-11-25", "09:45", "note", "Low of day $141.17; the put peaks at $1.89"),
     ("2026-11-25", "11:45", "note", "Retest to $141.74, within 0.4% of the low; the put reaches only $1.43"),
     ("2026-11-25", "12:05", "note", "VWAP reclaimed; the put falls for the rest of the day"),
     ("2026-11-25", "15:55", "note", "NVDA closes at the high of day; put at **$0.19**", "Wed close")],
    levels_opt=[[0.718, "average cost $0.72"]],
    note="Buy times are inferred from the cost per share and the option's volume by minute; the sale is from the screenshots.")

# ------------------------------------------------------------------ daily: NVDA candles with VIX and VIX1D underneath
dly = [r for r in L.load("NVDA_1d_1y") if "2026-10-01" <= L.et(r["t"], "%Y-%m-%d") <= "2026-11-25"]
vix = {L.et(r["t"] + 21600, "%Y-%m-%d"): r["c"] for r in L.load("VIX_1d_1y")}
v1d = {L.et(r["t"] + 21600, "%Y-%m-%d"): r["c"] for r in L.load("VIX1D_1d_3mo")}
def dlabel(t):
    return f"{int(L.et(t, '%d'))} {L.et(t, '%b')}"
dd = [L.et(r["t"], "%Y-%m-%d") for r in dly]
dmark = lambda d: dd.index(d)
F["daily"] = {
    "kind": "tape", "title": "NVDA day by day, with the market's fear gauge underneath",
    "sub": "Daily bars, 1 October to 25 November 2026. The lower panel is the implied volatility of the S&P 500: the VIX (30 days) and VIX1D (one day).",
    "x": [dlabel(r["t"]) for r in dly],
    "ticks": [[i, dlabel(r["t"])] for i, r in enumerate(dly) if time.gmtime(r["t"] + L.OFF).tm_wday == 0],
    "panels": [
        {"name": "NVDA", "short": "NVDA", "desc": "daily bars", "unit": "$", "height": 300,
         "candles": [[round(r["o"], 2), round(r["h"], 2), round(r["l"], 2), round(r["c"], 2)] for r in dly]},
        {"name": "VIX and VIX1D", "short": "Volatility", "desc": "annualised percent, daily close", "unit": "%", "dp": 1, "height": 170, "min": 10,
         "lines": [{"name": "VIX", "values": [round(vix[d], 1) if d in vix else None for d in dd], "c": 1},
                   {"name": "VIX1D", "values": [round(v1d[d], 1) if d in v1d else None for d in dd], "c": 2}]},
    ],
    "marks": [
        [dmark("2026-11-05"), "note", "Market-wide sell-off: NVDA −9.3%, VIX jumps from 16.6 to 28.2"],
        [dmark("2026-11-09"), "note", "First session after the chief executive's weekend disclosure: opens −7.3%"],
        [dmark("2026-11-11"), "buy", "Bet 1: **$499** of $160 puts expiring in two days"],
        [dmark("2026-11-12"), "sell", "Resignation reported; NVDA opens −13.1%. Puts sold for $22,199"],
        [dmark("2026-11-20"), "buy", "Bet 2: **$19,100** of $145 calls, bought into a −14% day (VIX 35.9, VIX1D 51.3)"],
        [dmark("2026-11-23"), "sell", "Reinstatement announced; NVDA opens +33%. Calls sold for $395,892"],
        [dmark("2026-11-24"), "buy", "Bet 3: **$358,901** of $135 puts"],
        [dmark("2026-11-25"), "sell", "NVDA opens −7.3%. Puts sold for $739,898"],
    ],
    "badgeGap": 3.0,
    "note": "Hover or tap for each day's values.", "source": SRC,
}
print("daily bars", len(dly), dd[0], dd[-1])
for d in ("2026-11-04", "2026-11-05", "2026-11-13", "2026-11-19", "2026-11-20", "2026-11-23", "2026-11-24", "2026-11-25"):
    print("  ", d, "VIX", vix.get(d), "VIX1D", v1d.get(d))

# ------------------------------------------------------------------ scatter: put against stock, by minute
pts = []
for d, split in (("2026-11-24", None), ("2026-11-25", "10:30")):
    rows = [r for r in L.day(p135, d) if int(L.et(r["t"], "%M")) % 2 == 0]
    for r in rows:
        hm = L.et(r["t"], "%H:%M")
        u = L.at(nv, r["t"])["c"]
        g = 0 if d == "2026-11-24" else (1 if hm < split else 2)
        pts.append([round(u, 2), round(r["c"], 2), g, f"{DAYNAME[d][:3]} {hm12(r['t'])}"])
F["scatter"] = {
    "kind": "scatter", "title": "The $135 put against NVDA's price, every two minutes",
    "sub": "Price falls to the right. A straight line would mean the put behaved like a fixed number of shares. It bends, and later dots sit lower.",
    "xName": "NVDA price (falling to the right)", "xShort": "NVDA", "yName": "Put price per share", "yShort": "put", "xUnit": "$", "yUnit": "$", "reverseX": True,
    "groups": ["Tuesday 24 Nov", "Wednesday to 10:30", "Wednesday after 10:30"], "points": pts, "height": 360,
    "notes": [[143.56, 1.48, "sold 9:32", "l"], [141.4, 1.89, "peak 9:43", "l"]],
    "note": "Same stock price, later in the day, cheaper put: that vertical gap is time decay.", "source": SRC,
}
print("scatter points", len(pts))

# ------------------------------------------------------------------ explorer presets: implied volatility at real moments (days/365, r 4%)
def iv_at(price, S, K, t, expiry, kind):
    days = (L.ts(expiry + " 16:00") - t) / 86400
    lo, hi = 0.01, 10.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if bs(S, K, days / 365, mid, 0.04, kind) > price: hi = mid
        else: lo = mid
    return days, (lo + hi) / 2
def preset(label, d, hm, opt, K, expiry, kind, price=None, S=None):
    t = L.ts(d + " " + hm)
    S = S or L.at(nv, t)["c"]
    price = price or L.at(opt, t)["c"]
    days, iv = iv_at(price, S, K, t, expiry, kind)
    print(f"   preset {label}: S {S:.2f} opt {price:.3f} days {days:.2f} iv {iv*100:.1f}")
    return [label, round(S, 2), round(days, 2), round(iv * 100)]
print("put135 presets")
pp = [preset("First block, Tue 11:20", "2026-11-24", "11:20", p135, 135, "2026-11-27", "p", price=0.81),
      preset("Second block, Tue 12:10", "2026-11-24", "12:10", p135, 135, "2026-11-27", "p"),
      preset("Tue close", "2026-11-24", "15:59", p135, 135, "2026-11-27", "p", price=0.37, S=155.47),
      preset("Sold, Wed 9:32", "2026-11-25", "09:32", p135, 135, "2026-11-27", "p", price=1.48, S=143.56),
      preset("Wed 11:45 retest", "2026-11-25", "11:45", p135, 135, "2026-11-27", "p"),
      preset("Wed close", "2026-11-25", "15:59", p135, 135, "2026-11-27", "p", price=0.19)]
F["explorer_put"] = {
    "kind": "explorer", "title": "Drive the last bet: 5,000 of the $135 puts",
    "sub": "Move the stock price, the days left and the implied volatility. The buttons jump to real moments of the trade; the profit is measured against the average cost of $0.72.",
    "type": "put", "strike": 135, "contracts": 5000, "cost": 0.718, "underlying": "NVDA",
    "price": {"min": 132, "max": 162, "value": pp[0][1], "step": 0.05}, "days": {"max": 3.5, "value": pp[0][2], "step": 0.01},
    "iv": {"min": 40, "max": 160, "value": pp[0][3]}, "presets": pp, "ymax": 3.2,
    "note": "A Black-Scholes model with a 4% interest rate, time counted in calendar days. The preset values of implied volatility are solved from the real option price at that minute, so the presets reproduce the traded prices; everything in between is the model.",
}
print("call145 presets")
pc = [preset("Bought, Fri 3 pm", "2026-11-20", "15:00", c145, 145, "2026-11-25", "c"),
      preset("Fri close", "2026-11-20", "15:59", c145, 145, "2026-11-25", "c"),
      preset("Sold, Mon 9:31", "2026-11-23", "09:31", c145, 145, "2026-11-25", "c", price=19.80, S=164.50)]
F["explorer_call"] = {
    "kind": "explorer", "title": "Drive the second bet: 200 of the $145 calls",
    "sub": "Start at Friday afternoon and drag the price to where Monday opened.",
    "type": "call", "strike": 145, "contracts": 200, "cost": 0.955, "underlying": "NVDA",
    "price": {"min": 118, "max": 172, "value": pc[0][1], "step": 0.05}, "days": {"max": 5.2, "value": pc[0][2], "step": 0.01},
    "iv": {"min": 40, "max": 160, "value": pc[0][3]}, "presets": pc, "ymax": 28,
    "note": "A Black-Scholes model with a 4% interest rate, time counted in calendar days. Flat on the left, steep on the right: the left is where the option sat on Friday, the right is where the stock opened on Monday. NVDA moved several dollars inside the minute of the sale; the preset uses $164.50.",
}

# ------------------------------------------------------------------ primer: model figures (stock $100, 4% rate)
r_ = 0.04
def call(S, K, days, iv): return bs(S, K, days / 365, iv, r_, "c")
def put(S, K, days, iv): return bs(S, K, days / 365, iv, r_, "p")
prem = call(100, 105, 30, 0.40); pprem = put(100, 95, 30, 0.40)
print("primer: $105 call", round(prem, 2), "$95 put", round(pprem, 2))
xs = list(range(85, 126, 1))
F["payoff_call"] = {
    "kind": "line", "title": "Profit or loss at expiry: one $105 call against 100 shares",
    "sub": f"Stock at $100 today. The call costs ${prem:.2f} a share, ${prem*100:,.0f} for the contract. The shares cost $10,000.",
    "unit": "$", "x": [f"${x}" for x in xs], "xName": "Stock price at expiry",
    "series": [{"name": "One $105 call", "values": [round((max(x - 105, 0) - prem) * 100) for x in xs]},
               {"name": "100 shares", "values": [(x - 100) * 100 for x in xs], "dash": True}],
    "marks": [["$105", "strike"], ["$108", "breakeven $107.71"]], "endValues": False,
    "note": "Below the strike the call's loss is flat at the premium. Above the breakeven it gains dollar for dollar with 100 shares.", "source": "Model values (Black-Scholes, 40% implied volatility, 30 days, 4% interest rate)",
}
xs2 = list(range(75, 116, 1))
F["payoff_put"] = {
    "kind": "line", "title": "The same picture flipped: one $95 put against 100 shares sold short",
    "sub": f"The put costs ${pprem:.2f} a share, ${pprem*100:,.0f} for the contract.",
    "unit": "$", "x": [f"${x}" for x in xs2], "xName": "Stock price at expiry",
    "series": [{"name": "One $95 put", "values": [round((max(95 - x, 0) - pprem) * 100) for x in xs2]},
               {"name": "100 shares short", "values": [(100 - x) * 100 for x in xs2], "dash": True}],
    "marks": [["$95", "strike"], ["$93", f"breakeven ${95 - pprem:.2f}"]], "endValues": False,
    "source": "Model values (Black-Scholes, 40% implied volatility, 30 days, 4% interest rate)",
}
days = list(range(60, -1, -1))
F["decay"] = {
    "kind": "line", "title": "Time decay: an at-the-money call with the stock frozen at $100",
    "sub": "Price per share as the days run out. Nothing else changes.",
    "unit": "$", "x": [str(d) for d in days], "xName": "Days left",
    "series": [{"name": "$100 call", "values": [round(call(100, 100, d, 0.40), 2) for d in days]}],
    "marks": [["30", "30 days left"], ["10", "10 days left"]],
    "note": f"The last 10 days remove ${call(100,100,10,0.40):.2f}; the 30 days before them remove ${call(100,100,40,0.40)-call(100,100,10,0.40):.2f}. Read left to right: 60 days left down to none.",
    "source": "Model values (Black-Scholes, 40% implied volatility, 4% interest rate)",
}
print("decay: 60d", round(call(100,100,60,.4),2), "40d", round(call(100,100,40,.4),2), "30d", round(call(100,100,30,.4),2), "10d", round(call(100,100,10,.4),2))
F["explorer_primer"] = {
    "kind": "explorer", "title": "One option, three dials: a $105 call on a $100 stock",
    "sub": "Everything in this primer can be seen by moving these three sliders.",
    "type": "call", "strike": 105, "contracts": 1, "cost": round(prem, 4), "underlying": "Stock",
    "price": {"min": 85, "max": 125, "value": 100, "step": 0.1}, "days": {"max": 30, "value": 30, "step": 0.25},
    "iv": {"min": 10, "max": 100, "value": 40},
    "presets": [["Start: $100, 30 days", 100, 30, 40], ["+5% the next day", 105, 29, 40], ["Flat for 20 days", 100, 10, 40], ["+7% at expiry", 107, 0, 40], ["Fear doubles", 100, 30, 80]],
    "ymax": 16,
    "note": "A Black-Scholes model with a 4% interest rate and no dividends. Real quotes differ a little.",
}
# leverage scenarios (percent return): call vs shares
sc = [("+5% next day", 105, 29), ("+10% in 10 days", 110, 20), ("Flat for 10 days", 100, 20), ("Flat for 20 days", 100, 10), ("−5% in 10 days", 95, 20), ("+7% at expiry", 107, 0)]
F["leverage"] = {
    "kind": "bar", "title": "The same stock moves, as a return on the call and on the shares", "sub": "Percent gain or loss. $105 call bought at $2.71 with the stock at $100.",
    "unit": "%", "x": [s[0] for s in sc], "xName": "What the stock does",
    "series": [{"name": "$105 call", "values": [round((call(s[1], 105, s[2], 0.40) / prem - 1) * 100) for s in sc]},
               {"name": "100 shares", "values": [s[1] - 100 for s in sc]}],
    "labels": "all", "height": 300,
    "note": "The last pair is the trap: the stock rose 7% by expiry and the call still lost 26%. Had it risen 4%, the call would have lost everything.",
    "source": "Model values (Black-Scholes, 40% implied volatility, 4% interest rate)",
}
print("leverage", F["leverage"]["series"][0]["values"])
F["iv_price"] = {
    "kind": "hbar", "title": "Same stock, same strike, same 30 days: only the expected movement differs", "unit": "$", "dp": 2,
    "rows": [[f"Implied volatility {v}%", round(call(100, 105, 30, v / 100), 2), f"about {v/15.87:.1f}% a day"] for v in (20, 40, 80)],
    "source": "Model values (Black-Scholes, $105 call, stock $100, 4% interest rate)",
}
# IV crush example
c0 = call(100, 100, 3, 1.50)
F["crush"] = {
    "kind": "bar", "title": "Volatility crush: a call bought before earnings, the morning after", "sub": f"Bought at ${c0:.2f} with implied volatility at 150%. The next morning implied volatility is 45%.",
    "unit": "%", "sign": True, "x": ["−5%", "+3%", "+5%", "+8%", "+12%"], "xName": "Stock move on the report",
    "series": [{"name": "Return on the call", "values": [round((call(s, 100, 2, 0.45) / c0 - 1) * 100) for s in (95, 103, 105, 108, 112)]}],
    "note": "The stock rose 3% and 5% and the call buyer still lost. The move has to beat what was already priced in, here about 11%.",
    "source": "Model values (Black-Scholes, $100 call, 3 days to expiry at purchase, 4% interest rate)",
}
print("crush", round(c0, 2), F["crush"]["series"][0]["values"])
# 0DTE: SPY 600, $606 call, 10:00 -> 2:00 pm, trading-hours clock (6.5h day, 252 days), iv 16%
def c0dte(S, hours): return bs(S, 606, hours / 6.5 / 252, 0.16, r_, "c")
z0 = c0dte(600, 6.0)
F["zero"] = {
    "kind": "bar", "title": "A same-day call: what $0.48 becomes by 2:00 pm", "sub": "SPY at $600 at 10:00 am; the $606 call expiring that day. Value at 2:00 pm as a multiple of the price paid.",
    "unit": "x", "x": ["flat", "+0.5%", "+1.0%", "+1.5%", "+2.0%"], "xName": "SPY move by 2:00 pm",
    "series": [{"name": "Multiple of cost", "values": [round(c0dte(s, 2.0) / z0, 1) for s in (600, 603, 606, 609, 612)]}],
    "note": "A 2% up day is rare: at a VIX of 16 the market prices a typical day of about 1%. Held to the close with SPY at $606 or lower, the call expires worthless.",
    "source": "Model values (Black-Scholes, implied volatility held at 16%, trading hours as the clock)",
}
print("0dte", round(z0, 2), F["zero"]["series"][0]["values"])

json.dump(F, open(os.path.join(HERE, "figs.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("wrote", len(F), "figures;", {k: len(json.dumps(v)) for k, v in F.items()})
