// Edge-safe id + auth helpers shared across USMLE routes.
import { NextRequest } from "next/server";

/** Short, URL-safe unique id (edge-safe — Web Crypto). */
export function newId(prefix = ""): string {
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/**
 * Authorization gate for USMLE mutations. This is a single-user app and the
 * owner opted out of a write key, so it is intentionally open.
 *
 * Note: decoupled from the project-wide WRITE_KEY (which the 4-Week Challenge
 * uses) on purpose — that key may be set for the other app, and we don't want
 * USMLE to require it. To lock these routes later, gate on a dedicated env var,
 * e.g.: `const k = process.env.USMLE_WRITE_KEY; return !k || req.headers.get("x-write-key") === k;`
 */
export function isAuthorized(_req: NextRequest): boolean {
  return true;
}
