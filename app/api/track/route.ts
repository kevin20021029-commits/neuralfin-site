import { NextRequest, NextResponse } from "next/server";
import { CAMPAIGN_EVENTS, ROOMS, TARGETS, clip, insertCampaignEvent, supabaseConfigured } from "@/lib/campaign/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, anonymous ingestion for the /12/one campaign page. No cookies, no
// IP stored, no PII: a random session id plus which room or link was used.

const WINDOW_MS = 60_000;
const MAX_PER_IP = 120;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (hits.size > 5000) {
    for (const [key, value] of hits) if (value.reset < now) hits.delete(key);
  }
  return entry.count > MAX_PER_IP;
}

function ipOf(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function decodeHeader(value: string | null, max: number): string | undefined {
  if (!value) return undefined;
  try {
    return clip(decodeURIComponent(value), max);
  } catch {
    return clip(value, max);
  }
}

export async function POST(request: NextRequest) {
  if (rateLimited(ipOf(request))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  if (!supabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const eventName = body.event_name;
  if (typeof eventName !== "string" || !(CAMPAIGN_EVENTS as readonly string[]).includes(eventName)) {
    return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });
  }

  const sessionId = clip(body.session_id, 64);
  if (!sessionId || !/^[0-9a-zA-Z-]{8,64}$/.test(sessionId)) {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 400 });
  }

  const room = typeof body.room === "string" && (ROOMS as readonly string[]).includes(body.room) ? body.room : undefined;
  const target =
    typeof body.target === "string" && (TARGETS as readonly string[]).includes(body.target) ? body.target : undefined;

  const params: Record<string, unknown> = { session_id: sessionId };
  if (room) params.room = room;
  if (target) params.target = target;
  const label = clip(body.label, 40);
  if (label) params.label = label;

  try {
    await insertCampaignEvent({
      event_name: eventName as (typeof CAMPAIGN_EVENTS)[number],
      page: "12-one",
      lang: clip(body.lang, 16),
      url: clip(body.url, 500),
      ua: clip(request.headers.get("user-agent") ?? "", 300),
      country: clip(request.headers.get("x-vercel-ip-country"), 8),
      city: decodeHeader(request.headers.get("x-vercel-ip-city"), 64),
      params,
    });
  } catch (error) {
    console.error("[campaign-track] insert failed", error);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
