import { NextResponse } from "next/server";

/**
 * Same-origin proxy to the backend's resume confirm endpoint (D-008 / D-031).
 *
 * Carries no body: the backend verifies the asset against the `public_id` IT
 * issued and recorded on the application row, never one a caller names. That is
 * what stops a guessed reference from attaching someone else's file.
 *
 * Same reasoning as the signature proxy — server-only API key, no CORS
 * preflight, and the status relayed verbatim so the form can fall back to
 * "email it instead" on a genuine rejection.
 */

const NO_STORE = { "Cache-Control": "no-store" } as const;
/** Confirm does a ranged read plus an Admin API call, so it is slower. */
const UPSTREAM_TIMEOUT_MS = 10000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    console.warn("[resume] BACKEND_URL is not set; confirm unavailable");
    return NextResponse.json(
      { error: "Resume upload is not available." },
      { status: 503, headers: NO_STORE },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(
      `${backendUrl.replace(/\/+$/, "")}/api/applications/${encodeURIComponent(reference)}/confirm`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          ...(process.env.BACKEND_API_KEY
            ? { "x-api-key": process.env.BACKEND_API_KEY }
            : {}),
          ...clientIpHeader(request),
        },
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

function clientIpHeader(request: Request): Record<string, string> {
  const xff = request.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  const ip = first !== undefined && first !== "" ? first : request.headers.get("x-real-ip");
  return ip ? { "x-bhw-client-ip": ip } : {};
}
