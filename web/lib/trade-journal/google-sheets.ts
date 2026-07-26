import { GroupedTrade } from "./trade-grouper";
import { MarketEnrichment, fetchVixMap } from "./market-data";

const SHEET_HEADERS = [
  "Date",
  "Entry Time",
  "Exit Time",
  "Duration (mins)",
  "Symbol",
  "Side",
  "Shares",
  "Avg Entry",
  "Avg Exit",
  "Stop",
  "# Partials",
  "P&L",
  "R (Risk)",
  "P&L (R)",
  "Setup",
  "Process Followed?",
  "Notes",
  "Sleep Score",
  "Readiness Score",
  "Emotional State",
  "Market Bias",
  "Conviction (1-3)",
  "Catalyst",
  "Tags",
  "Max R Before Stop",
  "Farthest Price",
  "1R",
  "2R",
  "3R",
  "4R",
  "5R",
  "6R",
  "#1m",
  "#5m",
  "#1H",
  "%Gap",
  "%ATR",
  "RVOL",
  "%VWAP",
  "OR Size ($)",
  "OR %ATR",
  "OR High",
  "OR Low",
  "Breakout Vol Ratio",
  "Prior Close Loc",
  "Dist 20 SMA (%)",
  "Dist 50 SMA (%)",
  "Float",
  "Avg $ Vol",
  "SPY Dir",
  "VIX",
  "PDC",
  "PDH",
  "PDL",
  "Origin",
  "L2 Bias",
  "Daily Trend",
  "Daily Conv",
  "1H Trend",
  "1H Conv",
  "5m Trend",
  "5m Conv",
  // Appended at the end (matching how migration extends existing tabs) so the
  // positional COL map above stays valid — do not insert new headers mid-list.
  "MAE (R)",
  "Energy (1-5)",
  "Tension (1-5)",
  "Urge to Trade Fast?",
  // Trade-date daily candle (raw OHLCV) + volatility references. Header strings
  // match the manually-created columns on the live sheet exactly, so migration
  // treats them as already-present (no duplicate columns). Appended at the end
  // like everything above — never insert mid-list (keeps the COL map valid).
  "O",
  "H",
  "L",
  "C",
  "V",
  "ATR",
  "30mATR",
  // Sleep duration (hours slept) — a NEW day-level column, appended at the end
  // like everything above so the positional COL map stays valid. Sleep Score /
  // Readiness Score already exist near the top of this list and are NOT
  // re-added. Auto-filled from the Morning Plan check-in (see DAY_FILL_COLS).
  "Sleep (hrs)",
  // Average Daily Range ($) — mean of (High - Low) over the 14 sessions BEFORE
  // the trade date. Gap-free sibling of ATR (which is true range, so it counts
  // overnight gaps a post-open day trade can't capture). Yardstick for the Daily
  // Prediction metric. Appended at the very end like everything above so the
  // positional COL map stays valid. (Column already added to the live sheet.)
  "ADR",
];

const COL = {
  DATE: 0,
  ENTRY_TIME: 1,
  EXIT_TIME: 2,
  DURATION: 3,
  SYMBOL: 4,
  SIDE: 5,
  SHARES: 6,
  AVG_ENTRY: 7,
  AVG_EXIT: 8,
  STOP: 9,
  PARTIALS: 10,
  PNL: 11,
  RISK: 12,
  PNL_R: 13,
  SETUP: 14,
  PROCESS: 15,
  NOTES: 16,
  SLEEP: 17,
  READINESS: 18,
  EMOTIONAL: 19,
  BIAS: 20,
  CONVICTION: 21,
  CATALYST: 22,
  TAGS: 23,
  MAX_R_BEFORE_STOP: 24,
  FARTHEST_PRICE: 25,
  R1: 26,
  R2: 27,
  R3: 28,
  R4: 29,
  R5: 30,
  R6: 31,
  CONSEC_1M: 32,
  CONSEC_5M: 33,
  CONSEC_1H: 34,
  GAP_PCT: 35,
  ATR_PCT: 36,
  RVOL: 37,
  VWAP_PCT: 38,
  OR_SIZE: 39,
  OR_ATR_PCT: 40,
  OR_HIGH: 41,
  OR_LOW: 42,
  BREAKOUT_VOL: 43,
  PRIOR_CLOSE_LOC: 44,
  DIST_20_SMA: 45,
  DIST_50_SMA: 46,
  FLOAT: 47,
  AVG_DOLLAR_VOL: 48,
  SPY_DIR: 49,
  VIX_LEVEL: 50,
} as const;

// --- Dynamic column mapping (handles user-reordered sheets) ---

type ColMap = { [headerName: string]: number };

function buildColMap(headerRow: string[]): ColMap {
  const map: ColMap = {};
  headerRow.forEach((h, i) => { map[h.trim()] = i; });
  return map;
}

function cm(map: ColMap, header: string): number {
  return map[header] ?? -1;
}

function colLetter(index: number): string {
  if (index < 26) return String.fromCharCode(65 + index);
  return String.fromCharCode(64 + Math.floor(index / 26)) + String.fromCharCode(65 + (index % 26));
}

const TOTAL_COLS = SHEET_HEADERS.length;
const READ_RANGE_END = colLetter(TOTAL_COLS + 9);

const SETUP_OPTIONS = [
  "ORB",
  "ABCD",
  "BHOD",
  "BLOD",
  "VWAP Bounce",
  "Mean Reversion",
];

const CATALYST_OPTIONS = [
  "Earnings/News",
  "Upgrade/Downgrade",
  "FDA/Regulatory",
  "Sector Momentum",
  "Gap Only",
  "Key Daily Level",
  "Day 2",
  "Pullback to DEMA",
  "Other",
];

const TAG_OPTIONS = [
  "clean entry",
  "extended entry",
  "chased",
  "FOMO",
  "added size",
  "perfect process",
  "revenge trade",
  "oversize",
  "strong momentum",
  "gap>2xATR",
  "gap<2xATR",
];

const ORIGIN_OPTIONS = [
  "Watchlist",
  "Callout",
  "Intraday discovery",
];

// Symbols that are always on the radar (seeded in the Morning Plan form —
// keep in sync with SEED_SYMBOLS in app/pct-bootcamp/trade-journal/plan/page.tsx).
// Their trades get Origin "Watchlist" even when no plan was saved that day.
const ALWAYS_WATCHLIST_SYMBOLS = new Set(["QQQ", "SPY"]);

const EMOTIONAL_STATE_OPTIONS = [
  "Calm",
  "Anxious",
  "Excited",
  "Frustrated",
  "Fatigued",
];

const MARKET_BIAS_OPTIONS = [
  "Bullish",
  "Bearish",
  "Neutral",
];

// Multi-timeframe pre-market read: a direction (Trend, reuses MARKET_BIAS_OPTIONS)
// and a strength (Conv, 1-3) per timeframe. Captured in the Daily Plan, auto-filled
// onto trades. Headers are identical on the plan tab and the trade sheet.
const MTF_TREND_HEADERS = ["Daily Trend", "1H Trend", "5m Trend"];
const MTF_CONV_HEADERS = ["Daily Conv", "1H Conv", "5m Conv"];

// Day-level psych check-in (replaces "Emotional State" as the primary input —
// that column stays for history but is no longer the main capture). Logged in
// the Morning Plan, auto-filled onto every trade row of that date.
const PSYCH_SCALE_HEADERS = ["Energy (1-5)", "Tension (1-5)"];
const URGE_HEADER = "Urge to Trade Fast?";

// Day-level sleep/readiness inputs — captured in the Morning Plan check-in and
// auto-filled onto every trade of the date (same convention as the psych scales
// above). "Sleep Score" and "Readiness Score" already exist on the trade sheet;
// "Sleep (hrs)" is the newly-appended column.
const SLEEP_HEADERS = ["Sleep Score", "Readiness Score", "Sleep (hrs)"];

const COLORS = {
  headerBg: { red: 0.15, green: 0.15, blue: 0.2 },
  headerText: { red: 0.85, green: 0.87, blue: 0.91 },
  greenText: { red: 0.45, green: 0.72, blue: 0.55 },
  redText: { red: 0.78, green: 0.45, blue: 0.45 },
  vividGreenBg: { red: 0.14, green: 0.45, blue: 0.2 },
  vividGreenText: { red: 0.29, green: 0.87, blue: 0.5 },
  vividRedBg: { red: 0.45, green: 0.14, blue: 0.14 },
  vividRedText: { red: 0.97, green: 0.44, blue: 0.44 },
  white: { red: 1, green: 1, blue: 1 },
  darkBg: { red: 0.04, green: 0.05, blue: 0.08 },
  panelBg: { red: 0.07, green: 0.09, blue: 0.11 },
  borderColor: { red: 0.12, green: 0.15, blue: 0.19 },
  mutedText: { red: 0.42, green: 0.47, blue: 0.52 },
};

// --- Edge-compatible Google Sheets API client (no googleapis SDK) ---

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function getAccessToken(): Promise<string> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set.");
  const sa = JSON.parse(raw) as {
    client_email: string;
    private_key: string;
    token_uri: string;
  };

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly",
    aud: sa.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = new TextEncoder();
  const headerB64 = b64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Import PEM private key for Web Crypto
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const keyBuf = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuf,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, enc.encode(signingInput));
  const jwt = `${signingInput}.${b64url(sig)}`;

  const tokenRes = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };
  return tokenData.access_token;
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error("GOOGLE_SPREADSHEET_ID environment variable is not set.");
  return id;
}

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

interface SheetMeta {
  properties: { title: string; sheetId: number };
}

async function sheetsGet(token: string, spreadsheetId: string): Promise<{ sheets: SheetMeta[] }> {
  const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}?fields=sheets.properties`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Sheets get failed: ${await res.text()}`);
  return res.json() as Promise<{ sheets: SheetMeta[] }>;
}

async function sheetsValuesGet(
  token: string,
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const res = await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Sheets values.get failed: ${await res.text()}`);
  const data = (await res.json()) as { values?: string[][] };
  return data.values || [];
}

async function sheetsValuesUpdate(
  token: string,
  spreadsheetId: string,
  range: string,
  values: (string | number)[][],
  valueInputOption: string = "RAW"
): Promise<void> {
  const res = await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    }
  );
  if (!res.ok) throw new Error(`Sheets values.update failed: ${await res.text()}`);
}

async function sheetsValuesAppend(
  token: string,
  spreadsheetId: string,
  range: string,
  values: (string | number)[][],
  valueInputOption: string = "USER_ENTERED"
): Promise<void> {
  const res = await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${valueInputOption}&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    }
  );
  if (!res.ok) throw new Error(`Sheets values.append failed: ${await res.text()}`);
}

async function sheetsValuesClear(
  token: string,
  spreadsheetId: string,
  range: string
): Promise<void> {
  const res = await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
    }
  );
  if (!res.ok) throw new Error(`Sheets values.clear failed: ${await res.text()}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sheetsBatchUpdate(token: string, spreadsheetId: string, requests: any[]): Promise<void> {
  const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  if (!res.ok) throw new Error(`Sheets batchUpdate failed: ${await res.text()}`);
}

// --- Sheet helpers ---

function findTabByAccountPrefix(
  sheets: SheetMeta[],
  account: string
): { title: string; sheetId: number } | null {
  const match = sheets.find((s) => {
    const title = s.properties.title;
    return title === account || title.startsWith(`${account}-`);
  });
  if (!match) return null;
  return { title: match.properties.title, sheetId: match.properties.sheetId };
}

function getSheetId(sheets: SheetMeta[], tabName: string): number {
  const sheet = sheets.find((s) => s.properties.title === tabName);
  return sheet?.properties.sheetId ?? 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function applyFormatting(token: string, spreadsheetId: string, sheetId: number, colMap?: ColMap) {
  const rc = (codeCol: number): number => {
    if (!colMap) return codeCol;
    const header = SHEET_HEADERS[codeCol];
    return header ? (colMap[header] ?? -1) : -1;
  };

  const totalCols = colMap ? Math.max(...Object.values(colMap)) + 1 : TOTAL_COLS;

  const manualHeaders = ["R (Risk)", "Setup", "Process Followed?", "Notes", "Sleep Score", "Readiness Score", "Sleep (hrs)", "Emotional State", "Market Bias", "Conviction (1-3)", "Catalyst", "Tags", "Origin", "L2 Bias", ...MTF_TREND_HEADERS, ...MTF_CONV_HEADERS, ...PSYCH_SCALE_HEADERS, URGE_HEADER];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const colRange = (col: number) => ({ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headerRange = (col: number) => ({ sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: col, endColumnIndex: col + 1 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requests: any[] = [];

  requests.push({
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: "gridProperties.frozenRowCount",
    },
  });

  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: totalCols },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.headerBg,
          textFormat: { bold: true, foregroundColor: COLORS.headerText, fontSize: 10 },
          horizontalAlignment: "CENTER",
          verticalAlignment: "MIDDLE",
          padding: { top: 4, bottom: 4, left: 6, right: 6 },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)",
    },
  });

  for (const h of manualHeaders) {
    const col = colMap ? (colMap[h] ?? -1) : (SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: headerRange(col),
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.headerText,
            textFormat: { bold: true, foregroundColor: COLORS.headerBg, fontSize: 10 },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat)",
      },
    });
  }

  const colWidths: Record<string, number> = {
    "Date": 100, "Entry Time": 90, "Exit Time": 90,
    "Duration (mins)": 105, "Symbol": 80, "Side": 70,
    "Shares": 70, "Avg Entry": 95, "Avg Exit": 95, "Stop": 95,
    "# Partials": 85, "P&L": 95, "R (Risk)": 95,
    "P&L (R)": 85, "Setup": 140, "Process Followed?": 130, "Notes": 200,
    "Sleep Score": 100, "Readiness Score": 120, "Sleep (hrs)": 90, "Emotional State": 120, "Market Bias": 100,
    "Conviction (1-3)": 100, "Catalyst": 160, "Tags": 200,
    "Max R Before Stop": 120, "Farthest Price": 105, "1R": 45, "2R": 45, "3R": 45, "4R": 45, "5R": 45, "6R": 45,
    "#1m": 55, "#5m": 55, "#1H": 55,
    "%Gap": 70, "%ATR": 70, "RVOL": 65, "%VWAP": 75,
    "OR Size ($)": 85, "OR %ATR": 75, "OR High": 85, "OR Low": 85,
    "Breakout Vol Ratio": 110, "Prior Close Loc": 105,
    "Dist 20 SMA (%)": 105, "Dist 50 SMA (%)": 105,
    "Float": 100, "Avg $ Vol": 100,
    "SPY Dir": 70, "VIX": 60,
    "PDC": 80, "PDH": 80, "PDL": 80,
    "Origin": 130, "L2 Bias": 90,
    "Daily Trend": 95, "Daily Conv": 80, "1H Trend": 90, "1H Conv": 75, "5m Trend": 90, "5m Conv": 75,
    "MAE (R)": 80, "Energy (1-5)": 95, "Tension (1-5)": 95, "Urge to Trade Fast?": 130,
    "O": 80, "H": 80, "L": 80, "C": 80, "V": 100, "ATR": 75, "30mATR": 80, "ADR": 75,
  };
  for (const [header, width] of Object.entries(colWidths)) {
    const col = colMap ? (colMap[header] ?? -1) : SHEET_HEADERS.indexOf(header);
    if (col < 0) continue;
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: col, endIndex: col + 1 },
        properties: { pixelSize: width },
        fields: "pixelSize",
      },
    });
  }

  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 36 },
      fields: "pixelSize",
    },
  });

  // Currency formatting
  for (const h of ["P&L", "R (Risk)", "OR Size ($)", "OR High", "OR Low", "Avg Entry", "Avg Exit", "Stop", "Farthest Price", "PDC", "PDH", "PDL", "O", "H", "L", "C"]) {
    const col = rc(SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: colRange(col),
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  for (const h of ["Duration (mins)", "P&L (R)", "Sleep (hrs)"]) {
    const col = rc(SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: colRange(col),
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "0.0" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // Conditional formatting: Side
  const sideCol = rc(COL.SIDE);
  if (sideCol >= 0) {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [colRange(sideCol)],
          booleanRule: {
            condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "Long" }] },
            format: { backgroundColor: COLORS.vividGreenBg, textFormat: { foregroundColor: COLORS.vividGreenText, bold: true } },
          },
        },
        index: 0,
      },
    });
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [colRange(sideCol)],
          booleanRule: {
            condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "Short" }] },
            format: { backgroundColor: COLORS.vividRedBg, textFormat: { foregroundColor: COLORS.vividRedText, bold: true } },
          },
        },
        index: 1,
      },
    });
  }

  // Conditional formatting: P&L
  const pnlCol = rc(COL.PNL);
  if (pnlCol >= 0) {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [colRange(pnlCol)],
          booleanRule: {
            condition: { type: "NUMBER_GREATER_THAN_EQ", values: [{ userEnteredValue: "0" }] },
            format: { textFormat: { foregroundColor: COLORS.greenText, bold: true } },
          },
        },
        index: 2,
      },
    });
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [colRange(pnlCol)],
          booleanRule: {
            condition: { type: "NUMBER_LESS", values: [{ userEnteredValue: "0" }] },
            format: { textFormat: { foregroundColor: COLORS.redText, bold: true } },
          },
        },
        index: 3,
      },
    });
  }

  // Conditional formatting: P&L (R)
  const pnlRCol = rc(COL.PNL_R);
  if (pnlRCol >= 0) {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [colRange(pnlRCol)],
          booleanRule: {
            condition: { type: "NUMBER_GREATER_THAN_EQ", values: [{ userEnteredValue: "0" }] },
            format: { textFormat: { foregroundColor: COLORS.greenText } },
          },
        },
        index: 4,
      },
    });
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [colRange(pnlRCol)],
          booleanRule: {
            condition: { type: "NUMBER_LESS", values: [{ userEnteredValue: "0" }] },
            format: { textFormat: { foregroundColor: COLORS.redText } },
          },
        },
        index: 5,
      },
    });
  }

  // Conditional formatting: Process Followed?
  const processCol = rc(COL.PROCESS);
  if (processCol >= 0) {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [colRange(processCol)],
          booleanRule: {
            condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "Yes" }] },
            format: { backgroundColor: COLORS.vividGreenBg, textFormat: { foregroundColor: COLORS.vividGreenText, bold: true } },
          },
        },
        index: 6,
      },
    });
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [colRange(processCol)],
          booleanRule: {
            condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "No" }] },
            format: { backgroundColor: COLORS.vividRedBg, textFormat: { foregroundColor: COLORS.vividRedText, bold: true } },
          },
        },
        index: 7,
      },
    });

    requests.push({
      setDataValidation: {
        range: colRange(processCol),
        rule: {
          condition: { type: "ONE_OF_LIST", values: [{ userEnteredValue: "Yes" }, { userEnteredValue: "No" }] },
          showCustomUi: true,
          strict: true,
        },
      },
    });
  }

  // Conditional formatting: 1R–6R columns (Y = green, N = red, same style as Process Followed)
  const rCols = [COL.R1, COL.R2, COL.R3, COL.R4, COL.R5, COL.R6].map(rc).filter((c) => c >= 0);
  if (rCols.length > 0) {
    const rRanges = rCols.map((col) => colRange(col));
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: rRanges,
          booleanRule: {
            condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "Y" }] },
            format: { backgroundColor: COLORS.vividGreenBg, textFormat: { foregroundColor: COLORS.vividGreenText, bold: true } },
          },
        },
        index: 8,
      },
    });
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: rRanges,
          booleanRule: {
            condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "N" }] },
            format: { backgroundColor: COLORS.vividRedBg, textFormat: { foregroundColor: COLORS.vividRedText, bold: true } },
          },
        },
        index: 9,
      },
    });
  }

  // Data validation: Setup
  const setupCol = rc(COL.SETUP);
  if (setupCol >= 0) {
    requests.push({
      setDataValidation: {
        range: colRange(setupCol),
        rule: {
          condition: { type: "ONE_OF_LIST", values: SETUP_OPTIONS.map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: false,
        },
      },
    });
  }

  // Data validation: Conviction (1-3)
  const convictionCol = rc(COL.CONVICTION);
  if (convictionCol >= 0) {
    requests.push({
      setDataValidation: {
        range: colRange(convictionCol),
        rule: {
          condition: { type: "ONE_OF_LIST", values: [{ userEnteredValue: "1" }, { userEnteredValue: "2" }, { userEnteredValue: "3" }] },
          showCustomUi: true,
          strict: true,
        },
      },
    });
  }

  // Data validation: Catalyst
  const catalystCol = rc(COL.CATALYST);
  if (catalystCol >= 0) {
    requests.push({
      setDataValidation: {
        range: colRange(catalystCol),
        rule: {
          condition: { type: "ONE_OF_LIST", values: CATALYST_OPTIONS.map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: false,
        },
      },
    });
  }

  // Data validation: Tags
  const tagsCol = rc(COL.TAGS);
  if (tagsCol >= 0) {
    requests.push({
      setDataValidation: {
        range: colRange(tagsCol),
        rule: {
          condition: { type: "ONE_OF_LIST", values: TAG_OPTIONS.map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: false,
        },
      },
    });
  }

  // Data validation: Emotional State
  const emotionalCol = rc(COL.EMOTIONAL);
  if (emotionalCol >= 0) {
    requests.push({
      setDataValidation: {
        range: colRange(emotionalCol),
        rule: {
          condition: { type: "ONE_OF_LIST", values: EMOTIONAL_STATE_OPTIONS.map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: false,
        },
      },
    });
  }

  // Data validation: Market Bias
  const biasCol = rc(COL.BIAS);
  if (biasCol >= 0) {
    requests.push({
      setDataValidation: {
        range: colRange(biasCol),
        rule: {
          condition: { type: "ONE_OF_LIST", values: MARKET_BIAS_OPTIONS.map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: false,
        },
      },
    });
  }

  // Data validation: Origin
  const originCol = colMap ? (colMap["Origin"] ?? -1) : SHEET_HEADERS.indexOf("Origin");
  if (originCol >= 0) {
    requests.push({
      setDataValidation: {
        range: colRange(originCol),
        rule: {
          condition: { type: "ONE_OF_LIST", values: ORIGIN_OPTIONS.map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: false,
        },
      },
    });
  }

  // Data validation: L2 Bias (reuses the Market Bias options)
  const l2BiasCol = colMap ? (colMap["L2 Bias"] ?? -1) : SHEET_HEADERS.indexOf("L2 Bias");
  if (l2BiasCol >= 0) {
    requests.push({
      setDataValidation: {
        range: colRange(l2BiasCol),
        rule: {
          condition: { type: "ONE_OF_LIST", values: MARKET_BIAS_OPTIONS.map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: false,
        },
      },
    });
  }

  // Data validation: MTF Trend columns (direction) + MTF Conv columns (1-3 strength)
  for (const h of MTF_TREND_HEADERS) {
    const col = colMap ? (colMap[h] ?? -1) : SHEET_HEADERS.indexOf(h);
    if (col < 0) continue;
    requests.push({
      setDataValidation: {
        range: colRange(col),
        rule: {
          condition: { type: "ONE_OF_LIST", values: MARKET_BIAS_OPTIONS.map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: false,
        },
      },
    });
  }
  for (const h of MTF_CONV_HEADERS) {
    const col = colMap ? (colMap[h] ?? -1) : SHEET_HEADERS.indexOf(h);
    if (col < 0) continue;
    requests.push({
      setDataValidation: {
        range: colRange(col),
        rule: {
          condition: { type: "ONE_OF_LIST", values: [{ userEnteredValue: "1" }, { userEnteredValue: "2" }, { userEnteredValue: "3" }] },
          showCustomUi: true,
          strict: true,
        },
      },
    });
  }

  // Data validation: psych scales (1-5) and Urge to Trade Fast? (Yes/No)
  for (const h of PSYCH_SCALE_HEADERS) {
    const col = colMap ? (colMap[h] ?? -1) : SHEET_HEADERS.indexOf(h);
    if (col < 0) continue;
    requests.push({
      setDataValidation: {
        range: colRange(col),
        rule: {
          condition: { type: "ONE_OF_LIST", values: ["1", "2", "3", "4", "5"].map((v) => ({ userEnteredValue: v })) },
          showCustomUi: true,
          strict: true,
        },
      },
    });
  }
  {
    const col = colMap ? (colMap[URGE_HEADER] ?? -1) : SHEET_HEADERS.indexOf(URGE_HEADER);
    if (col >= 0) {
      requests.push({
        setDataValidation: {
          range: colRange(col),
          rule: {
            condition: { type: "ONE_OF_LIST", values: [{ userEnteredValue: "Yes" }, { userEnteredValue: "No" }] },
            showCustomUi: true,
            strict: true,
          },
        },
      });
    }
  }

  // Number format: Sleep & Readiness scores (whole numbers)
  for (const h of ["Sleep Score", "Readiness Score", "#1m", "#5m", "#1H"]) {
    const col = rc(SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: colRange(col),
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "0" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  for (const h of ["%Gap", "%VWAP", "Dist 20 SMA (%)", "Dist 50 SMA (%)"]) {
    const col = rc(SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: colRange(col),
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "+0.00;-0.00" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  for (const h of ["%ATR", "OR %ATR", "Prior Close Loc", "Max R Before Stop"]) {
    const col = rc(SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: colRange(col),
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "0.0" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  for (const h of ["RVOL", "Breakout Vol Ratio", "VIX", "MAE (R)", "ATR", "30mATR", "ADR"]) {
    const col = rc(SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: colRange(col),
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "0.00" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // Daily volume (V): integer with thousands separators
  {
    const col = rc(SHEET_HEADERS.indexOf("V"));
    if (col >= 0) {
      requests.push({
        repeatCell: {
          range: colRange(col),
          cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "#,##0" } } },
          fields: "userEnteredFormat.numberFormat",
        },
      });
    }
  }

  const floatCol = rc(COL.FLOAT);
  if (floatCol >= 0) {
    requests.push({
      repeatCell: {
        range: colRange(floatCol),
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "#,##0" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  const avgDolVolCol = rc(COL.AVG_DOLLAR_VOL);
  if (avgDolVolCol >= 0) {
    requests.push({
      repeatCell: {
        range: colRange(avgDolVolCol),
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "$#,##0" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // Text wrapping
  for (const h of ["Setup", "Notes", "Catalyst", "Tags", "Origin"]) {
    const col = rc(SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: colRange(col),
        cell: { userEnteredFormat: { wrapStrategy: "WRAP" } },
        fields: "userEnteredFormat.wrapStrategy",
      },
    });
  }

  // Center-align
  for (const h of ["Side", "Shares", "# Partials", "Duration (mins)", "Process Followed?", "Sleep Score", "Readiness Score", "Sleep (hrs)", "Emotional State", "Market Bias", "L2 Bias", ...MTF_TREND_HEADERS, ...MTF_CONV_HEADERS, ...PSYCH_SCALE_HEADERS, URGE_HEADER, "Conviction (1-3)", "1R", "2R", "3R", "4R", "5R", "6R", "#1m", "#5m", "#1H", "%Gap", "%ATR", "RVOL", "%VWAP", "OR %ATR", "Breakout Vol Ratio", "Prior Close Loc", "Dist 20 SMA (%)", "Dist 50 SMA (%)", "Float", "Avg $ Vol", "SPY Dir", "VIX"]) {
    const col = rc(SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: colRange(col),
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    });
  }

  // Right-align
  for (const h of ["Avg Entry", "Avg Exit", "Stop", "Max R Before Stop", "Farthest Price", "MAE (R)", "P&L", "R (Risk)", "P&L (R)", "OR Size ($)", "OR High", "OR Low", "PDC", "PDH", "PDL", "O", "H", "L", "C", "V", "ATR", "30mATR", "ADR"]) {
    const col = rc(SHEET_HEADERS.indexOf(h));
    if (col < 0) continue;
    requests.push({
      repeatCell: {
        range: colRange(col),
        cell: { userEnteredFormat: { horizontalAlignment: "RIGHT" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    });
  }

  await sheetsBatchUpdate(token, spreadsheetId, requests);
}

const FORMULA_HEADERS = new Set(["Stop", "P&L (R)", "1R", "2R", "3R", "4R", "5R", "6R"]);

async function repairFormulas(
  token: string,
  spreadsheetId: string,
  tabTitle: string,
  colMap: ColMap
): Promise<void> {
  const lastCol = Math.max(...Object.values(colMap));
  const allRows = await sheetsValuesGet(token, spreadsheetId, `'${tabTitle}'!A:${colLetter(lastCol)}`);
  const dataRowCount = allRows.length - 1;
  if (dataRowCount <= 0) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formulaUpdates: any[] = [];
  for (let r = 0; r < dataRowCount; r++) {
    const rowIndex = r + 2;
    const formulas = buildFormulas(rowIndex, colMap);
    for (const h of FORMULA_HEADERS) {
      const colIdx = colMap[h];
      if (colIdx === undefined) continue;
      let value = "";
      if (h === "Stop") value = formulas.stop;
      else if (h === "P&L (R)") value = formulas.pnlR;
      else if (h.match(/^[1-6]R$/)) {
        const n = parseInt(h[0], 10);
        value = formulas.rMultiples[n - 1];
      }
      if (value) {
        formulaUpdates.push({
          range: `'${tabTitle}'!${colLetter(colIdx)}${rowIndex}`,
          values: [[value]],
        });
      }
    }
  }
  if (formulaUpdates.length > 0) {
    const BATCH_SIZE = 500;
    for (let i = 0; i < formulaUpdates.length; i += BATCH_SIZE) {
      const batch = formulaUpdates.slice(i, i + BATCH_SIZE);
      const res = await fetch(
        `${SHEETS_BASE}/${spreadsheetId}/values:batchUpdate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ valueInputOption: "USER_ENTERED", data: batch }),
        }
      );
      if (!res.ok) throw new Error(`Formula repair failed: ${await res.text()}`);
    }
  }
}

async function migrateTabIfNeeded(
  token: string,
  spreadsheetId: string,
  tabTitle: string,
  sheetId: number
): Promise<void> {
  const currentHeaders = await sheetsValuesGet(token, spreadsheetId, `'${tabTitle}'!1:1`);
  const headerRow = currentHeaders[0] || [];
  if (headerRow.length === 0) return;

  const existingSet = new Set(headerRow.map((h) => h.trim()));
  const missingHeaders = SHEET_HEADERS.filter((h) => !existingSet.has(h));

  if (missingHeaders.length === 0) {
    const colMap = buildColMap(headerRow);
    await repairFormulas(token, spreadsheetId, tabTitle, colMap);
    return;
  }

  await sheetsBatchUpdate(token, spreadsheetId, [
    { appendDimension: { sheetId, dimension: "COLUMNS", length: missingHeaders.length } },
  ]);

  const startCol = headerRow.length;
  const endCol = startCol + missingHeaders.length;
  const range = `'${tabTitle}'!${colLetter(startCol)}1:${colLetter(endCol - 1)}1`;
  await sheetsValuesUpdate(token, spreadsheetId, range, [missingHeaders]);

  const fullHeader = [...headerRow, ...missingHeaders];
  const colMap = buildColMap(fullHeader);

  await repairFormulas(token, spreadsheetId, tabTitle, colMap);
  await applyFormatting(token, spreadsheetId, sheetId, colMap);
}

async function ensureSheetTab(
  token: string,
  spreadsheetId: string,
  account: string,
  suffix: string
): Promise<{ tabName: string; gid: number }> {
  const meta = await sheetsGet(token, spreadsheetId);
  const existing = findTabByAccountPrefix(meta.sheets, account);

  if (existing) {
    await migrateTabIfNeeded(token, spreadsheetId, existing.title, existing.sheetId);
    return { tabName: existing.title, gid: existing.sheetId };
  }

  const tabName = suffix ? `${account}-${suffix}` : account;

  await sheetsBatchUpdate(token, spreadsheetId, [
    { addSheet: { properties: { title: tabName } } },
  ]);

  await sheetsValuesUpdate(token, spreadsheetId, `'${tabName}'!A1`, [SHEET_HEADERS]);

  const updatedMeta = await sheetsGet(token, spreadsheetId);
  const sheetId = getSheetId(updatedMeta.sheets, tabName);
  await applyFormatting(token, spreadsheetId, sheetId);

  return { tabName, gid: sheetId };
}

function buildFormulas(rowIndex: number, colMap: ColMap): { stop: string; pnlR: string; rMultiples: string[] } {
  const cl = (header: string) => {
    const idx = colMap[header];
    return idx !== undefined ? colLetter(idx) : null;
  };
  const R = `${rowIndex}`;
  const risk = cl("R (Risk)");
  const pnl = cl("P&L");
  const shares = cl("Shares");
  const side = cl("Side");
  const entry = cl("Avg Entry");
  const maxR = cl("Max R Before Stop");

  const pnlR = risk && pnl
    ? `=IF(${risk}${R}="","",${pnl}${R}/${risk}${R})`
    : "";

  const stop = risk && shares && side && entry
    ? `=IF(OR(${risk}${R}="",${shares}${R}=""),"",IF(${side}${R}="Long",${entry}${R}-${risk}${R}/${shares}${R},${entry}${R}+${risk}${R}/${shares}${R}))`
    : "";

  const rMultiples: string[] = [];
  for (let n = 1; n <= 6; n++) {
    if (maxR) {
      rMultiples.push(
        `=IF(${maxR}${R}="","",IF(${maxR}${R}>=${n},"Y","N"))`
      );
    } else {
      rMultiples.push("");
    }
  }

  return { stop, pnlR, rMultiples };
}

function tradeToRow(trade: GroupedTrade, rowIndex: number, colMap: ColMap, enrichment?: MarketEnrichment): (string | number)[] {
  const size = Math.max(...Object.values(colMap)) + 1;
  const row: (string | number)[] = new Array(size).fill("");

  const set = (header: string, value: string | number) => {
    const idx = colMap[header];
    if (idx !== undefined) row[idx] = value;
  };

  const formulas = buildFormulas(rowIndex, colMap);

  set("Date", trade.date);
  set("Entry Time", trade.entryTime);
  set("Exit Time", trade.exitTime);
  set("Duration (mins)", trade.durationMins);
  set("Symbol", trade.symbol);
  set("Side", trade.side);
  set("Shares", trade.totalShares);
  set("Avg Entry", trade.avgEntry);
  set("Avg Exit", trade.avgExit);
  set("Stop", formulas.stop);
  set("# Partials", trade.numPartials);
  set("P&L", trade.pnl);
  set("P&L (R)", formulas.pnlR);
  const rHeaders = ["1R", "2R", "3R", "4R", "5R", "6R"];
  for (let i = 0; i < 6; i++) {
    set(rHeaders[i], formulas.rMultiples[i]);
  }

  const e = enrichment;
  if (e) {
    set("#1m", e.consec1m ?? "");
    set("#5m", e.consec5m ?? "");
    set("#1H", e.consec1h ?? "");
    set("%Gap", e.gapPct ?? "");
    set("%ATR", e.atrPct ?? "");
    set("RVOL", e.rvol ?? "");
    set("%VWAP", e.vwapPct ?? "");
    set("OR Size ($)", e.orSize ?? "");
    set("OR %ATR", e.orAtrPct ?? "");
    set("OR High", e.orHigh ?? "");
    set("OR Low", e.orLow ?? "");
    set("Max R Before Stop", e.maxRBeforeStop ?? "");
    set("Farthest Price", e.farthestPrice ?? "");
    set("MAE (R)", e.maeR ?? "");
    set("Breakout Vol Ratio", e.breakoutVolRatio ?? "");
    set("Prior Close Loc", e.priorCloseLoc ?? "");
    set("Dist 20 SMA (%)", e.dist20Sma ?? "");
    set("Dist 50 SMA (%)", e.dist50Sma ?? "");
    set("Float", e.floatShares ?? "");
    set("Avg $ Vol", e.avgDollarVol ?? "");
    set("SPY Dir", e.spyDir ?? "");
    set("VIX", e.vix ?? "");
    set("PDC", e.pdc ?? "");
    set("PDH", e.pdh ?? "");
    set("PDL", e.pdl ?? "");
    set("O", e.dayOpen ?? "");
    set("H", e.dayHigh ?? "");
    set("L", e.dayLow ?? "");
    set("C", e.dayClose ?? "");
    set("V", e.dayVolume ?? "");
    set("ATR", e.atr14 ?? "");
    set("30mATR", e.atr30m ?? "");
    set("ADR", e.adr14 ?? "");
  }

  return row;
}

function normalizeTime(t: string | number): string {
  const s = String(t);
  const parts = s.split(":");
  if (parts.length === 3) {
    return parts.map((p) => p.replace(/^0+/, "") || "0").join(":");
  }
  return s;
}

function makeDedupeKey(row: (string | number)[], colMap: ColMap): string {
  return [
    row[cm(colMap, "Date")] ?? "",
    row[cm(colMap, "Symbol")] ?? "",
    normalizeTime(row[cm(colMap, "Entry Time")] ?? ""),
    row[cm(colMap, "Side")] ?? "",
  ].join("|");
}

export interface SegmentStats {
  label: string;
  totalPnl: number;
  trades: number;
  winners: number;
  losers: number;
  winRate: number;
  avgWinner: number;
  avgLoser: number;
  profitFactor: number;
}

// Prediction & Execution skill funnel — read direction (intraday), read
// magnitude (daily), then convert to P&L (execution). Each is a distinct,
// separately-improvable skill; pcts are null when no trade has the data.
export interface SkillMetrics {
  intradayReadPct: number | null;    // % of readable trades that moved >= 1x 30mATR beyond open in the trade direction
  intradayReadN: number;             // denominator: trades with O/H/L + a numeric 30mATR
  dailyReadPct: number | null;       // % that moved >= 0.8x daily ADR beyond open (headline)
  dailyReadStrongPct: number | null; // % that moved >= 1.0x daily ADR beyond open (strong read)
  dailyReadN: number;                // denominator: trades with O/H/L + a numeric ADR
  executionPct: number | null;       // Target Capture %: among trades whose MFE reached target, mean(min(realizedR,target))/target
  executionN: number;                // denominator: trades whose Max R Before Stop >= target (with risk + realized R)
  captureTarget: number;             // the target (R) used for the execution metric
}

export interface AggregateStats {
  totalPnl: number;
  avgDailyPnl: number;
  avgWinner: number;
  avgLoser: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgDurationMins: number;
  hourlyBreakdown: SegmentStats[];
  granularHourlyBreakdown: SegmentStats[];
  setupBreakdown: SegmentStats[];
  convictionBreakdown: SegmentStats[];
  catalystBreakdown: SegmentStats[];
  skill: SkillMetrics;
  // Discipline % = share of trades marked Process Followed? = Yes, among trades
  // labeled Yes or No (blanks excluded). null when no trade is labeled.
  disciplinePct: number | null;
  disciplineN: number;
}

export interface StatsFilter {
  processFollowed?: "yes" | "no";
  startDate?: string;
  endDate?: string;
  setup?: string;
  conviction?: string;
  side?: string;
  symbol?: string;
  catalyst?: string;
  tags?: string;
}

// Shared row filter used by computeStats, extractTradesForAnalysis, and
// getDailyCalendar so all three sections filter identically (no drift).
// Exact match: Process/Setup/Conviction/Side/Symbol. "Contains" (comma-separated
// multi-value): Catalyst/Tags. Date range: Date.
function applyRowFilter(dataRows: string[][], colMap: ColMap, filter?: StatsFilter): string[][] {
  if (!filter) return dataRows;
  const dateIdx = cm(colMap, "Date");
  const processIdx = cm(colMap, "Process Followed?");
  const setupIdx = cm(colMap, "Setup");
  const convictionIdx = cm(colMap, "Conviction (1-3)");
  const sideIdx = cm(colMap, "Side");
  const symbolIdx = cm(colMap, "Symbol");
  const catalystIdx = cm(colMap, "Catalyst");
  const tagsIdx = cm(colMap, "Tags");

  let out = dataRows;
  if (filter.processFollowed && processIdx >= 0) {
    const want = filter.processFollowed === "yes" ? "Yes" : "No";
    out = out.filter((r) => (r[processIdx] || "").trim() === want);
  }
  if (filter.startDate && dateIdx >= 0) {
    out = out.filter((r) => (r[dateIdx] || "") >= filter.startDate!);
  }
  if (filter.endDate && dateIdx >= 0) {
    out = out.filter((r) => (r[dateIdx] || "") <= filter.endDate!);
  }
  if (filter.setup && setupIdx >= 0) {
    out = out.filter((r) => (r[setupIdx] || "").trim() === filter.setup);
  }
  if (filter.conviction && convictionIdx >= 0) {
    out = out.filter((r) => (r[convictionIdx] || "").trim() === filter.conviction);
  }
  if (filter.side && sideIdx >= 0) {
    out = out.filter((r) => (r[sideIdx] || "").trim() === filter.side);
  }
  if (filter.symbol && symbolIdx >= 0) {
    const sym = filter.symbol.trim().toUpperCase();
    out = out.filter((r) => (r[symbolIdx] || "").trim().toUpperCase() === sym);
  }
  if (filter.catalyst && catalystIdx >= 0) {
    const c = filter.catalyst.toLowerCase();
    out = out.filter((r) => (r[catalystIdx] || "").toLowerCase().includes(c));
  }
  if (filter.tags && tagsIdx >= 0) {
    const t = filter.tags.toLowerCase();
    out = out.filter((r) => (r[tagsIdx] || "").toLowerCase().includes(t));
  }
  return out;
}

// Parses a StatsFilter from URL query params. Shared by the stats, analysis,
// and calendar routes. `includeDates: false` for the calendar (it uses month
// navigation for time, so start/end date are ignored there).
export function parseStatsFilter(
  searchParams: URLSearchParams,
  opts?: { includeDates?: boolean }
): StatsFilter {
  const filter: StatsFilter = {};
  const pf = searchParams.get("processFollowed");
  if (pf === "yes" || pf === "true") filter.processFollowed = "yes";
  else if (pf === "no") filter.processFollowed = "no";
  if (opts?.includeDates !== false) {
    if (searchParams.get("startDate")) filter.startDate = searchParams.get("startDate")!;
    if (searchParams.get("endDate")) filter.endDate = searchParams.get("endDate")!;
  }
  if (searchParams.get("setup")) filter.setup = searchParams.get("setup")!;
  if (searchParams.get("conviction")) filter.conviction = searchParams.get("conviction")!;
  if (searchParams.get("side")) filter.side = searchParams.get("side")!;
  if (searchParams.get("symbol")) filter.symbol = searchParams.get("symbol")!;
  if (searchParams.get("catalyst")) filter.catalyst = searchParams.get("catalyst")!;
  if (searchParams.get("tags")) filter.tags = searchParams.get("tags")!;
  return filter;
}

const HOUR_BLOCKS: { label: string; startMin: number; endMin: number }[] = [
  { label: "Opening Bell (9:30–10:00)", startMin: 570, endMin: 600 },
  { label: "Morning (10:00–11:30)", startMin: 600, endMin: 690 },
  { label: "Lunch (11:30–14:00)", startMin: 690, endMin: 840 },
  { label: "Closing (14:00–16:00)", startMin: 840, endMin: 960 },
];

const GRANULAR_HOUR_BLOCKS: { label: string; startMin: number; endMin: number }[] = [
  { label: "Opening Bell (9:30–9:35)", startMin: 570, endMin: 575 },
  { label: "Opening 15m (9:35–9:45)", startMin: 575, endMin: 585 },
  { label: "Opening 30m (9:45–10:00)", startMin: 585, endMin: 600 },
  { label: "10:00–10:15", startMin: 600, endMin: 615 },
  { label: "10:15–10:30", startMin: 615, endMin: 630 },
  { label: "10:30–10:45", startMin: 630, endMin: 645 },
  { label: "10:45–11:00", startMin: 645, endMin: 660 },
  { label: "11:00–11:30", startMin: 660, endMin: 690 },
  { label: "11:30–12:30", startMin: 690, endMin: 750 },
  { label: "12:30–2:00", startMin: 750, endMin: 840 },
  { label: "2:00–3:00", startMin: 840, endMin: 900 },
  { label: "3:00–4:00", startMin: 900, endMin: 960 },
];

function parseTimeToMinutes(t: string): number {
  const parts = String(t).split(":");
  if (parts.length < 2) return -1;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function computeSegment(pnls: number[], label: string): SegmentStats {
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);
  const grossWins = wins.reduce((s, v) => s + v, 0);
  const grossLosses = Math.abs(losses.reduce((s, v) => s + v, 0));
  return {
    label,
    totalPnl: Math.round(pnls.reduce((s, v) => s + v, 0) * 100) / 100,
    trades: pnls.length,
    winners: wins.length,
    losers: losses.length,
    winRate: pnls.length > 0 ? Math.round((wins.length / pnls.length) * 1000) / 10 : 0,
    avgWinner: wins.length > 0 ? Math.round((grossWins / wins.length) * 100) / 100 : 0,
    avgLoser: losses.length > 0 ? Math.round((grossLosses / losses.length) * -100) / 100 : 0,
    profitFactor: grossLosses > 0 ? Math.round((grossWins / grossLosses) * 100) / 100 : grossWins > 0 ? 9999 : 0,
  };
}

interface ParsedRow {
  pnl: number;
  duration: number;
  entryMin: number;
  setup: string;
  conviction: string;
  catalyst: string;
}

// Prediction thresholds (favorable move beyond the open, as a multiple of the
// relevant pre-open range). Intraday uses the 30-minute opening range (30mATR);
// daily uses ADR (gap-free average daily range), NOT true-range ATR — the
// excursion is gap-free (measured from the open), so its yardstick must be too.
const INTRADAY_READ_MULT = 1.0;       // >= 1x 30mATR = a typical opening-bell move your way
const DAILY_READ_MULT = 0.8;          // >= 0.8x daily ADR = the daily-scale move showed up (headline)
const DAILY_READ_STRONG_MULT = 1.0;   // >= 1.0x daily ADR = a full-ADR move your way (strong read)
export const DEFAULT_CAPTURE_TARGET = 2.5;

function emptySkill(captureTarget: number): SkillMetrics {
  return {
    intradayReadPct: null, intradayReadN: 0,
    dailyReadPct: null, dailyReadStrongPct: null, dailyReadN: 0,
    executionPct: null, executionN: 0, captureTarget,
  };
}

// Parse a sheet cell to a number, treating blank and the literal "N/A" as null.
function numCell(v: string | undefined): number | null {
  if (v === undefined) return null;
  const s = String(v).trim();
  if (s === "" || s.toUpperCase() === "N/A") return null;
  const n = parseFloat(s.replace(/[$,]/g, ""));
  return isNaN(n) ? null : n;
}

function computeSkillMetrics(dataRows: string[][], colMap: ColMap, captureTarget: number): SkillMetrics {
  const sideIdx = cm(colMap, "Side");
  const oIdx = cm(colMap, "O");
  const hIdx = cm(colMap, "H");
  const lIdx = cm(colMap, "L");
  const adrIdx = cm(colMap, "ADR");
  const atr30Idx = cm(colMap, "30mATR");
  const maxRIdx = cm(colMap, "Max R Before Stop");
  const pnlRIdx = cm(colMap, "P&L (R)");
  const riskIdx = cm(colMap, "R (Risk)");

  let intraHit = 0, intraN = 0;
  let dailyHit = 0, dailyStrong = 0, dailyN = 0;
  const captureVals: number[] = [];

  for (const r of dataRows) {
    const side = sideIdx >= 0 ? String(r[sideIdx] || "").trim() : "";
    const isLong = side === "Long";
    const isShort = side === "Short";
    const o = numCell(r[oIdx]);

    // Favorable excursion beyond the open, in the trade direction (long: H-O,
    // short: O-L). Measured from the open so it is a pure prediction signal,
    // independent of entry timing.
    let excursion: number | null = null;
    if (o !== null && isLong) { const h = numCell(r[hIdx]); if (h !== null) excursion = h - o; }
    else if (o !== null && isShort) { const l = numCell(r[lIdx]); if (l !== null) excursion = o - l; }

    if (excursion !== null) {
      const atr30 = numCell(r[atr30Idx]);
      if (atr30 !== null && atr30 > 0) {
        intraN++;
        if (excursion >= INTRADAY_READ_MULT * atr30) intraHit++;
      }
      // Daily read uses ADR (gap-free average daily range = mean High-Low over
      // the prior 14 sessions), NOT ATR. The favorable excursion is measured
      // from the open, so it excludes the overnight gap; dividing by true-range
      // ATR (which includes gaps) would compare gap-free travel against a
      // gap-inflated yardstick. ADR keeps numerator and denominator gap-free.
      const adr = numCell(r[adrIdx]);
      if (adr !== null && adr > 0) {
        dailyN++;
        if (excursion >= DAILY_READ_MULT * adr) dailyHit++;
        if (excursion >= DAILY_READ_STRONG_MULT * adr) dailyStrong++;
      }
    }

    // Execution / Target Capture: among trades whose MFE reached the target,
    // mean(min(realizedR, target)) / target — isolates the trail leak.
    const maxR = numCell(r[maxRIdx]);
    const realizedR = numCell(r[pnlRIdx]);
    const risk = numCell(r[riskIdx]);
    if (maxR !== null && realizedR !== null && risk !== null && risk > 0 && maxR >= captureTarget) {
      captureVals.push(Math.min(realizedR, captureTarget));
    }
  }

  const pct = (hit: number, n: number) => (n > 0 ? Math.round((hit / n) * 1000) / 10 : null);
  const executionPct = captureVals.length > 0
    ? Math.round((captureVals.reduce((s, v) => s + v, 0) / captureVals.length / captureTarget) * 1000) / 10
    : null;

  return {
    intradayReadPct: pct(intraHit, intraN),
    intradayReadN: intraN,
    dailyReadPct: pct(dailyHit, dailyN),
    dailyReadStrongPct: pct(dailyStrong, dailyN),
    dailyReadN: dailyN,
    executionPct,
    executionN: captureVals.length,
    captureTarget,
  };
}

export function computeStats(rows: string[][], filter?: StatsFilter, captureTarget: number = DEFAULT_CAPTURE_TARGET): AggregateStats {
  if (rows.length === 0) {
    return {
      totalPnl: 0, avgDailyPnl: 0, avgWinner: 0, avgLoser: 0,
      totalTrades: 0, winningTrades: 0, losingTrades: 0, winRate: 0,
      profitFactor: 0, largestWin: 0, largestLoss: 0,
      maxConsecutiveWins: 0, maxConsecutiveLosses: 0, avgDurationMins: 0,
      hourlyBreakdown: [], granularHourlyBreakdown: [], setupBreakdown: [],
      convictionBreakdown: [], catalystBreakdown: [],
      skill: emptySkill(captureTarget),
      disciplinePct: null, disciplineN: 0,
    };
  }

  const colMap = buildColMap(rows[0]);
  const pnlIdx = cm(colMap, "P&L");
  const dateIdx = cm(colMap, "Date");
  const durationIdx = cm(colMap, "Duration (mins)");
  const entryTimeIdx = cm(colMap, "Entry Time");
  const setupIdx = cm(colMap, "Setup");
  const convictionIdx = cm(colMap, "Conviction (1-3)");
  const catalystIdx = cm(colMap, "Catalyst");

  let dataRows = rows.slice(1).filter((r) => pnlIdx >= 0 && r.length > pnlIdx && r[pnlIdx] !== "");
  dataRows = applyRowFilter(dataRows, colMap, filter);

  const parsed: ParsedRow[] = dataRows.map((r) => ({
    pnl: parseFloat(String(pnlIdx >= 0 ? r[pnlIdx] : "0").replace(/[$,]/g, "")) || 0,
    duration: durationIdx >= 0 ? parseFloat(r[durationIdx]) || 0 : 0,
    entryMin: entryTimeIdx >= 0 ? parseTimeToMinutes(r[entryTimeIdx]) : -1,
    setup: setupIdx >= 0 ? (r[setupIdx] || "").trim() : "",
    conviction: convictionIdx >= 0 ? (r[convictionIdx] || "").trim() : "",
    catalyst: catalystIdx >= 0 ? (r[catalystIdx] || "").trim() : "",
  }));

  const pnls = parsed.map((p) => p.pnl);

  const emptyStats: AggregateStats = {
    totalPnl: 0, avgDailyPnl: 0, avgWinner: 0, avgLoser: 0,
    totalTrades: 0, winningTrades: 0, losingTrades: 0, winRate: 0,
    profitFactor: 0, largestWin: 0, largestLoss: 0,
    maxConsecutiveWins: 0, maxConsecutiveLosses: 0, avgDurationMins: 0,
    hourlyBreakdown: [], granularHourlyBreakdown: [], setupBreakdown: [],
    convictionBreakdown: [], catalystBreakdown: [],
    skill: emptySkill(captureTarget),
    disciplinePct: null, disciplineN: 0,
  };

  if (pnls.length === 0) return emptyStats;

  const skill = computeSkillMetrics(dataRows, colMap, captureTarget);

  // Discipline %: share of trades marked Process Followed? = Yes, among trades
  // labeled Yes or No (blanks excluded). Computed on the already-filtered
  // dataRows, so it respects the shared filter bar automatically.
  const processIdx = cm(colMap, "Process Followed?");
  let disciplineYes = 0;
  let disciplineN = 0;
  if (processIdx >= 0) {
    for (const r of dataRows) {
      const v = String(r[processIdx] || "").trim();
      if (v === "Yes") { disciplineYes++; disciplineN++; }
      else if (v === "No") { disciplineN++; }
    }
  }
  const disciplinePct = disciplineN > 0 ? Math.round((disciplineYes / disciplineN) * 1000) / 10 : null;

  const totalPnl = pnls.reduce((s, v) => s + v, 0);
  const uniqueDays = new Set(dateIdx >= 0 ? dataRows.map((r) => r[dateIdx]) : []).size || 1;
  const winners = pnls.filter((p) => p > 0);
  const losers = pnls.filter((p) => p < 0);
  const grossWins = winners.reduce((s, v) => s + v, 0);
  const grossLosses = Math.abs(losers.reduce((s, v) => s + v, 0));

  let maxConsecWins = 0;
  let maxConsecLosses = 0;
  let curWins = 0;
  let curLosses = 0;
  for (const p of pnls) {
    if (p > 0) { curWins++; curLosses = 0; maxConsecWins = Math.max(maxConsecWins, curWins); }
    else if (p < 0) { curLosses++; curWins = 0; maxConsecLosses = Math.max(maxConsecLosses, curLosses); }
    else { curWins = 0; curLosses = 0; }
  }

  const buildBreakdown = (blocks: typeof HOUR_BLOCKS) =>
    blocks.map((block) => {
      const blockPnls = parsed.filter((r) => r.entryMin >= block.startMin && r.entryMin < block.endMin).map((r) => r.pnl);
      return computeSegment(blockPnls, block.label);
    }).filter((s) => s.trades > 0);

  const hourlyBreakdown = buildBreakdown(HOUR_BLOCKS);
  const granularHourlyBreakdown = buildBreakdown(GRANULAR_HOUR_BLOCKS);

  const setupMap = new Map<string, number[]>();
  for (const r of parsed) {
    if (!r.setup) continue;
    const setups = r.setup.split(",").map((s) => s.trim()).filter(Boolean);
    for (const s of setups) {
      if (!setupMap.has(s)) setupMap.set(s, []);
      setupMap.get(s)!.push(r.pnl);
    }
  }
  const setupBreakdown = Array.from(setupMap.entries())
    .map(([setup, sPnls]) => computeSegment(sPnls, setup))
    .sort((a, b) => b.trades - a.trades);

  const convictionMap = new Map<string, number[]>();
  for (const r of parsed) {
    if (!r.conviction) continue;
    if (!convictionMap.has(r.conviction)) convictionMap.set(r.conviction, []);
    convictionMap.get(r.conviction)!.push(r.pnl);
  }
  const convictionBreakdown = Array.from(convictionMap.entries())
    .map(([level, cPnls]) => computeSegment(cPnls, `Conviction ${level}`))
    .sort((a, b) => a.label.localeCompare(b.label));

  const catalystMap = new Map<string, number[]>();
  for (const r of parsed) {
    if (!r.catalyst) continue;
    const catalysts = r.catalyst.split(",").map((s) => s.trim()).filter(Boolean);
    for (const c of catalysts) {
      if (!catalystMap.has(c)) catalystMap.set(c, []);
      catalystMap.get(c)!.push(r.pnl);
    }
  }
  const catalystBreakdown = Array.from(catalystMap.entries())
    .map(([cat, catPnls]) => computeSegment(catPnls, cat))
    .sort((a, b) => b.trades - a.trades);

  const durations = parsed.map((r) => r.duration);

  return {
    totalPnl: Math.round(totalPnl * 100) / 100,
    avgDailyPnl: Math.round((totalPnl / Math.max(uniqueDays, 1)) * 100) / 100,
    avgWinner: winners.length > 0 ? Math.round((grossWins / winners.length) * 100) / 100 : 0,
    avgLoser: losers.length > 0 ? Math.round((grossLosses / losers.length) * -100) / 100 : 0,
    totalTrades: pnls.length,
    winningTrades: winners.length,
    losingTrades: losers.length,
    winRate: Math.round((winners.length / pnls.length) * 1000) / 10,
    profitFactor: grossLosses > 0 ? Math.round((grossWins / grossLosses) * 100) / 100 : grossWins > 0 ? 9999 : 0,
    largestWin: winners.length > 0 ? Math.max(...winners) : 0,
    largestLoss: losers.length > 0 ? Math.min(...losers) : 0,
    maxConsecutiveWins: maxConsecWins,
    maxConsecutiveLosses: maxConsecLosses,
    avgDurationMins: Math.round((durations.reduce((s, v) => s + v, 0) / durations.length) * 10) / 10,
    hourlyBreakdown,
    granularHourlyBreakdown,
    setupBreakdown,
    convictionBreakdown,
    catalystBreakdown,
    skill,
    disciplinePct,
    disciplineN,
  };
}

export interface TradeForAnalysis {
  date: string;
  symbol: string;
  side: string;
  shares: number;
  avgEntry: number;
  avgExit: number;
  pnl: number;
  risk: number;
  maxRBeforeStop: number;
  maeR: number | null; // negative R (heat taken); null when not enriched or N/A
  setup: string;
  entryTime: string;
}

// "N/A" (insufficient history) and blank both parse to null.
function parseNullableNum(v: string | undefined): number | null {
  const n = parseFloat(String(v ?? "").replace(/[$,]/g, ""));
  return isNaN(n) ? null : n;
}

export function extractTradesForAnalysis(rows: string[][], filter?: StatsFilter): TradeForAnalysis[] {
  if (rows.length <= 1) return [];

  const colMap = buildColMap(rows[0]);
  const pnlIdx = cm(colMap, "P&L");
  const dateIdx = cm(colMap, "Date");
  const symbolIdx = cm(colMap, "Symbol");
  const sideIdx = cm(colMap, "Side");
  const sharesIdx = cm(colMap, "Shares");
  const entryIdx = cm(colMap, "Avg Entry");
  const exitIdx = cm(colMap, "Avg Exit");
  const riskIdx = cm(colMap, "R (Risk)");
  const maxRIdx = cm(colMap, "Max R Before Stop");
  const maeIdx = cm(colMap, "MAE (R)");
  const setupIdx = cm(colMap, "Setup");
  const entryTimeIdx = cm(colMap, "Entry Time");

  let dataRows = rows.slice(1).filter((r) => pnlIdx >= 0 && r.length > pnlIdx && r[pnlIdx] !== "");
  dataRows = applyRowFilter(dataRows, colMap, filter);

  const parseNum = (v: string | undefined) => parseFloat(String(v || "").replace(/[$,]/g, "")) || 0;

  return dataRows
    .filter((r) => riskIdx >= 0 && r[riskIdx] && r[riskIdx] !== "" && maxRIdx >= 0 && r[maxRIdx] && r[maxRIdx] !== "")
    .map((r) => ({
      date: dateIdx >= 0 ? r[dateIdx] || "" : "",
      symbol: symbolIdx >= 0 ? r[symbolIdx] || "" : "",
      side: sideIdx >= 0 ? r[sideIdx] || "" : "",
      shares: sharesIdx >= 0 ? parseNum(r[sharesIdx]) : 0,
      avgEntry: entryIdx >= 0 ? parseNum(r[entryIdx]) : 0,
      avgExit: exitIdx >= 0 ? parseNum(r[exitIdx]) : 0,
      pnl: parseNum(r[pnlIdx]),
      risk: riskIdx >= 0 ? parseNum(r[riskIdx]) : 0,
      maxRBeforeStop: maxRIdx >= 0 ? parseNum(r[maxRIdx]) : 0,
      maeR: maeIdx >= 0 ? parseNullableNum(r[maeIdx]) : null,
      setup: setupIdx >= 0 ? (r[setupIdx] || "").trim() : "",
      entryTime: entryTimeIdx >= 0 ? r[entryTimeIdx] || "" : "",
    }))
    .filter((t) => t.shares > 0 && t.risk > 0);
}

export async function getTradesForAnalysisFromTab(tabName: string, filter?: StatsFilter): Promise<TradeForAnalysis[]> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  const rows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:${READ_RANGE_END}`);
  return extractTradesForAnalysis(rows, filter);
}

export async function listSheetTabs(): Promise<{ name: string; gid: number }[]> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheetsGet(token, spreadsheetId);
  const EXCLUDED = new Set(["Instructions"]);
  return meta.sheets
    .filter((s) => !EXCLUDED.has(s.properties.title))
    .map((s) => ({ name: s.properties.title, gid: s.properties.sheetId }));
}

export interface BackfillTrade {
  date: string;
  entryTime: string;
  exitTime: string;
  side: string;
  symbol: string;
  avgEntry: number;
  index: number;
  riskPerShare?: number;
}

export async function getTradesForBackfill(tabName: string): Promise<BackfillTrade[]> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  const meta = await sheetsGet(token, spreadsheetId);
  const tab = meta.sheets.find((s) => s.properties.title === tabName);
  if (tab) {
    await migrateTabIfNeeded(token, spreadsheetId, tabName, tab.properties.sheetId);
  }

  const rows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:${READ_RANGE_END}`);
  if (rows.length <= 1) return [];

  const colMap = buildColMap(rows[0]);
  const symIdx = cm(colMap, "Symbol");
  const dateIdx = cm(colMap, "Date");
  const entryIdx = cm(colMap, "Entry Time");
  const exitIdx = cm(colMap, "Exit Time");
  const sideIdx = cm(colMap, "Side");
  const avgEntryIdx = cm(colMap, "Avg Entry");
  const sharesIdx = cm(colMap, "Shares");
  const riskIdx = cm(colMap, "R (Risk)");
  const orSizeIdx = cm(colMap, "OR Size ($)");
  const maxRIdx = cm(colMap, "Max R Before Stop");
  const maeIdx = cm(colMap, "MAE (R)");
  const dayOpenIdx = cm(colMap, "O");
  const adrIdx = cm(colMap, "ADR");

  const parseNum = (v: string | undefined) => parseFloat(String(v || "").replace(/[$,]/g, "")) || 0;
  const hasValue = (idx: number, row: string[]) => idx >= 0 && row[idx] !== undefined && row[idx] !== "";

  const trades: BackfillTrade[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (symIdx < 0 || !row[symIdx]) continue;

    const sym = String(row[symIdx]).trim();
    if (!sym || !isNaN(Number(sym)) || !/[A-Za-z]/.test(sym)) continue;

    const hasBasicEnrichment = hasValue(orSizeIdx, row);
    const hasMaxR = hasValue(maxRIdx, row);
    const hasMae = hasValue(maeIdx, row);
    // Daily candle group (OHLCV + ATR + 30mATR) fills together; the trade-date
    // Open ("O") is always computable when the daily bar exists, so its presence
    // marks the row as processed by the OHLCV enrichment (avoids re-triggering
    // forever on genuinely-uncomputable ATR values).
    const hasCandle = hasValue(dayOpenIdx, row);
    // ADR was added after OHLCV/ATR/30mATR, so rows enriched before it exist with
    // a candle but no ADR — treat a missing ADR as needing work so one Backfill
    // pass fills it. ADR is computable whenever the daily history is (else "N/A"),
    // so this won't re-trigger forever.
    const hasAdr = hasValue(adrIdx, row);
    const riskVal = riskIdx >= 0 ? parseNum(row[riskIdx]) : 0;
    const sharesVal = sharesIdx >= 0 ? parseNum(row[sharesIdx]) : 0;
    const hasRisk = riskVal > 0 && sharesVal > 0;

    // A row needs enrichment if it lacks the basic market data, the daily candle
    // group, or has R filled but is missing an R-dependent field (Max R Before
    // Stop, MAE). VIX is handled separately by the per-date backfillVixForTab pass.
    const needsWork = !hasBasicEnrichment || !hasCandle || !hasAdr || (hasRisk && (!hasMaxR || !hasMae));
    if (!needsWork) continue;

    const riskPerShare = hasRisk ? riskVal / sharesVal : undefined;

    trades.push({
      date: dateIdx >= 0 ? row[dateIdx] : "",
      entryTime: entryIdx >= 0 ? row[entryIdx] : "",
      exitTime: exitIdx >= 0 ? (row[exitIdx] || "") : "",
      side: sideIdx >= 0 ? row[sideIdx] : "",
      symbol: sym,
      avgEntry: avgEntryIdx >= 0 ? parseNum(row[avgEntryIdx]) : 0,
      index: r - 1,
      riskPerShare,
    });
  }
  return trades;
}

export async function getStatsForTab(tabName: string, filter?: StatsFilter, captureTarget?: number): Promise<AggregateStats> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheetsGet(token, spreadsheetId);
  const tab = meta.sheets.find((s) => s.properties.title === tabName);
  if (!tab) throw new Error(`Sheet tab "${tabName}" not found.`);
  const rows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:${READ_RANGE_END}`);
  return computeStats(rows, filter, captureTarget ?? DEFAULT_CAPTURE_TARGET);
}

// --- Trading Calendar ---

const CALENDAR_CONFIG_TAB = "Calendar Config";

interface FullREntry {
  effectiveDate: string; // YYYY-MM-DD
  fullR: number;
}

// account (or tab prefix) -> entries sorted by effectiveDate ascending
type FullRSchedule = { [account: string]: FullREntry[] };

// Reads the "Calendar Config" tab. Returns {} if the tab is absent or empty —
// callers fall back to Realized R when no Full R baseline is configured.
async function getFullRSchedule(token: string, spreadsheetId: string): Promise<FullRSchedule> {
  let rows: string[][];
  try {
    rows = await sheetsValuesGet(token, spreadsheetId, `'${CALENDAR_CONFIG_TAB}'!A:C`);
  } catch {
    return {};
  }
  if (rows.length <= 1) return {};

  const colMap = buildColMap(rows[0]);
  const acctIdx = cm(colMap, "Account");
  const dateIdx = cm(colMap, "Effective Date");
  const fullRIdx = cm(colMap, "Full R($)");
  if (acctIdx < 0 || dateIdx < 0 || fullRIdx < 0) return {};

  const schedule: FullRSchedule = {};
  for (const r of rows.slice(1)) {
    const account = (r[acctIdx] || "").trim();
    const effectiveDate = (r[dateIdx] || "").trim();
    const fullR = parseFloat(String(r[fullRIdx] || "").replace(/[$,]/g, ""));
    if (!account || !effectiveDate || isNaN(fullR) || fullR <= 0) continue;
    if (!schedule[account]) schedule[account] = [];
    schedule[account].push({ effectiveDate, fullR });
  }
  for (const acct of Object.keys(schedule)) {
    schedule[acct].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  }
  return schedule;
}

// Picks the Full R baseline applicable to a tab on a given date: the latest
// schedule entry whose effectiveDate <= date, for the matching account.
function fullRForDate(schedule: FullRSchedule, tabName: string, date: string): number | null {
  // Match the config "Account" to this tab: exact, or the tab starts with it
  // (e.g. account "ACCT1234" applies to tab "ACCT1234-XX").
  let entries: FullREntry[] | undefined;
  if (schedule[tabName]) {
    entries = schedule[tabName];
  } else {
    const key = Object.keys(schedule).find(
      (acct) => tabName === acct || tabName.startsWith(`${acct}-`) || tabName.startsWith(acct)
    );
    entries = key ? schedule[key] : undefined;
  }
  if (!entries || entries.length === 0) return null;

  let applicable: number | null = null;
  for (const e of entries) {
    if (e.effectiveDate <= date) applicable = e.fullR;
    else break;
  }
  // If the date predates every configured entry, fall back to the earliest one.
  return applicable ?? entries[0].fullR;
}

// --- Daily Plan (pre-market watchlist: conviction, catalyst, bias, MTF read) ---

const DAILY_PLAN_TAB = "Daily Plan";
const PLAN_HEADERS = [
  "Date", "Symbol", "Conviction (1-3)", "Thesis", "Catalyst", "L2 Bias",
  "Daily Trend", "Daily Conv", "1H Trend", "1H Conv", "5m Trend", "5m Conv",
  // Day-level psych check-in — one value per day, replicated onto each plan
  // row for the date (appended at the end so older plan rows still align).
  ...PSYCH_SCALE_HEADERS, URGE_HEADER,
  // Day-level sleep/readiness inputs, same replicated-per-date convention.
  ...SLEEP_HEADERS,
];
// Plan range spans A..(last PLAN_HEADERS column).
const PLAN_RANGE = `A:${colLetter(PLAN_HEADERS.length - 1)}`;

// Fields that carry from the plan onto a matching trade at upload (fill-if-blank).
// The header string is identical on the plan tab and the trade sheet, so one map
// drives both reading the plan and writing the trade row. (Origin is handled
// separately — it's derived from plan *presence*, not a stored column.)
type PlanFill = {
  conviction: string;
  catalyst: string;
  l2Bias: string;
  dailyTrend: string;
  dailyConv: string;
  hourlyTrend: string;
  hourlyConv: string;
  fiveMinTrend: string;
  fiveMinConv: string;
};
const PLAN_FILL_COLS: { key: keyof PlanFill; header: string }[] = [
  { key: "conviction", header: "Conviction (1-3)" },
  { key: "catalyst", header: "Catalyst" },
  { key: "l2Bias", header: "L2 Bias" },
  { key: "dailyTrend", header: "Daily Trend" },
  { key: "dailyConv", header: "Daily Conv" },
  { key: "hourlyTrend", header: "1H Trend" },
  { key: "hourlyConv", header: "1H Conv" },
  { key: "fiveMinTrend", header: "5m Trend" },
  { key: "fiveMinConv", header: "5m Conv" },
];

// Day-level psych fields: one value per date (not per symbol), so they flow
// onto EVERY trade row of the date — including off-plan symbols — keyed by
// date alone. Same convention as PLAN_FILL_COLS: the header string is
// identical on the plan tab and the trade sheet.
export interface DailyPsych {
  energy: string;
  tension: string;
  urgeFast: string;
  sleepScore: string;      // 0-100
  readinessScore: string;  // 0-100
  sleepDuration: string;   // hours slept (decimals allowed, e.g. 7.5)
}
const DAY_FILL_COLS: { key: keyof DailyPsych; header: string }[] = [
  { key: "energy", header: "Energy (1-5)" },
  { key: "tension", header: "Tension (1-5)" },
  { key: "urgeFast", header: URGE_HEADER },
  { key: "sleepScore", header: "Sleep Score" },
  { key: "readinessScore", header: "Readiness Score" },
  { key: "sleepDuration", header: "Sleep (hrs)" },
];

export function emptyDailyPsych(): DailyPsych {
  return { energy: "", tension: "", urgeFast: "", sleepScore: "", readinessScore: "", sleepDuration: "" };
}

export interface DailyPlanEntry extends PlanFill {
  symbol: string;
  thesis: string;
}

function emptyPlanFill(): PlanFill {
  return {
    conviction: "", catalyst: "", l2Bias: "",
    dailyTrend: "", dailyConv: "", hourlyTrend: "", hourlyConv: "", fiveMinTrend: "", fiveMinConv: "",
  };
}

async function ensureDailyPlanTab(token: string, spreadsheetId: string): Promise<void> {
  const meta = await sheetsGet(token, spreadsheetId);
  const exists = meta.sheets.some((s) => s.properties.title === DAILY_PLAN_TAB);
  if (exists) return;
  await sheetsBatchUpdate(token, spreadsheetId, [
    { addSheet: { properties: { title: DAILY_PLAN_TAB } } },
  ]);
  await sheetsValuesUpdate(token, spreadsheetId, `'${DAILY_PLAN_TAB}'!A1`, [PLAN_HEADERS]);
}

// All plan rows as lookups: "date|SYMBOL" -> PlanFill (per-symbol fields) and
// date -> DailyPsych (day-level fields, first non-empty value per date wins).
// Returns empty maps when the tab is absent. Presence in bySymbol => Origin
// "Watchlist"; absence => "Intraday discovery".
async function getDailyPlanMap(
  token: string,
  spreadsheetId: string
): Promise<{ bySymbol: Map<string, PlanFill>; psychByDate: Map<string, DailyPsych> }> {
  const bySymbol = new Map<string, PlanFill>();
  const psychByDate = new Map<string, DailyPsych>();
  let rows: string[][];
  try {
    rows = await sheetsValuesGet(token, spreadsheetId, `'${DAILY_PLAN_TAB}'!${PLAN_RANGE}`);
  } catch {
    return { bySymbol, psychByDate };
  }
  if (rows.length <= 1) return { bySymbol, psychByDate };
  const colMap = buildColMap(rows[0]);
  const dIdx = cm(colMap, "Date");
  const sIdx = cm(colMap, "Symbol");
  if (dIdx < 0 || sIdx < 0) return { bySymbol, psychByDate };
  for (const r of rows.slice(1)) {
    const date = (r[dIdx] || "").trim();
    const symbol = (r[sIdx] || "").trim().toUpperCase();
    if (!date || !symbol) continue;
    const fill = emptyPlanFill();
    for (const { key, header } of PLAN_FILL_COLS) {
      const idx = cm(colMap, header);
      fill[key] = idx >= 0 ? (r[idx] || "").trim() : "";
    }
    bySymbol.set(`${date}|${symbol}`, fill);

    const psych = psychByDate.get(date) ?? emptyDailyPsych();
    for (const { key, header } of DAY_FILL_COLS) {
      const idx = cm(colMap, header);
      if (!psych[key] && idx >= 0) psych[key] = (r[idx] || "").trim();
    }
    psychByDate.set(date, psych);
  }
  return { bySymbol, psychByDate };
}

export async function getDailyPlan(
  date: string
): Promise<{ entries: DailyPlanEntry[]; daily: DailyPsych }> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  const daily = emptyDailyPsych();
  let rows: string[][];
  try {
    rows = await sheetsValuesGet(token, spreadsheetId, `'${DAILY_PLAN_TAB}'!${PLAN_RANGE}`);
  } catch {
    return { entries: [], daily };
  }
  if (rows.length <= 1) return { entries: [], daily };
  const colMap = buildColMap(rows[0]);
  const dIdx = cm(colMap, "Date");
  const sIdx = cm(colMap, "Symbol");
  const tIdx = cm(colMap, "Thesis");
  const entries = rows
    .slice(1)
    .filter((r) => (r[dIdx] || "").trim() === date && (r[sIdx] || "").trim())
    .map((r) => {
      const fill = emptyPlanFill();
      for (const { key, header } of PLAN_FILL_COLS) {
        const idx = cm(colMap, header);
        fill[key] = idx >= 0 ? (r[idx] || "").trim() : "";
      }
      // Day-level psych: first non-empty value across the date's rows wins.
      for (const { key, header } of DAY_FILL_COLS) {
        const idx = cm(colMap, header);
        if (!daily[key] && idx >= 0) daily[key] = (r[idx] || "").trim();
      }
      return {
        ...fill,
        symbol: (r[sIdx] || "").trim().toUpperCase(),
        thesis: tIdx >= 0 ? (r[tIdx] || "").trim() : "",
      };
    });
  return { entries, daily };
}

// Replace all rows for a given date with the supplied entries. Dedups entries by
// symbol (uppercased) so manually re-typing seeded QQQ/SPY never doubles a row.
// The day-level psych check-in is replicated onto each row of the date.
export async function upsertDailyPlan(
  date: string,
  entries: DailyPlanEntry[],
  daily?: DailyPsych
): Promise<number> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  await ensureDailyPlanTab(token, spreadsheetId);

  const rows = await sheetsValuesGet(token, spreadsheetId, `'${DAILY_PLAN_TAB}'!${PLAN_RANGE}`);
  const otherDates = rows.slice(1).filter((r) => (r[0] || "").trim() !== date && (r[0] || "").trim());

  const seen = new Set<string>();
  const cleaned: DailyPlanEntry[] = [];
  for (const e of entries) {
    const sym = (e.symbol || "").trim().toUpperCase();
    if (!sym || seen.has(sym)) continue;
    seen.add(sym);
    const fill = emptyPlanFill();
    for (const { key } of PLAN_FILL_COLS) fill[key] = (e[key] || "").trim();
    cleaned.push({ ...fill, symbol: sym, thesis: (e.thesis || "").trim() });
  }

  const psych = emptyDailyPsych();
  for (const { key } of DAY_FILL_COLS) psych[key] = (daily?.[key] || "").trim();

  // Build each row in PLAN_HEADERS order.
  const rowFor = (e: DailyPlanEntry): string[] =>
    PLAN_HEADERS.map((h) => {
      if (h === "Date") return date;
      if (h === "Symbol") return e.symbol;
      if (h === "Thesis") return e.thesis;
      const dayCol = DAY_FILL_COLS.find((c) => c.header === h);
      if (dayCol) return psych[dayCol.key];
      const col = PLAN_FILL_COLS.find((c) => c.header === h);
      return col ? e[col.key] : "";
    });
  const newRows = cleaned.map(rowFor);
  const out: (string | number)[][] = [PLAN_HEADERS, ...otherDates, ...newRows];

  await sheetsValuesClear(token, spreadsheetId, `'${DAILY_PLAN_TAB}'!${PLAN_RANGE}`);
  await sheetsValuesUpdate(token, spreadsheetId, `'${DAILY_PLAN_TAB}'!A1`, out);
  return cleaned.length;
}

export interface DailyTrade {
  symbol: string;
  setup: string;
  side: string;
  entryTime: string;
  pnl: number;
  realizedR: number | null; // P&L vs its own risk
  standardR: number | null; // P&L ÷ Full R target for the date
  risk: number | null; // deployed $ risk
  maxRBeforeStop: number | null; // MFE — used for the weekly bracket counterfactual
  conviction: string;
  processFollowed: string; // "Yes" | "No" | "" — for drill-down badge
  hasNote: boolean;
}

export interface DailyCalendarCell {
  date: string; // YYYY-MM-DD
  pnl: number;
  realizedR: number; // sum of P&L (R) — each trade vs its own risk
  standardR: number | null; // sum of P&L / Full R target for the date; null if no baseline
  trades: number;
  wins: number;
  losses: number;
  avgRisk: number | null; // average deployed $ risk across the day's trades
  fullR: number | null; // Full R target in effect that date
  hasNote: boolean;
  tradeList: DailyTrade[]; // per-trade detail for drill-down
}

export interface CalendarData {
  cells: DailyCalendarCell[];
  hasFullRConfig: boolean;
}

export async function getDailyCalendar(tabName: string, filter?: StatsFilter): Promise<CalendarData> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheetsGet(token, spreadsheetId);
  const tab = meta.sheets.find((s) => s.properties.title === tabName);
  if (!tab) throw new Error(`Sheet tab "${tabName}" not found.`);

  const [rows, schedule] = await Promise.all([
    sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:${READ_RANGE_END}`),
    getFullRSchedule(token, spreadsheetId),
  ]);
  if (rows.length <= 1) return { cells: [], hasFullRConfig: false };

  const colMap = buildColMap(rows[0]);
  const dateIdx = cm(colMap, "Date");
  const pnlIdx = cm(colMap, "P&L");
  const pnlRIdx = cm(colMap, "P&L (R)");
  const riskIdx = cm(colMap, "R (Risk)");
  const notesIdx = cm(colMap, "Notes");
  const eodIdx = cm(colMap, "EOD Screenshot");
  const symbolIdx = cm(colMap, "Symbol");
  const setupIdx = cm(colMap, "Setup");
  const sideIdx = cm(colMap, "Side");
  const entryTimeIdx = cm(colMap, "Entry Time");
  const convictionIdx = cm(colMap, "Conviction (1-3)");
  const processIdx = cm(colMap, "Process Followed?");
  const maxRIdx = cm(colMap, "Max R Before Stop");
  const parseNum = (v: string | undefined) => parseFloat(String(v || "").replace(/[$,]/g, ""));

  const hasFullRConfig = fullRForDate(schedule, tabName, "9999-12-31") !== null;

  interface Acc {
    pnl: number;
    realizedR: number;
    trades: number;
    wins: number;
    losses: number;
    riskSum: number;
    riskCount: number;
    hasNote: boolean;
    rawTrades: { pnl: number; realizedR: number | null; risk: number | null; maxRBeforeStop: number | null; symbol: string; setup: string; side: string; entryTime: string; conviction: string; processFollowed: string; hasNote: boolean }[];
  }
  const byDate = new Map<string, Acc>();

  let dataRows = rows.slice(1).filter((r) => pnlIdx >= 0 && r.length > pnlIdx && r[pnlIdx] !== undefined && r[pnlIdx] !== "");
  dataRows = applyRowFilter(dataRows, colMap, filter);

  for (const r of dataRows) {
    const date = (dateIdx >= 0 ? r[dateIdx] : "") || "";
    if (!date) continue;
    const pnl = parseNum(r[pnlIdx]) || 0;

    if (!byDate.has(date)) {
      byDate.set(date, { pnl: 0, realizedR: 0, trades: 0, wins: 0, losses: 0, riskSum: 0, riskCount: 0, hasNote: false, rawTrades: [] });
    }
    const a = byDate.get(date)!;
    a.pnl += pnl;
    a.trades += 1;
    if (pnl > 0) a.wins += 1;
    else if (pnl < 0) a.losses += 1;

    const pnlR = pnlRIdx >= 0 ? parseNum(r[pnlRIdx]) : NaN;
    const risk = riskIdx >= 0 ? parseNum(r[riskIdx]) : NaN;
    if (!isNaN(pnlR)) a.realizedR += pnlR;
    else if (!isNaN(risk) && risk > 0) a.realizedR += pnl / risk;
    if (!isNaN(risk) && risk > 0) { a.riskSum += risk; a.riskCount += 1; }

    const notes = notesIdx >= 0 ? (r[notesIdx] || "").trim() : "";
    const eod = eodIdx >= 0 ? (r[eodIdx] || "").trim() : "";
    const rowHasNote = !!(notes || eod);
    if (rowHasNote) a.hasNote = true;

    a.rawTrades.push({
      pnl: Math.round(pnl * 100) / 100,
      realizedR: !isNaN(pnlR) ? pnlR : (!isNaN(risk) && risk > 0 ? Math.round((pnl / risk) * 100) / 100 : null),
      risk: !isNaN(risk) && risk > 0 ? risk : null,
      maxRBeforeStop: maxRIdx >= 0 ? parseNullableNum(r[maxRIdx]) : null,
      symbol: symbolIdx >= 0 ? (r[symbolIdx] || "").trim() : "",
      setup: setupIdx >= 0 ? (r[setupIdx] || "").trim() : "",
      side: sideIdx >= 0 ? (r[sideIdx] || "").trim() : "",
      entryTime: entryTimeIdx >= 0 ? (r[entryTimeIdx] || "").trim() : "",
      conviction: convictionIdx >= 0 ? (r[convictionIdx] || "").trim() : "",
      processFollowed: processIdx >= 0 ? (r[processIdx] || "").trim() : "",
      hasNote: rowHasNote,
    });
  }

  const cells: DailyCalendarCell[] = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, a]) => {
      const fullR = fullRForDate(schedule, tabName, date);
      return {
        date,
        pnl: Math.round(a.pnl * 100) / 100,
        realizedR: Math.round(a.realizedR * 100) / 100,
        standardR: fullR ? Math.round((a.pnl / fullR) * 100) / 100 : null,
        trades: a.trades,
        wins: a.wins,
        losses: a.losses,
        avgRisk: a.riskCount > 0 ? Math.round((a.riskSum / a.riskCount) * 100) / 100 : null,
        fullR,
        hasNote: a.hasNote,
        tradeList: a.rawTrades
          .sort((x, y) => x.entryTime.localeCompare(y.entryTime))
          .map((t) => ({
            symbol: t.symbol,
            setup: t.setup,
            side: t.side,
            entryTime: t.entryTime,
            pnl: t.pnl,
            realizedR: t.realizedR,
            standardR: fullR ? Math.round((t.pnl / fullR) * 100) / 100 : null,
            risk: t.risk,
            maxRBeforeStop: t.maxRBeforeStop,
            conviction: t.conviction,
            processFollowed: t.processFollowed,
            hasNote: t.hasNote,
          })),
      };
    });

  return { cells, hasFullRConfig };
}

export async function populateInstructionsSheet(): Promise<void> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  const tabName = "Instructions";
  const meta = await sheetsGet(token, spreadsheetId);
  const tab = meta.sheets.find((s) => s.properties.title === tabName);
  if (!tab) throw new Error(`"${tabName}" sheet tab not found. Please create it first.`);
  const sheetId = tab.properties.sheetId;

  const HEADER_ROW = ["Column", "Auto-filled?", "Description"];

  const COLUMN_DOCS: [string, string, string][] = [
    ["Date", "Yes", "The date the trades were executed (YYYY-MM-DD)."],
    ["Entry Time", "Yes", "Time of the first fill that opened the position (HH:MM:SS)."],
    ["Exit Time", "Yes", "Time of the last fill that closed the position (HH:MM:SS)."],
    ["Duration (mins)", "Yes", "How long the round-trip trade lasted, in minutes."],
    ["Symbol", "Yes", "The ticker symbol traded (e.g. AAPL, QQQ)."],
    ["Side", "Yes", "Whether the trade was Long or Short."],
    ["Shares", "Yes", "Total number of shares traded in the round trip."],
    ["Avg Entry", "Yes", "Volume-weighted average entry price across all entry fills."],
    ["Avg Exit", "Yes", "Volume-weighted average exit price across all exit fills."],
    ["Stop", "Formula", "Auto-calculated stop price: Entry - R/Shares (Long) or Entry + R/Shares (Short). Populates after you enter R."],
    ["# Partials", "Yes", "Number of individual executions (fills) that made up this trade."],
    ["P&L", "Yes", "Profit or loss in dollars for the round-trip trade."],
    ["R (Risk)", "No — you fill this in", "Your planned dollar risk on this trade (e.g. if your stop was $0.10 on 100 shares, R = $10). Used to calculate P&L in R multiples."],
    ["P&L (R)", "Formula", "Auto-calculated: P&L divided by R. Shows how many risk units you gained or lost. Only populates after you enter R."],
    ["Setup", "No — you fill this in", "The trade setup type. Select from the dropdown: ORB, ABCD, BHOD, BLOD, VWAP Bounce, or Mean Reversion."],
    ["Process Followed?", "No — you fill this in", "Did you follow your trading plan and rules for this trade? Select Yes or No from the dropdown."],
    ["Notes", "No — you fill this in", "Free-form notes: what you were thinking, what went right or wrong, lessons for next time."],
    ["Sleep Score", "Auto-filled from Morning Plan", "Your sleep quality score (0–100). Logged pre-market in the Morning Plan check-in; auto-fills onto every trade of the day. Edit here only to correct."],
    ["Readiness Score", "Auto-filled from Morning Plan", "Your overall readiness to trade (0–100). Logged pre-market in the Morning Plan check-in; auto-fills onto every trade of the day. Edit here only to correct."],
    ["Sleep (hrs)", "Auto-filled from Morning Plan", "How long you slept, in hours (decimals allowed, e.g. 7.5). Logged pre-market in the Morning Plan check-in; auto-fills onto every trade of the day. Edit here only to correct."],
    ["Emotional State", "No — you fill this in (daily)", "Legacy daily field, kept for history — the Energy / Tension / Urge to Trade Fast? columns are the primary psych capture now (logged in the Morning Plan). Dropdown: Calm, Anxious, Excited, Frustrated, or Fatigued."],
    ["Energy (1-5)", "Auto-filled from Morning Plan", "Daily energy level logged pre-market in the Morning Plan: 1 = drained, 5 = fully charged. Auto-fills onto every trade of the day."],
    ["Tension (1-5)", "Auto-filled from Morning Plan", "Daily tension level logged pre-market in the Morning Plan: 1 = settled, 5 = wired/racing. Auto-fills onto every trade of the day."],
    ["Urge to Trade Fast?", "Auto-filled from Morning Plan", "Yes/No — did you arrive with an urge to jump in fast? Logged pre-market in the Morning Plan; auto-fills onto every trade of the day."],
    ["Market Bias", "No — you fill this in (daily)", "Your pre-market read on the overall market direction. Select from dropdown: Bullish, Bearish, or Neutral. Fill in once per day."],
    ["Conviction (1-3)", "No — you fill this in", "Your conviction level for this trade before/at entry: 1 (low), 2 (solid), 3 (A+ setup)."],
    ["Catalyst", "No — you fill this in", "The catalyst driving the trade. Select one or type comma-separated: Earnings/News, Upgrade/Downgrade, FDA/Regulatory, Sector Momentum, Gap Only, Key Daily Level, Day 2, Pullback to DEMA, Other."],
    ["Tags", "No — you fill this in", "Retrospective pattern tags applied during screenshot review. Comma-separated: clean entry, extended entry, chased, FOMO, added size, perfect process, revenge trade, oversize, strong momentum, gap>2xATR, gap<2xATR, or custom."],
    ["Max R Before Stop", "Yes (market data)", "Highest R-multiple the stock reached before the stop was hit (order-aware). If the stop was never hit, this is the max R by end of day. Requires R to be filled in. Used by 1R-6R columns."],
    ["Farthest Price", "Yes (market data)", "The actual stock price at the farthest favorable point before the stop was hit. Requires R to be filled in."],
    ["MAE (R)", "Yes (market data)", "Max Adverse Excursion: the worst the trade went against entry during the actual holding window (entry to exit), in R-multiples. Negative (e.g. -0.62); 0 = never went against entry. Requires R to be filled in."],
    ["1R", "Formula", "Y/N — did Max R Before Stop reach at least 1x? Green = Y, Red = N."],
    ["2R", "Formula", "Y/N — did the favorable move reach at least 2x your per-share risk?"],
    ["3R", "Formula", "Y/N — did the favorable move reach at least 3x your per-share risk?"],
    ["4R", "Formula", "Y/N — did the favorable move reach at least 4x your per-share risk?"],
    ["5R", "Formula", "Y/N — did the favorable move reach at least 5x your per-share risk?"],
    ["6R", "Formula", "Y/N — did the favorable move reach at least 6x your per-share risk?"],
    ["#1m", "Yes (market data)", "Number of consecutive 1-minute candles in the trade direction at entry (including the entry candle). Green candles for Long, red for Short."],
    ["#5m", "Yes (market data)", "Number of consecutive 5-minute candles in the trade direction at entry."],
    ["#1H", "Yes (market data)", "Number of consecutive 1-hour candles in the trade direction at entry."],
    ["%Gap", "Yes (market data)", "Percentage gap from previous day's close to today's open. Positive = gap up, negative = gap down."],
    ["%ATR", "Yes (market data)", "Percentage of the 14-day Average True Range already consumed by the time of entry. High values mean much of the expected daily range was already used."],
    ["RVOL", "Yes (market data)", "Relative Volume at entry time compared to the same time on prior days. >1 means above-average volume activity."],
    ["%VWAP", "Yes (market data)", "Percentage distance from VWAP at entry. Positive = above VWAP, negative = below VWAP."],
    ["OR Size ($)", "Yes (market data)", "Opening range size in dollars (OR high minus OR low). The OR is the first 5 minutes (9:30-9:35 ET)."],
    ["OR %ATR", "Yes (market data)", "Opening range size as a percentage of ATR-14. Smaller OR relative to ATR means more room to run."],
    ["OR High", "Yes (market data)", "The high price of the 5-minute opening range."],
    ["OR Low", "Yes (market data)", "The low price of the 5-minute opening range."],
    ["Breakout Vol Ratio", "Yes (market data)", "Volume of the breakout bar divided by avg volume of OR bars. Higher = stronger conviction breakout."],
    ["Prior Close Loc", "Yes (market data)", "Where the previous day closed within its range (0=at low, 100=at high)."],
    ["Dist 20 SMA (%)", "Yes (market data)", "Distance from the 20-day SMA as a percentage. Positive = above SMA."],
    ["Dist 50 SMA (%)", "Yes (market data)", "Distance from the 50-day SMA as a percentage. Positive = above SMA."],
    ["Float", "Yes (market data)", "Total shares float (outstanding shares available for trading). From Polygon reference data."],
    ["Avg $ Vol", "Yes (market data)", "Average daily dollar volume over the past 20 trading days."],
    ["SPY Dir", "Yes (market data)", "SPY direction at your entry time: Up, Down, or Flat relative to SPY's open."],
    ["VIX", "Yes (market data)", "VIX level on the trade date. Higher VIX = higher implied volatility."],
    ["PDC", "Yes (market data)", "Prior Day Close — the closing price from the previous trading day."],
    ["PDH", "Yes (market data)", "Prior Day High — the high price from the previous trading day."],
    ["PDL", "Yes (market data)", "Prior Day Low — the low price from the previous trading day."],
    ["O", "Yes (market data)", "Trade-date daily candle Open. Reference point for the daily/intraday prediction metrics (favorable move measured from the open)."],
    ["H", "Yes (market data)", "Trade-date daily candle High. For a long, H minus O is the favorable excursion beyond the open."],
    ["L", "Yes (market data)", "Trade-date daily candle Low. For a short, O minus L is the favorable excursion beyond the open."],
    ["C", "Yes (market data)", "Trade-date daily candle Close."],
    ["V", "Yes (market data)", "Trade-date daily Volume (total shares traded that day)."],
    ["ATR", "Yes (market data)", "Daily ATR ($) — mean TRUE range of the 14 sessions BEFORE the trade date (pre-open snapshot, no lookahead). Includes overnight gaps. Reference volatility; also feeds %ATR / OR %ATR."],
    ["30mATR", "Yes (market data)", "30-minute ATR ($) — mean of the 9:30-10:00 ET range over the 14 sessions BEFORE the trade date (pre-open snapshot). The yardstick for the Intra-Day Prediction metric (1x = a typical opening-bell move in your direction)."],
    ["ADR", "Yes (market data)", "Average Daily Range ($) — mean of (High − Low) over the 14 sessions BEFORE the trade date (pre-open snapshot, no lookahead). Gap-free, unlike ATR. The yardstick for the Daily Prediction metric (0.8x = headline, 1.0x = strong read), matching the gap-free favorable move from the open."],
  ];

  const SPACER: string[] = [];

  const MANUAL_DETAILS: [string, string][] = [
    ["R (Risk)", "Enter your dollar risk for the trade. This is the amount you would have lost if your stop was hit. Example: 100 shares with a $0.10 stop = $10 risk."],
    ["Setup", "Select the setup from the dropdown. If your setup isn't listed, pick the closest match and note it in the Notes column."],
    ["Process Followed?", "Honestly assess whether you followed your trading plan. This is for your own development — be truthful."],
    ["Notes", "Write anything that will help you learn: your reasoning, emotions, what the chart looked like, what you'd do differently."],
    ["Conviction (1-3)", "Rate your conviction before entry: 1 = low (taking it but not ideal), 2 = solid setup, 3 = A+ setup. Over time, compare your P&L across conviction levels."],
    ["Catalyst", "Select the catalyst from dropdown or type comma-separated values for multiple: Earnings/News, Upgrade/Downgrade, FDA/Regulatory, Sector Momentum, Gap Only, Key Daily Level, Day 2, Pullback to DEMA, Other."],
    ["Tags", "Add tags during screenshot review to categorize patterns. Comma-separated. Use the web app's Screenshot Review page or type directly."],
    ["Sleep Score", "Log in the Morning Plan check-in (0–100). Auto-fills onto every trade of the day; edit here only to correct."],
    ["Readiness Score", "Log in the Morning Plan check-in (0–100). Auto-fills onto every trade of the day; edit here only to correct."],
    ["Sleep (hrs)", "Log in the Morning Plan check-in (hours slept, decimals allowed). Auto-fills onto every trade of the day; edit here only to correct."],
    ["Emotional State", "Legacy — kept for history. Log Energy / Tension / Urge to Trade Fast? in the Morning Plan instead; they auto-fill onto the day's trades."],
    ["Market Bias", "Select from dropdown. Fill in once per day. Over time, see if having a strong bias helps or hurts your trading."],
    ["Energy (1-5)", "Log in the Morning Plan before the open: 1 = drained, 5 = fully charged. Auto-fills onto every trade of the day; edit here only to correct."],
    ["Tension (1-5)", "Log in the Morning Plan before the open: 1 = settled, 5 = wired/racing. Auto-fills onto every trade of the day; edit here only to correct."],
    ["Urge to Trade Fast?", "Log in the Morning Plan before the open: Yes/No. A leading indicator for FOMO/revenge patterns — compare P&L on Yes days vs No days."],
  ];

  const rows: (string | number)[][] = [
    ["TRADE JOURNAL — COLUMN REFERENCE"],
    SPACER,
    HEADER_ROW,
    ...COLUMN_DOCS,
    SPACER,
    SPACER,
    ["COLUMNS YOU NEED TO FILL IN"],
    ["After each upload, open the sheet and complete these four columns for every trade:"],
    SPACER,
    ["Column", "What to enter"],
    ...MANUAL_DETAILS,
    SPACER,
    SPACER,
    ["TIPS"],
    ["• Upload your DAS Trader CSV at tapereader.us/pct-bootcamp/trade-journal at the end of each trading day."],
    ["• The system detects duplicates — uploading the same CSV twice won't create duplicate rows."],
    ["• Columns with a different header color in your trade sheet are the ones you need to fill in manually."],
    ["• Your P&L (R) column auto-calculates once you enter your R value."],
    ["• Review your stats on the web app after uploading to spot patterns in your trading."],
    ["• N/A in a market-data column means the ticker is too recently listed to compute that field (not enough daily history). A blank cell means the row hasn't been enriched yet."],
  ];

  await sheetsValuesUpdate(token, spreadsheetId, `'${tabName}'!A1`, rows);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requests: any[] = [];

  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 3 },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.headerBg,
          textFormat: { bold: true, fontSize: 14, foregroundColor: COLORS.headerText },
        },
      },
      fields: "userEnteredFormat(textFormat,backgroundColor)",
    },
  });

  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 3 },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 10, foregroundColor: COLORS.headerText },
          backgroundColor: COLORS.headerBg,
        },
      },
      fields: "userEnteredFormat(textFormat,backgroundColor)",
    },
  });

  const dataStartRow = 3;
  for (let i = 0; i < COLUMN_DOCS.length; i++) {
    if (COLUMN_DOCS[i][1].startsWith("No")) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: dataStartRow + i, endRowIndex: dataStartRow + i + 1, startColumnIndex: 1, endColumnIndex: 2 },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true, foregroundColor: COLORS.vividGreenText },
              backgroundColor: COLORS.vividGreenBg,
            },
          },
          fields: "userEnteredFormat(textFormat,backgroundColor)",
        },
      });
    }
  }

  const manualTitleRow = dataStartRow + COLUMN_DOCS.length + 2;
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: manualTitleRow, endRowIndex: manualTitleRow + 1, startColumnIndex: 0, endColumnIndex: 3 },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 12, foregroundColor: COLORS.headerText },
          backgroundColor: COLORS.headerBg,
        },
      },
      fields: "userEnteredFormat(textFormat,backgroundColor)",
    },
  });

  const manualHeaderRow = manualTitleRow + 3;
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: manualHeaderRow, endRowIndex: manualHeaderRow + 1, startColumnIndex: 0, endColumnIndex: 2 },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 10, foregroundColor: COLORS.headerText },
          backgroundColor: COLORS.headerBg,
        },
      },
      fields: "userEnteredFormat(textFormat,backgroundColor)",
    },
  });

  const tipsRow = manualHeaderRow + 1 + MANUAL_DETAILS.length + 2;
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: tipsRow, endRowIndex: tipsRow + 1, startColumnIndex: 0, endColumnIndex: 3 },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 12, foregroundColor: COLORS.headerText },
          backgroundColor: COLORS.headerBg,
        },
      },
      fields: "userEnteredFormat(textFormat,backgroundColor)",
    },
  });

  requests.push(
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 }, properties: { pixelSize: 180 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 }, properties: { pixelSize: 180 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 2, endIndex: 3 }, properties: { pixelSize: 600 }, fields: "pixelSize" } },
  );

  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 3 },
      cell: { userEnteredFormat: { wrapStrategy: "WRAP" } },
      fields: "userEnteredFormat.wrapStrategy",
    },
  });

  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 10 },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.darkBg,
          textFormat: { foregroundColor: COLORS.headerText },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat.foregroundColor)",
    },
  });

  await sheetsBatchUpdate(token, spreadsheetId, requests);

  await sheetsValuesUpdate(token, spreadsheetId, `'${tabName}'!A1`, rows);
}

export async function appendTrades(
  trades: GroupedTrade[],
  sheetSuffix: string,
  enrichments?: MarketEnrichment[]
): Promise<{ appended: number; skipped: number; accounts: string[]; sheetGid: number | null; stats: AggregateStats | null }> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  // Pre-market plan lookup for auto-fill: per-symbol fields (date|SYMBOL ->
  // conviction/catalyst/L2 bias/MTF read) and day-level psych (date -> Energy/
  // Tension/Urge, applied to every trade of the date, on- or off-plan).
  const { bySymbol: planMap, psychByDate } = await getDailyPlanMap(token, spreadsheetId);

  const byAccount = new Map<string, { trade: GroupedTrade; enrichment?: MarketEnrichment }[]>();
  for (let i = 0; i < trades.length; i++) {
    const t = trades[i];
    if (!byAccount.has(t.account)) byAccount.set(t.account, []);
    byAccount.get(t.account)!.push({ trade: t, enrichment: enrichments?.[i] });
  }

  let totalAppended = 0;
  let totalSkipped = 0;
  const usedAccounts: string[] = [];
  let firstGid: number | null = null;

  for (const [account, items] of byAccount) {
    const { tabName, gid } = await ensureSheetTab(token, spreadsheetId, account, sheetSuffix);
    usedAccounts.push(tabName);
    if (firstGid === null) firstGid = gid;

    const existing = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:${READ_RANGE_END}`);
    const tabColMap = existing.length > 0 ? buildColMap(existing[0]) : buildColMap(SHEET_HEADERS);
    const existingKeys = new Set(existing.slice(1).map((row) => makeDedupeKey(row, tabColMap)));

    const nextRowStart = existing.length + 1;
    const newRows: (string | number)[][] = [];
    let skipped = 0;

    const originIdx = cm(tabColMap, "Origin");
    // Resolve trade-sheet column index for each plan-fill field once.
    const fillIdx = PLAN_FILL_COLS.map((c) => ({ key: c.key, idx: cm(tabColMap, c.header) }));
    const dayFillIdx = DAY_FILL_COLS.map((c) => ({ key: c.key, idx: cm(tabColMap, c.header) }));

    for (const { trade, enrichment } of items) {
      const rowIndex = nextRowStart + newRows.length;
      const row = tradeToRow(trade, rowIndex, tabColMap, enrichment);
      const key = makeDedupeKey(row, tabColMap);
      if (existingKeys.has(key)) { skipped++; continue; }

      // Auto-fill from the pre-market Daily Plan (by date|symbol). Origin is derived
      // from presence (on the plan => Watchlist; off-plan => Intraday discovery);
      // conviction/catalyst/L2 bias/MTF read fill in only when the cell is blank.
      // QQQ/SPY are always-watchlist (seeded on every plan) even if no plan was
      // saved that day.
      const upperSym = (trade.symbol || "").toUpperCase();
      const plan = planMap.get(`${trade.date}|${upperSym}`);
      if (originIdx >= 0) {
        row[originIdx] = plan || ALWAYS_WATCHLIST_SYMBOLS.has(upperSym)
          ? "Watchlist"
          : "Intraday discovery";
      }
      if (plan) {
        for (const { key, idx } of fillIdx) {
          const val = plan[key];
          if (idx >= 0 && val && (row[idx] === "" || row[idx] == null)) {
            row[idx] = val;
          }
        }
      }

      // Day-level psych check-in applies to every trade of the date,
      // regardless of whether the symbol was on the plan.
      const psych = psychByDate.get(trade.date);
      if (psych) {
        for (const { key, idx } of dayFillIdx) {
          const val = psych[key];
          if (idx >= 0 && val && (row[idx] === "" || row[idx] == null)) {
            row[idx] = val;
          }
        }
      }

      newRows.push(row);
    }

    if (newRows.length > 0) {
      await sheetsValuesAppend(token, spreadsheetId, `'${tabName}'!A1`, newRows);
    }

    totalAppended += newRows.length;
    totalSkipped += skipped;
  }

  let stats: AggregateStats | null = null;
  if (usedAccounts.length > 0) {
    const allRows = await sheetsValuesGet(token, spreadsheetId, `'${usedAccounts[0]}'!A:${READ_RANGE_END}`);
    stats = computeStats(allRows);
  }

  return { appended: totalAppended, skipped: totalSkipped, accounts: usedAccounts, sheetGid: firstGid, stats };
}

export async function updateEnrichment(
  tabName: string,
  symbol: string,
  enrichments: { date: string; entryTime: string; side: string; data: MarketEnrichment }[]
): Promise<{ updated: number }> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  const rows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:${READ_RANGE_END}`);
  if (rows.length <= 1) return { updated: 0 };

  const colMap = buildColMap(rows[0]);
  const symIdx = cm(colMap, "Symbol");
  const dateIdx = cm(colMap, "Date");
  const entryIdx = cm(colMap, "Entry Time");
  const sideIdx = cm(colMap, "Side");

  const enrichFieldMap: [string, (d: MarketEnrichment) => string | number | null][] = [
    ["#1m", (d) => d.consec1m],
    ["#5m", (d) => d.consec5m],
    ["#1H", (d) => d.consec1h],
    ["%Gap", (d) => d.gapPct],
    ["%ATR", (d) => d.atrPct],
    ["RVOL", (d) => d.rvol],
    ["%VWAP", (d) => d.vwapPct],
    ["OR Size ($)", (d) => d.orSize],
    ["OR %ATR", (d) => d.orAtrPct],
    ["OR High", (d) => d.orHigh],
    ["OR Low", (d) => d.orLow],
    ["Max R Before Stop", (d) => d.maxRBeforeStop],
    ["Farthest Price", (d) => d.farthestPrice],
    ["MAE (R)", (d) => d.maeR],
    ["Breakout Vol Ratio", (d) => d.breakoutVolRatio],
    ["Prior Close Loc", (d) => d.priorCloseLoc],
    ["Dist 20 SMA (%)", (d) => d.dist20Sma],
    ["Dist 50 SMA (%)", (d) => d.dist50Sma],
    ["Float", (d) => d.floatShares],
    ["Avg $ Vol", (d) => d.avgDollarVol],
    ["SPY Dir", (d) => d.spyDir],
    ["VIX", (d) => d.vix],
    ["PDC", (d) => d.pdc],
    ["PDH", (d) => d.pdh],
    ["PDL", (d) => d.pdl],
    ["O", (d) => d.dayOpen],
    ["H", (d) => d.dayHigh],
    ["L", (d) => d.dayLow],
    ["C", (d) => d.dayClose],
    ["V", (d) => d.dayVolume],
    ["ATR", (d) => d.atr14],
    ["30mATR", (d) => d.atr30m],
    ["ADR", (d) => d.adr14],
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const valueRanges: any[] = [];
  const used = new Set<number>();

  for (const e of enrichments) {
    const normEntry = normalizeTime(e.entryTime);
    for (let r = 1; r < rows.length; r++) {
      if (used.has(r)) continue;
      const row = rows[r];
      if (
        symIdx >= 0 && row[symIdx] === symbol &&
        dateIdx >= 0 && row[dateIdx] === e.date &&
        entryIdx >= 0 && normalizeTime(row[entryIdx]) === normEntry &&
        sideIdx >= 0 && row[sideIdx] === e.side
      ) {
        used.add(r);
        const rowNum = r + 1;
        for (const [header, getter] of enrichFieldMap) {
          const colIdx = cm(colMap, header);
          if (colIdx < 0) continue;
          // null = not computable this run — keep whatever the cell already
          // holds (blank means "not enriched yet"; a re-run must never wipe a
          // previously computed value). "N/A" is written through as a value.
          const value = getter(e.data);
          if (value === null || value === undefined) continue;
          valueRanges.push({
            range: `'${tabName}'!${colLetter(colIdx)}${rowNum}`,
            values: [[value]],
          });
        }
        break;
      }
    }
  }

  if (valueRanges.length > 0) {
    const res = await fetch(
      `${SHEETS_BASE}/${spreadsheetId}/values:batchUpdate`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          valueInputOption: "RAW",
          data: valueRanges,
        }),
      }
    );
    if (!res.ok) throw new Error(`Sheets batchUpdate values failed: ${await res.text()}`);
  }

  return { updated: valueRanges.length };
}

// Fills every blank VIX cell in the tab from per-date index data (Polygon
// I:VIX when the plan allows, else CBOE's free daily history). VIX is per-date,
// not per-symbol, so this runs as one fast pass — no per-symbol Polygon calls,
// and it works even for rows whose symbol enrichment fails (e.g. delisted
// tickers). Existing VIX values are never overwritten.
export async function backfillVixForTab(
  tabName: string
): Promise<{ updated: number; missingDates: string[] }> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  const rows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:${READ_RANGE_END}`);
  if (rows.length <= 1) return { updated: 0, missingDates: [] };

  const colMap = buildColMap(rows[0]);
  const dateIdx = cm(colMap, "Date");
  const symIdx = cm(colMap, "Symbol");
  const vixIdx = cm(colMap, "VIX");
  if (dateIdx < 0 || vixIdx < 0) {
    throw new Error("VIX backfill: Date or VIX column not found in sheet.");
  }

  const targets: { rowNum: number; date: string }[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const date = (row[dateIdx] || "").trim();
    const sym = symIdx >= 0 ? String(row[symIdx] || "").trim() : "";
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (!sym || !/[A-Za-z]/.test(sym)) continue;
    if (row[vixIdx] !== undefined && row[vixIdx] !== "") continue;
    targets.push({ rowNum: r + 1, date });
  }
  if (targets.length === 0) return { updated: 0, missingDates: [] };

  const dates = targets.map((t) => t.date).sort();
  const vixByDate = await fetchVixMap(dates[0], dates[dates.length - 1]);

  const missing = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const valueRanges: any[] = [];
  for (const t of targets) {
    const vix = vixByDate.get(t.date);
    if (vix === undefined) {
      missing.add(t.date);
      continue;
    }
    valueRanges.push({
      range: `'${tabName}'!${colLetter(vixIdx)}${t.rowNum}`,
      values: [[vix]],
    });
  }

  if (valueRanges.length > 0) {
    const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}/values:batchUpdate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ valueInputOption: "RAW", data: valueRanges }),
    });
    if (!res.ok) throw new Error(`VIX backfill batchUpdate failed: ${await res.text()}`);
  }

  return { updated: valueRanges.length, missingDates: [...missing].sort() };
}

export interface TradeRowForReview {
  date: string;
  symbol: string;
  side: string;
  entryTime: string;
  pnl: number;
  pnlR: number;
  risk: number;
  setup: string;
  tags: string;
  processFollowed: string;
  catalyst: string;
  shares: number;
  avgEntry: number;
  avgExit: number;
  notes: string;
  rowIndex: number; // 1-based sheet row number
  maxRBeforeStop: number | null;
  maeR: number | null; // negative R (heat taken); null when not enriched
  duration: number; // minutes
}

export async function getTradesForReview(tabName: string): Promise<TradeRowForReview[]> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  const rows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:${READ_RANGE_END}`);
  if (rows.length <= 1) return [];

  const colMap = buildColMap(rows[0]);
  const parseNum = (v: string | undefined) => parseFloat(String(v || "").replace(/[$,]/g, "")) || 0;

  return rows.slice(1)
    .map((r, i) => ({
      date: r[cm(colMap, "Date")] || "",
      symbol: r[cm(colMap, "Symbol")] || "",
      side: r[cm(colMap, "Side")] || "",
      entryTime: r[cm(colMap, "Entry Time")] || "",
      pnl: parseNum(r[cm(colMap, "P&L")]),
      pnlR: parseNum(r[cm(colMap, "P&L (R)")]),
      risk: parseNum(r[cm(colMap, "R (Risk)")]),
      setup: (r[cm(colMap, "Setup")] || "").trim(),
      tags: (r[cm(colMap, "Tags")] || "").trim(),
      processFollowed: (r[cm(colMap, "Process Followed?")] || "").trim(),
      catalyst: (r[cm(colMap, "Catalyst")] || "").trim(),
      shares: parseNum(r[cm(colMap, "Shares")]),
      avgEntry: parseNum(r[cm(colMap, "Avg Entry")]),
      avgExit: parseNum(r[cm(colMap, "Avg Exit")]),
      notes: (r[cm(colMap, "Notes")] || "").trim(),
      rowIndex: i + 2, // 1-based, header is row 1
      maxRBeforeStop: parseNullableNum(r[cm(colMap, "Max R Before Stop")]),
      maeR: parseNullableNum(r[cm(colMap, "MAE (R)")]),
      duration: parseNum(r[cm(colMap, "Duration (mins)")]),
    }))
    .filter((t) => t.date && t.symbol);
}

export async function updateTradeTags(
  tabName: string,
  rowIndex: number,
  tags: string
): Promise<void> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  // Read headers to find Tags column position (handles reordered sheets)
  const headerRows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!1:1`);
  const colMap = buildColMap(headerRows[0] || []);
  const tagsIdx = cm(colMap, "Tags");
  if (tagsIdx < 0) throw new Error("Tags column not found in sheet.");

  const range = `'${tabName}'!${colLetter(tagsIdx)}${rowIndex}`;
  await sheetsValuesUpdate(token, spreadsheetId, range, [[tags]]);
}
