export const runtime = "edge";

import { getTradesForAnalysisFromTab } from "@/lib/trade-journal/google-sheets";
import type { StatsFilter } from "@/lib/trade-journal/google-sheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");
  if (!tab) {
    return Response.json({ error: "Missing ?tab= parameter." }, { status: 400 });
  }

  const filter: StatsFilter = {};
  if (searchParams.get("processFollowed") === "true") filter.processFollowed = true;
  if (searchParams.get("startDate")) filter.startDate = searchParams.get("startDate")!;
  if (searchParams.get("endDate")) filter.endDate = searchParams.get("endDate")!;

  try {
    const trades = await getTradesForAnalysisFromTab(tab, filter);
    return Response.json({ trades });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("not found") ? 404 : 500;
    return Response.json({ error: msg }, { status });
  }
}
