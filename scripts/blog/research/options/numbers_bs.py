"""Black-Scholes worked numbers for the options primer (stdlib only)."""
from math import log, sqrt, exp, erf, pi


def N(x):
    return 0.5 * (1 + erf(x / sqrt(2)))


def n(x):
    return exp(-x * x / 2) / sqrt(2 * pi)


def bs(S, K, T, iv, r=0.04, kind="c"):
    if T <= 0:
        return max(S - K, 0) if kind == "c" else max(K - S, 0)
    d1 = (log(S / K) + (r + iv * iv / 2) * T) / (iv * sqrt(T))
    d2 = d1 - iv * sqrt(T)
    if kind == "c":
        return S * N(d1) - K * exp(-r * T) * N(d2)
    return K * exp(-r * T) * N(-d2) - S * N(-d1)


def greeks(S, K, T, iv, r=0.04, kind="c"):
    d1 = (log(S / K) + (r + iv * iv / 2) * T) / (iv * sqrt(T))
    d2 = d1 - iv * sqrt(T)
    delta = N(d1) if kind == "c" else N(d1) - 1
    gamma = n(d1) / (S * iv * sqrt(T))
    vega = S * n(d1) * sqrt(T) / 100
    if kind == "c":
        theta = (-S * n(d1) * iv / (2 * sqrt(T)) - r * K * exp(-r * T) * N(d2)) / 365
    else:
        theta = (-S * n(d1) * iv / (2 * sqrt(T)) + r * K * exp(-r * T) * N(-d2)) / 365
    return delta, gamma, theta, vega


if __name__ == "__main__":
    print("== A: XYZ $100, 105 call, 30d, IV 40%")
    S, K, T, iv = 100, 105, 30 / 365, 0.40
    p = bs(S, K, T, iv)
    print("premium", round(p, 2), "greeks", [round(g, 4) for g in greeks(S, K, T, iv)])
    for label, s2, days_left, iv2 in [
        ("up 10% in 10d", 110, 20, 0.40),
        ("up 5% in 10d", 105, 20, 0.40),
        ("flat 10d", 100, 20, 0.40),
        ("down 5% in 10d", 95, 20, 0.40),
        ("flat 20d", 100, 10, 0.40),
        ("exp 110", 110, 0, 0.40),
        ("exp 107", 107, 0, 0.40),
        ("exp 104", 104, 0, 0.40),
        ("exp 100", 100, 0, 0.40),
        ("up 5% 1d", 105, 29, 0.40),
        ("up 1 1d", 101, 30, 0.40),
        ("same, IV 30", 100, 30, 0.30),
        ("same, IV 50", 100, 30, 0.50),
    ]:
        v = bs(s2, K, days_left / 365, iv2)
        print(f"  {label:16s} value {v:6.2f}  pnl/contract {100*(v-p):8.0f}  ret {100*(v/p-1):6.0f}%")
    print("  put 95, 30d:", round(bs(100, 95, T, iv, kind="p"), 2))
    print("  ATM call 100, 30d:", round(bs(100, 100, T, iv), 2), "ATM put", round(bs(100, 100, T, iv, kind="p"), 2))
    print("  ITM call 90, 30d:", round(bs(100, 90, T, iv), 2), greeks(100, 90, T, iv)[0])
    print("  deltas: 90c %.2f 100c %.2f 105c %.2f 115c %.2f" % tuple(greeks(100, k, T, iv)[0] for k in (90, 100, 105, 115)))
    print("  115 call:", round(bs(100, 115, T, iv), 2))
    for iv2 in (0.2, 0.4, 0.8):
        print("  105c at IV", iv2, round(bs(100, 105, T, iv2), 2))
    print("  time decay ATM 100c IV40:", [(d, round(bs(100, 100, d / 365, 0.4), 2)) for d in (60, 45, 30, 20, 10, 5, 2, 1)])

    print("== B: SPY 0DTE. trading-time years: hours/(6.5*252)")
    yr = lambda h: h / (6.5 * 252)
    S, K, iv = 600.0, 603.0, 0.14
    p0 = bs(S, K, yr(6), iv)
    print("entry 10:00 (6h left) SPY 600, 603c:", round(p0, 3), "delta", round(greeks(S, K, yr(6), iv)[0], 3))
    for label, s2, h in [("SPY 603 12:00", 603, 4), ("SPY 606 14:00", 606, 2), ("SPY 606 15:30", 606, .5),
                         ("SPY 600 14:00", 600, 2), ("SPY 602 15:59", 602, 0.0), ("SPY 604.5 close", 604.5, 0.0),
                         ("SPY 601.5 14:00", 601.5, 2), ("SPY 598 12:00", 598, 4)]:
        v = bs(s2, K, yr(h), iv)
        print(f"  {label:18s} value {v:6.3f}  x{v/p0:5.1f}  SPY move {100*(s2/S-1):+.2f}%")
    print("  deltas over path:", [round(greeks(s, K, yr(h), iv)[0], 2) for s, h in ((600, 6), (601.5, 5), (603, 4), (604.5, 3), (606, 2))])

    print("== C: earnings IV crush. stock 100, 100 call, 3 days to expiry")
    S, K = 100, 100
    T0, T1 = 3 / 365, 2 / 365
    for iv0 in (1.2, 1.5):
        c0 = bs(S, K, T0, iv0)
        p0_ = bs(S, K, T0, iv0, kind="p")
        print(f" IV {iv0}: call {c0:.2f} put {p0_:.2f} straddle {c0+p0_:.2f} (implied move ~{(c0+p0_):.1f}%)")
        for s2 in (103, 105, 108, 112, 95):
            c1 = bs(s2, K, T1, 0.45)
            print(f"   next day stock {s2} IV 45%: call {c1:.2f} pnl {100*(c1-c0):+.0f} ({100*(c1/c0-1):+.0f}%)")
    print("== VIX rule of 16:", [(v, round(v / sqrt(252), 2), round(v * sqrt(30 / 365), 2)) for v in (12, 16, 20, 30, 45)])
