import { NextRequest, NextResponse } from "next/server";
import { requestAuthed } from "@/lib/backend/auth";
import { loadOverview, loadSource } from "@/lib/backend/sources";
import { RANGES, type RangeKey } from "@/lib/backend/time";
import { SOURCES, type SourceKey } from "@/lib/backend/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60_000;
/* 上游抖一下别把看板打空:10 分钟内的旧结果可以顶上 */
const STALE_MAX_MS = 10 * 60_000;
const cache = new Map<string, { at: number; payload: unknown }>();
/* 并发合并:同一个 src:range 同时穿缓存时只算一次 */
const pending = new Map<string, Promise<unknown>>();

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
  return entry.count > MAX_PER_IP;
}

function json(body: unknown, status: number, cacheState: "hit" | "miss" | "skip" | "shared" | "stale") {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store", "x-cache": cacheState },
  });
}

export async function GET(request: NextRequest) {
  if (!requestAuthed(request)) {
    return json({ ok: false, error: "unauthorized" }, 401, "skip");
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429, "skip");

  const rawSrc = request.nextUrl.searchParams.get("src") ?? "overview";
  const rawRange = request.nextUrl.searchParams.get("range") ?? "7";
  const range = (RANGES as readonly string[]).includes(rawRange) ? (rawRange as RangeKey) : "7";
  const isOverview = rawSrc === "overview";
  if (!isOverview && !(SOURCES as readonly string[]).includes(rawSrc)) {
    return json({ ok: false, error: "bad_source" }, 400, "skip");
  }

  const key = `${rawSrc}:${range}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return json(hit.payload, 200, "hit");

  const cachedJob = pending.get(key);
  const shared = Boolean(cachedJob);
  let job: Promise<unknown> = cachedJob ?? Promise.resolve(null);
  if (!cachedJob) {
    job = (isOverview ? loadOverview(range) : loadSource(rawSrc as SourceKey, range))
      .then((payload: unknown) => {
        cache.set(key, { at: Date.now(), payload });
        return payload;
      })
      .finally(() => {
        pending.delete(key);
      });
    pending.set(key, job);
  }

  try {
    const payload = await job;
    return json(payload, 200, shared ? "shared" : "miss");
  } catch (error) {
    console.error("[backend-stats]", rawSrc, error);
    const last = cache.get(key);
    if (last && Date.now() - last.at < STALE_MAX_MS) return json(last.payload, 200, "stale");
    return json({ ok: false, error: error instanceof Error ? error.message : "upstream_failed" }, 502, "skip");
  }
}
