import { NextRequest, NextResponse } from "next/server";
import { validateAndParse } from "@/lib/trade-journal/csv-parser";
import { groupExecutionsIntoTrades } from "@/lib/trade-journal/trade-grouper";
import { appendTrades } from "@/lib/trade-journal/google-sheets";

function getTodayEST(): string {
  const now = new Date();
  const est = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const y = est.getFullYear();
  const m = String(est.getMonth() + 1).padStart(2, "0");
  const d = String(est.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const date = (formData.get("date") as string) || getTodayEST();

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a .csv file." },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Date must be in YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    const sheetSuffix = (formData.get("sheetSuffix") as string) || "";

    const csvText = await file.text();
    const { executions } = validateAndParse(csvText);
    const trades = groupExecutionsIntoTrades(executions, date);

    const result = await appendTrades(trades, sheetSuffix);

    return NextResponse.json({
      success: true,
      date,
      tradesProcessed: trades.length,
      rowsAppended: result.appended,
      rowsSkipped: result.skipped,
      accounts: result.accounts,
      stats: result.stats,
      trades: trades.map((t) => ({
        symbol: t.symbol,
        side: t.side,
        shares: t.totalShares,
        avgEntry: t.avgEntry,
        avgExit: t.avgExit,
        pnl: t.pnl,
        numPartials: t.numPartials,
        durationMins: t.durationMins,
        entryTime: t.entryTime,
        exitTime: t.exitTime,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
