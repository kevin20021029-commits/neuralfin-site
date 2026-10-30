// 2027 campaign telemetry: shared contract + Supabase REST access.
//
// Events are stored in the same Supabase `events` table the NBTI pipeline
// writes to, but under the `nf2027_` prefix. The NBTI dashboard groups by
// event name, so these rows show up there as their own funnel keys — keep that
// in mind before renaming anything.
//
// Server-only: the service-role key must never reach the browser.

export const CAMPAIGN_PREFIX = "nf2027_";

export const CAMPAIGN_EVENTS = ["nf2027_view", "nf2027_room_open", "nf2027_cta_click"] as const;
export type CampaignEventName = (typeof CAMPAIGN_EVENTS)[number];

export const ROOMS = [
  "arti",
  "play",
  "up",
  "feed",
  "ai",
  "trade",
  "nbti",
  "bazi",
  "download",
  "ziwei",
  "upgrade",
  "web",
] as const;
export type RoomKey = (typeof ROOMS)[number];

export const TARGETS = ["arti", "bazi", "nbti", "download", "home", "other"] as const;

export const PAGES = ["12-one", "12-two", "12-v1"] as const;
export type TargetKey = (typeof TARGETS)[number];

const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

function headers(extra: Record<string, string> = {}) {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export type InsertRow = {
  event_name: CampaignEventName;
  lang?: string;
  page: string;
  url?: string;
  ua?: string;
  country?: string;
  city?: string;
  params: Record<string, unknown>;
};

export async function insertCampaignEvent(row: InsertRow): Promise<void> {
  if (!supabaseConfigured()) throw new Error("supabase_not_configured");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
    method: "POST",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify([row]),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`supabase_insert_${res.status}:${text.slice(0, 200)}`);
  }
}

export function clip(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/�/g, "").trim();
  return clean ? clean.slice(0, max) : undefined;
}
