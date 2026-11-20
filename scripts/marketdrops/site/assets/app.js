/* Anatomy of a Drop: page behaviour (menu, "studied" ticks kept in this browser only). */
(function () {
  var side = document.getElementById("side"), menu = document.getElementById("menu");
  if (menu) menu.addEventListener("click", function () { side.classList.toggle("open"); });
  document.addEventListener("click", function (e) { if (side.classList.contains("open") && !side.contains(e.target) && e.target !== menu) side.classList.remove("open"); });
  var KEY = "md-studied", read = {};
  try { read = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  function paint() { [].forEach.call(side.querySelectorAll("a[data-slug]"), function (a) { a.classList.toggle("read", !!read[a.getAttribute("data-slug")]); }); }
  var box = document.getElementById("studied"), slug = document.body.getAttribute("data-page");
  if (box) { box.checked = !!read[slug]; box.addEventListener("change", function () { if (box.checked) read[slug] = 1; else delete read[slug]; try { localStorage.setItem(KEY, JSON.stringify(read)); } catch (e) {} paint(); }); }
  paint();
  var on = side.querySelector("a.on"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "center" });
})();
