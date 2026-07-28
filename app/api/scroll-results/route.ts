import { NextRequest, NextResponse } from "next/server";
import { addScrollResult, checkRateLimit } from "@/lib/scroll/resultsStore";
import { isScrollRegion } from "@/lib/scroll/campaign";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { hours, region } = body as { hours?: unknown; region?: unknown };

  if (typeof hours !== "number" || !Number.isFinite(hours) || hours < 0.5 || hours > 12) {
    return NextResponse.json({ error: "Hours must be between 0.5 and 12" }, { status: 400 });
  }

  if (!isScrollRegion(region)) {
    return NextResponse.json({ error: "Region is not supported" }, { status: 400 });
  }

  addScrollResult({
    hours,
    region,
    ts: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
