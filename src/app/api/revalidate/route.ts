/**
 * POST /api/revalidate — the publish trigger. D-042, replacing the Deploy Hook.
 *
 * The backend calls this after a content mutation with the tags that changed.
 * `revalidateTag` drops those Data Cache entries and the cached renders that
 * depend on them, so the next request re-reads the API and the new content is
 * public in seconds. No build, no deployment.
 *
 * 🔴 THIS IS A CAPABILITY. Anyone who can call it can force the live site to
 * re-render, which is a cheap denial-of-service against the backend if left
 * open. It is therefore secret-authenticated, and the secret is compared with a
 * timing-safe equality check — a plain `===` on a secret leaks its prefix to a
 * patient attacker one byte at a time.
 *
 * 🔴 AND IT IS THE NEW SINGLE POINT OF SILENT FAILURE. The old architecture's
 * whole failure was a publish trigger that quietly did nothing while reporting
 * success, so this route is built to be the opposite: it rejects unknown tags
 * rather than ignoring them, it returns exactly which tags it revalidated, and
 * the backend records that list. A typo in a tag name is a 422, not a shrug.
 */

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { ALL_CONTENT_TAGS } from "@/lib/content";

export const dynamic = "force-dynamic";

/** Constant-time comparison that tolerates differing lengths. */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  // `timingSafeEqual` throws on a length mismatch, which would itself be a
  // length oracle. Hash-free fix: compare equal-length buffers and AND in the
  // length check, so every path does the same work.
  const length = Math.max(a.length, b.length, 1);
  const padA = Buffer.alloc(length);
  const padB = Buffer.alloc(length);
  a.copy(padA);
  b.copy(padB);
  return timingSafeEqual(padA, padB) && a.length === b.length;
}

function json(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    // Refuse rather than allow. An unset secret must never mean "no auth
    // required" — that would turn a misconfiguration into an open endpoint.
    return json({ error: "Revalidation is not configured." }, 503);
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  if (!secretMatches(provided, expected)) {
    // Generic, and identical for "missing" and "wrong" — the distinction is
    // only useful to someone guessing.
    return json({ error: "Unauthorized." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }

  const requested = (body as { tags?: unknown })?.tags;
  if (!Array.isArray(requested) || requested.length === 0) {
    return json({ error: "Body must be { tags: [string, …] }." }, 400);
  }

  // 🔴 Reject unknown tags loudly. Silently accepting a misspelled tag is
  // precisely how a collection becomes unpublishable while every status
  // surface reports success.
  const known = new Set<string>(ALL_CONTENT_TAGS);
  const unknown = requested.filter((t) => typeof t !== "string" || !known.has(t));
  if (unknown.length > 0) {
    return json(
      {
        error: `Unknown tag(s): ${unknown.map(String).join(", ")}.`,
        knownTags: [...known].sort(),
      },
      422,
    );
  }

  const tags = [...new Set(requested as string[])];
  for (const tag of tags) revalidateTag(tag);

  // Returning the list lets the caller record what it actually invalidated,
  // rather than inferring it from a bare 200.
  return json({ revalidated: tags, at: new Date().toISOString() }, 200);
}

/** A GET here is almost always a misconfigured caller; say so plainly. */
export function GET(): NextResponse {
  return json({ error: "Use POST with { tags: [...] }." }, 405);
}
