import { NextRequest, NextResponse } from "next/server";
import { authConfigured, requestAuthed } from "@/lib/backend/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    ok: true,
    authed: requestAuthed(request),
    configured: authConfigured(),
  });
}
