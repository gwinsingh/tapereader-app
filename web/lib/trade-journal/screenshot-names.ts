/**
 * Screenshot filename conventions, shared by the Drive index (server) and the
 * Screenshot Review / calendar galleries (client). Pure — no fetch, no env.
 *
 * The name is the whole contract: scripts/screenshots/Journal-Screenshots.ps1 writes it,
 * google-drive.ts indexes by its first two tokens (date, symbol), and this module reads
 * the rest (step, companion index, source app, capture time).
 */

/** Which app took the screenshot — read from the name, DAS when nothing says otherwise. */
export type ScreenshotSource = "DAS" | "Bookmap" | "TradingView";

/**
 * The rest of the naming contract (scripts/screenshots/Journal-Screenshots.ps1), which
 * orders a symbol's screenshots and pairs companion shots from other apps with the DAS
 * shot they belong to:
 *
 *   2026-07-21 NBIS 4 ORB Long Screenshot (605).png                          DAS, step 4
 *   2026-07-21 NBIS 4.1 Bookmap Screenshot 2026-07-21 at 9.52.47 AM.png      Bookmap, 4.1
 *   2026-07-21 NBIS 4.2 TradingView AddSize 09.53.10.png                     TradingView, 4.2
 *
 * Tokens before the step are fixed (date, symbol); the source is a whole word anywhere
 * after it, since older hand-named files put it in different places.
 */
export function parseScreenshotDetails(name: string): {
  source: ScreenshotSource;
  step: number | null;
  sub: number;
  time: string | null;
} {
  const tokens = name.replace(/\.[a-z]+$/i, "").split(/\s+/);
  const words = tokens.slice(2).map((t) => t.toUpperCase());
  const source: ScreenshotSource = words.includes("BOOKMAP")
    ? "Bookmap"
    : words.includes("TRADINGVIEW") // the full word only: "TV" could be a note on a DAS shot
      ? "TradingView"
      : "DAS";

  let step: number | null = null;
  let sub = 0;
  const stepMatch = tokens[2]?.match(/^(\d+)(?:\.(\d+))?$/);
  if (stepMatch) {
    step = parseInt(stepMatch[1], 10);
    sub = stepMatch[2] ? parseInt(stepMatch[2], 10) : 0;
  }

  return { source, step, sub, time: parseCaptureTime(name) };
}

/**
 * Capture time carried in the name, as HH:MM:SS (24h). Two shapes:
 *   macOS    "… at 9.52.47 AM"  (U+202F or a plain space before AM/PM)
 *   pipeline "… 09.53.10"       (24h, what the script writes for TradingView shots)
 */
export function parseCaptureTime(name: string): string | null {
  const pad = (n: number) => String(n).padStart(2, "0");
  const mac = name.match(/\bat (\d{1,2})\.(\d{2})\.(\d{2})[\s ]*([AP]M)\b/i);
  if (mac) {
    let h = parseInt(mac[1], 10) % 12;
    if (mac[4].toUpperCase() === "PM") h += 12;
    return `${pad(h)}:${mac[2]}:${mac[3]}`;
  }
  const h24 = name.match(/\b([01]\d|2[0-3])\.([0-5]\d)\.([0-5]\d)\b/);
  return h24 ? `${h24[1]}:${h24[2]}:${h24[3]}` : null;
}

/**
 * Orders one symbol's shots so each DAS step is followed by its Bookmap/TradingView
 * companions: step, then companion index, then DAS before other apps (EOD shots have no
 * step), then name. Numeric, so step 10 sorts after 9 (Drive's name order puts "10"
 * before "2").
 */
export function compareScreenshots(
  a: { step: number | null; sub: number; name: string; source?: ScreenshotSource },
  b: { step: number | null; sub: number; name: string; source?: ScreenshotSource }
): number {
  const sa = a.step ?? Number.MAX_SAFE_INTEGER;
  const sb = b.step ?? Number.MAX_SAFE_INTEGER;
  if (sa !== sb) return sa - sb;
  if (a.sub !== b.sub) return a.sub - b.sub;
  const da = a.source && a.source !== "DAS" ? 1 : 0;
  const db = b.source && b.source !== "DAS" ? 1 : 0;
  if (da !== db) return da - db;
  return a.name.localeCompare(b.name);
}

/**
 * Short thumbnail caption: drops the date (shown on the card already) and the
 * uniqueness suffixes ("Screenshot (1121)", the Mac's "Screenshot 2026-07-21 at …"),
 * and appends the capture time when the name carries one.
 */
export function screenshotCaption(name: string): string {
  const time = parseCaptureTime(name);
  const core = name
    .replace(/\.(png|jpe?g|gif|webp)$/i, "")
    .replace(/^\d{4}-\d{2}-\d{2}\s*/, "")
    .replace(/\s*Screenshot \(\d+\)/i, "")
    .replace(/\s*Screenshot \d{4}-\d{2}-\d{2} at [\d.]+[\s\u202f]*[AP]M/i, "")
    .replace(/\s*\b([01]\d|2[0-3])\.[0-5]\d\.[0-5]\d\b/, "")
    .replace(/\s+/g, " ")
    .trim();
  const label = time ? `${core} · ${time}` : core;
  return label || name;
}
