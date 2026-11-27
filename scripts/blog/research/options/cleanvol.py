"""Yahoo's 1-minute NVDA bars carry some impossible volumes (one minute larger than the whole day). This repairs them
against the 5-minute bars, whose volumes add up sensibly, and exposes clean 1-minute rows and a VWAP."""
import os, sys, statistics as st
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib as L

_n1 = L.load("NVDA_1m_8d")
_n5 = L.load("NVDA_5m_1mo")
_v5 = {r["t"]: r["v"] for r in _n5}

def clean_day(d):
    rows = [dict(r) for r in L.day(_n1, d)]
    buckets = {}
    for r in rows:
        buckets.setdefault(r["t"] - r["t"] % 300, []).append(r)
    fixed = 0
    for k, bars in buckets.items():
        v5 = _v5.get(k)
        if not v5:
            continue
        for _ in range(len(bars)):
            s1 = sum(b["v"] for b in bars)
            if s1 <= 1.3 * v5:
                break
            big = max(bars, key=lambda b: b["v"])
            others = [b["v"] for b in bars if b is not big]
            big["v"] = max(v5 - sum(others), st.median(others) if others else 0, 0)
            fixed += 1
    return rows, fixed

_cache = {}
def day(d):
    if d not in _cache:
        _cache[d] = clean_day(d)
    return _cache[d][0]

def vwap(d):
    """{timestamp: vwap} from clean 1-minute bars, cumulative from 9:30."""
    pv = vol = 0.0
    out = {}
    for r in day(d):
        pv += (r["h"] + r["l"] + r["c"]) / 3 * r["v"]; vol += r["v"]
        out[r["t"]] = pv / vol if vol else r["c"]
    return out

if __name__ == "__main__":
    for d in ("2026-11-20", "2026-11-23", "2026-11-24", "2026-11-25"):
        rows, fixed = clean_day(d)
        _cache[d] = (rows, fixed)
        vw = vwap(d)
        # cross-check with a VWAP built only from 5-minute bars
        pv = vol = 0.0; v5w = {}
        for r in L.day(_n5, d):
            pv += (r["h"] + r["l"] + r["c"]) / 3 * r["v"]; vol += r["v"]; v5w[r["t"]] = pv / vol
        last5 = max(v5w)
        print(d, "bars repaired:", fixed, "| total 1m clean", round(sum(r["v"] for r in rows) / 1e6, 1), "M | VWAP close", round(vw[rows[-1]["t"]], 2), "| 5m-only VWAP close", round(v5w[last5], 2), "| close", round(rows[-1]["c"], 2))
        side = None; cr = []
        for r in rows:
            s = r["c"] > vw[r["t"]]
            if side is not None and s != side:
                cr.append((L.et(r["t"], "%H:%M"), "above" if s else "below"))
            side = s
        print("   crosses (%d):" % len(cr), cr[:40])
        pts = ("09:31", "09:41", "09:48", "09:54", "10:09", "10:25", "11:02", "11:15", "11:20", "11:37", "12:08", "12:10", "13:00", "14:25", "15:00", "15:55", "15:59")
        print("   ", "; ".join(f"{hm} px {L.at(rows, L.ts(d + ' ' + hm))['c']:.2f} vwap {vw[L.at(rows, L.ts(d + ' ' + hm))['t']]:.2f} ({(L.at(rows, L.ts(d + ' ' + hm))['c'] / vw[L.at(rows, L.ts(d + ' ' + hm))['t']] - 1) * 100:+.1f}%)" for hm in pts))
