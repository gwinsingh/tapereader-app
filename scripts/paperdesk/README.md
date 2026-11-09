# Paper Desk

Forward-tests setup systems on paper every trading day, unattended. Plain code scans, sizes, locks and
replays; an AI agent (Claude Code headless) only **selects and grades** candidates; a deterministic
**rules-only twin** trades the same candidates so the record shows whether the agent adds edge. No live orders.

Design + decisions: `docs/trade-journal/paper-desk-plan.md` · handoff: `docs/trade-journal/paper-desk-handoff.md`
(both local-only). Vault: `Paper Desk/`. Web: `/pct-bootcamp/paper-desk` (behind Cloudflare Access).

## Daily flow (`run-daily.cmd`, weekdays 06:45 ET)
1. Grouped daily bars through yesterday (RS cache read-only, own cache for gaps).
2. Replay every un-replayed session against its **locked** plan (`lib/replay.js`); 1-min bars only where the daily
   bar can't settle the order of events (`lib/session.js#needs1m`).
3. Scans (`lib/scan.js`) → rules-only orders (`lib/planner.js`, `lib/plan.js`) under portfolio limits.
4. Agent (`agent/run-agent.js`, prompt `agent/prompt-v<N>.md`) picks from the same candidates → validator → retry once
   → else `missing`/`failed` and the rules-only plan trades alone.
5. Lock (`lib/lock.js`): plan written once, SHA-256 into the append-only `.data/locks.log`. Deadline 09:25 ET;
   late plans are excluded; nothing is written after 09:30.
6. KV publish (`lib/publish.js`, ≤ 6 writes), vault pages (`lib/vault.js`), registry card, open Obsidian.

Saturday 09:00 ET: `run-weekly.cmd` → edge statuses (`.data/edge-status.json`) + Weekly Review.

## Commands
```
node --max-old-space-size=4000 scripts/paperdesk/run.js --dry           # full pipeline, nothing locked/saved
node --max-old-space-size=4000 scripts/paperdesk/probe.js               # scanners on the latest session
node scripts/paperdesk/test/replay.test.js                              # engine cases
node --max-old-space-size=6000 scripts/paperdesk/backtest.js            # one-time rules-only backtest (labeled)
node scripts/paperdesk/seed-library.js                                  # seeds systems/setups/exits (never overwrites)
```

## The library
- `systems/<id>.json` — one trader / source: `source` tag, vault study link, `regimeGate`, `universe` overlay,
  `sizing` (+ `riskBudgetR`), `maxPositions`, `gaps[]` (what the source didn't define and how it was filled).
- `setups/<id>.json` — one setup: `system`, `version`, `direction`, `scenario`, `scan {type, params}`,
  `entry` (`stop_entry` | `orh_break` + `dailyApprox`), `stop`, `exit` (scheme id), optional `lane: "ep"`.
- `exits/<id>.json` — reusable exit schemes: `trims` (`atR` or `afterSessions`, `stopTo`), `trail`
  (`close_below` / `close_above` / `adaptive`), `noProgress`, `pillars`, `timeStopSessions`, `earnings`.
- `proposals.json` — ideas waiting for the trader. Nothing there runs.

**Fork a setup:** copy the file, new `id`, `source: "own:..."` via an own system (or the same system), `version: 1`.
Both run side by side; the edge board decides.

## Adding a trader's system
1. Distil the trader's rules into the vault study first (`Studies/10 Systems/<Trader> — <System>/… System Rules`).
2. `systems/<id>.json`: source tag, `vault` link, the trader's market gate (add a case to `gateOpen` in
   `lib/scan.js` if none of `any | not_downtrend | ml_index | jlaw_threshold | weekly_below_9` fits),
   universe overlay, sizing/risk budget, `gaps[]`.
3. One `setups/*.json` per setup. Reuse a scanner (`ema_pullback`, `tight_base`, `high52_breakout`,
   `post_earnings_drift`, `washout`, `ma50_first_pullback_short`, `parabolic_index`, `ep_earnings`) with the
   trader's params; add a scanner to `lib/scan.js` only when none fits. Every field must resolve from price data.
4. An exit scheme in `exits/` if the trader's exits differ.
5. `node scripts/paperdesk/probe.js` → check candidates; `run.js --dry` → check the plan page.
6. It enters the forward record from the next locked plan; optionally re-run `backtest.js` for its backtest row.
