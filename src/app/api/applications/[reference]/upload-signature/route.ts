import { NextResponse } from "next/server";

/**
 * Same-origin proxy to the backend's resume upload-signature endpoint (D-008).
 *
 * 🔴 WHY A PROXY. `BACKEND_API_KEY` is server-only and must never reach the
 * browser, and keeping the call same-origin avoids a CORS preflight on the
 * careers form. The browser never talks to the backend directly (D-002, D-016).
 * Only the FILE goes elsewhere — straight to Cloudinary with the signed
 * parameters this returns, so the bytes never pass through either server
 * (D-014).
 *
 * 🔴 THE CONTRACT IS NOT REIMPLEMENTED HERE. The backend owns every rule: the
 * format allowlist, the server-chosen `public_id`, the one-signature-per-
 * application limit, and the fail-closed rate limit. This forwards the body and
 * relays the status verbatim — including 4xx and 409, because unlike
 * `/api/contact` those ARE real answers the form must act on.
 *
 * ⚠ Unlike the contact proxy, a 5xx is NOT masked as success. Nothing has been
 * promised to the applicant at this point and the application row already
 * exists, so the honest answer lets the form fall back to "email it instead"
 * rather than claiming a CV was received.
 */

const NO_STORE = { "Cache-Control": "no-store" } as const;
const UPSTREAM_TIMEOUT_MS = 5000;
/** The body is a single short `{ format }` object. */
const MAX_BODY_BYTES = 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    console.warn("[resume] BACKEND_URL is not set; upload unavailable");
    return NextResponse.json(
      { error: "Resume upload is not available." },
      { status: 503, headers: NO_STORE },
    );
  }

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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(
      `${backendUrl.replace(/\/+$/, "")}/api/applications/${encodeURIComponent(reference)}/upload-signature`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(process.env.BACKEND_API_KEY
            ? { "x-api-key": process.env.BACKEND_API_KEY }
            : {}),
          ...clientIpHeader(request),
        },
        body,
      },
    );

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        ...NO_STORE,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the server." },
      { status: 503, headers: NO_STORE },
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The visitor's address for the backend's fail-closed rate limiter.
 *
 * Trusted by the backend only because the request also carries the API key
 * above, so it cannot be set from the browser. Vercel puts the visitor
 * left-most in its own `x-forwarded-for`.
 */
function clientIpHeader(request: Request): Record<string, string> {
  const xff = request.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  const ip = first !== undefined && first !== "" ? first : request.headers.get("x-real-ip");
  return ip ? { "x-bhw-client-ip": ip } : {};
}
