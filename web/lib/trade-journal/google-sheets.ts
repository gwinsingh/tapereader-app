import { GroupedTrade } from "./trade-grouper";
import { MarketEnrichment } from "./market-data";

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
  "MFE ($)",
  "MAE ($)",
  "MFE Time (mins)",
  "Breakout Vol Ratio",
  "Prior Close Loc",
  "Dist 20 SMA (%)",
  "Dist 50 SMA (%)",
  "Float",
  "Avg $ Vol",
  "SPY Dir",
  "VIX",
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
  PARTIALS: 9,
  PNL: 10,
  RISK: 11,
  PNL_R: 12,
  SETUP: 13,
  PROCESS: 14,
  NOTES: 15,
  SLEEP: 16,
  READINESS: 17,
  EMOTIONAL: 18,
  BIAS: 19,
  CONVICTION: 20,
  CATALYST: 21,
  CONSEC_1M: 22,
  CONSEC_5M: 23,
  CONSEC_1H: 24,
  GAP_PCT: 25,
  ATR_PCT: 26,
  RVOL: 27,
  VWAP_PCT: 28,
  OR_SIZE: 29,
  OR_ATR_PCT: 30,
  OR_HIGH: 31,
  OR_LOW: 32,
  MFE: 33,
  MAE: 34,
  MFE_TIME: 35,
  BREAKOUT_VOL: 36,
  PRIOR_CLOSE_LOC: 37,
  DIST_20_SMA: 38,
  DIST_50_SMA: 39,
  FLOAT: 40,
  AVG_DOLLAR_VOL: 41,
  SPY_DIR: 42,
  VIX_LEVEL: 43,
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

const SETUP_OPTIONS = [
  "ORB",
  "ABCD",
  "BHOD",
  "BLOD",
  "VWAP Bounce",
  "Mean Reversion",
];

const CATALYST_OPTIONS = [
  "Earnings",
  "Upgrade/Downgrade",
  "FDA/Regulatory",
  "Sector Momentum",
  "Gap Only",
  "Key Daily Level",
  "Day 2",
  "Pullback to DEMA",
  "Other",
];

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

async function getAccessToken(): Promise<string> {
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
    scope: "https://www.googleapis.com/auth/spreadsheets",
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

  const manualHeaders = ["R (Risk)", "Setup", "Process Followed?", "Notes", "Sleep Score", "Readiness Score", "Emotional State", "Market Bias", "Conviction (1-3)", "Catalyst"];

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
    "Shares": 70, "Avg Entry": 95, "Avg Exit": 95,
    "# Partials": 85, "P&L": 95, "R (Risk)": 95,
    "P&L (R)": 85, "Setup": 140, "Process Followed?": 130, "Notes": 200,
    "Sleep Score": 100, "Readiness Score": 120, "Emotional State": 120, "Market Bias": 100,
    "Conviction (1-3)": 100, "Catalyst": 160,
    "#1m": 55, "#5m": 55, "#1H": 55,
    "%Gap": 70, "%ATR": 70, "RVOL": 65, "%VWAP": 75,
    "OR Size ($)": 85, "OR %ATR": 75, "OR High": 85, "OR Low": 85,
    "MFE ($)": 75, "MAE ($)": 75, "MFE Time (mins)": 95,
    "Breakout Vol Ratio": 110, "Prior Close Loc": 105,
    "Dist 20 SMA (%)": 105, "Dist 50 SMA (%)": 105,
    "Float": 100, "Avg $ Vol": 100,
    "SPY Dir": 70, "VIX": 60,
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
  for (const h of ["P&L", "R (Risk)", "OR Size ($)", "OR High", "OR Low", "MFE ($)", "MAE ($)", "Avg Entry", "Avg Exit"]) {
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

  for (const h of ["Duration (mins)", "P&L (R)"]) {
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

  // Number format: Sleep & Readiness scores (whole numbers)
  for (const h of ["Sleep Score", "Readiness Score", "#1m", "#5m", "#1H", "MFE Time (mins)"]) {
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

  for (const h of ["%ATR", "OR %ATR", "Prior Close Loc"]) {
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

  for (const h of ["RVOL", "Breakout Vol Ratio", "VIX"]) {
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
  for (const h of ["Setup", "Notes", "Catalyst"]) {
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
  for (const h of ["Side", "Shares", "# Partials", "Duration (mins)", "Process Followed?", "Sleep Score", "Readiness Score", "Emotional State", "Market Bias", "Conviction (1-3)", "#1m", "#5m", "#1H", "%Gap", "%ATR", "RVOL", "%VWAP", "OR %ATR", "MFE Time (mins)", "Breakout Vol Ratio", "Prior Close Loc", "Dist 20 SMA (%)", "Dist 50 SMA (%)", "Float", "Avg $ Vol", "SPY Dir", "VIX"]) {
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
  for (const h of ["Avg Entry", "Avg Exit", "P&L", "R (Risk)", "P&L (R)", "OR Size ($)", "OR High", "OR Low", "MFE ($)", "MAE ($)"]) {
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

  if (missingHeaders.length === 0) return;

  await sheetsBatchUpdate(token, spreadsheetId, [
    { appendDimension: { sheetId, dimension: "COLUMNS", length: missingHeaders.length } },
  ]);

  const startCol = headerRow.length;
  const endCol = startCol + missingHeaders.length;
  const range = `'${tabTitle}'!${colLetter(startCol)}1:${colLetter(endCol - 1)}1`;
  await sheetsValuesUpdate(token, spreadsheetId, range, [missingHeaders]);

  const fullHeader = [...headerRow, ...missingHeaders];
  await applyFormatting(token, spreadsheetId, sheetId, buildColMap(fullHeader));
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

function tradeToRow(trade: GroupedTrade, rowIndex: number, colMap: ColMap, enrichment?: MarketEnrichment): (string | number)[] {
  const size = Math.max(...Object.values(colMap)) + 1;
  const row: (string | number)[] = new Array(size).fill("");

  const set = (header: string, value: string | number) => {
    const idx = colMap[header];
    if (idx !== undefined) row[idx] = value;
  };

  const riskIdx = colMap["R (Risk)"];
  const pnlIdx = colMap["P&L"];
  const pnlRFormula = riskIdx !== undefined && pnlIdx !== undefined
    ? `=IF(${colLetter(riskIdx)}${rowIndex}="","",${colLetter(pnlIdx)}${rowIndex}/${colLetter(riskIdx)}${rowIndex})`
    : "";

  set("Date", trade.date);
  set("Entry Time", trade.entryTime);
  set("Exit Time", trade.exitTime);
  set("Duration (mins)", trade.durationMins);
  set("Symbol", trade.symbol);
  set("Side", trade.side);
  set("Shares", trade.totalShares);
  set("Avg Entry", trade.avgEntry);
  set("Avg Exit", trade.avgExit);
  set("# Partials", trade.numPartials);
  set("P&L", trade.pnl);
  set("P&L (R)", pnlRFormula);

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
    set("MFE ($)", e.mfeDollars ?? "");
    set("MAE ($)", e.maeDollars ?? "");
    set("MFE Time (mins)", e.mfeTimeMins ?? "");
    set("Breakout Vol Ratio", e.breakoutVolRatio ?? "");
    set("Prior Close Loc", e.priorCloseLoc ?? "");
    set("Dist 20 SMA (%)", e.dist20Sma ?? "");
    set("Dist 50 SMA (%)", e.dist50Sma ?? "");
    set("Float", e.floatShares ?? "");
    set("Avg $ Vol", e.avgDollarVol ?? "");
    set("SPY Dir", e.spyDir ?? "");
    set("VIX", e.vix ?? "");
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
}

export interface StatsFilter {
  processFollowed?: boolean;
  startDate?: string;
  endDate?: string;
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

export function computeStats(rows: string[][], filter?: StatsFilter): AggregateStats {
  if (rows.length === 0) {
    return {
      totalPnl: 0, avgDailyPnl: 0, avgWinner: 0, avgLoser: 0,
      totalTrades: 0, winningTrades: 0, losingTrades: 0, winRate: 0,
      profitFactor: 0, largestWin: 0, largestLoss: 0,
      maxConsecutiveWins: 0, maxConsecutiveLosses: 0, avgDurationMins: 0,
      hourlyBreakdown: [], granularHourlyBreakdown: [], setupBreakdown: [],
      convictionBreakdown: [], catalystBreakdown: [],
    };
  }

  const colMap = buildColMap(rows[0]);
  const pnlIdx = cm(colMap, "P&L");
  const dateIdx = cm(colMap, "Date");
  const processIdx = cm(colMap, "Process Followed?");
  const durationIdx = cm(colMap, "Duration (mins)");
  const entryTimeIdx = cm(colMap, "Entry Time");
  const setupIdx = cm(colMap, "Setup");
  const convictionIdx = cm(colMap, "Conviction (1-3)");
  const catalystIdx = cm(colMap, "Catalyst");

  let dataRows = rows.slice(1).filter((r) => pnlIdx >= 0 && r.length > pnlIdx && r[pnlIdx] !== "");

  if (filter?.processFollowed && processIdx >= 0) {
    dataRows = dataRows.filter((r) => (r[processIdx] || "").trim() === "Yes");
  }
  if (filter?.startDate && dateIdx >= 0) {
    dataRows = dataRows.filter((r) => (r[dateIdx] || "") >= filter.startDate!);
  }
  if (filter?.endDate && dateIdx >= 0) {
    dataRows = dataRows.filter((r) => (r[dateIdx] || "") <= filter.endDate!);
  }

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
  };

  if (pnls.length === 0) return emptyStats;

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
  };
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
}

export async function getTradesForBackfill(tabName: string): Promise<BackfillTrade[]> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  const meta = await sheetsGet(token, spreadsheetId);
  const tab = meta.sheets.find((s) => s.properties.title === tabName);
  if (tab) {
    await migrateTabIfNeeded(token, spreadsheetId, tabName, tab.properties.sheetId);
  }

  const rows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:AR`);
  if (rows.length <= 1) return [];

  const colMap = buildColMap(rows[0]);
  const symIdx = cm(colMap, "Symbol");
  const dateIdx = cm(colMap, "Date");
  const entryIdx = cm(colMap, "Entry Time");
  const exitIdx = cm(colMap, "Exit Time");
  const sideIdx = cm(colMap, "Side");
  const avgEntryIdx = cm(colMap, "Avg Entry");
  const orSizeIdx = cm(colMap, "OR Size ($)");

  const trades: BackfillTrade[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (symIdx < 0 || !row[symIdx]) continue;

    // Validate symbol looks like a real ticker, not a number from a misaligned column
    const sym = String(row[symIdx]).trim();
    if (!sym || !isNaN(Number(sym)) || !/[A-Za-z]/.test(sym)) continue;

    const hasFullEnrichment = orSizeIdx >= 0 && row[orSizeIdx] !== undefined && row[orSizeIdx] !== "";
    if (hasFullEnrichment) continue;

    trades.push({
      date: dateIdx >= 0 ? row[dateIdx] : "",
      entryTime: entryIdx >= 0 ? row[entryIdx] : "",
      exitTime: exitIdx >= 0 ? (row[exitIdx] || "") : "",
      side: sideIdx >= 0 ? row[sideIdx] : "",
      symbol: sym,
      avgEntry: avgEntryIdx >= 0 ? parseFloat(String(row[avgEntryIdx]).replace(/[$,]/g, "")) || 0 : 0,
      index: r - 1,
    });
  }
  return trades;
}

export async function getStatsForTab(tabName: string, filter?: StatsFilter): Promise<AggregateStats> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheetsGet(token, spreadsheetId);
  const tab = meta.sheets.find((s) => s.properties.title === tabName);
  if (!tab) throw new Error(`Sheet tab "${tabName}" not found.`);
  const rows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:AR`);
  return computeStats(rows, filter);
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
    ["# Partials", "Yes", "Number of individual executions (fills) that made up this trade."],
    ["P&L", "Yes", "Profit or loss in dollars for the round-trip trade."],
    ["R (Risk)", "No — you fill this in", "Your planned dollar risk on this trade (e.g. if your stop was $0.10 on 100 shares, R = $10). Used to calculate P&L in R multiples."],
    ["P&L (R)", "Formula", "Auto-calculated: P&L divided by R. Shows how many risk units you gained or lost. Only populates after you enter R."],
    ["Setup", "No — you fill this in", "The trade setup type. Select from the dropdown: ORB, ABCD, BHOD, BLOD, VWAP Bounce, or Mean Reversion."],
    ["Process Followed?", "No — you fill this in", "Did you follow your trading plan and rules for this trade? Select Yes or No from the dropdown."],
    ["Notes", "No — you fill this in", "Free-form notes: what you were thinking, what went right or wrong, lessons for next time."],
    ["Sleep Score", "No — you fill this in (daily)", "Your sleep quality score (0–100). Fill in once on the first trade of each day."],
    ["Readiness Score", "No — you fill this in (daily)", "Your overall readiness to trade (0–100). Fill in once on the first trade of each day."],
    ["Emotional State", "No — you fill this in (daily)", "How you're feeling before trading. Select from dropdown: Calm, Anxious, Excited, Frustrated, or Fatigued. Fill in once per day."],
    ["Market Bias", "No — you fill this in (daily)", "Your pre-market read on the overall market direction. Select from dropdown: Bullish, Bearish, or Neutral. Fill in once per day."],
    ["Conviction (1-3)", "No — you fill this in", "Your conviction level for this trade before/at entry: 1 (low), 2 (solid), 3 (A+ setup)."],
    ["Catalyst", "No — you fill this in", "The catalyst driving the trade. Select one or type comma-separated: Earnings, Upgrade/Downgrade, FDA/Regulatory, Sector Momentum, Gap Only, Key Daily Level, Day 2, Pullback to DEMA, Other."],
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
    ["MFE ($)", "Yes (market data)", "Maximum Favorable Excursion: the furthest the trade went in your favor ($/share) between entry and exit."],
    ["MAE ($)", "Yes (market data)", "Maximum Adverse Excursion: the furthest the trade went against you ($/share) between entry and exit."],
    ["MFE Time (mins)", "Yes (market data)", "Minutes from entry to when MFE occurred. Shows how quickly the move played out."],
    ["Breakout Vol Ratio", "Yes (market data)", "Volume of the breakout bar divided by avg volume of OR bars. Higher = stronger conviction breakout."],
    ["Prior Close Loc", "Yes (market data)", "Where the previous day closed within its range (0=at low, 100=at high)."],
    ["Dist 20 SMA (%)", "Yes (market data)", "Distance from the 20-day SMA as a percentage. Positive = above SMA."],
    ["Dist 50 SMA (%)", "Yes (market data)", "Distance from the 50-day SMA as a percentage. Positive = above SMA."],
    ["Float", "Yes (market data)", "Total shares float (outstanding shares available for trading). From Polygon reference data."],
    ["Avg $ Vol", "Yes (market data)", "Average daily dollar volume over the past 20 trading days."],
    ["SPY Dir", "Yes (market data)", "SPY direction at your entry time: Up, Down, or Flat relative to SPY's open."],
    ["VIX", "Yes (market data)", "VIX level on the trade date. Higher VIX = higher implied volatility."],
  ];

  const SPACER: string[] = [];

  const MANUAL_DETAILS: [string, string][] = [
    ["R (Risk)", "Enter your dollar risk for the trade. This is the amount you would have lost if your stop was hit. Example: 100 shares with a $0.10 stop = $10 risk."],
    ["Setup", "Select the setup from the dropdown. If your setup isn't listed, pick the closest match and note it in the Notes column."],
    ["Process Followed?", "Honestly assess whether you followed your trading plan. This is for your own development — be truthful."],
    ["Notes", "Write anything that will help you learn: your reasoning, emotions, what the chart looked like, what you'd do differently."],
    ["Conviction (1-3)", "Rate your conviction before entry: 1 = low (taking it but not ideal), 2 = solid setup, 3 = A+ setup. Over time, compare your P&L across conviction levels."],
    ["Catalyst", "Select the catalyst from dropdown or type comma-separated values for multiple: Earnings, Upgrade/Downgrade, FDA/Regulatory, Sector Momentum, Gap Only, Key Daily Level, Day 2, Pullback to DEMA, Other."],
    ["Sleep Score", "Rate your sleep quality 0–100. Fill in once on the first trade row of each day."],
    ["Readiness Score", "Rate your overall readiness to trade 0–100. Fill in once on the first trade row of each day."],
    ["Emotional State", "Select from dropdown. Fill in once per day. Track this to find correlations between your state and your P&L."],
    ["Market Bias", "Select from dropdown. Fill in once per day. Over time, see if having a strong bias helps or hurts your trading."],
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

    const existing = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:AR`);
    const tabColMap = existing.length > 0 ? buildColMap(existing[0]) : buildColMap(SHEET_HEADERS);
    const existingKeys = new Set(existing.slice(1).map((row) => makeDedupeKey(row, tabColMap)));

    const nextRowStart = existing.length + 1;
    const newRows: (string | number)[][] = [];
    let skipped = 0;

    for (const { trade, enrichment } of items) {
      const rowIndex = nextRowStart + newRows.length;
      const row = tradeToRow(trade, rowIndex, tabColMap, enrichment);
      const key = makeDedupeKey(row, tabColMap);
      if (existingKeys.has(key)) { skipped++; } else { newRows.push(row); }
    }

    if (newRows.length > 0) {
      await sheetsValuesAppend(token, spreadsheetId, `'${tabName}'!A1`, newRows);
    }

    totalAppended += newRows.length;
    totalSkipped += skipped;
  }

  let stats: AggregateStats | null = null;
  if (usedAccounts.length > 0) {
    const allRows = await sheetsValuesGet(token, spreadsheetId, `'${usedAccounts[0]}'!A:AR`);
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

  const rows = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:AR`);
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
    ["MFE ($)", (d) => d.mfeDollars],
    ["MAE ($)", (d) => d.maeDollars],
    ["MFE Time (mins)", (d) => d.mfeTimeMins],
    ["Breakout Vol Ratio", (d) => d.breakoutVolRatio],
    ["Prior Close Loc", (d) => d.priorCloseLoc],
    ["Dist 20 SMA (%)", (d) => d.dist20Sma],
    ["Dist 50 SMA (%)", (d) => d.dist50Sma],
    ["Float", (d) => d.floatShares],
    ["Avg $ Vol", (d) => d.avgDollarVol],
    ["SPY Dir", (d) => d.spyDir],
    ["VIX", (d) => d.vix],
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
          valueRanges.push({
            range: `'${tabName}'!${colLetter(colIdx)}${rowNum}`,
            values: [[getter(e.data) ?? ""]],
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
