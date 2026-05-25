export const runtime = "edge";

import { listSheetTabs } from "@/lib/trade-journal/google-sheets";

export async function GET() {
  try {
    const tabs = await listSheetTabs();
    return Response.json({ tabs });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
