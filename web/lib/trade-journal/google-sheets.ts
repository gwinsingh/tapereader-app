import { google } from "googleapis";
import { GroupedTrade } from "./trade-grouper";

const SHEET_HEADERS = [
  "Date",
  "Entry Time",
  "Exit Time",
  "Symbol",
  "Side",
  "Shares",
  "Avg Entry",
  "Avg Exit",
  "# Partials",
  "P&L",
  "R (Risk)",
  "P&L (R)",
];

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

async function ensureSheetTab(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabName: string
): Promise<void> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets?.find(
    (s) => s.properties?.title === tabName
  );

  if (existing) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: { title: tabName },
          },
        },
      ],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [SHEET_HEADERS],
    },
  });
}

function tradeToRow(trade: GroupedTrade, rowIndex: number): (string | number)[] {
  // R column (K) is left empty for manual input
  // P&L (R) column (L) uses a formula: =IF(K{row}="","",J{row}/K{row})
  const pnlRFormula = `=IF(K${rowIndex}="","",J${rowIndex}/K${rowIndex})`;

  return [
    trade.date,
    trade.entryTime,
    trade.exitTime,
    trade.symbol,
    trade.side,
    trade.totalShares,
    trade.avgEntry,
    trade.avgExit,
    trade.numPartials,
    trade.pnl,
    "", // R (Risk) — manual input
    pnlRFormula,
  ];
}

async function getExistingRows(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabName: string
): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A:L`,
  });
  return (res.data.values as string[][]) || [];
}

function makeDedupeKey(row: (string | number)[]): string {
  // Key: Date + EntryTime + ExitTime + Symbol + Side + Shares + AvgEntry + AvgExit
  return [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]].join("|");
}

export async function appendTrades(
  trades: GroupedTrade[]
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

  for (const [account, accountTrades] of byAccount) {
    await ensureSheetTab(sheets, spreadsheetId, account);

    const existing = await getExistingRows(sheets, spreadsheetId, account);
    const existingKeys = new Set(
      existing.slice(1).map((row) => makeDedupeKey(row))
    );

    // We need to know the next row index for formulas
    const nextRowStart = existing.length + 1;

    const newRows: (string | number)[][] = [];
    let skipped = 0;

    accountTrades.forEach((trade, i) => {
      const rowIndex = nextRowStart + newRows.length;
      const row = tradeToRow(trade, rowIndex);
      const key = makeDedupeKey(row);

      if (existingKeys.has(key)) {
        skipped++;
      } else {
        newRows.push(row);
      }
    });

    if (newRows.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${account}'!A1`,
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
    accounts: Array.from(byAccount.keys()),
  };
}
