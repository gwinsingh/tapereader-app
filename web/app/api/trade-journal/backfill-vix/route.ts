export const runtime = "edge";

import { backfillVixForTab } from "@/lib/trade-journal/google-sheets";

// Fills every blank VIX cell in the tab in one pass. VIX is per-date, not
// per-symbol, so this needs no per-symbol Polygon calls — index data comes from
// Polygon I:VIX when the plan allows it, else CBOE's free daily history CSV.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");
  if (!tab) {
    return Response.json({ error: "Missing ?tab= parameter." }, { status: 400 });
  }

  try {
    const result = await backfillVixForTab(tab);
    return Response.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
