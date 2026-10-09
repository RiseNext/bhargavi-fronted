import { NextResponse } from "next/server";

/**
 * Same-origin proxy to the backend's `/api/contact` — F-15.
 *
 * 🔴 WHY A PROXY AND NOT A DIRECT CALL. The forms post this URL immediately
 * after `window.open()`. Keeping the request same-origin means no CORS
 * preflight, no cross-origin cookie rules, and nothing that could turn a
 * fire-and-forget `fetch` into something that interferes with the already-opened
 * WhatsApp tab. The browser never talks to the backend directly (D-002, D-016).
 *
 * 🔴 THE CONTRACT IS NOT REIMPLEMENTED HERE. Validation — including the exact
 * ORDER in which errors are produced (X-32) — lives in the backend, which has a
 * frozen-contract test pinning it. Duplicating it here would create two homes
 * for one rule, and they would drift. This forwards the body and relays the
 * status.
 *
 * 🔴 X-30 — THE TIMEOUT RULE. `CareerForm` awaits this response and renders an
 * error panel on `!res.ok`. So if the backend is slow or down, propagating a 5xx
 * would break the page for a real applicant. Instead this returns
 * `200 { ok: true }` and logs: the enquiry has already reached the clinic over
 * WhatsApp, so the visitor is not misled, and the operator is alerted by the
 * backend's own monitoring rather than by a broken form.
 *
 * A validation rejection (4xx) IS relayed — that is a real answer about the
 * submission, not an infrastructure failure.
 */

/** The browser must never cache a submission response. */
const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * Long enough for a cold Railway container, short enough that a visitor is not
 * left waiting. Beyond this the request is abandoned and reported as success.
 */
const UPSTREAM_TIMEOUT_MS = 5000;

/** Matches the backend's own public cap, so an oversized body fails here first. */
const MAX_BODY_BYTES = 10 * 1024;

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_URL;

  // Read the body as text and forward it verbatim: re-parsing and re-serialising
  // could change it, and the backend owns the 400-on-unparseable rule.
  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413, headers: NO_STORE },
    );
  }

  if (!backendUrl) {
    // No backend configured — a preview deployment, or a misconfigured
    // environment. The WhatsApp hand-over has already delivered the enquiry, so
    // breaking the form would cost more than it protects.
    console.warn("[contact] BACKEND_URL is not set; submission not persisted");
    return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${backendUrl.replace(/\/+$/, "")}/api/contact`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        // Exempts the build and this trusted server-side caller from the public
        // rate limit. Server-only: never exposed to the browser.
        ...(process.env.BACKEND_API_KEY
          ? { "x-api-key": process.env.BACKEND_API_KEY }
          : {}),
        // 🔴 The visitor's address, stated explicitly rather than inferred.
        // The backend trusts this header ONLY from a caller that presented
        // BACKEND_API_KEY (above), so it cannot be spoofed from the browser.
        // Deriving it here removes the guesswork: the backend would otherwise
        // have to work out which hop of a two-proxy X-Forwarded-For chain is
        // the visitor, and getting that wrong puts every visitor on earth into
        // a single 20-submissions-per-hour rate-limit bucket (X-29).
        ...clientIpHeader(request),
        // Still forwarded, as the fallback for a request that arrives without
        // the API key configured.
        ...forwardedFor(request),
      },
      body,
    });

    const text = await upstream.text();

    // 🔴 A 5xx is an infrastructure failure, not an answer about the
    // submission. Relaying it would break CareerForm's panel for a real
    // applicant (X-30).
    if (upstream.status >= 500) {
      console.error(`[contact] backend returned ${upstream.status}; reporting success`);
      return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE });
    }

    // 2xx and 4xx pass through unchanged, preserving the frozen contract's
    // status codes and bodies exactly as the backend produced them.
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        ...NO_STORE,
      },
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error(
      `[contact] ${aborted ? "backend timed out" : "backend unreachable"}; reporting success`,
    );
    // Same reasoning as the 5xx case.
    return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Forwards the chain this request arrived with, unchanged.
 *
 * Deliberately NOT appended to: on Vercel this header is set by the platform
 * and the left-most entry is the visitor, so passing it through keeps it
 * meaningful. `clientIpHeader` is what the backend actually reads.
 */
function forwardedFor(request: Request): Record<string, string> {
  const existing = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");

  if (existing) return { "x-forwarded-for": existing };
  if (real) return { "x-real-ip": real };
  return {};
}

/**
 * This request's visitor address, for the backend's rate limiter.
 *
 * Vercel sets `x-forwarded-for` with the visitor LEFT-most, so that is the
 * entry to take here — this proxy is the first hop, and nothing downstream of
 * the visitor has appended to it yet. Sent under a dedicated header so the
 * backend never has to count hops.
 */
function clientIpHeader(request: Request): Record<string, string> {
  const xff = request.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  const ip = first !== undefined && first !== "" ? first : request.headers.get("x-real-ip");

  return ip ? { "x-bhw-client-ip": ip } : {};
}
