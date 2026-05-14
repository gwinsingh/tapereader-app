import { NextRequest, NextResponse } from "next/server";
import { enrichSymbol } from "@/lib/trade-journal/market-data";
import { updateEnrichment } from "@/lib/trade-journal/google-sheets";

export const runtime = "edge";

interface EnrichRequest {
  symbol: string;
  tabName: string;
  trades: {
    date: string;
    entryTime: string;
    side: "Long" | "Short";
    avgEntry: number;
    index: number;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EnrichRequest;
    const { symbol, tabName, trades } = body;

    if (!symbol || !tabName || !trades?.length) {
      return NextResponse.json({ error: "Missing symbol, tabName, or trades." }, { status: 400 });
    }

    const result = await enrichSymbol(symbol, trades);

    const enrichments = result.enrichments.map((e) => {
      const trade = trades.find((t) => t.index === e.tradeIndex)!;
      return {
        date: trade.date,
        entryTime: trade.entryTime,
        side: trade.side,
        data: e.data,
      };
    });

    const { updated } = await updateEnrichment(tabName, symbol, enrichments);

    return NextResponse.json({ success: true, symbol, updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
