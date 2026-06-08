import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

function getKV(): KV | null {
  try {
    const env = process.env as unknown as Record<string, unknown>;
    return (env.CREW_KV as KV) ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key)
    return NextResponse.json({ error: "missing key" }, { status: 400 });

  const kv = getKV();
  if (!kv)
    return NextResponse.json({ error: "KV not available" }, { status: 503 });

  const value = await kv.get(`shared:${key}`);
  return NextResponse.json(
    { key, value },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-write-key") !== process.env.WRITE_KEY)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { key?: string; value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const { key, value } = body || {};
  if (!key)
    return NextResponse.json({ error: "missing key" }, { status: 400 });

  const kv = getKV();
  if (!kv)
    return NextResponse.json({ error: "KV not available" }, { status: 503 });

  await kv.put(`shared:${key}`, String(value));
  return NextResponse.json(
    { key, value },
    { headers: { "Cache-Control": "no-store" } }
  );
}
