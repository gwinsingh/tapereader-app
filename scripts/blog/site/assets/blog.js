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
