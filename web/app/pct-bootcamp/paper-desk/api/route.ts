import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Paper Desk KV API. Blobs are published by the local paper-desk runner and
// read by /pct-bootcamp/paper-desk. Keys live under `paperdesk:<name>` in the
// shared CREW_KV namespace. (The whole /pct-bootcamp tree sits behind
// Cloudflare Access; writes additionally require WRITE_KEY.)

const NAMES = ["status", "plan", "positions", "edge", "setups", "ledger"] as const;
type Name = (typeof NAMES)[number];

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PUTS = 6;
const NO_STORE = { "Cache-Control": "no-store" };

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

function isName(s: string): s is Name {
  return (NAMES as readonly string[]).includes(s);
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

function parse(raw: string | null): unknown {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key || (key !== "all" && !isName(key)))
    return json({ paperdeskApi: 1, error: "bad key", allowed: [...NAMES, "all"] }, 400);

  const kv = getKV();
  if (!kv) return json({ paperdeskApi: 1, error: "KV not available" }, 503);

  if (key === "all") {
    const values = await Promise.all(NAMES.map((n) => kv.get(`paperdesk:${n}`)));
    const out: Record<string, unknown> = { paperdeskApi: 1 };
    NAMES.forEach((n, i) => (out[n] = parse(values[i])));
    return json(out);
  }

  const value = parse(await kv.get(`paperdesk:${key}`));
  return json({ paperdeskApi: 1, key, value });
}

// Constant-time string compare (no early exit on the first differing byte).
function safeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function POST(req: NextRequest) {
  // Prefer a Paper-Desk-only key. WRITE_KEY (shared with the 4-Week Challenge, whose key ships in that app's public
  // bundle) is accepted only as a fallback until PAPERDESK_WRITE_KEY is set in the Pages dashboard. Either way the
  // route sits behind Cloudflare Access, which is the outer gate.
  const writeKey = process.env.PAPERDESK_WRITE_KEY || process.env.WRITE_KEY;
  if (!writeKey) return json({ error: "writes disabled (no write key configured)" }, 503);
  if (!safeEqual(req.headers.get("x-write-key") ?? "", writeKey)) return json({ error: "unauthorized" }, 401);

  let body: { blobs?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }

  const blobs = body?.blobs;
  if (!blobs || typeof blobs !== "object" || Array.isArray(blobs))
    return json({ error: "missing blobs object" }, 400);

  const entries = Object.entries(blobs as Record<string, unknown>);
  if (entries.length === 0) return json({ error: "no blobs" }, 400);
  if (entries.length > MAX_PUTS) return json({ error: `max ${MAX_PUTS} blobs per request` }, 400);

  const bad = entries.map(([n]) => n).filter((n) => !isName(n));
  if (bad.length) return json({ error: "unknown blob name", bad, allowed: NAMES }, 400);

  const enc = new TextEncoder();
  const puts: { name: Name; text: string }[] = [];
  for (const [name, value] of entries) {
    if (value === undefined) return json({ error: `blob ${name} is undefined` }, 400);
    const text = JSON.stringify(value);
    const bytes = enc.encode(text).byteLength;
    if (bytes > MAX_BYTES) return json({ error: `blob ${name} too large`, bytes, max: MAX_BYTES }, 413);
    puts.push({ name: name as Name, text });
  }

  const kv = getKV();
  if (!kv) return json({ error: "KV not available" }, 503);

  await Promise.all(puts.map((p) => kv.put(`paperdesk:${p.name}`, p.text)));
  return json({ ok: true, wrote: puts.map((p) => p.name) });
}
