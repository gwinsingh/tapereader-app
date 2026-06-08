const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) return json({ error: "missing key" }, 400);
  const value = await env.CREW_KV.get(`shared:${key}`);
  return json({ key, value });
}

export async function onRequestPost({ request, env }) {
  if (request.headers.get("x-write-key") !== env.WRITE_KEY)
    return json({ error: "unauthorized" }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }
  const { key, value } = body || {};
  if (!key) return json({ error: "missing key" }, 400);
  await env.CREW_KV.put(`shared:${key}`, String(value));
  return json({ key, value });
}
