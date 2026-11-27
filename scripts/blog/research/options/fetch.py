import json, sys, urllib.request, urllib.parse, os, time
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
def get(sym, interval, rng, name=None, pre=True):
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(sym)}?interval={interval}&range={rng}&includePrePost={'true' if pre else 'false'}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        raw = urllib.request.urlopen(req, timeout=30).read()
    except Exception as e:
        print(sym, interval, rng, "ERR", e); return None
    j = json.loads(raw)
    r = j["chart"]["result"]
    if not r:
        print(sym, "no result", j["chart"].get("error")); return None
    r = r[0]
    ts = r.get("timestamp") or []
    fn = os.path.join(D, (name or f"{sym.replace('^','')}_{interval}_{rng}") + ".json")
    open(fn, "wb").write(raw)
    q = r["indicators"]["quote"][0]
    print(sym, interval, rng, "bars", len(ts), "first", time.strftime("%Y-%m-%d %H:%M", time.gmtime(ts[0])) if ts else None, "last", time.strftime("%Y-%m-%d %H:%M", time.gmtime(ts[-1])) if ts else None, "lastclose", [c for c in q["close"] if c][-1] if ts else None)
    return r
for a in sys.argv[1:]:
    s, i, r = a.split(",")
    get(s, i, r); time.sleep(0.4)
