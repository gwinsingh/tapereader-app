export const runtime = "edge";

import { getDailyCalendar, parseStatsFilter } from "@/lib/trade-journal/google-sheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");
  if (!tab) {
    return Response.json({ error: "Missing ?tab= parameter." }, { status: 400 });
  }

  // Categorical filters only — the calendar uses month navigation for time,
  // so start/end date are intentionally ignored here.
  const filter = parseStatsFilter(searchParams, { includeDates: false });

  try {
    const data = await getDailyCalendar(tab, filter);
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("not found") ? 404 : 500;
    return Response.json({ error: msg }, { status });
  }
}
