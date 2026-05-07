import { NextResponse } from "next/server";
import { populateInstructionsSheet } from "@/lib/trade-journal/google-sheets";

export const runtime = "edge";

export async function POST() {
  try {
    await populateInstructionsSheet();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
