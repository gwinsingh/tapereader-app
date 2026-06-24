import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized } from "@/lib/usmle/ids";
import { getSettings, updateSettings } from "@/lib/usmle/settings";

export const runtime = "edge";

export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });
  return NextResponse.json(await getSettings(db), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { newPerDay?: number; maxReviewsPerDay?: number };
  const patch: { newPerDay?: number; maxReviewsPerDay?: number } = {};
  if (typeof body.newPerDay === "number") patch.newPerDay = body.newPerDay;
  if (typeof body.maxReviewsPerDay === "number") patch.maxReviewsPerDay = body.maxReviewsPerDay;
  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "newPerDay or maxReviewsPerDay required" }, { status: 400 });

  const settings = await updateSettings(db, patch);
  return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
}
