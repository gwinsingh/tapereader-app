import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/usmle/ids";
import { generateCards, type GenerateInput } from "@/lib/usmle/anthropic";

export const runtime = "edge";

// Generate DRAFT cards with Claude. Does not write to the DB — the client
// reviews/edits/approves, then POSTs accepted cards to /api/usmle/cards/bulk.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as GenerateInput;
  if (!body.topicName && !body.notes && !body.missedConcept)
    return NextResponse.json({ error: "provide topicName, notes, or missedConcept" }, { status: 400 });

  try {
    const cards = await generateCards({ ...body, count: Math.min(Math.max(body.count ?? 12, 1), 30) });
    return NextResponse.json({ cards }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 502 });
  }
}
