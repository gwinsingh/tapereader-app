// Figures for blog posts. A post holds a fenced block ```figure with a JSON spec; render() turns it into HTML
// (charts are HTML/CSS with percentage positions, so text keeps its size on a phone) and toMarkdown() turns the
// same spec into plain text and tables for the Obsidian copy of the post.
// Kinds: bar, hbar, line, stack, timeline, flow, compare, quadrant, tiles, and for market data tape, scatter, explorer.
// See README.md for the fields of each.

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// inline emphasis inside figure text: **bold** and `code` only
const inl = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`(.+?)`/g, "<code>$1</code>");

function num(v, dp) {
  const a = Math.abs(v);
  const d = dp != null ? dp : a >= 1000 ? 0 : a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 1 : 2;
  let s = a.toFixed(d);
  if (s.indexOf(".") >= 0) s = s.replace(/\.?0+$/, "");
  const parts = s.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
// unit "%" → 12.3%   "$bn" → $12.3bn   "x" → 2.5x   "" → 12.3 ; signed adds + and a true minus
function fmt(v, unit, signed, dp) {
  if (v == null || isNaN(v)) return "n/a";
  unit = unit || "";
  const sign = v < 0 ? "−" : signed && v > 0 ? "+" : "";
  const pre = unit[0] === "$" || unit[0] === "£" || unit[0] === "€" ? unit[0] : "";
  const post = pre ? unit.slice(1) : unit;
  return sign + pre + num(v, dp) + (post && /^[a-zA-Z]/.test(post) && post.length > 2 ? " " + post : post);
}

function nice(min, max, target) {
  target = target || 5;
  if (min === max) max = min + 1;
  const raw = (max - min) / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / mag;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const ticks = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Math.abs(t) < step / 1e6 ? 0 : +t.toFixed(10));
  return { lo, hi, step, ticks };
}

const r2 = (x) => +x.toFixed(2);
// axis ticks: compact on an axis that reaches 10,000 (0 / 10K / 20K) or a million (0 / 1M / 2M)
function tick(t, unit, hi) {
  const a = Math.abs(hi);
  if (t === 0 && a >= 1e4) return (unit[0] === "$" || unit[0] === "£" || unit[0] === "€" ? unit[0] : "") + "0";
  if (a >= 1e6) return fmt(t / 1e6, (unit[0] === "$" || unit[0] === "£" || unit[0] === "€" ? unit[0] : "") + "M");
  if (a >= 1e4) return fmt(t / 1e3, (unit[0] === "$" || unit[0] === "£" || unit[0] === "€" ? unit[0] : "") + "K");
  return fmt(t, unit, false);
}

function legend(names) {
  if (names.length < 2) return "";
  return `<div class="legend">${names.map((n, i) => `<span><i class="sw s${i + 1}"></i>${esc(n)}</span>`).join("")}</div>`;
}

function dataTable(head, rows) {
  return `<details class="fig-data"><summary>Show the numbers</summary><div class="scroll"><table class="t"><thead><tr>${head
    .map((h, i) => `<th${i ? ' class="num"' : ""}>${esc(h)}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ""}>${esc(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div></details>`;
}

function xLabels(x) {
  const n = x.length;
  const longest = Math.max.apply(null, x.map((s) => String(s).length));
  const maxLabels = longest <= 4 ? 9 : longest <= 7 ? 6 : 4;
  const step = Math.max(1, Math.ceil(n / maxLabels));
  return { step, show: (i) => (n - 1 - i) % step === 0 };
}

// ---------- bar (vertical columns, 1–3 series, negatives allowed)
function bar(s) {
  const series = s.series || [{ name: s.title, values: s.values }];
  const n = s.x.length, k = series.length, unit = s.unit || "";
  const all = [].concat.apply([], series.map((r) => r.values)).filter((v) => v != null);
  const sc = nice(Math.min(0, Math.min.apply(null, all)), Math.max(0, Math.max.apply(null, all)), s.ticks || 4);
  const pct = (v) => ((v - sc.lo) / (sc.hi - sc.lo)) * 100;
  const zero = pct(0);
  const signed = sc.lo < 0;
  const grid = sc.ticks.map((t) => `<div class="g${t === 0 ? " z" : ""}" style="bottom:${r2(pct(t))}%"><span>${tick(t, unit, Math.max(Math.abs(sc.lo), Math.abs(sc.hi)))}</span></div>`).join("");
  const mx = Math.max.apply(null, all), mn = Math.min.apply(null, all);
  const labelAll = k === 1 && n <= 14;
  const xl = xLabels(s.x);
  const slots = s.x.map((lab, i) => {
    const bars = series.map((r, j) => {
      const v = r.values[i];
      if (v == null) return `<div class="b"></div>`;
      const h = Math.abs(pct(v) - zero), neg = v < 0;
      const cls = s.sign ? (neg ? "neg" : "s1") : "s" + (j + 1);
      const pos = neg ? `bottom:${r2(zero - h)}%;height:${r2(h)}%` : `bottom:${r2(zero)}%;height:${r2(h)}%`;
      const tip = `${lab}${k > 1 ? " · " + r.name : ""}: ${fmt(v, unit, signed, s.dp)}`;
      let lbl = "";
      const want = s.labels === "none" ? false : labelAll || (k === 1 && (v === mx || v === mn || i === n - 1)) || s.labels === "all";
      if (want) {
        const txt = fmt(v, n > 8 ? (unit === "%" ? "" : unit) : unit, signed, s.dp);
        lbl = neg ? `<em style="top:calc(${r2(100 - (zero - h))}% + 2px)">${txt}</em>` : `<em style="bottom:calc(${r2(zero + h)}% + 2px)">${txt}</em>`;
      }
      return `<div class="b"><i class="${cls}${neg ? " dn" : ""}" style="${pos}" data-tip="${esc(tip)}" tabindex="0"></i>${lbl}</div>`;
    }).join("");
    return `<div class="slot" style="left:${r2((i / n) * 100)}%;width:${r2(100 / n)}%">${bars}</div>`;
  }).join("");
  // a few long category names: give each label its slot and let it wrap, so nothing overlaps on a phone
  const wrap = n <= 6 && Math.max.apply(null, s.x.map((t) => String(t).length)) > 7;
  const xs = s.x.map((lab, i) => (wrap ? `<span style="left:${r2(((i + 0.5) / n) * 100)}%;width:${r2(100 / n)}%">${esc(lab)}</span>` : xl.show(i) ? `<span style="left:${r2(((i + 0.5) / n) * 100)}%">${esc(lab)}</span>` : "")).join("");
  const head = [s.xName || ""].concat(series.map((r) => r.name || s.yName || "Value"));
  const rows = s.x.map((lab, i) => [lab].concat(series.map((r) => fmt(r.values[i], unit, signed, s.dp))));
  return `${s.sign ? "" : legend(series.map((r) => r.name))}<div class="chart col" style="--h:${s.height || 250}px"><div class="plot">${grid}${slots}</div><div class="xaxis${wrap ? " wrap" : ""}">${xs}</div></div>${dataTable(head, rows)}`;
}

// ---------- hbar (horizontal bars, one series, labels on the left)
function hbar(s) {
  const unit = s.unit || "";
  const vals = s.rows.map((r) => r[1]).filter((v) => v != null);
  const lo = Math.min(0, Math.min.apply(null, vals)), hi = Math.max(0, Math.max.apply(null, vals));
  const span = hi - lo || 1;
  const pct = (v) => ((v - lo) / span) * 100;
  const zero = pct(0), signed = lo < 0;
  const rows = s.rows.map((r) => {
    const v = r[1], strong = s.highlight && [].concat(s.highlight).indexOf(r[0]) >= 0;
    const neg = v < 0, w = Math.abs(pct(v) - zero);
    const cls = s.sign && neg ? "neg" : strong && !s.sign ? "s2" : "s1";
    const barEl = v == null ? "" : `<i class="${cls}${neg ? " dn" : ""}" style="left:${r2(neg ? zero - w : zero)}%;width:${r2(w)}%" data-tip="${esc(r[0] + ": " + fmt(v, unit, signed, s.dp))}" tabindex="0"></i>`;
    return `<div class="hrow${strong ? " hi" : ""}"><span class="hl">${inl(r[0])}${r[2] ? `<small>${inl(r[2])}</small>` : ""}</span><div class="ht">${signed ? `<b class="hz" style="left:${r2(zero)}%"></b>` : ""}${barEl}</div><span class="hv">${fmt(v, unit, signed, s.dp)}</span></div>`;
  }).join("");
  return `<div class="chart hbar">${rows}</div>`;
}

// ---------- line (1–4 series over an ordered x; null breaks the line)
function line(s) {
  const series = s.series, n = s.x.length, unit = s.unit || "";
  const all = [].concat.apply([], series.map((r) => r.values)).filter((v) => v != null);
  let lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
  if (s.zero !== false && lo > 0 && lo < hi * 0.6) lo = 0;
  if (s.min != null) lo = s.min;
  // "log": true puts the values on a log scale (each gridline is ten times the one below); values must be above 0
  const lg = s.log ? (v) => Math.log10(v) : (v) => v;
  let sc = nice(Math.min(lo, 0 > lo ? lo : lo), hi, s.ticks || 4);
  if (s.log) {
    const a = Math.floor(Math.log10(Math.min.apply(null, all)) + 1e-9), b = Math.ceil(Math.log10(hi) - 1e-9);
    sc = { lo: a, hi: b, ticks: [] };
    for (let t = a; t <= b; t++) sc.ticks.push(t);
  }
  const py = (v) => ((lg(v) - sc.lo) / (sc.hi - sc.lo)) * 100;
  const px = (i) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const signed = !s.log && sc.lo < 0;
  const grid = s.log
    ? sc.ticks.map((t) => `<div class="g" style="bottom:${r2(((t - sc.lo) / (sc.hi - sc.lo)) * 100)}%"><span>${tick(Math.pow(10, t), unit, Math.pow(10, t))}</span></div>`).join("")
    : sc.ticks.map((t) => `<div class="g${t === 0 && signed ? " z" : ""}" style="bottom:${r2(py(t))}%"><span>${tick(t, unit, Math.max(Math.abs(sc.lo), Math.abs(sc.hi)))}</span></div>`).join("");
  const paths = series.map((r, j) => {
    let d = "", pen = false;
    r.values.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      d += (pen ? "L" : "M") + r2(px(i)) + " " + r2(100 - py(v));
      pen = true;
    });
    return `<path class="ln s${j + 1}${r.dash ? " dash" : ""}" d="${d}"/>`;
  }).join("");
  const dots = series.map((r, j) => {
    let li = -1;
    r.values.forEach((v, i) => { if (v != null) li = i; });
    if (li < 0) return "";
    if (s.points) return r.values.map((v, i) => (v == null ? "" : `<i class="dot s${j + 1}" style="left:${r2(px(i))}%;bottom:${r2(py(v))}%"></i>`)).join("");
    return `<i class="dot s${j + 1}" style="left:${r2(px(li))}%;bottom:${r2(py(r.values[li]))}%"></i>`;
  }).join("");
  let markCount = 0;
  const marks = (s.marks || []).map((m) => {
    const i = s.x.map(String).indexOf(String(m[0]));
    if (i < 0) return "";
    const right = px(i) > 70;
    markCount += 1;
    return `<div class="mk${right ? " r" : ""}${markCount % 2 === 0 ? " up" : ""}" style="left:${r2(px(i))}%"><span>${inl(m[1])}</span></div>`;
  }).join("");
  const xl = xLabels(s.x);
  const xs = s.x.map((lab, i) => {
    if (!xl.show(i) && i !== 0) return "";
    if (i === 0 && !xl.show(0) && (n - 1) % xl.step < Math.max(2, Math.ceil(xl.step * 0.6))) return "";
    const al = i === 0 ? " a0" : i === n - 1 ? " a1" : "";
    return `<span class="${al.trim()}" style="left:${r2(px(i))}%">${esc(lab)}</span>`;
  }).join("");
  const leg = series.length > 1
    ? `<div class="legend">${series.map((r, j) => {
        const last = r.values.filter((v) => v != null).slice(-1)[0];
        return `<span><i class="sw ln s${j + 1}"></i>${esc(r.name)}${s.endValues === false ? "" : ` <b>${fmt(last, unit, signed)}</b>`}</span>`;
      }).join("")}</div>`
    : "";
  const payload = { x: s.x, u: unit, sg: signed, s: series.map((r) => ({ n: r.name || s.yName || "", v: r.values })) };
  const head = [s.xName || ""].concat(series.map((r) => r.name || s.yName || "Value"));
  const rows = s.x.map((lab, i) => [lab].concat(series.map((r) => fmt(r.values[i], unit, signed))));
  return `${leg}<div class="chart line${markCount > 1 ? " marks2" : ""}" style="--h:${s.height || 250}px" data-line="${esc(JSON.stringify(payload))}"><div class="plot">${grid}${marks}<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>${dots}<div class="cross" hidden></div></div><div class="xaxis">${xs}</div></div>${dataTable(head, rows)}`;
}

// ---------- stack (one whole split into parts; one or several bars)
function stack(s) {
  const bars = s.bars || [{ name: "", parts: s.parts }];
  const unit = s.unit == null ? "%" : s.unit;
  const order = [];
  bars.forEach((b) => b.parts.forEach((p) => { if (order.indexOf(p[0]) < 0) order.push(p[0]); }));
  const rows = bars.map((b) => {
    const tot = b.parts.reduce((a, p) => a + p[1], 0);
    const segs = b.parts.filter((p) => p[1] > 0).map((p) => {
      const share = (p[1] / tot) * 100, ci = Math.min(order.indexOf(p[0]) + 1, 9);
      const txt = share >= 9 ? `<span>${fmt(p[1], unit)}</span>` : "";
      return `<i class="s${ci}" style="flex:${r2(share)} 1 0" data-tip="${esc(`${b.name ? b.name + " · " : ""}${p[0]}: ${fmt(p[1], unit)}`)}" tabindex="0">${txt}</i>`;
    }).join("");
    return `<div class="srow${b.name ? "" : " one"}">${b.name ? `<span class="sn">${inl(b.name)}</span>` : ""}<div class="seg">${segs}</div></div>`;
  }).join("");
  const head = ["Part"].concat(bars.map((b) => b.name || "Share"));
  const trows = order.map((name) => [name].concat(bars.map((b) => { const p = b.parts.filter((q) => q[0] === name)[0]; return p ? fmt(p[1], unit) : "–"; })));
  return `<div class="legend">${order.map((n, i) => `<span><i class="sw s${Math.min(i + 1, 9)}"></i>${esc(n)}</span>`).join("")}</div><div class="chart stack">${rows}</div>${dataTable(head, trows)}`;
}

// ---------- timeline: events [when, title, text?]
function timeline(s) {
  return `<ol class="tl">${s.events.map((e) => `<li><time>${inl(e[0])}</time><div><b>${inl(e[1])}</b>${e[2] ? `<p>${inl(e[2])}</p>` : ""}</div></li>`).join("")}</ol>`;
}

// ---------- flow: steps [title, text?]; "dir":"h" lays up to 5 steps side by side on a wide screen
function flow(s) {
  const h = s.dir === "h" && s.steps.length <= 5;
  return `<ol class="flow${h ? " h" : ""}">${s.steps.map((e, i) => `<li><span class="n">${i + 1}</span><b>${inl(e[0])}</b>${e[1] ? `<p>${inl(e[1])}</p>` : ""}</li>`).join("")}</ol>`;
}

// ---------- compare: cols [{title, tag?, items[]}] side by side
function compare(s) {
  return `<div class="cmp" style="--c:${s.cols.length}">${s.cols.map((c, i) => `<div class="cmpc"><div class="cmph"><i class="sw s${i + 1}"></i><b>${inl(c.title)}</b>${c.tag ? `<small>${inl(c.tag)}</small>` : ""}</div><ul>${c.items.map((it) => `<li>${inl(it)}</li>`).join("")}</ul></div>`).join("")}</div>`;
}

// ---------- quadrant: xAxis [left,right], yAxis [top,bottom], cells [TL,TR,BL,BR] each [title, text]
function quadrant(s) {
  const c = s.cells;
  const cell = (x) => `<div class="qc"><b>${inl(x[0])}</b>${x[1] ? `<p>${inl(x[1])}</p>` : ""}</div>`;
  return `<div class="quad"><div class="qx"><span>${inl(s.xAxis[0])}</span><span>${inl(s.xAxis[1])}</span></div><div class="qrow"><span class="qy">${inl(s.yAxis[0])}</span>${cell(c[0])}${cell(c[1])}</div><div class="qrow"><span class="qy">${inl(s.yAxis[1])}</span>${cell(c[2])}${cell(c[3])}</div></div>`;
}

// ---------- tiles: [value, label, note?]
function tiles(s) {
  return `<div class="tiles">${s.tiles.map((t) => `<div class="tile"><b>${inl(t[0])}</b><span>${inl(t[1])}</span>${t[2] ? `<small>${inl(t[2])}</small>` : ""}</div>`).join("")}</div>`;
}

// ======================================================================= market figures
// ---------- tape: candles and lines on one shared clock, in stacked panels (price on top, another series underneath).
// x [label per bar], ticks [[index, label]], sessions [[start index, name]], marks [[index, "buy"|"sell"|"note", text]],
// panels [{name, desc?, unit, height?, candles? [[o,h,l,c]|null], lines? [{name, values, dash?, c?, area?}], levels? [[value, text]], min?, max?, dp?}]
function tape(s) {
  const n = s.x.length;
  const cx = (i) => ((i + 0.5) / n) * 100;
  const marks = (s.marks || []).map((m, k) => ({ i: m[0], type: m[1] || "note", text: m[2], when: m[3] || s.x[m[0]], letter: String.fromCharCode(97 + k) }));
  const starts = {};
  (s.sessions || []).forEach((q) => { starts[q[0]] = 1; });
  const rowsLast = [];
  marks.slice().sort((a, b) => a.i - b.i).forEach((m) => {
    let row = 0;
    while (rowsLast[row] != null && cx(m.i) - rowsLast[row] < (s.badgeGap || 3.6)) row++;
    rowsLast[row] = cx(m.i);
    m.row = row;
  });
  const badgeRows = rowsLast.length;
  let colour = 0;
  const payload = { x: s.x, p: [] };
  const sessions = s.sessions || [];
  const dividers = sessions.filter((q) => q[0] > 0).map((q) => `<div class="sd" style="left:${r2((q[0] / n) * 100)}%"></div>`).join("");
  const panels = s.panels.map((p, pi) => {
    const unit = p.unit || "", dp = p.dp == null ? 2 : p.dp;
    const vals = [];
    (p.candles || []).forEach((c) => { if (c) vals.push(c[1], c[2]); });
    (p.lines || []).forEach((l) => l.values.forEach((v) => { if (v != null) vals.push(v); }));
    (p.levels || []).forEach((l) => vals.push(l[0]));
    let lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    const pad = (hi - lo) * 0.05;
    lo = p.min != null ? p.min : lo - pad;
    hi = p.max != null ? p.max : hi + pad;
    const sc = nice(lo, hi, p.ticks || 4);
    const py = (v) => ((v - sc.lo) / (sc.hi - sc.lo)) * 100;
    const grid = sc.ticks.map((t) => `<div class="g" style="bottom:${r2(py(t))}%"><span>${fmt(t, unit, false)}</span></div>`).join("");
    const bw = (100 / n) * 0.62;
    const candles = (p.candles || []).map((c, i) => {
      if (!c) return "";
      const up = c[3] >= c[0], x = cx(i), cls = up ? "up" : "dn";
      const yT = 100 - py(Math.max(c[0], c[3])), yB = 100 - py(Math.min(c[0], c[3]));
      return `<line class="wk ${cls}" x1="${r2(x)}" x2="${r2(x)}" y1="${r2(100 - py(c[1]))}" y2="${r2(100 - py(c[2]))}"/><rect class="bd ${cls}" x="${r2(x - bw / 2)}" y="${r2(yT)}" width="${r2(bw)}" height="${r2(Math.max(yB - yT, 0.25))}"/>`;
    }).join("");
    const lines = (p.lines || []).map((l) => {
      const k = l.c || ++colour;
      const segs = [];
      let cur = null;
      l.values.forEach((v, i) => {
        if (v == null || starts[i]) cur = null;
        if (v == null) return;
        if (!cur) segs.push((cur = []));
        cur.push([cx(i), 100 - py(v)]);
      });
      l._k = k;
      const dOf = (g) => g.map((q, j) => (j ? "L" : "M") + r2(q[0]) + " " + r2(q[1])).join("");
      const base = 100 - Math.max(0, Math.min(100, py(Math.max(sc.lo, 0))));
      const area = l.area ? segs.map((g) => `<path class="ar s${k}" d="${dOf(g)}L${r2(g[g.length - 1][0])} ${r2(base)}L${r2(g[0][0])} ${r2(base)}Z"/>`).join("") : "";
      return `${area}<path class="ln s${k}${l.dash ? " dash" : ""}" d="${segs.map(dOf).join("")}"/>`;
    }).join("");
    const levels = (p.levels || []).map((l) => `<div class="lv" style="bottom:${r2(py(l[0]))}%"><span>${inl(l[1])}</span></div>`).join("");
    const tm = marks.map((m) => `<div class="tm ${m.type}" style="left:${r2(cx(m.i))}%">${pi === 0 ? `<b class="tb ${m.type}" style="top:${-24 - m.row * 21}px" data-tip="${esc(m.when + ": " + m.text.replace(/\*\*/g, ""))}" tabindex="0">${m.letter}</b>` : ""}</div>`).join("");
    const key = (p.candles ? `<span><i class="cdl up"></i>up bar</span><span><i class="cdl dn"></i>down bar</span>` : "") + (p.lines || []).map((l) => `<span><i class="sw ln s${l._k}"></i>${esc(l.name)}</span>`).join("");
    payload.p.push({ n: p.short || p.name, u: unit, d: dp, c: p.candles || null, l: (p.lines || []).map((l) => ({ n: l.name, k: l._k, v: l.values })) });
    return `<div class="tp"><div class="tpn"><b>${inl(p.name)}</b>${p.desc ? `<span>${inl(p.desc)}</span>` : ""}<em>${key}</em></div><div class="plot" style="--h:${p.height || 220}px${pi === 0 && badgeRows ? `;margin-top:${12 + badgeRows * 21}px` : ""}">${grid}${dividers}${levels}${tm}<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${candles}${lines}</svg><div class="cross" hidden></div></div></div>`;
  }).join("");
  const xs = (s.ticks || []).map((t) => `<span style="left:${r2(cx(t[0]))}%">${esc(t[1])}</span>`).join("");
  const sess = sessions.length
    ? `<div class="sess">${sessions.map((q, k) => {
        const a = q[0], b = k + 1 < sessions.length ? sessions[k + 1][0] : n;
        return `<span style="left:${r2((a / n) * 100)}%;width:${r2(((b - a) / n) * 100)}%">${esc(q[1])}</span>`;
      }).join("")}</div>`
    : "";
  const keyList = marks.length
    ? `<ol class="tkey">${marks.map((m) => `<li><b class="tb ${m.type}">${m.letter}</b><span><time>${esc(m.when)}</time>${inl(m.text)}</span></li>`).join("")}</ol>`
    : "";
  const table = marks.length
    ? dataTable(["Mark", "When", "What"].concat(s.panels.map((p) => p.short || p.name)), marks.map((m) => [m.letter, m.when, m.text.replace(/\*\*/g, "")].concat(s.panels.map((p) => {
        const c = p.candles && p.candles[m.i];
        const v = c ? c[3] : p.lines && p.lines[0] && p.lines[0].values[m.i];
        return v == null ? "–" : fmt(v, p.unit || "", false, p.dp == null ? 2 : p.dp);
      }))))
    : "";
  return `<div class="chart tape" data-tape="${esc(JSON.stringify(payload))}">${panels}<div class="xaxis">${xs}</div>${sess}</div>${keyList}${table}`;
}

// ---------- scatter: one dot per observation. points [[x, y, group index, label?]], groups [names], xName, yName, xUnit, yUnit,
// reverseX (true: x falls to the right), notes [[x, y, text, "l"?]]
function scatter(s) {
  const xu = s.xUnit || "", yu = s.yUnit || "";
  const xsv = s.points.map((p) => p[0]), ysv = s.points.map((p) => p[1]);
  const sx = nice(Math.min.apply(null, xsv), Math.max.apply(null, xsv), s.xTicks || 6);
  const sy = nice(s.yMin != null ? s.yMin : Math.min(0, Math.min.apply(null, ysv)), Math.max.apply(null, ysv), s.yTicks || 4);
  const px = (v) => { const f = ((v - sx.lo) / (sx.hi - sx.lo)) * 100; return s.reverseX ? 100 - f : f; };
  const py = (v) => ((v - sy.lo) / (sy.hi - sy.lo)) * 100;
  const grid = sy.ticks.map((t) => `<div class="g" style="bottom:${r2(py(t))}%"><span>${fmt(t, yu, false)}</span></div>`).join("")
    + sx.ticks.map((t) => `<div class="gv" style="left:${r2(px(t))}%"></div>`).join("");
  const groups = s.groups || [""];
  const dots = s.points.map((p) => `<i class="pt s${(p[2] || 0) + 1}" style="left:${r2(px(p[0]))}%;bottom:${r2(py(p[1]))}%" data-tip="${esc(`${p[3] ? p[3] + " · " : ""}${s.xShort || s.xName || "x"} ${fmt(p[0], xu, false, s.xDp == null ? 2 : s.xDp)} · ${s.yShort || s.yName || "y"} ${fmt(p[1], yu, false, s.yDp == null ? 2 : s.yDp)}`)}"></i>`).join("");
  const notes = (s.notes || []).map((q) => `<span class="snote${q[3] === "l" ? " l" : ""}" style="left:${r2(px(q[0]))}%;bottom:${r2(py(q[1]))}%">${inl(q[2])}</span>`).join("");
  const xs = sx.ticks.map((t) => `<span style="left:${r2(px(t))}%">${fmt(t, xu, false)}</span>`).join("");
  const leg = groups.length > 1 ? `<div class="legend">${groups.map((g, i) => `<span><i class="sw dotsw s${i + 1}"></i>${esc(g)}</span>`).join("")}</div>` : "";
  return `${leg}<div class="chart sc" style="--h:${s.height || 340}px"><div class="yn">${esc(s.yName || "")}</div><div class="plot">${grid}${dots}${notes}</div><div class="xaxis">${xs}</div><div class="xn">${esc(s.xName || "")}</div></div>`;
}

// ---------- explorer: an option pricer the reader can drive (stock price, days left, implied volatility).
// type "call"|"put", strike, contracts, cost (per share), underlying, rate (default 0.04),
// price {min, max, value, step?}, days {max, value, step?}, iv {min, max, value}, presets [[label, price, days, iv]]
function ncdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
}
function bsPrice(S, K, days, ivPct, r, put) {
  const T = Math.max(days, 0) / 365, v = ivPct / 100;
  if (T <= 0 || v <= 0) return Math.max(put ? K - S : S - K, 0);
  const sd = v * Math.sqrt(T), d1 = (Math.log(S / K) + (r + (v * v) / 2) * T) / sd, d2 = d1 - sd;
  return put ? K * Math.exp(-r * T) * ncdf(-d2) - S * ncdf(-d1) : S * ncdf(d1) - K * Math.exp(-r * T) * ncdf(d2);
}
function explorerTable(s) {
  const put = s.type === "put", r = s.rate == null ? 0.04 : s.rate;
  const d0 = s.days.value, d1 = Math.max(d0 - 1, 0);
  const head = [`${s.underlying || "Stock"} price`, `${num(d0)} days left`, `${num(d1)} days left`, "At expiry"];
  const rows = [];
  for (let k = 0; k <= 8; k++) {
    const S = s.price.min + ((s.price.max - s.price.min) * k) / 8;
    rows.push([fmt(S, "$", false, 2), fmt(bsPrice(S, s.strike, d0, s.iv.value, r, put), "$", false, 2), fmt(bsPrice(S, s.strike, d1, s.iv.value, r, put), "$", false, 2), fmt(bsPrice(S, s.strike, 0, s.iv.value, r, put), "$", false, 2)]);
  }
  return { head, rows };
}
function explorer(s) {
  ["strike", "price", "days", "iv"].forEach((k) => { if (s[k] == null) throw new Error(`explorer needs "${k}"`); });
  const put = s.type === "put";
  const cfg = { t: put ? "put" : "call", k: s.strike, n: s.contracts || 1, c: s.cost == null ? null : s.cost, r: s.rate == null ? 0.04 : s.rate, u: s.underlying || "Stock", p: s.price, d: s.days, v: s.iv, ymax: s.ymax || null };
  const presets = (s.presets || []).map((q) => `<button type="button" class="exb" data-p="${q[1]}" data-d="${q[2]}" data-v="${q[3]}">${esc(q[0])}</button>`).join("");
  const slider = (id, label, o, small) => `<label class="exsl"><span>${label}<output data-o="${id}"></output></span><input type="range" data-i="${id}" min="${o.min == null ? 0 : o.min}" max="${o.max}" step="${o.step || (id === "p" ? 0.1 : id === "d" ? 0.05 : 1)}" value="${o.value}" aria-label="${esc(label)}">${small ? `<small data-o="${id}n">${small}</small>` : ""}</label>`;
  const t = explorerTable(s);
  return `<div class="ex" data-ex="${esc(JSON.stringify(cfg))}">
${presets ? `<div class="exp"><span>Jump to a moment:</span>${presets}</div>` : ""}
<div class="exg">
<div class="exc"><div class="legend"><span><i class="sw ln s1"></i>Worth now</span><span><i class="sw ln s2"></i>One day later, nothing else changed</span><span><i class="sw ln s9"></i>At expiry</span></div>
<div class="chart exch"><div class="yn">Option price per share</div><div class="plot" style="--h:${s.height || 270}px"><div class="exgrid"></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="ln s9 dash" data-c="exp"/><path class="ln s2" data-c="next"/><path class="ln s1" data-c="now"/></svg><div class="exk"><span>strike</span></div><div class="excost" hidden><span></span></div><div class="exm"><i></i></div></div><div class="xaxis"></div><div class="xn">${esc(cfg.u)} price (drag on the chart, or use the slider)</div></div></div>
<dl class="exr">
<div><dt>Option price</dt><dd data-r="px">–</dd><small data-r="pxn"></small></div>
<div><dt>${cfg.n > 1 ? `Position, ${num(cfg.n)} contracts` : "One contract"}</dt><dd data-r="val">–</dd><small data-r="pl"></small></div>
<div><dt>Acts like</dt><dd data-r="sh">–</dd><small data-r="shn"></small></div>
<div><dt>One day passing costs</dt><dd data-r="th">–</dd><small data-r="thn"></small></div>
</dl>
</div>
<div class="exs">
${slider("p", `${esc(cfg.u)} price`, s.price)}
${slider("d", "Days left to expiry", Object.assign({ min: 0 }, s.days))}
${slider("v", "Implied volatility", s.iv, "the size of move the market is pricing in")}
</div>
<noscript><p class="fnote">The controls need JavaScript. The table below holds the same numbers.</p></noscript>
</div>${dataTable(t.head, t.rows)}`;
}

const KINDS = { bar, hbar, line, stack, timeline, flow, compare, quadrant, tiles, tape, scatter, explorer };

function render(spec, n) {
  const fn = KINDS[spec.kind];
  if (!fn) throw new Error(`unknown figure kind "${spec.kind}" (use: ${Object.keys(KINDS).join(", ")})`);
  const cap = `<figcaption><span class="fn">Figure ${n}</span><b>${inl(spec.title || "")}</b>${spec.sub ? `<span class="fs">${inl(spec.sub)}</span>` : ""}</figcaption>`;
  const src = spec.source ? `<span class="fsrc">Source: ${spec.sourceUrl ? `<a href="${esc(spec.sourceUrl)}" target="_blank" rel="noopener">${inl(spec.source)}</a>` : inl(spec.source)}</span>` : "";
  const note = spec.note || src ? `<p class="fnote">${spec.note ? inl(spec.note) + " " : ""}${src}</p>` : "";
  return `<figure class="fig k-${spec.kind}" id="fig-${n}">${cap}<div class="fbody">${fn(spec)}</div>${note}</figure>`;
}

// ---------- plain-text version for the vault
function mdTable(head, rows) {
  const cell = (c) => String(c == null ? "" : c).replace(/\|/g, "\\|");
  return `| ${head.map(cell).join(" | ")} |\n|${head.map((h, i) => (i ? "---:" : "---")).join("|")}|\n${rows.map((r) => `| ${r.map(cell).join(" | ")} |`).join("\n")}`;
}
function toMarkdown(spec, n) {
  const unit = spec.unit == null ? (spec.kind === "stack" ? "%" : "") : spec.unit;
  let body = "";
  if (spec.kind === "bar" || spec.kind === "line") {
    const series = spec.series || [{ name: spec.title, values: spec.values }];
    const signed = [].concat.apply([], series.map((r) => r.values)).some((v) => v < 0);
    body = mdTable([spec.xName || " "].concat(series.map((r) => r.name || "Value")), spec.x.map((lab, i) => [lab].concat(series.map((r) => fmt(r.values[i], unit, signed)))));
  } else if (spec.kind === "hbar") {
    const signed = spec.rows.some((r) => r[1] < 0);
    body = mdTable([" ", "Value"], spec.rows.map((r) => [r[0] + (r[2] ? ` (${r[2]})` : ""), fmt(r[1], unit, signed)]));
  } else if (spec.kind === "stack") {
    const bars = spec.bars || [{ name: "Share", parts: spec.parts }];
    const order = [];
    bars.forEach((b) => b.parts.forEach((p) => { if (order.indexOf(p[0]) < 0) order.push(p[0]); }));
    body = mdTable(["Part"].concat(bars.map((b) => b.name || "Share")), order.map((name) => [name].concat(bars.map((b) => { const p = b.parts.filter((q) => q[0] === name)[0]; return p ? fmt(p[1], unit) : "–"; }))));
  } else if (spec.kind === "timeline") {
    body = spec.events.map((e) => `- **${e[0]}** — ${e[1]}${e[2] ? ". " + e[2] : ""}`).join("\n");
  } else if (spec.kind === "flow") {
    body = spec.steps.map((e, i) => `${i + 1}. **${e[0]}**${e[1] ? " — " + e[1] : ""}`).join("\n");
  } else if (spec.kind === "compare") {
    body = spec.cols.map((c) => `**${c.title}**${c.tag ? ` (${c.tag})` : ""}\n${c.items.map((it) => `- ${it}`).join("\n")}`).join("\n\n");
  } else if (spec.kind === "quadrant") {
    const c = spec.cells;
    body = mdTable([" ", spec.xAxis[0], spec.xAxis[1]], [
      [spec.yAxis[0], `${c[0][0]}${c[0][1] ? ": " + c[0][1] : ""}`, `${c[1][0]}${c[1][1] ? ": " + c[1][1] : ""}`],
      [spec.yAxis[1], `${c[2][0]}${c[2][1] ? ": " + c[2][1] : ""}`, `${c[3][0]}${c[3][1] ? ": " + c[3][1] : ""}`],
    ]).replace(/---:/g, "---");
  } else if (spec.kind === "tape") {
    body = (spec.marks || []).length
      ? mdTable(["Mark", "When", "What"], spec.marks.map((m, k) => [String.fromCharCode(97 + k), m[3] || spec.x[m[0]], m[2]])).replace(/---:/g, "---")
      : "(Price chart: see the published post.)";
  } else if (spec.kind === "scatter") {
    body = `(Scatter of ${spec.yName || "y"} against ${spec.xName || "x"}, ${spec.points.length} points: see the published post.)`;
  } else if (spec.kind === "explorer") {
    const t = explorerTable(spec);
    body = mdTable(t.head, t.rows);
  } else if (spec.kind === "tiles") {
    body = spec.tiles.map((t) => `- **${t[0]}** — ${t[1]}${t[2] ? ` (${t[2]})` : ""}`).join("\n");
  }
  const tail = [spec.note, spec.source ? `Source: ${spec.sourceUrl ? `[${spec.source}](${spec.sourceUrl})` : spec.source}` : ""].filter(Boolean).join(" ");
  return `**Figure ${n}. ${spec.title || ""}**${spec.sub ? ` ${spec.sub}` : ""}\n\n${body}${tail ? `\n\n*${tail}*` : ""}`;
}

module.exports = { render, toMarkdown, esc, KINDS };
