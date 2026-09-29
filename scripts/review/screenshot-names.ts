/**
 * Pins the screenshot naming contract the app reads (web/lib/trade-journal/screenshot-names.ts)
 * against the names scripts/screenshots/Journal-Screenshots.ps1 writes. No network, no env.
 *
 *   node --experimental-strip-types scripts/review/screenshot-names.ts
 */
import {
  compareScreenshots, parseCaptureTime, parseScreenshotDetails, screenshotCaption,
} from "../../web/lib/trade-journal/screenshot-names.ts";

let failed = 0;
function check(what: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? "  ok  " : "  FAIL"} ${what}${ok ? "" : `\n        got:  ${JSON.stringify(got)}\n        want: ${JSON.stringify(want)}`}`);
}

const d = (name: string) => parseScreenshotDetails(name);
check("DAS step", d("2026-09-24 SOXL 3 AddSize ORB Long Screenshot (1121).png"),
  { source: "DAS", step: 3, sub: 0, time: null });
check("script-written Bookmap companion", d("2026-09-29 NVDA 2.2 Bookmap 09.43.00.png"),
  { source: "Bookmap", step: 2, sub: 2, time: "09:43:00" });
check("TradingView companion with action", d("2026-09-29 NVDA 2.1 TradingView AddSize 09.41.30.png"),
  { source: "TradingView", step: 2, sub: 1, time: "09:41:30" });
check("companion index 10 is not 1", d("2026-09-29 NVDA 2.10 Bookmap 10.00.00.png").sub, 10);
check("July hand-named Bookmap (Mac suffix)", d("2026-07-21 NBIS 4.1 Bookmap Screenshot 2026-07-21 at 9.52.47 AM.png"),
  { source: "Bookmap", step: 4, sub: 1, time: "09:52:47" });
check("Mac U+202F before PM", parseCaptureTime("x at 1.05.09 PM.png"), "13:05:09");
check("12 AM / 12 PM", [parseCaptureTime("at 12.00.01 AM"), parseCaptureTime("at 12.00.01 PM")], ["00:00:01", "12:00:01"]);
check("DAS EOD", d("2026-09-24 META EOD 2 Screenshot (1139).png"), { source: "DAS", step: null, sub: 0, time: null });
check("companion EOD", d("2026-09-29 NVDA EOD Bookmap 16.21.40.png"), { source: "Bookmap", step: null, sub: 0, time: "16:21:40" });
check("a symbol named TV is not TradingView", d("2026-09-29 TV 1 ORB Long Screenshot (5).png").source, "DAS");
check("a note saying TV is not TradingView", d("2026-09-29 NVDA 3 AddSize TV ORB Long Screenshot (5).png").source, "DAS");

const order = [
  "2026-09-29 NVDA EOD Screenshot (99).png",
  "2026-09-29 NVDA 10 AllOut ORB Long Screenshot (30).png",
  "2026-09-29 NVDA 2.1 TradingView AddSize 09.41.30.png",
  "2026-09-29 NVDA 2 AddSize ORB Long Screenshot (11).png",
  "2026-09-29 NVDA 0.1 Bookmap 09.12.03.png",
  "2026-09-29 NVDA 2.2 Bookmap 09.43.00.png",
].map((name) => ({ name, ...d(name) })).sort(compareScreenshots).map((f) => f.name.split(" ").slice(2, 4).join(" "));
check("order: numeric steps, companions after their step, unnumbered last", order,
  ["0.1 Bookmap", "2 AddSize", "2.1 TradingView", "2.2 Bookmap", "10 AllOut", "EOD Screenshot"]);

const eodOrder = ["2026-09-29 NVDA EOD Bookmap 16.21.40.png", "2026-09-29 NVDA EOD Screenshot (40).png"]
  .map((name) => ({ name, ...d(name) })).sort(compareScreenshots).map((f) => f.source);
check("EOD: the DAS shot leads", eodOrder, ["DAS", "Bookmap"]);

check("caption DAS", screenshotCaption("2026-09-24 SOXL 3 AddSize ORB Long Screenshot (1121).png"), "SOXL 3 AddSize ORB Long");
check("caption companion", screenshotCaption("2026-09-29 NVDA 2.2 Bookmap 09.43.00.png"), "NVDA 2.2 Bookmap · 09:43:00");
check("caption Mac suffix", screenshotCaption("2026-07-21 NBIS 4.1 Bookmap Screenshot 2026-07-21 at 9.52.47 AM.png"), "NBIS 4.1 Bookmap · 09:52:47");

if (failed) { console.log(`${failed} failed`); process.exit(1); }
console.log("all passed");
