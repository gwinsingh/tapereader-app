import json, time, os, calendar
from math import log, sqrt, exp
from numbers_bs import bs, greeks
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
OFF = -18000
def load(n):
    r = json.load(open(os.path.join(D, n + ".json")))["chart"]["result"][0]
    q = r["indicators"]["quote"][0]
    rows = []
    for i, t in enumerate(r["timestamp"]):
        if q["close"][i] is None: continue
        rows.append(dict(t=t, o=q["open"][i], h=q["high"][i], l=q["low"][i], c=q["close"][i], v=q["volume"][i] or 0))
    return rows
def et(t, f="%m-%d %H:%M"): return time.strftime(f, time.gmtime(t + OFF))
def ts(s):  # "2026-11-24 09:37" ET -> epoch
    return calendar.timegm(time.strptime(s, "%Y-%m-%d %H:%M")) - OFF
def day(rows, d, rth=True):
    out = [r for r in rows if et(r["t"], "%Y-%m-%d") == d]
    if rth: out = [r for r in out if "09:30" <= et(r["t"], "%H:%M") < "16:00"]
    return out
def at(rows, t):  # last bar at or before t
    best = None
    for r in rows:
        if r["t"] <= t: best = r
        else: break
    return best
def iv_solve(price, S, K, T, kind, r=0.04):
    lo, hi = 0.01, 10.0
    intrinsic = max(S - K, 0) if kind == "c" else max(K - S, 0)
    if price <= intrinsic + 1e-6: return None
    for _ in range(80):
        mid = (lo + hi) / 2
        if bs(S, K, T, mid, r, kind) > price: hi = mid
        else: lo = mid
    return (lo + hi) / 2
def T_years(t, expiry):  # calendar time to 16:00 ET on expiry date
    return max((ts(expiry + " 16:00") - t), 60) / (365 * 86400)
