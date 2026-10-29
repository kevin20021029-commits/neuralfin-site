// Server-only Supabase REST access for the console. The service-role key stays
// in the function environment; nothing here is importable from a client file.

const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

function headers(): Record<string, string> {
  return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };
}

/**
 * Newest-first rows, walked past PostgREST's 1000-row response cap.
 * `max` is a hard budget — callers surface truncation rather than silently
 * dropping rows.
 */
export async function sbSelect<T>(
  table: string,
  params: Record<string, string>,
  max = 20000,
): Promise<{ rows: T[]; truncated: boolean }> {
  if (!supabaseConfigured()) throw new Error("supabase_not_configured");
  const pageSize = 1000;
  const rows: T[] = [];
  for (let offset = 0; offset < max; offset += pageSize) {
    const qs = new URLSearchParams(params);
    qs.set("limit", String(Math.min(pageSize, max - offset)));
    qs.set("offset", String(offset));
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs.toString()}`, {
      headers: headers(),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`supabase_${table}_${res.status}:${text.slice(0, 160)}`);
    }
    const batch = (await res.json()) as T[];
    rows.push(...batch);
    if (batch.length < pageSize) return { rows, truncated: false };
  }
  return { rows, truncated: true };
}
