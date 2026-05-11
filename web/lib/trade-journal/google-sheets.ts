import { GroupedTrade } from "./trade-grouper";

// Column layout (0-indexed):
// A=Date, B=Entry Time, C=Exit Time, D=Duration (mins), E=Symbol,
// F=Side, G=Shares, H=Avg Entry, I=Avg Exit, J=# Partials,
// K=P&L, L=R (Risk), M=P&L (R), N=Setup, O=Process Followed?, P=Notes
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
} as const;

const MANUAL_COLS = new Set([COL.RISK, COL.SETUP, COL.PROCESS, COL.NOTES]);

const TOTAL_COLS = SHEET_HEADERS.length;

const SETUP_OPTIONS = [
  "ORB",
  "ABCD",
  "BHOD",
  "BLOD",
  "VWAP Bounce",
  "Mean Reversion",
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
async function applyFormatting(token: string, spreadsheetId: string, sheetId: number) {
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
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: TOTAL_COLS },
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

  for (const col of MANUAL_COLS) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: col, endColumnIndex: col + 1 },
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

  const colWidths: Record<number, number> = {
    [COL.DATE]: 100, [COL.ENTRY_TIME]: 90, [COL.EXIT_TIME]: 90,
    [COL.DURATION]: 105, [COL.SYMBOL]: 80, [COL.SIDE]: 70,
    [COL.SHARES]: 70, [COL.AVG_ENTRY]: 95, [COL.AVG_EXIT]: 95,
    [COL.PARTIALS]: 85, [COL.PNL]: 95, [COL.RISK]: 95,
    [COL.PNL_R]: 85, [COL.SETUP]: 140, [COL.PROCESS]: 130, [COL.NOTES]: 200,
  };
  for (const [col, width] of Object.entries(colWidths)) {
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: Number(col), endIndex: Number(col) + 1 },
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

  for (const col of [COL.PNL, COL.RISK]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.DURATION, endColumnIndex: COL.DURATION + 1 },
      cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "0.0" } } },
      fields: "userEnteredFormat.numberFormat",
    },
  });

  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PNL_R, endColumnIndex: COL.PNL_R + 1 },
      cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "0.0" } } },
      fields: "userEnteredFormat.numberFormat",
    },
  });

  for (const col of [COL.AVG_ENTRY, COL.AVG_EXIT]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // Conditional formatting: Side
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.SIDE, endColumnIndex: COL.SIDE + 1 }],
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
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.SIDE, endColumnIndex: COL.SIDE + 1 }],
        booleanRule: {
          condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "Short" }] },
          format: { backgroundColor: COLORS.vividRedBg, textFormat: { foregroundColor: COLORS.vividRedText, bold: true } },
        },
      },
      index: 1,
    },
  });

  // Conditional formatting: P&L
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PNL, endColumnIndex: COL.PNL + 1 }],
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
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PNL, endColumnIndex: COL.PNL + 1 }],
        booleanRule: {
          condition: { type: "NUMBER_LESS", values: [{ userEnteredValue: "0" }] },
          format: { textFormat: { foregroundColor: COLORS.redText, bold: true } },
        },
      },
      index: 3,
    },
  });

  // Conditional formatting: P&L (R)
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PNL_R, endColumnIndex: COL.PNL_R + 1 }],
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
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PNL_R, endColumnIndex: COL.PNL_R + 1 }],
        booleanRule: {
          condition: { type: "NUMBER_LESS", values: [{ userEnteredValue: "0" }] },
          format: { textFormat: { foregroundColor: COLORS.redText } },
        },
      },
      index: 5,
    },
  });

  // Conditional formatting: Process Followed?
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PROCESS, endColumnIndex: COL.PROCESS + 1 }],
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
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PROCESS, endColumnIndex: COL.PROCESS + 1 }],
        booleanRule: {
          condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "No" }] },
          format: { backgroundColor: COLORS.vividRedBg, textFormat: { foregroundColor: COLORS.vividRedText, bold: true } },
        },
      },
      index: 7,
    },
  });

  // Data validation: Process Followed?
  requests.push({
    setDataValidation: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PROCESS, endColumnIndex: COL.PROCESS + 1 },
      rule: {
        condition: { type: "ONE_OF_LIST", values: [{ userEnteredValue: "Yes" }, { userEnteredValue: "No" }] },
        showCustomUi: true,
        strict: true,
      },
    },
  });

  // Data validation: Setup
  requests.push({
    setDataValidation: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.SETUP, endColumnIndex: COL.SETUP + 1 },
      rule: {
        condition: { type: "ONE_OF_LIST", values: SETUP_OPTIONS.map((v) => ({ userEnteredValue: v })) },
        showCustomUi: true,
        strict: false,
      },
    },
  });

  // Text wrapping
  for (const col of [COL.SETUP, COL.NOTES]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP" } },
        fields: "userEnteredFormat.wrapStrategy",
      },
    });
  }

  // Center-align
  for (const col of [COL.SIDE, COL.SHARES, COL.PARTIALS, COL.DURATION, COL.PROCESS]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    });
  }

  // Right-align
  for (const col of [COL.AVG_ENTRY, COL.AVG_EXIT, COL.PNL, COL.RISK, COL.PNL_R]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: { userEnteredFormat: { horizontalAlignment: "RIGHT" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    });
  }

  await sheetsBatchUpdate(token, spreadsheetId, requests);
}

async function ensureSheetTab(
  token: string,
  spreadsheetId: string,
  account: string,
  suffix: string
): Promise<{ tabName: string; gid: number }> {
  const meta = await sheetsGet(token, spreadsheetId);
  const existing = findTabByAccountPrefix(meta.sheets, account);

  if (existing) return { tabName: existing.title, gid: existing.sheetId };

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

function tradeToRow(trade: GroupedTrade, rowIndex: number): (string | number)[] {
  const pnlRFormula = `=IF(L${rowIndex}="","",K${rowIndex}/L${rowIndex})`;

  return [
    trade.date,
    trade.entryTime,
    trade.exitTime,
    trade.durationMins,
    trade.symbol,
    trade.side,
    trade.totalShares,
    trade.avgEntry,
    trade.avgExit,
    trade.numPartials,
    trade.pnl,
    "", // R (Risk)
    pnlRFormula,
    "", // Setup
    "", // Process Followed?
    "", // Notes
  ];
}

function normalizeTime(t: string | number): string {
  const s = String(t);
  const parts = s.split(":");
  if (parts.length === 3) {
    return parts.map((p) => p.replace(/^0+/, "") || "0").join(":");
  }
  return s;
}

function makeDedupeKey(row: (string | number)[]): string {
  return [row[COL.DATE], row[COL.SYMBOL], normalizeTime(row[COL.ENTRY_TIME]), row[COL.SIDE]].join("|");
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
  setupBreakdown: SegmentStats[];
}

const HOUR_BLOCKS: { label: string; startMin: number; endMin: number }[] = [
  { label: "Opening Bell (9:30–10:00)", startMin: 570, endMin: 600 },
  { label: "Morning (10:00–11:30)", startMin: 600, endMin: 690 },
  { label: "Lunch (11:30–14:00)", startMin: 690, endMin: 840 },
  { label: "Closing (14:00–16:00)", startMin: 840, endMin: 960 },
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
}

function computeStats(rows: string[][]): AggregateStats {
  const dataRows = rows.slice(1).filter((r) => r.length > COL.PNL && r[COL.PNL] !== "");

  const parsed: ParsedRow[] = dataRows.map((r) => ({
    pnl: parseFloat(String(r[COL.PNL]).replace(/[$,]/g, "")) || 0,
    duration: parseFloat(r[COL.DURATION]) || 0,
    entryMin: parseTimeToMinutes(r[COL.ENTRY_TIME]),
    setup: (r[COL.SETUP] || "").trim(),
  }));

  const pnls = parsed.map((p) => p.pnl);

  if (pnls.length === 0) {
    return {
      totalPnl: 0, avgDailyPnl: 0, avgWinner: 0, avgLoser: 0,
      totalTrades: 0, winningTrades: 0, losingTrades: 0, winRate: 0,
      profitFactor: 0, largestWin: 0, largestLoss: 0,
      maxConsecutiveWins: 0, maxConsecutiveLosses: 0, avgDurationMins: 0,
      hourlyBreakdown: [], setupBreakdown: [],
    };
  }

  const totalPnl = pnls.reduce((s, v) => s + v, 0);
  const uniqueDays = new Set(dataRows.map((r) => r[COL.DATE])).size;
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

  const hourlyBreakdown = HOUR_BLOCKS.map((block) => {
    const blockPnls = parsed.filter((r) => r.entryMin >= block.startMin && r.entryMin < block.endMin).map((r) => r.pnl);
    return computeSegment(blockPnls, block.label);
  }).filter((s) => s.trades > 0);

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
    setupBreakdown,
  };
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
  ];

  const SPACER: string[] = [];

  const MANUAL_DETAILS: [string, string][] = [
    ["R (Risk)", "Enter your dollar risk for the trade. This is the amount you would have lost if your stop was hit. Example: 100 shares with a $0.10 stop = $10 risk."],
    ["Setup", "Select the setup from the dropdown. If your setup isn't listed, pick the closest match and note it in the Notes column."],
    ["Process Followed?", "Honestly assess whether you followed your trading plan. This is for your own development — be truthful."],
    ["Notes", "Write anything that will help you learn: your reasoning, emotions, what the chart looked like, what you'd do differently."],
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
  sheetSuffix: string
): Promise<{ appended: number; skipped: number; accounts: string[]; sheetGid: number | null; stats: AggregateStats | null }> {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  const byAccount = new Map<string, GroupedTrade[]>();
  for (const t of trades) {
    if (!byAccount.has(t.account)) byAccount.set(t.account, []);
    byAccount.get(t.account)!.push(t);
  }

  let totalAppended = 0;
  let totalSkipped = 0;
  const usedAccounts: string[] = [];
  let firstGid: number | null = null;

  for (const [account, accountTrades] of byAccount) {
    const { tabName, gid } = await ensureSheetTab(token, spreadsheetId, account, sheetSuffix);
    usedAccounts.push(tabName);
    if (firstGid === null) firstGid = gid;

    const existing = await sheetsValuesGet(token, spreadsheetId, `'${tabName}'!A:P`);
    const existingKeys = new Set(existing.slice(1).map((row) => makeDedupeKey(row)));

    const nextRowStart = existing.length + 1;
    const newRows: (string | number)[][] = [];
    let skipped = 0;

    for (const trade of accountTrades) {
      const rowIndex = nextRowStart + newRows.length;
      const row = tradeToRow(trade, rowIndex);
      const key = makeDedupeKey(row);
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
    const allRows = await sheetsValuesGet(token, spreadsheetId, `'${usedAccounts[0]}'!A:P`);
    stats = computeStats(allRows);
  }

  return { appended: totalAppended, skipped: totalSkipped, accounts: usedAccounts, sheetGid: firstGid, stats };
}
