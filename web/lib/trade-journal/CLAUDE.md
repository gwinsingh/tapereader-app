# Trade Journal Module

## Overview
Processes DAS Trader CSV exports into round-trip trades and writes them to Google Sheets. Runs on Cloudflare edge runtime — no Node.js APIs.

## CSV format (DAS Trader)
Headers: `Event,B/S,Symbol,Shares,Price,Route,Time,Account,Note`
Only rows where `Event === "Execute"` are processed. Everything else (Accept, Cancel, etc.) is filtered out.

## Trade grouping algorithm
Position tracking: Buy = +shares, Sell/Shrt = -shares. When cumulative position returns to 0, that's one complete round-trip trade. The grouper handles multiple partial fills and computes volume-weighted average entry/exit prices.

## Google Sheets API (edge-compatible)
No `googleapis` SDK. All calls use `fetch` directly against `https://sheets.googleapis.com/v4/spreadsheets`.

Auth flow:
1. Parse service account JSON from env var
2. Build JWT with `iss`, `scope`, `aud`, `iat`, `exp`
3. Sign with Web Crypto API (`RSASSA-PKCS1-v1_5` / `SHA-256`)
4. Exchange JWT for access token at `https://oauth2.googleapis.com/token`

Key functions:
- `getAccessToken()` — JWT-based OAuth2 service account auth
- `ensureSheetTab()` — finds or creates a tab for the account, applies formatting
- `appendTrades()` — main entry point: dedup, append, compute stats
- `populateInstructionsSheet()` — one-shot: writes column reference to Instructions tab

## Column layout (20 columns, A-T)
Auto-filled: Date, Entry Time, Exit Time, Duration, Symbol, Side, Shares, Avg Entry, Avg Exit, # Partials, P&L, P&L(R) (formula).
Per-trade manual: R (Risk), Setup (dropdown), Process Followed? (dropdown), Notes.
Daily manual (fill once on first trade of the day): Sleep Score (0-100), Readiness Score (0-100), Emotional State (dropdown: Calm/Anxious/Excited/Frustrated/Fatigued), Market Bias (dropdown: Bullish/Bearish/Neutral).

## Dedup
Key: `Date|Symbol|normalizedEntryTime|Side`. Times are normalized (leading zeros stripped) because Google Sheets drops them (e.g., `09:30:46` → `9:30:46`).

## Known gotchas
- `Infinity` → use `9999` sentinel (JSON.stringify turns Infinity into null)
- Time normalization is critical for dedup — always strip leading zeros before comparison
- Google Sheets currency columns return values like `$32.21` — strip `$` and `,` when parsing P&L values back
