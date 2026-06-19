export const runtime = "edge";

import { getTradesForAnalysisFromTab, parseStatsFilter } from "@/lib/trade-journal/google-sheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");
  if (!tab) {
    return Response.json({ error: "Missing ?tab= parameter." }, { status: 400 });
  }

  const filter = parseStatsFilter(searchParams);

  try {
    const trades = await getTradesForAnalysisFromTab(tab, filter);
    return Response.json({ trades });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("not found") ? 404 : 500;
    return Response.json({ error: msg }, { status });
  }
}
