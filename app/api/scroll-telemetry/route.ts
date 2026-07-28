import { NextRequest, NextResponse } from "next/server";
import { buildScrollTelemetrySummary, checkRateLimit, recordScrollTelemetry } from "@/lib/scroll/resultsStore";
import { PARSE_OUTCOMES, SCREEN_TIME_LAYOUTS, type ParseOutcome, type ScreenTimeLayout } from "@/lib/scroll/ocrSanitizer";

export const runtime = "nodejs";

// Anonymous, aggregate-only parse telemetry: accepts two enums and nothing
// else. No image data, no OCR text, no app names ever reach this endpoint.

function isLayout(value: unknown): value is ScreenTimeLayout {
  return typeof value === "string" && SCREEN_TIME_LAYOUTS.includes(value as ScreenTimeLayout);
}

function isOutcome(value: unknown): value is ParseOutcome {
  return typeof value === "string" && PARSE_OUTCOMES.includes(value as ParseOutcome);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(`telemetry:${ip}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { layout, outcome } = body as { layout?: unknown; outcome?: unknown };

  if (!isLayout(layout) || !isOutcome(outcome)) {
    return NextResponse.json({ error: "Invalid telemetry" }, { status: 400 });
  }

  recordScrollTelemetry(layout, outcome);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(buildScrollTelemetrySummary());
}
