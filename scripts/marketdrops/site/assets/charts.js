/* Market-drops study: chart engine. No dependencies. Draws SVG from small JSON specs.
   Candles follow the trader's chart look: white up-candles, black down-candles; daily averages in greys from dark to light (EMA 9, EMA 20, SMA 50, SMA 200).
   Spec types:  candle | lines.   Data: data/px/<SYM>.json (bars), data/ser/<key>.json (date series), or inline in the page spec file. */
(function () {
  "use strict";
  var INK = "#111", INK2 = "#55534e", MUTED = "#8a887f", GRID = "#e9e7e1", AXIS = "#c9c6bd", SURF = "#ffffff";
  var CAT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
  /* daily averages in the greys of the trader's daily DAS chart, dark to light: EMA 9, EMA 20, SMA 50, SMA 200 (the 50 and 200 drawn a little thicker so they stay readable) */
  var MA = { e9: { n: 9, k: "ema", c: "#464646", w: 1.2, t: "EMA 9" }, e20: { n: 20, k: "ema", c: "#808080", w: 1.2, t: "EMA 20" }, s50: { n: 50, k: "sma", c: "#B0B0B0", w: 1.6, t: "SMA 50" }, s200: { n: 200, k: "sma", c: "#D0D0D0", w: 2.4, t: "SMA 200" },
    w10: { n: 10, k: "sma", c: "#808080", w: 1.4, t: "10-week" }, w40: { n: 40, k: "sma", c: "#B0B0B0", w: 2.2, t: "40-week" } };
  var BAND = { drop: "rgba(227,73,72,.10)", rally: "rgba(237,161,0,.16)", turn: "rgba(27,175,122,.14)", grey: "rgba(0,0,0,.05)", blue: "rgba(42,120,214,.10)" };
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var cache = {}, BASE = (document.currentScript && document.currentScript.getAttribute("data-base")) || "";

  function load(src) {
    if (!cache[src]) cache[src] = fetch(BASE + "data/" + src + ".json").then(function (r) { if (!r.ok) throw new Error(src + " " + r.status); return r.json(); }).then(decode);
    return cache[src];
  }
  function decode(j) {
    if (j.dd && !j.e) { var t = Date.parse(j.t0) / 864e5; j.e = []; for (var i = 0; i < j.dd.length; i++) { t += j.dd[i]; j.e.push(t); } }
    else if (j.d && !j.e) j.e = j.d.map(function (s) { return Date.parse(s) / 864e5; });
    return j;
  }
  var iso = function (e) { return new Date(e * 864e5).toISOString().slice(0, 10); };
  var ep = function (s) { return Date.parse(s) / 864e5; };
  function nice(e, withDow) { var d = new Date(e * 864e5); return (withDow ? DOW[d.getUTCDay()] + " " : "") + d.getUTCDate() + " " + MON[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function lowerBound(a, x) { var lo = 0, hi = a.length; while (lo < hi) { var m = (lo + hi) >> 1; if (a[m] < x) lo = m + 1; else hi = m; } return lo; }      // first index with a[i] >= x
  function atOrBefore(a, x) { var i = lowerBound(a, x); return i < a.length && a[i] === x ? i : i - 1; }
  function sma(v, n) { var o = new Array(v.length), s = 0; for (var i = 0; i < v.length; i++) { s += v[i]; if (i >= n) s -= v[i - n]; o[i] = i >= n - 1 ? s / n : NaN; } return o; }
  function ema(v, n) { var o = new Array(v.length), k = 2 / (n + 1), e = NaN, s = 0; for (var i = 0; i < v.length; i++) { if (i < n - 1) { s += v[i]; o[i] = NaN; continue; } if (i === n - 1) { s += v[i]; e = s / n; } else e = v[i] * k + e * (1 - k); o[i] = e; } return o; }
  function weekly(b) {
    var o = { e: [], o: [], h: [], l: [], c: [], v: [], last: [] }, key = null, k = -1;
    for (var i = 0; i < b.e.length; i++) { var dow = new Date(b.e[i] * 864e5).getUTCDay(), wk = b.e[i] - ((dow + 6) % 7);
      if (wk !== key) { key = wk; k++; o.e.push(b.e[i]); o.o.push(b.o[i]); o.h.push(b.h[i]); o.l.push(b.l[i]); o.c.push(b.c[i]); o.v.push(b.v ? b.v[i] : 0); o.last.push(b.e[i]); }
      else { if (b.h[i] > o.h[k]) o.h[k] = b.h[i]; if (b.l[i] < o.l[k]) o.l[k] = b.l[i]; o.c[k] = b.c[i]; if (b.v) o.v[k] += b.v[i]; o.last[k] = b.e[i]; } }
    return o;
  }
  function fmt(v, f) {
    if (v == null || !isFinite(v)) return "—";
    if (f === "pct") return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(Math.abs(v) < 10 ? 1 : 0) + "%";
    if (f === "pct1") return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%";
    if (f === "x") return v.toFixed(2) + "×";
    if (f === "int") return Math.round(v).toLocaleString("en-US");
    var a = Math.abs(v); return (v < 0 ? "−" : "") + (a >= 10000 ? Math.round(a).toLocaleString("en-US") : a >= 100 ? a.toFixed(1) : a >= 10 ? a.toFixed(2) : a.toFixed(a < 1 ? 3 : 2));
  }
  function ticks(lo, hi, n) {                                 // nice linear ticks
    var span = hi - lo; if (!(span > 0)) return [lo]; var step = Math.pow(10, Math.floor(Math.log10(span / n))), err = span / n / step;
    step *= err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1; var out = []; for (var v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10)); return out;
  }
  function logTicks(lo, hi) { var out = [], p = Math.pow(10, Math.floor(Math.log10(lo))); var mult = hi / lo > 30 ? [1, 2, 5] : hi / lo > 4 ? [1, 1.5, 2, 3, 4, 5, 7] : [1, 1.2, 1.4, 1.6, 1.8, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9];
    for (; p <= hi; p *= 10) for (var i = 0; i < mult.length; i++) { var v = p * mult[i]; if (v >= lo && v <= hi) out.push(v); } return out; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ------------------------------------------------------------------ candle chart ------------------------------------------------------------------ */
  function candle(host, spec) {
    var inline = spec.data ? Promise.resolve(decode(spec.data)) : load(spec.src);
    var extra = (spec.panels || []).filter(function (p) { return p.src; }).map(function (p) { return load(p.src); });
    var rsP = spec.rs ? load(spec.rs) : Promise.resolve(null);
    return Promise.all([inline, Promise.all(extra), rsP]).then(function (R) { drawCandle(host, spec, R[0], R[1], R[2]); });
  }
  function drawCandle(host, spec, raw, extraData, rsData) {
    var anon = !!spec.anon, tf = spec.tf || "D", b = tf === "W" ? weekly(raw) : raw, n = b.e.length;
    var i0 = spec.from ? lowerBound(b.e, ep(spec.from)) : 0, i1 = spec.to ? atOrBefore(tf === "W" ? b.last : b.e, ep(spec.to)) : n - 1;
    if (tf === "W" && spec.to) { i1 = Math.min(n - 1, lowerBound(b.last, ep(spec.to))); }
    if (spec.i0 != null) i0 = spec.i0; if (spec.i1 != null) i1 = spec.i1;
    i0 = Math.max(0, i0); i1 = Math.min(n - 1, i1); var cnt = i1 - i0 + 1; if (cnt < 2) { host.textContent = "no data for this window"; return; }
    var maKeys = spec.ma || (tf === "W" ? ["w10", "w40"] : ["e9", "e20", "s50", "s200"]), mas = maKeys.map(function (k) { var m = MA[k]; return { m: m, v: (m.k === "ema" ? ema : sma)(b.c, m.n) }; });
    var state = host._st || (host._st = { cut: spec.reveal ? (spec.reveal.cutI != null ? spec.reveal.cutI : atOrBefore(b.e, ep(spec.reveal.cut))) : i1, sel: -1 });
    var cut = Math.min(i1, state.cut), revealAll = cut >= i1;
    var panels = (spec.panels || [{ k: "vol" }]).filter(function (p) { return p.k !== "vol" || (b.v && b.v.some(function (x) { return x > 0; })); });
    var cw = host.clientWidth || 700, pitch = spec.pitch != null ? spec.pitch : (cw < 400 ? 3.2 : 0), mL = 6, mR = 54, mT = (spec.marks && spec.marks.length) ? 26 : 10, mB = 20;
    var W = Math.max(cw, pitch ? Math.round(cnt * pitch + mL + mR) : 0), pw = W - mL - mR, bw = pw / cnt;
    var H = spec.h || (cw < 520 ? 280 : 380), PH = 64, gap = 8, totalH = mT + H + panels.reduce(function (s, p) { return s + gap + (p.h || (p.k === "vol" ? 56 : PH)); }, 0) + mB;
    var x = function (i) { return mL + (i - i0 + 0.5) * bw; };
    // numbered badges: put each in the first row where it does not touch the one before; grow the top margin to fit the rows
    var badgeRow = {}, rowsUsed = 0; (function () { var lastX = [], ms = (spec.marks || []).filter(function (m) { return !m.k; });
      ms.forEach(function (m, q) { var i = m.i != null ? m.i : (tf === "W" ? Math.min(n - 1, lowerBound(b.last, ep(m.d))) : atOrBefore(b.e, ep(m.d))); if (i < i0 || i > i1) return; var xx = x(i), r = 0; while (r < 3 && lastX[r] != null && xx - lastX[r] < 18.5) r++; if (r > 3) r = 3; lastX[r] = xx; badgeRow[q] = r; if (r + 1 > rowsUsed) rowsUsed = r + 1; }); })();
    if (rowsUsed > 1) { var extra = (rowsUsed - 1) * 19; mT += extra; totalH += extra; }
    // y range from what is visible (never from the hidden future in reveal mode)
    var lo = Infinity, hi = -Infinity; for (var i = i0; i <= cut; i++) { if (b.l[i] < lo) lo = b.l[i]; if (b.h[i] > hi) hi = b.h[i]; }
    (spec.hlines || []).forEach(function (h) { if (h.fit) { lo = Math.min(lo, h.y); hi = Math.max(hi, h.y); } });
    var log = !!spec.log, pad = log ? Math.pow(hi / lo, 0.04) : (hi - lo) * 0.04; if (log) { lo /= pad; hi *= pad; } else { lo -= pad; hi += pad; }
    var y = log ? function (v) { return mT + H - (Math.log(v / lo) / Math.log(hi / lo)) * H; } : function (v) { return mT + H - ((v - lo) / (hi - lo)) * H; };
    var base = anon ? b.c[state.cut0 != null ? state.cut0 : (state.cut0 = cut)] : 0, pf = function (v) { return anon ? fmt(v / base * 100) : fmt(v); };
    var s = [], id = "c" + Math.random().toString(36).slice(2, 8);
    s.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + totalH + '" viewBox="0 0 ' + W + " " + totalH + '" role="img" aria-label="' + esc(spec.title || "price chart") + '" style="display:block;background:' + SURF + '">');
    s.push('<defs><clipPath id="' + id + '"><rect x="' + mL + '" y="' + mT + '" width="' + pw + '" height="' + H + '"/></clipPath></defs>');
    // bands
    (spec.bands || []).forEach(function (bd) { var a = Math.max(i0, lowerBound(b.e, ep(bd.from))), z = Math.min(cut, atOrBefore(b.e, ep(bd.to))); if (z < a) return;
      var x0 = mL + (a - i0) * bw, x1 = mL + (z - i0 + 1) * bw; s.push('<rect x="' + x0.toFixed(1) + '" y="' + mT + '" width="' + (x1 - x0).toFixed(1) + '" height="' + H + '" fill="' + (BAND[bd.c] || bd.c || BAND.grey) + '"/>');
      if (bd.t && x1 - x0 > 26) s.push('<text x="' + ((x0 + x1) / 2).toFixed(1) + '" y="' + (mT + (bd.low ? H - 6 : 12)) + '" text-anchor="middle" font-size="10.5" fill="' + INK2 + '">' + esc(bd.t) + "</text>"); });
    // grid + price axis
    (log ? logTicks(lo, hi) : ticks(lo, hi, Math.max(3, Math.round(H / 60)))).forEach(function (v) { var yy = y(v); if (yy < mT + 4 || yy > mT + H - 2) return;
      s.push('<line x1="' + mL + '" x2="' + (mL + pw) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="' + GRID + '"/><text x="' + (mL + pw + 5) + '" y="' + (yy + 3.5).toFixed(1) + '" font-size="10.5" fill="' + INK2 + '">' + pf(v) + "</text>"); });
    // date axis
    var axisY = totalH - mB + 13, lastLab = -99, perMonth = cnt / ((b.e[i1] - b.e[i0]) / 30.4 || 1) * bw;
    if (!anon) for (var j = i0 + 1; j <= i1; j++) { var d0 = new Date(b.e[j - 1] * 864e5), d1 = new Date(b.e[j] * 864e5), newY = d1.getUTCFullYear() !== d0.getUTCFullYear(), newM = d1.getUTCMonth() !== d0.getUTCMonth();
      if (!newM && !newY) continue; var q = d1.getUTCMonth() % 3 === 0, show = newY || perMonth >= 34 || (perMonth >= 12 && q) || false, xx = mL + (j - i0) * bw;
      if (newY || perMonth >= 9 || q) s.push('<line x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + mT + '" y2="' + (totalH - mB) + '" stroke="' + (newY ? AXIS : GRID) + '"/>');
      if (show && xx - lastLab > 30) { s.push('<text x="' + (xx + 3).toFixed(1) + '" y="' + axisY + '" font-size="10.5" fill="' + (newY ? INK : INK2) + '"' + (newY ? ' font-weight="600"' : "") + ">" + (newY ? d1.getUTCFullYear() : MON[d1.getUTCMonth()]) + "</text>"); lastLab = xx; } }
    else for (var a2 = i0; a2 <= i1; a2++) { var rel = a2 - (state.cut0 != null ? state.cut0 : cut); if (rel % 20 === 0) { var xa = x(a2); s.push('<line x1="' + xa.toFixed(1) + '" x2="' + xa.toFixed(1) + '" y1="' + mT + '" y2="' + (totalH - mB) + '" stroke="' + GRID + '"/><text x="' + xa.toFixed(1) + '" y="' + axisY + '" text-anchor="middle" font-size="10.5" fill="' + INK2 + '">' + (rel > 0 ? "+" : "") + rel + "</text>"); } }
    s.push('<rect x="' + mL + '" y="' + mT + '" width="' + pw + '" height="' + H + '" fill="none" stroke="' + AXIS + '"/>');
    // horizontal levels
    (spec.hlines || []).forEach(function (h) { if (h.y < lo || h.y > hi) return; var yy = y(h.y); s.push('<line x1="' + mL + '" x2="' + (mL + pw) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="' + (h.c || "#c0564b") + '" stroke-dasharray="5 4"/>');
      if (h.t) s.push('<text x="' + (mL + 5) + '" y="' + (yy - 4).toFixed(1) + '" font-size="10.5" fill="' + INK2 + '">' + esc(h.t) + "</text>"); });
    // moving averages
    s.push('<g clip-path="url(#' + id + ')">');
    mas.forEach(function (o) { var p = "", pen = false; for (var i = i0; i <= cut; i++) { var v = o.v[i]; if (!isFinite(v)) { pen = false; continue; } p += (pen ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); pen = true; }
      if (p) s.push('<path d="' + p + '" fill="none" stroke="' + o.m.c + '" stroke-width="' + o.m.w + '" stroke-linejoin="round"/>'); });
    // candles: white up, black down
    var body = Math.max(1, Math.min(bw * 0.72, 14)), wick = [], up = [], dn = [];
    for (var k = i0; k <= cut; k++) { var xx2 = x(k), O = b.o[k], C = b.c[k], yo = y(O), yc = y(C), top = Math.min(yo, yc), hgt = Math.max(1, Math.abs(yc - yo));
      wick.push("M" + xx2.toFixed(1) + " " + y(b.h[k]).toFixed(1) + "V" + y(b.l[k]).toFixed(1));
      (C >= O ? up : dn).push('<rect x="' + (xx2 - body / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + body.toFixed(1) + '" height="' + hgt.toFixed(1) + '"/>'); }
    s.push('<path d="' + wick.join("") + '" stroke="' + INK + '" stroke-width="' + (bw < 2.2 ? 0.7 : 1) + '" fill="none"/>');
    s.push('<g fill="#fff" stroke="' + INK + '" stroke-width="' + (body < 2.5 ? 0.5 : 0.9) + '">' + up.join("") + '</g><g fill="' + INK + '" stroke="' + INK + '" stroke-width="0.5">' + dn.join("") + "</g></g>");
    // marks
    var numbered = (spec.marks || []).filter(function (m) { return !m.k; });
    (spec.marks || []).forEach(function (m) { var i = m.i != null ? m.i : atOrBefore(tf === "W" ? b.e : b.e, ep(m.d)); if (tf === "W" && m.d) { i = Math.min(n - 1, lowerBound(b.last, ep(m.d))); } if (i < i0 || i > cut) return; var xx = x(i);
      if (m.k === "low" || m.k === "high") { var up2 = m.k === "low", yy = up2 ? y(b.l[i]) + 5 : y(b.h[i]) - 5, c = m.c || (up2 ? "#0c7d57" : "#b3261e");
        s.push('<path d="M' + xx.toFixed(1) + " " + yy.toFixed(1) + "l-5 " + (up2 ? 8 : -8) + "h10z" + '" fill="' + c + '"/>');
        if (m.t) s.push('<text x="' + xx.toFixed(1) + '" y="' + (yy + (up2 ? 20 : -12)).toFixed(1) + '" text-anchor="' + (xx > mL + pw - 60 ? "end" : xx < mL + 60 ? "start" : "middle") + '" font-size="10.5" font-weight="600" fill="' + INK + '" paint-order="stroke" stroke="#fff" stroke-width="3">' + esc(m.t) + "</text>"); }
      else if (m.k === "dot") { s.push('<circle cx="' + xx.toFixed(1) + '" cy="' + (y(b.h[i]) - 8).toFixed(1) + '" r="3.5" fill="' + (m.c || CAT[0]) + '" stroke="#fff" stroke-width="1.5"/>'); }
      else { var yy2 = y(b.h[i]) - 3, by = mT - 13 - (badgeRow[numbered.indexOf(m)] || 0) * 19; s.push('<line x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + (by + 8) + '" y2="' + yy2.toFixed(1) + '" stroke="' + (m.c || CAT[0]) + '" stroke-dasharray="2 3"/>');
        s.push('<circle cx="' + xx.toFixed(1) + '" cy="' + by + '" r="8.5" fill="' + (m.c || CAT[0]) + '"/><text x="' + xx.toFixed(1) + '" y="' + (by + 3.5) + '" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">' + esc(m.n != null ? m.n : "•") + "</text>"); } });
    // lower panels
    var py = mT + H;
    panels.forEach(function (p, pi) { var ph = p.h || (p.k === "vol" ? 56 : PH); py += gap; var top = py, bot = py + ph; s.push('<rect x="' + mL + '" y="' + top + '" width="' + pw + '" height="' + ph + '" fill="none" stroke="' + AXIS + '"/>');
      if (p.k === "vol") { var mx = 0; for (var i = i0; i <= cut; i++) if (b.v[i] > mx) mx = b.v[i]; var av = sma(b.v, tf === "W" ? 10 : 50), u = [], d = [], bwid = Math.max(1, Math.min(bw * 0.72, 14));
        for (var i2 = i0; i2 <= cut; i2++) { var hh = b.v[i2] / mx * (ph - 4); (b.c[i2] >= b.o[i2] ? u : d).push('<rect x="' + (x(i2) - bwid / 2).toFixed(1) + '" y="' + (bot - hh).toFixed(1) + '" width="' + bwid.toFixed(1) + '" height="' + hh.toFixed(1) + '"/>'); }
        s.push('<g fill="#fff" stroke="' + INK + '" stroke-width="0.5">' + u.join("") + '</g><g fill="' + INK + '">' + d.join("") + "</g>");
        var ap = "", pen = false; for (var i3 = i0; i3 <= cut; i3++) { if (!isFinite(av[i3])) { pen = false; continue; } ap += (pen ? "L" : "M") + x(i3).toFixed(1) + " " + (bot - av[i3] / mx * (ph - 4)).toFixed(1); pen = true; }
        s.push('<text x="' + (mL + 5) + '" y="' + (top + 11) + '" font-size="10" fill="' + INK2 + '" paint-order="stroke" stroke="#fff" stroke-width="3">Volume</text>'); }
      else { // a line series aligned to the bars by date (last known value carried forward)
        var ser, vals = new Array(n);
        if (p.k === "rs" && rsData) { for (var q2 = i0; q2 <= cut; q2++) { var r = atOrBefore(rsData.e, tf === "W" ? b.last[q2] : b.e[q2]); vals[q2] = r >= 0 ? b.c[q2] / rsData.c[r] : NaN; } var b0 = vals[i0]; for (var q3 = i0; q3 <= cut; q3++) vals[q3] = vals[q3] / b0 * 100; }
        else { ser = extraData[(spec.panels || []).filter(function (z) { return z.src; }).indexOf(p)] || p.data; if (!ser) return; ser = decode(ser); var key = p.key || "c"; for (var q4 = i0; q4 <= cut; q4++) { var r2 = atOrBefore(ser.e, tf === "W" ? b.last[q4] : b.e[q4]); vals[q4] = r2 >= 0 ? ser[key][r2] : NaN; } }
        var mn = Infinity, mx2 = -Infinity; for (var q5 = i0; q5 <= cut; q5++) if (isFinite(vals[q5])) { if (vals[q5] < mn) mn = vals[q5]; if (vals[q5] > mx2) mx2 = vals[q5]; }
        (p.hl || []).forEach(function (h) { if (h > mn * 0.5 && h < mx2 * 1.5) { mn = Math.min(mn, h); mx2 = Math.max(mx2, h); } }); if (p.zero) mn = Math.min(mn, 0);
        var pd = (mx2 - mn) * 0.1 || 1; mn -= pd; mx2 += pd; var yv = function (v) { return bot - (v - mn) / (mx2 - mn) * ph; };
        (p.hl || []).forEach(function (h) { s.push('<line x1="' + mL + '" x2="' + (mL + pw) + '" y1="' + yv(h).toFixed(1) + '" y2="' + yv(h).toFixed(1) + '" stroke="' + AXIS + '" stroke-dasharray="4 4"/><text x="' + (mL + pw + 5) + '" y="' + (yv(h) + 3.5).toFixed(1) + '" font-size="10" fill="' + INK2 + '">' + fmt(h, p.f) + "</text>"); });
        var lp = "", pen2 = false; for (var q6 = i0; q6 <= cut; q6++) { if (!isFinite(vals[q6])) { pen2 = false; continue; } lp += (pen2 ? "L" : "M") + x(q6).toFixed(1) + " " + yv(vals[q6]).toFixed(1); pen2 = true; }
        s.push('<path d="' + lp + '" fill="none" stroke="' + (p.c || CAT[pi % 8]) + '" stroke-width="1.6" stroke-linejoin="round"/><text x="' + (mL + 5) + '" y="' + (top + 11) + '" font-size="10" fill="' + INK2 + '" paint-order="stroke" stroke="#fff" stroke-width="3">' + esc(p.t || "") + "</text>");
        if (!(p.hl || []).length) { s.push('<text x="' + (mL + pw + 5) + '" y="' + (top + 10) + '" font-size="10" fill="' + INK2 + '">' + fmt(mx2 - pd, p.f) + '</text><text x="' + (mL + pw + 5) + '" y="' + (bot - 2) + '" font-size="10" fill="' + INK2 + '">' + fmt(mn + pd, p.f) + "</text>"); }
        p._vals = vals; }
      py = bot; });
    s.push('<line class="xh" x1="0" x2="0" y1="' + mT + '" y2="' + (totalH - mB) + '" stroke="' + INK2 + '" stroke-width="0.8" stroke-dasharray="3 3" visibility="hidden"/>');
    s.push('<rect class="hit" x="' + mL + '" y="0" width="' + pw + '" height="' + totalH + '" fill="transparent"/></svg>');
    // ---- DOM
    host.innerHTML = ""; host.classList.add("md-chart");
    var legend = el("div", "md-legend"); legend.innerHTML = mas.map(function (o) { return '<span><i style="background:' + o.m.c + ";height:" + Math.max(2, o.m.w + 0.6) + 'px"></i>' + o.m.t + "</span>"; }).join("") + '<span class="md-k"><b class="up"></b>up ' + (tf === "W" ? "week" : "day") + '</span><span class="md-k"><b class="dn"></b>down ' + (tf === "W" ? "week" : "day") + "</span>";
    var read = el("div", "md-read", "&nbsp;"), scroller = el("div", "md-scroll"); scroller.innerHTML = s.join("");
    if (spec.legend !== false) host.appendChild(legend); host.appendChild(read); host.appendChild(scroller);
    var svg = scroller.firstChild, xh = svg.querySelector(".xh");
    function show(i) { if (i < i0 || i > cut) { xh.setAttribute("visibility", "hidden"); read.innerHTML = "&nbsp;"; return; }
      var xx = x(i); xh.setAttribute("x1", xx); xh.setAttribute("x2", xx); xh.setAttribute("visibility", "visible"); var prev = i > 0 ? b.c[i - 1] : NaN, ch = (b.c[i] / prev - 1) * 100;
      var t = "<b>" + (anon ? "day " + (i - state.cut0 > 0 ? "+" : "") + (i - state.cut0) : (tf === "W" ? "week of " : "") + nice(b.e[i], tf !== "W")) + "</b> &nbsp;O " + pf(b.o[i]) + " &nbsp;H " + pf(b.h[i]) + " &nbsp;L " + pf(b.l[i]) + " &nbsp;C <b>" + pf(b.c[i]) + "</b> &nbsp;<b class='" + (ch >= 0 ? "pos" : "neg") + "'>" + fmt(ch, "pct1") + "</b>";
      if (b.v && b.v[i]) { var av = 0, c2 = 0; for (var j = Math.max(0, i - (tf === "W" ? 10 : 50)); j < i; j++) { av += b.v[j]; c2++; } if (c2 > 5 && av > 0) t += " &nbsp;vol " + (b.v[i] / (av / c2)).toFixed(2) + "× avg"; }
      panels.forEach(function (p) { if (p._vals && isFinite(p._vals[i])) t += " &nbsp;" + esc(p.s || p.t || "") + " " + fmt(p._vals[i], p.f); });
      read.innerHTML = t; }
    function fromEvent(ev) { var r = svg.getBoundingClientRect(), px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left; return i0 + Math.floor((px * (W / r.width) - mL) / bw); }
    svg.addEventListener("mousemove", function (ev) { show(fromEvent(ev)); }); svg.addEventListener("mouseleave", function () { show(-1); }); svg.addEventListener("click", function (ev) { show(fromEvent(ev)); });
    if (W > cw + 4) { var f = spec.focus ? x(atOrBefore(b.e, ep(spec.focus))) - cw * 0.6 : W; scroller.scrollLeft = Math.max(0, f); }
    // reveal controls
    if (spec.reveal) { var bar = el("div", "md-reveal"); var steps = spec.reveal.steps || [1, 5, 20];
      if (!revealAll) { steps.forEach(function (st) { var bt = el("button", "", "+" + st + (tf === "W" ? " wk" : st === 1 ? " day" : " days")); bt.onclick = function () { state.cut = Math.min(i1, cut + st); drawCandle(host, spec, raw, extraData, rsData); }; bar.appendChild(bt); });
        var all = el("button", "pri", "Show what happened"); all.onclick = function () { state.cut = i1; drawCandle(host, spec, raw, extraData, rsData); }; bar.appendChild(all); }
      else { var again = el("button", "", "Hide again"); again.onclick = function () { state.cut = state.cut0 != null ? state.cut0 : atOrBefore(b.e, ep(spec.reveal.cut)); drawCandle(host, spec, raw, extraData, rsData); }; bar.appendChild(again);
        if (spec.reveal.answer) bar.appendChild(el("div", "md-answer", spec.reveal.answer)); }
      host.appendChild(bar); }
  }

  /* ------------------------------------------------------------------ line chart ------------------------------------------------------------------
     spec: { type:"lines", xt:"n"|"date", series:[{t, d:[[x,y]..], c, w, dash, dim, label:false}], yf, xl, yl, hl:[{y,t}], vl:[{x,t}], bands:[{x0,x1,c,t}], h, log, zero } */
  function lines(host, spec) {
    var S = spec.series, cw = host.clientWidth || 700, small = cw < 520, direct = S.filter(function (z) { return z.label !== false && !z.dim; }).length <= 6 && !spec.noEndLabels;
    var mL = 46, mR = direct ? (small ? 62 : 96) : 14, mT = 12, mB = spec.xl ? 36 : 24, W = cw, H = spec.h || (small ? 260 : 360), pw = W - mL - mR, ph = H - mT - mB, isDate = spec.xt === "date";
    var X = function (v) { return isDate ? (typeof v === "string" ? ep(v) : v) : v; }, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    S.forEach(function (z, k) { z._c = z.c || (z.dim ? "#c8c5bc" : CAT[(z.ci != null ? z.ci : k) % 8]); z._p = z.d.map(function (p) { return [X(p[0]), p[1]]; }).filter(function (p) { return p[1] != null && isFinite(p[1]); });
      z._p.forEach(function (p) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (!z.nofit) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } }); });
    if (spec.x0 != null) x0 = X(spec.x0); if (spec.x1 != null) x1 = X(spec.x1); (spec.hl || []).forEach(function (h) { if (h.fit !== false) { y0 = Math.min(y0, h.y); y1 = Math.max(y1, h.y); } });
    if (spec.zero) { y0 = Math.min(y0, 0); y1 = Math.max(y1, 0); } if (spec.y0 != null) y0 = spec.y0; if (spec.y1 != null) y1 = spec.y1;
    var log = !!spec.log, pd = log ? 1 : (y1 - y0) * 0.05 || 1; if (!log) { if (spec.y0 == null) y0 -= pd; if (spec.y1 == null) y1 += pd; }
    var sx = function (v) { return mL + (v - x0) / (x1 - x0 || 1) * pw; }, sy = log ? function (v) { return mT + ph - Math.log(v / y0) / Math.log(y1 / y0) * ph; } : function (v) { return mT + ph - (v - y0) / (y1 - y0) * ph; };
    var s = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(spec.title || "line chart") + '" style="display:block;background:' + SURF + '">'];
    var id = "l" + Math.random().toString(36).slice(2, 8); s.push('<defs><clipPath id="' + id + '"><rect x="' + mL + '" y="' + mT + '" width="' + pw + '" height="' + ph + '"/></clipPath></defs>');
    (spec.bands || []).forEach(function (bd) { var a = sx(Math.max(x0, X(bd.x0))), z = sx(Math.min(x1, X(bd.x1))); if (z <= a) return; s.push('<rect x="' + a.toFixed(1) + '" y="' + mT + '" width="' + (z - a).toFixed(1) + '" height="' + ph + '" fill="' + (BAND[bd.c] || bd.c || BAND.grey) + '"/>'); if (bd.t && z - a > 30) s.push('<text x="' + ((a + z) / 2).toFixed(1) + '" y="' + (mT + 12) + '" text-anchor="middle" font-size="10.5" fill="' + INK2 + '">' + esc(bd.t) + "</text>"); });
    (log ? logTicks(y0, y1) : ticks(y0, y1, Math.max(3, Math.round(ph / 48)))).forEach(function (v) { var yy = sy(v); if (yy < mT - 1 || yy > mT + ph + 1) return; s.push('<line x1="' + mL + '" x2="' + (mL + pw) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="' + (v === 0 && !log ? AXIS : GRID) + '"/><text x="' + (mL - 5) + '" y="' + (yy + 3.5).toFixed(1) + '" text-anchor="end" font-size="10.5" fill="' + INK2 + '">' + fmt(v, spec.yf) + "</text>"); });
    if (isDate) { var span = x1 - x0, stepM = span > 365 * 12 ? 24 : span > 365 * 5 ? 12 : span > 365 * 2 ? 6 : span > 400 ? 3 : 1, d = new Date(x0 * 864e5); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + 1); var last = -99;
      for (; d.getTime() / 864e5 <= x1; d.setUTCMonth(d.getUTCMonth() + 1)) { if (d.getUTCMonth() % stepM) continue; var xx = sx(d.getTime() / 864e5), jan = d.getUTCMonth() === 0; s.push('<line x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + mT + '" y2="' + (mT + ph) + '" stroke="' + GRID + '"/>');
        if (xx - last > 38) { s.push('<text x="' + xx.toFixed(1) + '" y="' + (mT + ph + 14) + '" text-anchor="middle" font-size="10.5" fill="' + INK2 + '">' + (jan || stepM >= 12 ? d.getUTCFullYear() : MON[d.getUTCMonth()] + (stepM >= 3 || last < 0 ? " ’" + String(d.getUTCFullYear()).slice(2) : "")) + "</text>"); last = xx; } } }
    else ticks(x0, x1, Math.max(4, Math.round(pw / 70))).forEach(function (v) { var xx = sx(v); s.push('<line x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + mT + '" y2="' + (mT + ph) + '" stroke="' + (v === 0 ? AXIS : GRID) + '"/><text x="' + xx.toFixed(1) + '" y="' + (mT + ph + 14) + '" text-anchor="middle" font-size="10.5" fill="' + INK2 + '">' + fmt(v, spec.xf || "int") + "</text>"); });
    if (spec.xl) s.push('<text x="' + (mL + pw / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="11" fill="' + INK2 + '">' + esc(spec.xl) + "</text>");
    s.push('<rect x="' + mL + '" y="' + mT + '" width="' + pw + '" height="' + ph + '" fill="none" stroke="' + AXIS + '"/>');
    (spec.hl || []).forEach(function (h) { var yy = sy(h.y); if (yy < mT || yy > mT + ph) return; s.push('<line x1="' + mL + '" x2="' + (mL + pw) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="' + (h.c || INK2) + '" stroke-dasharray="5 4"/>'); if (h.t) s.push('<text x="' + (mL + 5) + '" y="' + (yy - 4).toFixed(1) + '" font-size="10.5" fill="' + INK2 + '" paint-order="stroke" stroke="#fff" stroke-width="3">' + esc(h.t) + "</text>"); });
    (spec.vl || []).forEach(function (v) { var xx = sx(X(v.x)); if (xx < mL || xx > mL + pw) return; s.push('<line x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + mT + '" y2="' + (mT + ph) + '" stroke="' + (v.c || INK2) + '" stroke-dasharray="4 4"/>'); if (v.t) s.push('<text x="' + (xx + 4).toFixed(1) + '" y="' + (mT + (v.low ? ph - 6 : 12)) + '" font-size="10.5" fill="' + INK2 + '" paint-order="stroke" stroke="#fff" stroke-width="3"' + (xx > mL + pw - 90 ? ' text-anchor="end" dx="-8"' : "") + ">" + esc(v.t) + "</text>"); });
    s.push('<g clip-path="url(#' + id + ')">');
    S.slice().sort(function (a, b2) { return (a.dim ? 0 : 1) - (b2.dim ? 0 : 1) || (a.w || 0) - (b2.w || 0); }).forEach(function (z) { if (!z._p.length) return; var p = ""; z._p.forEach(function (q, i) { p += (i ? "L" : "M") + sx(q[0]).toFixed(1) + " " + sy(q[1]).toFixed(1); });
      if (z.pts) z._p.forEach(function (q) { s.push('<circle cx="' + sx(q[0]).toFixed(1) + '" cy="' + sy(q[1]).toFixed(1) + '" r="' + (z.r || 3) + '" fill="' + z._c + '" stroke="#fff" stroke-width="1"/>'); });
      if (!z.nol) s.push('<path d="' + p + '" fill="none" stroke="' + z._c + '" stroke-width="' + (z.w || (z.dim ? 1 : 2)) + '" stroke-linejoin="round" stroke-linecap="round"' + (z.dash ? ' stroke-dasharray="' + z.dash + '"' : "") + (z.dim ? ' opacity=".8"' : "") + "/>"); });
    s.push("</g>");
    (spec.pts || []).forEach(function (p) { var xx = sx(X(p.x)), yy = sy(p.y); s.push('<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="4.5" fill="' + (p.c || INK) + '" stroke="#fff" stroke-width="2"/>'); if (p.t) s.push('<text x="' + (xx + (p.left ? -8 : 8)).toFixed(1) + '" y="' + (yy + (p.below ? 14 : -7)).toFixed(1) + '" font-size="10.5" font-weight="600" fill="' + INK + '" text-anchor="' + (p.left ? "end" : "start") + '" paint-order="stroke" stroke="#fff" stroke-width="3">' + esc(p.t) + "</text>"); });
    if (direct) { var labs = S.filter(function (z) { return z.label !== false && !z.dim && z._p.length; }).map(function (z) { var q = z._p[z._p.length - 1]; return { z: z, y: sy(q[1]), x: sx(Math.min(q[0], x1)) }; }).sort(function (a, b2) { return a.y - b2.y; });
      for (var i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < 12) labs[i].y = labs[i - 1].y + 12; for (var j = labs.length - 2; j >= 0; j--) if (labs[j + 1].y > mT + ph) { labs[j + 1].y = mT + ph; if (labs[j + 1].y - labs[j].y < 12) labs[j].y = labs[j + 1].y - 12; }
      labs.forEach(function (lb) { s.push('<circle cx="' + lb.x.toFixed(1) + '" cy="' + sy(lb.z._p[lb.z._p.length - 1][1]).toFixed(1) + '" r="3" fill="' + lb.z._c + '"/><text x="' + (mL + pw + 7) + '" y="' + (lb.y + 3.5).toFixed(1) + '" font-size="10.5" fill="' + INK + '">' + esc(lb.z.s || lb.z.t) + "</text>"); }); }
    s.push('<line class="xh" x1="0" x2="0" y1="' + mT + '" y2="' + (mT + ph) + '" stroke="' + INK2 + '" stroke-width="0.8" stroke-dasharray="3 3" visibility="hidden"/><rect class="hit" x="' + mL + '" y="' + mT + '" width="' + pw + '" height="' + ph + '" fill="transparent"/></svg>');
    host.innerHTML = ""; host.classList.add("md-chart");
    var named = S.filter(function (z) { return z.t && !z.nolegend; });
    if (named.length > 1 || spec.legend) { var lg = el("div", "md-legend"); var seen = {}; lg.innerHTML = named.filter(function (z) { var k = z.lg || z.t; if (seen[k]) return false; seen[k] = 1; return true; }).map(function (z) { return '<span><i style="background:' + z._c + ";height:" + (z.dim ? 2 : 3) + 'px"></i>' + esc(z.lg || z.t) + "</span>"; }).join(""); host.appendChild(lg); }
    var read = el("div", "md-read", "&nbsp;"), wrap = el("div", "md-scroll"); wrap.innerHTML = s.join(""); host.appendChild(read); host.appendChild(wrap);
    var svg = wrap.firstChild, xh = svg.querySelector(".xh");
    function show(ev) { var r = svg.getBoundingClientRect(), px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * (W / r.width), xv = x0 + (px - mL) / pw * (x1 - x0); if (px < mL || px > mL + pw) { xh.setAttribute("visibility", "hidden"); read.innerHTML = "&nbsp;"; return; }
      xh.setAttribute("x1", px); xh.setAttribute("x2", px); xh.setAttribute("visibility", "visible"); var parts = [];
      S.forEach(function (z) { if (z.dim || z.noread || !z._p.length) return; var bi = -1, bd = Infinity; for (var i = 0; i < z._p.length; i++) { var dd = Math.abs(z._p[i][0] - xv); if (dd < bd) { bd = dd; bi = i; } } if (bi < 0 || bd > (x1 - x0) * 0.04) return; parts.push('<span class="md-rv"><i style="background:' + z._c + '"></i>' + esc(z.s || z.t || "") + " <b>" + fmt(z._p[bi][1], spec.yf) + "</b></span>"); });
      read.innerHTML = "<b>" + (isDate ? nice(Math.round(xv)) : (spec.xn || "day") + " " + Math.round(xv)) + "</b> " + parts.slice(0, 8).join(" "); }
    svg.addEventListener("mousemove", show); svg.addEventListener("click", show); svg.addEventListener("mouseleave", function () { xh.setAttribute("visibility", "hidden"); read.innerHTML = "&nbsp;"; });
  }

  /* ------------------------------------------------------------------ boot ------------------------------------------------------------------ */
  var specs = null, specP = null;
  function pageSpecs() { if (specP) return specP; var name = document.body.getAttribute("data-page"); specP = name ? fetch(BASE + "data/pg/" + name + ".json").then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }) : Promise.resolve({}); return specP.then(function (j) { specs = j; return j; }); }
  function render(host) {
    if (host._done) return; host._done = true;
    pageSpecs().then(function (all) { var spec = all[host.getAttribute("data-chart")]; if (!spec) { host.textContent = "chart spec missing: " + host.getAttribute("data-chart"); return; }
      host._spec = spec; return (spec.type === "lines" ? Promise.resolve(lines(host, spec)) : candle(host, spec)); }).catch(function (e) { host.textContent = "Could not draw this chart (" + e.message + ")."; host._done = false; });
  }
  function boot() {
    var hosts = [].slice.call(document.querySelectorAll("[data-chart]"));
    if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); render(e.target); } }); }, { rootMargin: "500px 0px" }); hosts.forEach(function (h) { io.observe(h); }); }
    else hosts.forEach(render);
    var t = null, lastW = window.innerWidth; window.addEventListener("resize", function () { if (window.innerWidth === lastW) return; lastW = window.innerWidth; clearTimeout(t); t = setTimeout(function () { hosts.forEach(function (h) { if (h._done && h._spec) { h._done = false; h._st && h._spec.reveal ? 0 : (h._st = null); render(h); } }); }, 250); });
  }
  window.MD = { render: render, load: load, CAT: CAT };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
