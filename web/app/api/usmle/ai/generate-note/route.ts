import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/usmle/ids";
import { generateNote, type NoteInput } from "@/lib/usmle/notes";

export const runtime = "edge";

// Generate a DRAFT study note (markdown) with Claude. Does not write to the DB —
// the client reviews/edits, then POSTs to /api/usmle/notes to save.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as NoteInput;
  if (!body.topicName?.trim() && !body.focus?.trim())
    return NextResponse.json({ error: "provide topicName or focus" }, { status: 400 });

  try {
    const note = await generateNote(body);
    return NextResponse.json({ note }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 502 });
  }
}
