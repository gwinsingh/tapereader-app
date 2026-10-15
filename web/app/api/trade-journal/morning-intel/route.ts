export const runtime = "edge";

import { readTabValues } from "@/lib/trade-journal/google-sheets";
import {
  MORNING_BRIEF_TAB,
  MORNING_INTEL_VERSION,
  RS_WATCHLIST_TAB,
  parseMorningBrief,
  parseRsWatchlist,
  type MorningIntelResponse,
} from "@/lib/trade-journal/morning-intel";

// GET /api/trade-journal/morning-intel
// Read-only view of the `Morning Brief` + `RS Watchlist` tabs (written by the
// local `scripts/rs/run.js`). A missing tab yields `null` for that payload,
// never an error. `version` doubles as the deploy-verification signal.
export async function GET() {
  try {
    const [briefValues, rsValues] = await Promise.all([
      readTabValues(MORNING_BRIEF_TAB),
      readTabValues(RS_WATCHLIST_TAB),
    ]);
    const body: MorningIntelResponse = {
      brief: parseMorningBrief(briefValues),
      rs: parseRsWatchlist(rsValues),
      version: MORNING_INTEL_VERSION,
    };
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: msg },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
