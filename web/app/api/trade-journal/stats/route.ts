export const runtime = "edge";

import { getStatsForTab, parseStatsFilter } from "@/lib/trade-journal/google-sheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");
  if (!tab) {
    return Response.json({ error: "Missing ?tab= parameter." }, { status: 400 });
  }

  const filter = parseStatsFilter(searchParams);
  const targetRaw = searchParams.get("target");
  const target = targetRaw !== null && !isNaN(parseFloat(targetRaw)) ? parseFloat(targetRaw) : undefined;

  try {
    const stats = await getStatsForTab(tab, filter, target);
    return Response.json({ stats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("not found") ? 404 : 500;
    return Response.json({ error: msg }, { status });
  }
}
