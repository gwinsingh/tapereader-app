import { google, sheets_v4 } from "googleapis";
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

// Columns that require manual user input (visually distinct header)
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
  // Muted colors for text-only columns (P&L, P&L(R))
  greenText: { red: 0.45, green: 0.72, blue: 0.55 },
  redText: { red: 0.78, green: 0.45, blue: 0.45 },
  // Vivid colors for badge-style columns (Side, Process Followed)
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

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set.");
  }
  const parsed = JSON.parse(credentials);
  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) {
    throw new Error("GOOGLE_SPREADSHEET_ID environment variable is not set.");
  }
  return id;
}

async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

function findTabByAccountPrefix(
  sheetsMeta: sheets_v4.Schema$Sheet[] | undefined,
  account: string
): { title: string; sheetId: number } | null {
  if (!sheetsMeta) return null;
  const match = sheetsMeta.find((s) => {
    const title = s.properties?.title || "";
    return title === account || title.startsWith(`${account}-`);
  });
  if (!match) return null;
  return { title: match.properties?.title || "", sheetId: match.properties?.sheetId ?? 0 };
}

function getSheetId(
  sheetsMeta: sheets_v4.Schema$Sheet[] | undefined,
  tabName: string
): number {
  const sheet = sheetsMeta?.find((s) => s.properties?.title === tabName);
  return sheet?.properties?.sheetId ?? 0;
}

async function applyFormatting(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetId: number
) {
  const requests: sheets_v4.Schema$Request[] = [];

  // 1. Freeze the header row
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId,
        gridProperties: { frozenRowCount: 1 },
      },
      fields: "gridProperties.frozenRowCount",
    },
  });

  // 2. Format header row: bold, background color, text color, centered
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: TOTAL_COLS },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.headerBg,
          textFormat: {
            bold: true,
            foregroundColor: COLORS.headerText,
            fontSize: 10,
          },
          horizontalAlignment: "CENTER",
          verticalAlignment: "MIDDLE",
          padding: { top: 4, bottom: 4, left: 6, right: 6 },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)",
    },
  });

  // 2b. Flip header colors for manual-input columns (text color as bg, bg as text)
  for (const col of MANUAL_COLS) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.headerText,
            textFormat: {
              bold: true,
              foregroundColor: COLORS.headerBg,
              fontSize: 10,
            },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat)",
      },
    });
  }

  // 3. Set column widths for readability
  const colWidths: Record<number, number> = {
    [COL.DATE]: 100,
    [COL.ENTRY_TIME]: 90,
    [COL.EXIT_TIME]: 90,
    [COL.DURATION]: 105,
    [COL.SYMBOL]: 80,
    [COL.SIDE]: 70,
    [COL.SHARES]: 70,
    [COL.AVG_ENTRY]: 95,
    [COL.AVG_EXIT]: 95,
    [COL.PARTIALS]: 85,
    [COL.PNL]: 95,
    [COL.RISK]: 95,
    [COL.PNL_R]: 85,
    [COL.SETUP]: 140,
    [COL.PROCESS]: 130,
    [COL.NOTES]: 200,
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

  // 4. Set default row height for header
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 36 },
      fields: "pixelSize",
    },
  });

  // 5. Number format: P&L and R (Risk) as USD currency
  for (const col of [COL.PNL, COL.RISK]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" },
          },
        },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // 6. Number format: Duration (mins) — 1 decimal
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.DURATION, endColumnIndex: COL.DURATION + 1 },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: "NUMBER", pattern: "0.0" },
        },
      },
      fields: "userEnteredFormat.numberFormat",
    },
  });

  // 7. Number format: P&L (R) — 1 decimal
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PNL_R, endColumnIndex: COL.PNL_R + 1 },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: "NUMBER", pattern: "0.0" },
        },
      },
      fields: "userEnteredFormat.numberFormat",
    },
  });

  // 8. Number format: Avg Entry / Avg Exit as currency
  for (const col of [COL.AVG_ENTRY, COL.AVG_EXIT]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" },
          },
        },
        fields: "userEnteredFormat.numberFormat",
      },
    });
  }

  // 9. Conditional formatting: Side column — vivid green for Long, vivid red for Short
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.SIDE, endColumnIndex: COL.SIDE + 1 }],
        booleanRule: {
          condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "Long" }] },
          format: {
            backgroundColor: COLORS.vividGreenBg,
            textFormat: { foregroundColor: COLORS.vividGreenText, bold: true },
          },
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
          format: {
            backgroundColor: COLORS.vividRedBg,
            textFormat: { foregroundColor: COLORS.vividRedText, bold: true },
          },
        },
      },
      index: 1,
    },
  });

  // 10. Conditional formatting: P&L column — green if >= 0, red if < 0
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

  // 11. Conditional formatting: P&L (R) — same green/red
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

  // 12. Conditional formatting: Process Followed? — vivid green for Yes, vivid red for No
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PROCESS, endColumnIndex: COL.PROCESS + 1 }],
        booleanRule: {
          condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "Yes" }] },
          format: {
            backgroundColor: COLORS.vividGreenBg,
            textFormat: { foregroundColor: COLORS.vividGreenText, bold: true },
          },
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
          format: {
            backgroundColor: COLORS.vividRedBg,
            textFormat: { foregroundColor: COLORS.vividRedText, bold: true },
          },
        },
      },
      index: 7,
    },
  });

  // 13. Data validation: Process Followed? — Yes/No dropdown
  requests.push({
    setDataValidation: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PROCESS, endColumnIndex: COL.PROCESS + 1 },
      rule: {
        condition: {
          type: "ONE_OF_LIST",
          values: [{ userEnteredValue: "Yes" }, { userEnteredValue: "No" }],
        },
        showCustomUi: true,
        strict: true,
      },
    },
  });

  // 14. Data validation: Setup — dropdown with predefined options
  requests.push({
    setDataValidation: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.SETUP, endColumnIndex: COL.SETUP + 1 },
      rule: {
        condition: {
          type: "ONE_OF_LIST",
          values: SETUP_OPTIONS.map((v) => ({ userEnteredValue: v })),
        },
        showCustomUi: true,
        strict: false,
      },
    },
  });

  // 15. Text wrapping for Setup and Notes columns
  for (const col of [COL.SETUP, COL.NOTES]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: {
          userEnteredFormat: { wrapStrategy: "WRAP" },
        },
        fields: "userEnteredFormat.wrapStrategy",
      },
    });
  }

  // 16. Center-align data columns: Side, Shares, Partials, Duration, Process
  for (const col of [COL.SIDE, COL.SHARES, COL.PARTIALS, COL.DURATION, COL.PROCESS]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: {
          userEnteredFormat: { horizontalAlignment: "CENTER" },
        },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    });
  }

  // 17. Right-align currency/number columns
  for (const col of [COL.AVG_ENTRY, COL.AVG_EXIT, COL.PNL, COL.RISK, COL.PNL_R]) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: col, endColumnIndex: col + 1 },
        cell: {
          userEnteredFormat: { horizontalAlignment: "RIGHT" },
        },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    });
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
}

async function ensureSheetTab(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  account: string,
  suffix: string
): Promise<{ tabName: string; gid: number }> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = findTabByAccountPrefix(meta.data.sheets, account);

  if (existing) return { tabName: existing.title, gid: existing.sheetId };

  const tabName = suffix ? `${account}-${suffix}` : account;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [SHEET_HEADERS] },
  });

  const updatedMeta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetId = getSheetId(updatedMeta.data.sheets, tabName);
  await applyFormatting(sheets, spreadsheetId, sheetId);

  return { tabName, gid: sheetId };
}

// K=P&L (col index 11 in 1-based = L in sheets letters, but our col K is index 10, L=11, M=12)
// With new layout: K=P&L (col 11 in A1 notation = K), L=R (Risk) = L, M=P&L(R) = M
function tradeToRow(trade: GroupedTrade, rowIndex: number): (string | number)[] {
  // P&L (R) formula: =IF(L{row}="","",K{row}/L{row})
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
    "", // R (Risk) — manual input
    pnlRFormula,
    "", // Setup — manual input via dropdown
    "", // Process Followed? — manual input via dropdown
    "", // Notes — manual input
  ];
}

async function getExistingRows(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabName: string
): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A:P`,
  });
  return (res.data.values as string[][]) || [];
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
  // Date + Symbol + EntryTime + Side — normalize time to strip leading zeros
  // (Google Sheets drops leading zeros from time strings like 09:30:46 -> 9:30:46)
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
    profitFactor: grossLosses > 0 ? Math.round((grossWins / grossLosses) * 100) / 100 : grossWins > 0 ? Infinity : 0,
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
    if (p > 0) {
      curWins++;
      curLosses = 0;
      maxConsecWins = Math.max(maxConsecWins, curWins);
    } else if (p < 0) {
      curLosses++;
      curWins = 0;
      maxConsecLosses = Math.max(maxConsecLosses, curLosses);
    } else {
      curWins = 0;
      curLosses = 0;
    }
  }

  // Hourly breakdown
  const hourlyBreakdown = HOUR_BLOCKS.map((block) => {
    const blockPnls = parsed
      .filter((r) => r.entryMin >= block.startMin && r.entryMin < block.endMin)
      .map((r) => r.pnl);
    return computeSegment(blockPnls, block.label);
  }).filter((s) => s.trades > 0);

  // Setup breakdown
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
    profitFactor: grossLosses > 0 ? Math.round((grossWins / grossLosses) * 100) / 100 : grossWins > 0 ? Infinity : 0,
    largestWin: winners.length > 0 ? Math.max(...winners) : 0,
    largestLoss: losers.length > 0 ? Math.min(...losers) : 0,
    maxConsecutiveWins: maxConsecWins,
    maxConsecutiveLosses: maxConsecLosses,
    avgDurationMins: Math.round((durations.reduce((s, v) => s + v, 0) / durations.length) * 10) / 10,
    hourlyBreakdown,
    setupBreakdown,
  };
}

export async function appendTrades(
  trades: GroupedTrade[],
  sheetSuffix: string
): Promise<{ appended: number; skipped: number; accounts: string[]; sheetGid: number | null; stats: AggregateStats | null }> {
  const sheets = await getSheets();
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
    const { tabName, gid } = await ensureSheetTab(sheets, spreadsheetId, account, sheetSuffix);
    usedAccounts.push(tabName);
    if (firstGid === null) firstGid = gid;

    const existing = await getExistingRows(sheets, spreadsheetId, tabName);
    const existingKeys = new Set(
      existing.slice(1).map((row) => makeDedupeKey(row))
    );

    const nextRowStart = existing.length + 1;
    const newRows: (string | number)[][] = [];
    let skipped = 0;

    for (const trade of accountTrades) {
      const rowIndex = nextRowStart + newRows.length;
      const row = tradeToRow(trade, rowIndex);
      const key = makeDedupeKey(row);

      if (existingKeys.has(key)) {
        skipped++;
      } else {
        newRows.push(row);
      }
    }

    if (newRows.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${tabName}'!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: newRows },
      });
    }

    totalAppended += newRows.length;
    totalSkipped += skipped;
  }

  let stats: AggregateStats | null = null;
  if (usedAccounts.length > 0) {
    const allRows = await getExistingRows(sheets, spreadsheetId, usedAccounts[0]);
    stats = computeStats(allRows);
  }

  return {
    appended: totalAppended,
    skipped: totalSkipped,
    accounts: usedAccounts,
    sheetGid: firstGid,
    stats,
  };
}
