export const runtime = "edge";

import { updateTradeTags } from "@/lib/trade-journal/google-sheets";

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      tab?: string;
      rowIndex?: number;
      tags?: string;
    };

    if (!body.tab || !body.rowIndex || body.tags === undefined) {
      return Response.json(
        { error: "Missing required fields: tab, rowIndex, tags." },
        { status: 400 }
      );
    }

    await updateTradeTags(body.tab, body.rowIndex, body.tags);
    return Response.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
