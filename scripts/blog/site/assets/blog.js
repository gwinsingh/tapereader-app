// TapeReader Research Notes: theme switch, tag filter, chart read-outs, table-of-contents highlight. No dependencies.
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var $ = function (s, el) { return (el || doc).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); };

  // ---- light / dark
  var btn = $(".theme");
  if (btn) btn.addEventListener("click", function () {
    var now = root.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = now === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("blog-theme", next); } catch (e) {}
  });

  // ---- tag filter on the index
  var chips = $$(".chip");
  if (chips.length) {
    var apply = function (tag) {
      var shown = 0;
      $$(".row").forEach(function (r) {
        var ok = !tag || (" " + r.getAttribute("data-tags") + " ").indexOf(" " + tag + " ") >= 0;
        r.hidden = !ok;
        if (ok) shown++;
      });
      $$(".year").forEach(function (y) { y.hidden = !$$(".row", y).some(function (r) { return !r.hidden; }); });
      chips.forEach(function (c) { c.classList.toggle("on", c.getAttribute("data-tag") === tag); });
      var empty = $(".empty");
      if (empty) empty.hidden = shown > 0;
    };
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var t = c.getAttribute("data-tag");
        apply(t);
        try { history.replaceState(null, "", t ? "#tag=" + t : location.pathname); } catch (e) {}
      });
    });
    var m = /^#tag=([\w-]+)$/.exec(location.hash);
    if (m) apply(m[1]);
  }

  // ---- tooltips
  var tip = $("#tip");
  function place(x, y) {
    tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight, vw = window.innerWidth;
    var left = Math.min(Math.max(8, x - w / 2), vw - w - 8);
    var top = y - h - 14;
    if (top < 8) top = y + 18;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  function hide() { if (tip) tip.hidden = true; }
  if (tip) {
    doc.addEventListener("pointerover", function (e) {
      var t = e.target.closest && e.target.closest("[data-tip]");
      if (!t) return;
      tip.textContent = t.getAttribute("data-tip");
      var r = t.getBoundingClientRect();
      place(r.left + r.width / 2, r.top);
    });
    doc.addEventListener("pointerout", function (e) { if (e.target.closest && e.target.closest("[data-tip]")) hide(); });
    doc.addEventListener("focusin", function (e) {
      var t = e.target.closest && e.target.closest("[data-tip]");
      if (!t) return;
      tip.textContent = t.getAttribute("data-tip");
      var r = t.getBoundingClientRect();
      place(r.left + r.width / 2, r.top);
    });
    doc.addEventListener("focusout", hide);
    window.addEventListener("scroll", hide, { passive: true });
  }

  // ---- line charts: crosshair with every series' value at the nearest point
  function fmt(v, u, sg) {
    if (v == null) return "n/a";
    var a = Math.abs(v), d = a >= 100 ? 0 : a >= 1 ? 1 : 2;
    var s = a.toFixed(d).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var pre = /^[$£€]/.test(u) ? u[0] : "", post = pre ? u.slice(1) : u;
    return (v < 0 ? "−" : sg && v > 0 ? "+" : "") + pre + s + (post.length > 2 ? " " + post : post);
  }
  $$(".chart.line").forEach(function (ch) {
    var data;
    try { data = JSON.parse(ch.getAttribute("data-line")); } catch (e) { return; }
    var plot = $(".plot", ch), cross = $(".cross", ch), n = data.x.length;
    function move(e) {
      var r = plot.getBoundingClientRect();
      var f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      var i = Math.round(f * (n - 1));
      cross.hidden = false;
      cross.style.left = (n === 1 ? 50 : (i / (n - 1)) * 100) + "%";
      var html = "<b>" + data.x[i] + "</b>";
      data.s.forEach(function (s, j) {
        html += '<div class="r"><span>' + (data.s.length > 1 ? '<i class="sw s' + (j + 1) + '"></i>' : "") + (s.n || "") + "</span><b>" + fmt(s.v[i], data.u || "", data.sg) + "</b></div>";
      });
      tip.innerHTML = html;
      place(r.left + (n === 1 ? 0.5 : i / (n - 1)) * r.width, r.top + 10);
    }
    plot.addEventListener("pointermove", move);
    plot.addEventListener("pointerdown", move);
    plot.addEventListener("pointerleave", function () { cross.hidden = true; hide(); });
  });

  // ---- tape charts: one crosshair across every panel, with each panel's values at that bar
  $$(".chart.tape").forEach(function (ch) {
    var data;
    try { data = JSON.parse(ch.getAttribute("data-tape")); } catch (e) { return; }
    var plots = $$(".plot", ch), n = data.x.length;
    var money = function (v, u, d) { return v == null ? "n/a" : (u === "$" ? "$" : "") + v.toFixed(d) + (u && u !== "$" ? u : ""); };
    function move(e) {
      var r = e.currentTarget.getBoundingClientRect();
      var i = Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * n)));
      plots.forEach(function (p) { var c = $(".cross", p); c.hidden = false; c.style.left = ((i + 0.5) / n) * 100 + "%"; });
      var html = "<b>" + data.x[i] + "</b>";
      data.p.forEach(function (p) {
        var c = p.c && p.c[i];
        if (c) {
          html += '<div class="r"><span>' + p.n + " close</span><b>" + money(c[3], p.u, p.d) + "</b></div>";
          html += '<div class="r"><span>low to high</span><b>' + money(c[2], p.u, p.d) + " – " + money(c[1], p.u, p.d) + "</b></div>";
        }
        p.l.forEach(function (l) {
          if (l.v[i] == null) return;
          html += '<div class="r"><span><i class="sw s' + l.k + '"></i>' + l.n + "</span><b>" + money(l.v[i], p.u, p.d) + "</b></div>";
        });
      });
      tip.innerHTML = html;
      place(r.left + ((i + 0.5) / n) * r.width, r.top + 10);
    }
    plots.forEach(function (p) {
      p.addEventListener("pointermove", move);
      p.addEventListener("pointerdown", move);
      p.addEventListener("pointerleave", function () { plots.forEach(function (q) { $(".cross", q).hidden = true; }); hide(); });
    });
  });

  // ---- option explorer: a Black-Scholes pricer driven by three sliders
  function ncdf(x) {
    var t = 1 / (1 + 0.2316419 * Math.abs(x));
    var d = 0.3989422804014327 * Math.exp((-x * x) / 2);
    var p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x >= 0 ? 1 - p : p;
  }
  function bs(S, K, days, ivPct, r, put) {
    var T = Math.max(days, 0) / 365, v = ivPct / 100;
    if (T <= 0 || v <= 0) return Math.max(put ? K - S : S - K, 0);
    var sd = v * Math.sqrt(T), d1 = (Math.log(S / K) + (r + (v * v) / 2) * T) / sd, d2 = d1 - sd;
    return put ? K * Math.exp(-r * T) * ncdf(-d2) - S * ncdf(-d1) : S * ncdf(d1) - K * Math.exp(-r * T) * ncdf(d2);
  }
  function steps(lo, hi, target) {
    var raw = (hi - lo) / target, mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / mag;
    var st = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag, out = [];
    for (var t = Math.ceil(lo / st - 1e-9) * st; t <= hi + st / 1e6; t += st) out.push(+t.toFixed(8));
    return out;
  }
  function commas(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function dollars(v) {
    var a = Math.abs(v), s = a >= 1e6 ? "$" + (a / 1e6).toFixed(2) + "M" : a >= 100 ? "$" + commas(a) : "$" + a.toFixed(2);
    return (v < 0 ? "−" : "") + s;
  }
  $$(".ex").forEach(function (ex) {
    var c;
    try { c = JSON.parse(ex.getAttribute("data-ex")); } catch (e) { return; }
    var put = c.t === "put", plot = $(".plot", ex), x0 = c.p.min, x1 = c.p.max;
    var inp = {}, out = {}, R = {}, P = {};
    $$("input[data-i]", ex).forEach(function (el) { inp[el.getAttribute("data-i")] = el; });
    $$("[data-o]", ex).forEach(function (el) { out[el.getAttribute("data-o")] = el; });
    $$("[data-r]", ex).forEach(function (el) { R[el.getAttribute("data-r")] = el; });
    $$("path[data-c]", ex).forEach(function (el) { P[el.getAttribute("data-c")] = el; });
    var ymax = c.ymax || 1.08 * Math.max(bs(put ? x0 : x1, c.k, c.d.max, c.v.value, c.r, put), 0.05);
    var px = function (S) { return ((S - x0) / (x1 - x0)) * 100; };
    var py = function (v) { return (Math.min(v, ymax * 1.5) / ymax) * 100; };
    var two = function (v) { return "$" + v.toFixed(2); };
    $(".exgrid", ex).innerHTML = steps(0, ymax, 4).map(function (t) { return '<div class="g" style="bottom:' + py(t) + '%"><span>' + (ymax >= 20 ? "$" + t : two(t)) + "</span></div>"; }).join("");
    $(".xaxis", ex).innerHTML = steps(x0, x1, 6).map(function (t) { return '<span style="left:' + px(t) + '%">$' + t + "</span>"; }).join("");
    var k = $(".exk", ex);
    if (c.k > x0 && c.k < x1) k.style.left = px(c.k) + "%"; else k.hidden = true;
    var cost = $(".excost", ex);
    if (c.c != null && c.c < ymax) { cost.hidden = false; cost.style.bottom = py(c.c) + "%"; $("span", cost).textContent = "paid " + two(c.c); }
    function path(days, iv) {
      var d = "";
      for (var j = 0; j <= 90; j++) {
        var S = x0 + ((x1 - x0) * j) / 90;
        d += (j ? "L" : "M") + px(S).toFixed(2) + " " + (100 - py(bs(S, c.k, days, iv, c.r, put))).toFixed(2);
      }
      return d;
    }
    function draw() {
      var S = +inp.p.value, D = +inp.d.value, V = +inp.v.value, D1 = Math.max(D - 1, 0);
      P.now.setAttribute("d", path(D, V));
      P.next.setAttribute("d", path(D1, V));
      P.exp.setAttribute("d", path(0, V));
      var price = bs(S, c.k, D, V, c.r, put), next = bs(S, c.k, D1, V, c.r, put);
      var delta = (bs(S + 0.05, c.k, D, V, c.r, put) - bs(S - 0.05, c.k, D, V, c.r, put)) / 0.1;
      var shares = delta * c.n * 100, value = price * 100 * c.n;
      var m = $(".exm", ex);
      m.style.left = px(S) + "%";
      $("i", m).style.bottom = Math.min(py(price), 100) + "%";
      out.p.textContent = two(S);
      out.d.textContent = D <= 0 ? "expiry" : D.toFixed(2).replace(/\.?0+$/, "") + (D === 1 ? " day" : " days");
      out.v.textContent = V + "%";
      if (out.vn) out.vn.textContent = "prices a typical move of about " + (V / 15.87).toFixed(1) + "% a day";
      R.px.textContent = two(price);
      R.pxn.textContent = "per share, so " + dollars(price * 100) + " a contract";
      R.val.textContent = dollars(value);
      if (c.c != null) {
        var pl = value - c.c * 100 * c.n;
        R.pl.textContent = (pl >= 0 ? "+" : "") + dollars(pl) + " against " + dollars(c.c * 100 * c.n) + " paid";
        R.pl.className = pl >= 0 ? "gain" : "loss";
      } else R.pl.textContent = "worth now";
      R.sh.textContent = commas(Math.abs(shares)) + " shares";
      R.shn.textContent = (shares < 0 ? "short" : "long") + ", about " + dollars(Math.abs(shares) * S) + " of stock";
      R.th.textContent = dollars((next - price) * 100 * c.n);
      R.thn.textContent = D <= 0 ? "nothing left to decay" : price > 0.005 ? Math.round(((price - next) / price) * 100) + "% of what it is worth now" : "almost nothing left";
    }
    function setFrom(e) {
      var r = plot.getBoundingClientRect();
      var S = x0 + Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (x1 - x0);
      inp.p.value = S;
      clear();
      draw();
    }
    var btns = $$(".exb", ex);
    function clear() { btns.forEach(function (b) { b.classList.remove("on"); }); }
    plot.addEventListener("pointerdown", function (e) { try { plot.setPointerCapture(e.pointerId); } catch (err) {} setFrom(e); });
    plot.addEventListener("pointermove", function (e) { if (e.buttons & 1) setFrom(e); });
    ["p", "d", "v"].forEach(function (id) { inp[id].addEventListener("input", function () { clear(); draw(); }); });
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        inp.p.value = b.getAttribute("data-p"); inp.d.value = b.getAttribute("data-d"); inp.v.value = b.getAttribute("data-v");
        clear(); b.classList.add("on"); draw();
      });
    });
    if (btns.length) btns[0].classList.add("on");
    draw();
  });

  // ---- table of contents: mark the section being read
  var links = $$(".toc a");
  if (links.length) {
    var heads = links.map(function (a) { return { a: a, el: doc.getElementById(a.getAttribute("href").slice(1)) }; }).filter(function (h) { return h.el; });
    var current = null, queued = false;
    var mark = function () {
      queued = false;
      var hit = null;
      heads.forEach(function (h) { if (h.el.getBoundingClientRect().top < 140) hit = h.a; });
      if (hit === current) return;
      if (current) current.classList.remove("on");
      current = hit;
      if (current) current.classList.add("on");
    };
    window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
    if (window.matchMedia("(max-width: 999px)").matches) { var d = $(".toc details"); if (d) d.open = false; }
  }
})();
