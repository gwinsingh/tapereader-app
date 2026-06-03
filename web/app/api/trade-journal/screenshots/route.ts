export const runtime = "edge";

import { getAccessToken } from "@/lib/trade-journal/google-sheets";
import { buildScreenshotIndex } from "@/lib/trade-journal/google-drive";

export async function GET() {
  try {
    const token = await getAccessToken();
    const { index, unmatched } = await buildScreenshotIndex(token);
    return Response.json({ index, unmatched });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
