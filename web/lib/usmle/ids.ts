// Edge-safe id + auth helpers shared across USMLE routes.
import { NextRequest } from "next/server";

/** Short, URL-safe unique id (edge-safe — Web Crypto). */
export function newId(prefix = ""): string {
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/** True when the request carries the shared write key. Mutations require this. */
export function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("x-write-key") === process.env.WRITE_KEY;
}
