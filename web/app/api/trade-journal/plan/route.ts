export const runtime = "edge";

import { getDailyPlan, upsertDailyPlan, DailyPlanEntry } from "@/lib/trade-journal/google-sheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return Response.json({ error: "Missing ?date= parameter." }, { status: 400 });
  }
  try {
    const entries = await getDailyPlan(date);
    return Response.json({ entries });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: { date?: string; entries?: DailyPlanEntry[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { date, entries } = body;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "A valid date (YYYY-MM-DD) is required." }, { status: 400 });
  }
  if (!Array.isArray(entries)) {
    return Response.json({ error: "entries must be an array." }, { status: 400 });
  }

  try {
    const count = await upsertDailyPlan(date, entries);
    return Response.json({ ok: true, count });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
