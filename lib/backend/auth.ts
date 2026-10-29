// Password gate for /backend. One shared operator password, HMAC-signed cookie
// with an expiry baked into the payload — no server-side session store, so
// rotating the password logs everyone out at once.

import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "nfadm";

const TTL_MS = 12 * 3600 * 1000;

function secret(): string {
  return process.env.DASH_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function expectedPassword(): string {
  return process.env.BACKEND_PASSWORD || process.env.DASH_PASSWORD || "";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(`nfadm:${payload}`).digest("base64url");
}

function equal(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function authConfigured(): boolean {
  return Boolean(secret() && expectedPassword());
}

export function passwordAccepted(input: unknown): boolean {
  if (typeof input !== "string" || !input) return false;
  const expected = expectedPassword();
  return Boolean(expected) && equal(input, expected);
}

export function issueToken(now = Date.now()): { token: string; maxAge: number } {
  const exp = String(now + TTL_MS);
  return { token: `${exp}.${sign(exp)}`, maxAge: Math.floor(TTL_MS / 1000) };
}

export function tokenValid(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < now) return false;
  return equal(sig, sign(exp));
}

export function requestAuthed(request: NextRequest): boolean {
  return tokenValid(request.cookies.get(SESSION_COOKIE)?.value);
}

/** Same-origin check for the login POST; keeps casual CSRF out. */
export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
