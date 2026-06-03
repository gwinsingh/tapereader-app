export const runtime = "edge";

import { getAccessToken } from "@/lib/trade-journal/google-sheets";
import { getFileContent } from "@/lib/trade-journal/google-drive";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return Response.json({ error: "Missing ?fileId= parameter." }, { status: 400 });
  }

  try {
    const token = await getAccessToken();
    const driveResponse = await getFileContent(token, fileId);

    // Stream the image bytes through with proper headers
    return new Response(driveResponse.body, {
      status: 200,
      headers: {
        "Content-Type": driveResponse.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=86400", // cache for 24h
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
