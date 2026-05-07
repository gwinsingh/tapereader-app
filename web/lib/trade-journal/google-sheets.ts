import { google, sheets_v4 } from "googleapis";
import { GroupedTrade } from "./trade-grouper";

// Column layout (0-indexed):
// A=Date, B=Entry Time, C=Exit Time, D=Duration (mins), E=Symbol,
// F=Side, G=Shares, H=Avg Entry, I=Avg Exit, J=# Partials,
// K=P&L, L=R (Risk), M=P&L (R), N=Setup, O=Process Followed?
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
} as const;

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
  greenBg: { red: 0.14, green: 0.45, blue: 0.2 },
  greenText: { red: 0.29, green: 0.87, blue: 0.5 },
  redBg: { red: 0.45, green: 0.14, blue: 0.14 },
  redText: { red: 0.97, green: 0.44, blue: 0.44 },
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
): string | null {
  if (!sheetsMeta) return null;
  const match = sheetsMeta.find((s) => {
    const title = s.properties?.title || "";
    return title === account || title.startsWith(`${account}-`);
  });
  return match?.properties?.title || null;
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

  // 9. Conditional formatting: Side column — green for Long, red for Short
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.SIDE, endColumnIndex: COL.SIDE + 1 }],
        booleanRule: {
          condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "Long" }] },
          format: {
            backgroundColor: COLORS.greenBg,
            textFormat: { foregroundColor: COLORS.greenText, bold: true },
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
            backgroundColor: COLORS.redBg,
            textFormat: { foregroundColor: COLORS.redText, bold: true },
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

  // 12. Conditional formatting: Process Followed? — green for Yes, red for No
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.PROCESS, endColumnIndex: COL.PROCESS + 1 }],
        booleanRule: {
          condition: { type: "TEXT_EQ", values: [{ userEnteredValue: "Yes" }] },
          format: {
            backgroundColor: COLORS.greenBg,
            textFormat: { foregroundColor: COLORS.greenText, bold: true },
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
            backgroundColor: COLORS.redBg,
            textFormat: { foregroundColor: COLORS.redText, bold: true },
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

  // 15. Text wrapping for Setup column
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: COL.SETUP, endColumnIndex: COL.SETUP + 1 },
      cell: {
        userEnteredFormat: { wrapStrategy: "WRAP" },
      },
      fields: "userEnteredFormat.wrapStrategy",
    },
  });

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
): Promise<string> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTab = findTabByAccountPrefix(meta.data.sheets, account);

  if (existingTab) return existingTab;

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

  return tabName;
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
  ];
}

async function getExistingRows(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabName: string
): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A:O`,
  });
  return (res.data.values as string[][]) || [];
}

function makeDedupeKey(row: (string | number)[]): string {
  // Key: Date + EntryTime + ExitTime + Symbol + Side + Shares + AvgEntry + AvgExit
  return [row[0], row[1], row[2], row[4], row[5], row[6], row[7], row[8]].join("|");
}

export async function appendTrades(
  trades: GroupedTrade[],
  sheetSuffix: string
): Promise<{ appended: number; skipped: number; accounts: string[] }> {
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

  for (const [account, accountTrades] of byAccount) {
    const tabName = await ensureSheetTab(sheets, spreadsheetId, account, sheetSuffix);
    usedAccounts.push(tabName);

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

  return {
    appended: totalAppended,
    skipped: totalSkipped,
    accounts: usedAccounts,
  };
}
