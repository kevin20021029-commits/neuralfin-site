import { NextResponse } from "next/server";
import { buildScrollSummary } from "@/lib/scroll/resultsStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(buildScrollSummary());
}
