export interface RawExecution {
  event: string;
  side: string; // Buy, Sell, Shrt
  symbol: string;
  shares: number;
  price: number;
  route: string;
  time: string; // HH:MM:SS
  account: string;
}

const EXPECTED_HEADERS = ["Event", "B/S", "Symbol", "Shares", "Price", "Route", "Time", "Account", "Note"];

export function validateAndParse(csvText: string): {
  executions: RawExecution[];
  accounts: string[];
} {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const headerLine = lines[0].replace(/,+$/, "");
  const headers = headerLine.split(",").map((h) => h.trim());

  for (const expected of EXPECTED_HEADERS) {
    if (!headers.includes(expected)) {
      throw new Error(
        `Invalid DAS Trader CSV format: missing column "${expected}". ` +
          `Expected columns: ${EXPECTED_HEADERS.join(", ")}`
      );
    }
  }

  const colIndex: Record<string, number> = {};
  for (const h of EXPECTED_HEADERS) {
    colIndex[h] = headers.indexOf(h);
  }

  const executions: RawExecution[] = [];
  const accountSet = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const event = cols[colIndex["Event"]];

    if (event !== "Execute") continue;

    const side = cols[colIndex["B/S"]];
    if (!["Buy", "Sell", "Shrt"].includes(side)) {
      throw new Error(`Row ${i + 1}: unexpected B/S value "${side}".`);
    }

    const shares = parseInt(cols[colIndex["Shares"]], 10);
    const price = parseFloat(cols[colIndex["Price"]]);

    if (isNaN(shares) || shares <= 0) {
      throw new Error(`Row ${i + 1}: invalid Shares value "${cols[colIndex["Shares"]]}".`);
    }
    if (isNaN(price) || price <= 0) {
      throw new Error(`Row ${i + 1}: invalid Price value "${cols[colIndex["Price"]]}".`);
    }

    const account = cols[colIndex["Account"]];
    if (!account) {
      throw new Error(`Row ${i + 1}: missing Account.`);
    }

    accountSet.add(account);

    executions.push({
      event,
      side,
      symbol: cols[colIndex["Symbol"]],
      shares,
      price,
      route: cols[colIndex["Route"]],
      time: cols[colIndex["Time"]],
      account,
    });
  }

  if (executions.length === 0) {
    throw new Error("No executed trades found in the CSV.");
  }

  return { executions, accounts: Array.from(accountSet) };
}
