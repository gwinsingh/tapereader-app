#!/usr/bin/env node
/**
 * Social-attention ingest driver.  See docs/social-sentiment/00-brief.md §5.
 *
 * Runs in GitHub Actions (plain Node, no dependencies).  It exists because of
 * one measured fact: ApeWisdom exposes NO retrievable history.  There is no
 * date parameter and no archive — `?date=` silently returns the current
 * payload.  Every day this does not run is a day of crowd-attention data that
 * cannot be bought back at any price.  That is the whole argument for starting
 * collection before the research that justifies it has finished.
 *
 * Storage is NDJSON committed to the repo, deliberately, NOT D1:
 *   - `market_db` does not exist yet (wrangler.toml still has a TODO id)
 *   - D1's free tier caps row writes at 100k/day
 *   - a committed snapshot is free, permanently historical, trivially
 *     auditable, and imports into D1 later in a single pass
 * Measured cost: ~7.6 KB gzipped per ApeWisdom snapshot, ~11 MB/year at 4x/day.
 *
 * Sources (both keyless — no account, no API key, nothing to sign up for):
 *   apewisdom  breadth + freshness, zero history  -> snapshot forward only
 *   tradestie  real history to ~2021-03-20        -> daily + one-shot backfill
 *
 * Usage:
 *   node scripts/social-ingest.mjs --source apewisdom
 *   node scripts/social-ingest.mjs --source tradestie
 *   node scripts/social-ingest.mjs --source tradestie --backfill --start 03-20-2021
 *   node scripts/social-ingest.mjs --source all
 *   node scripts/social-ingest.mjs --source apewisdom --dry-run
 *
 * Env: none.  That is the point.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'data', 'social');

// A browser-ish UA is required, not cosmetic: tradestie.com returns HTTP 403 to
// the default Python-urllib UA, and undeclared UAs are a common soft block.
const UA = 'tapereader-social-ingest/1.0 (+https://tapereader.us)';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Current time in the US Eastern trading day, as {date:'YYYY-MM-DD', hhmm:'HH:MM'}. */
function nowET() {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hhmm: `${p.hour}:${p.minute}` };
}

/**
 * Which of the day's four capture slots we are in.  Snapshots are bucketed so a
 * re-run inside the same slot is a no-op rather than a duplicate row — that is
 * the entire idempotency mechanism, and it survives Actions retries.
 *
 * Slots track the trading day, not the clock:
 *   prior_close  16:05 ET  yesterday's close state
 *   premarket    09:15 ET  attention state AT SETUP TIME -- the H5 signal
 *   midday       12:30 ET
 *   evening      20:00 ET
 */
function slotFor(hhmm) {
  const m = Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
  if (m < 11 * 60) return 'premarket';
  if (m < 15 * 60) return 'midday';
  if (m < 18 * 60) return 'prior_close';
  return 'evening';
}

async function getJSON(url, { retries = 3 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) return { ok: false, status: res.status };
      return { ok: true, status: res.status, body: await res.json() };
    } catch (err) {
      if (attempt > retries) return { ok: false, status: 0, error: String(err) };
      await sleep(1000 * 2 ** attempt);
    }
  }
}

/** Append records, skipping any (source, scope, slot) already present for that date. */
async function append(source, date, records) {
  if (!records.length) return { written: 0, skipped: 0 };
  const file = path.join(OUT, source, date.slice(0, 4), `${date}.ndjson`);
  await mkdir(path.dirname(file), { recursive: true });

  const seen = new Set();
  if (existsSync(file)) {
    const existing = await readFile(file, 'utf8');
    for (const line of existing.split('\n')) {
      if (!line.trim()) continue;
      try {
        const r = JSON.parse(line);
        seen.add(`${r.scope}|${r.slot}`);
      } catch { /* a torn final line must never block today's write */ }
    }
  }

  const fresh = records.filter((r) => !seen.has(`${r.scope}|${r.slot}`));
  if (!fresh.length) return { written: 0, skipped: records.length };

  const payload = fresh.map((r) => JSON.stringify(r)).join('\n') + '\n';
  await writeFile(file, payload, { flag: 'a' });
  return { written: fresh.length, skipped: records.length - fresh.length, file };
}

// ---------------------------------------------------------------------------
// adapters
// ---------------------------------------------------------------------------

/**
 * ApeWisdom.  Six filters, paged 100/page.
 *
 * `mentions` was measured to be a ROLLING TRAILING-24H count, not a daily
 * total -- values fall as well as rise.  This is undocumented and it matters:
 * snapshots must not be differenced as if they were cumulative counters.  It is
 * also what makes the 09:15 ET slot a genuine pre-market attention state.
 *
 * `mentions_24h_ago` is kept NULL rather than coerced to 0.  Null means "not
 * ranked 24h ago" = a new entrant, which is precisely the fresh-discovery
 * population (brief §D, H3).  Collapsing it to 0 destroys that signal.
 */
const APEWISDOM_FILTERS = ['all-stocks', 'wallstreetbets', 'stocks', 'Daytrading', 'options', 'pennystocks'];

async function apewisdom({ dryRun }) {
  const { date, hhmm } = nowET();
  const slot = slotFor(hhmm);
  const capturedAt = new Date().toISOString();
  const records = [];

  for (const filter of APEWISDOM_FILTERS) {
    let page = 1, pages = 1;
    do {
      const url = `https://apewisdom.io/api/v1.0/filter/${filter}/page/${page}`;
      const res = await getJSON(url);
      if (!res.ok) { console.error(`  ${filter} p${page}: FAILED (${res.status})`); break; }
      pages = res.body.pages ?? 1;
      for (const row of res.body.results ?? []) {
        records.push({
          source: 'apewisdom',
          scope: filter,
          slot,
          date,
          captured_at: capturedAt,
          ticker: row.ticker,
          name: row.name,           // stored raw; contains HTML entities (S&amp;P)
          rank: row.rank,
          mentions: row.mentions,
          upvotes: row.upvotes,
          // null, never 0 -- see the note above
          rank_24h_ago: row.rank_24h_ago ?? null,
          mentions_24h_ago: row.mentions_24h_ago ?? null,
        });
      }
      page++;
      await sleep(400);
    } while (page <= pages);
    console.log(`  ${filter}: ${records.filter((r) => r.scope === filter).length} rows`);
  }

  if (dryRun) { console.log(`DRY RUN: ${records.length} rows for ${date} slot=${slot}`); return; }
  const r = await append('apewisdom', date, records);
  console.log(`apewisdom ${date} slot=${slot}: wrote ${r.written}, skipped ${r.skipped}`);
}

/**
 * Tradestie (r/wallstreetbets daily).
 *
 * CRITICAL, MEASURED: `sentiment` and `sentiment_score` are NOT persisted.
 * Across 480 tickers over 37 dates spanning 5.4 years there is ZERO
 * within-ticker variation -- TSLA is 0.381 on all 30 dates it appears, NVDA
 * 0.106 on all 27.  It is a static per-ticker constant stamped onto every date,
 * despite docs claiming a 15-minute recompute.  Storing it would introduce
 * silent look-ahead bias into every downstream study.  Only `no_of_comments`
 * and rank carry date-varying signal, so only those are kept.
 *
 * Host note: use tradestie.com, NOT the documented api.tradestie.com, whose TLS
 * certificate expired 2026-01-03.
 */
async function tradestie({ dryRun, backfill, start }) {
  const dates = [];
  if (backfill) {
    // start is MM-DD-YYYY to match the API's own parameter format
    const [sm, sd, sy] = start.split('-').map(Number);
    for (let d = new Date(Date.UTC(sy, sm - 1, sd)); d <= new Date(); d.setUTCDate(d.getUTCDate() + 1)) {
      const day = d.getUTCDay();
      if (day === 0 || day === 6) continue; // weekends are empty
      dates.push(d.toISOString().slice(0, 10));
    }
  } else {
    dates.push(nowET().date);
  }

  console.log(`tradestie: ${dates.length} date(s)`);
  let totalWritten = 0;

  for (const iso of dates) {
    const [y, m, d] = iso.split('-');
    const url = `https://tradestie.com/api/v1/apps/reddit?date=${m}-${d}-${y}`;
    const res = await getJSON(url);
    if (!res.ok) { console.error(`  ${iso}: FAILED (${res.status})`); await sleep(3200); continue; }

    const rows = Array.isArray(res.body) ? res.body : [];
    const records = rows.map((row, i) => ({
      source: 'tradestie',
      scope: 'wallstreetbets',
      slot: 'daily',
      date: iso,
      captured_at: new Date().toISOString(),
      ticker: row.ticker,
      rank: i + 1,
      no_of_comments: row.no_of_comments,
      // sentiment / sentiment_score deliberately omitted -- see the note above
    }));

    if (!dryRun && records.length) {
      const r = await append('tradestie', iso, records);
      totalWritten += r.written;
    }
    if (rows.length) console.log(`  ${iso}: ${rows.length} rows`);
    await sleep(3200); // stay under the ~20 req/min ceiling
  }
  console.log(`tradestie: wrote ${totalWritten} rows${dryRun ? ' (DRY RUN: 0)' : ''}`);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : (argv[i + 1]?.startsWith('--') ? true : argv[i + 1]) ?? true;
};

const source = arg('source', 'all');
const opts = {
  dryRun: argv.includes('--dry-run'),
  backfill: argv.includes('--backfill'),
  start: arg('start', '03-20-2021'),
};

if (source === 'apewisdom' || source === 'all') await apewisdom(opts);
if (source === 'tradestie' || source === 'all') await tradestie(opts);
