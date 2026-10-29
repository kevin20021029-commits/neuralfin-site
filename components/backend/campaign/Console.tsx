"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OverviewPayload, SourceKey, SourcePayload } from "@/lib/backend/types";

type TabKey = "overview" | SourceKey;
type RangeKey = "1" | "7" | "30" | "all";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "1", label: "今日" },
  { key: "7", label: "近 7 天" },
  { key: "30", label: "近 30 天" },
  { key: "all", label: "全部" },
];

const TABS: { key: TabKey; label: string; sub: string }[] = [
  { key: "overview", label: "总览", sub: "四端合计" },
  { key: "onepage", label: "12/one", sub: "neuralfin.ai/12/one" },
  { key: "nbti", label: "NBTI", sub: "nbti.neuralfin.ai" },
  { key: "bazi", label: "八字", sub: "nbti.neuralfin.ai/bazi" },
  { key: "arti", label: "ARTi", sub: "neuralfin.ai/arti" },
];

const POLL_MS = 30_000;

function num(value: number): string {
  return (value ?? 0).toLocaleString("zh-CN");
}

function clock(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
}

function dateClock(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function ago(seconds: number | null): string {
  if (seconds === null) return "无数据";
  if (seconds < 60) return `${seconds} 秒前`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} 分钟前`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} 小时前`;
  return `${Math.round(seconds / 86400)} 天前`;
}

function dur(seconds: number): string {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

function share(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export default function Console() {
  const [gate, setGate] = useState<"checking" | "locked" | "ready">("checking");
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  const [tab, setTab] = useState<TabKey>("overview");
  const [range, setRange] = useState<RangeKey>("7");
  const [data, setData] = useState<OverviewPayload | SourcePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [usageLimit, setUsageLimit] = useState(20);
  const [userLimit, setUserLimit] = useState(20);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/backend/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((body: { authed?: boolean; configured?: boolean }) => {
        setConfigured(body.configured !== false);
        setGate(body.authed ? "ready" : "locked");
      })
      .catch(() => setGate("locked"));
  }, []);

  const load = useCallback(
    async (src: TabKey, key: RangeKey) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/backend/stats?src=${src}&range=${key}`, { cache: "no-store" });
        const body = (await res.json()) as { ok?: boolean; error?: string };
        if (res.status === 401) {
          setGate("locked");
          return;
        }
        if (!res.ok || body.ok === false) {
          setError(body.error ?? `http_${res.status}`);
          setData(null);
        } else {
          setError(null);
          setData(body as OverviewPayload | SourcePayload);
          setFetchedAt(Date.now());
        }
      } catch {
        setError("network");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (gate !== "ready") return;
    void load(tab, range);
  }, [gate, tab, range, load]);

  useEffect(() => {
    setUsageLimit(20);
    setUserLimit(20);
  }, [tab, range]);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (gate !== "ready" || !auto) return;
    timer.current = setInterval(() => void load(tab, range), POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [auto, gate, tab, range, load]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/backend/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) {
        setPassword("");
        setGate("ready");
      } else {
        setLoginError(body.error === "bad_password" ? "密码不正确" : body.error === "rate_limited" ? "尝试过于频繁，稍后再试" : body.error ?? "登录失败");
      }
    } catch {
      setLoginError("网络错误");
    } finally {
      setLoginBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/backend/logout", { method: "POST" });
    setGate("locked");
    setData(null);
  }

  if (gate === "checking") {
    return (
      <div className="bk-root">
        <div className="bk-gate">
          <p className="bk-gate-eyebrow">NEURALFIN · OPS</p>
          <p className="bk-gate-hint">正在校验会话…</p>
        </div>
      </div>
    );
  }

  if (gate === "locked") {
    return (
      <div className="bk-root">
        <div className="bk-gate">
          <span className="bk-mark" aria-hidden="true" />
          <p className="bk-gate-eyebrow">NEURALFIN · OPS</p>
          <h1>数据后台</h1>
          <p className="bk-gate-sub">12/one · NBTI · 八字 · ARTi</p>
          <form onSubmit={signIn} className="bk-gate-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="访问密码"
              autoFocus
              autoComplete="current-password"
            />
            <button type="submit" disabled={loginBusy || !password}>
              {loginBusy ? "校验中…" : "进入"}
            </button>
          </form>
          {!configured && <p className="bk-gate-error">服务端未配置 DASH_PASSWORD，无法登录。</p>}
          {loginError && <p className="bk-gate-error">{loginError}</p>}
        </div>
      </div>
    );
  }

  const overview = data && "kind" in data ? data : null;
  const source = data && !("kind" in data) ? data : null;
  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <div className="bk-root">
      <div className="bk-shell">
        <aside className="bk-rail">
          <div className="bk-rail-brand">
            <span className="bk-mark" aria-hidden="true" />
            <div>
              <p className="bk-eyebrow">NEURALFIN · OPS</p>
              <strong>数据后台</strong>
            </div>
          </div>
          <nav className="bk-nav">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={item.key === tab ? "on" : ""}
                onClick={() => setTab(item.key)}
              >
                <span className="bk-nav-label">{item.label}</span>
                <span className="bk-nav-sub">{item.sub}</span>
              </button>
            ))}
          </nav>
          <div className="bk-rail-foot">
            <button type="button" className="bk-ghost" onClick={() => void signOut()}>
              退出登录
            </button>
            <a className="bk-ghost" href="/12/one" target="_blank" rel="noopener">
              打开 12/one ↗
            </a>
          </div>
        </aside>

        <main className="bk-main">
          <header className="bk-head">
            <div className="bk-title">
              <p className="bk-eyebrow">DATA CONSOLE</p>
              <h1>{activeTab.label}</h1>
              <p className="bk-sub">{activeTab.sub}</p>
            </div>
            <div className="bk-controls">
              <div className="bk-seg" role="group" aria-label="时间范围">
                {RANGES.map((r) => (
                  <button key={r.key} type="button" className={r.key === range ? "on" : ""} onClick={() => setRange(r.key)}>
                    {r.label}
                  </button>
                ))}
              </div>
              <button type="button" className="bk-auto" onClick={() => setAuto((v) => !v)} aria-pressed={auto}>
                <span className={auto ? "dot on" : "dot"} />
                {auto ? "自动刷新" : "已暂停"}
              </button>
              <button type="button" className="bk-refresh" onClick={() => void load(tab, range)} disabled={loading} aria-label="刷新">
                ↻
              </button>
            </div>
          </header>

          <div className="bk-status">
            <span className={source ? (source.health.stale ? "pulse" : "pulse on") : overview ? "pulse on" : "pulse"} />
            <b>{loading && !data ? "加载中" : error ? "读取失败" : overview ? "四端汇总" : source?.health.stale ? "数据停滞" : "数据在线"}</b>
            {source && <span>最近事件 {ago(source.health.ageSec)}</span>}
            {source && <span>今日 {num(source.health.todayEvents)} 条</span>}
            {overview && <span>窗口 {overview.rangeLabel}</span>}
            {fetchedAt && <span className="bk-updated">更新于 {clock(new Date(fetchedAt).toISOString())}</span>}
          </div>

          {error && (
            <div className="bk-notice">
              <b>读取失败（{error}）。</b> 先确认 Supabase 可达，再看函数日志。
            </div>
          )}

          {overview && <OverviewView payload={overview} onOpen={(src) => setTab(src)} />}
          {source && <SourceView payload={source} usageLimit={usageLimit} userLimit={userLimit} onMoreUsage={() => setUsageLimit((n) => n + 30)} onMoreUsers={() => setUserLimit((n) => n + 30)} />}

          <footer className="bk-foot">
            <span>时间 = Asia/Shanghai 自然日</span>
            <span>数据源 = Supabase events / arti_events + NBTI /api/stats</span>
            <span>刷新 {auto ? "30s" : "手动"}</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function OverviewView({ payload, onOpen }: { payload: OverviewPayload; onOpen: (src: SourceKey) => void }) {
  return (
    <>
      <div className="bk-kpis bk-kpis-4">
        <Kpi label="总访客" value={payload.totals.visitors} sub="四端相加，未跨端去重" />
        <Kpi label="总事件" value={payload.totals.events} sub={payload.rangeLabel} />
        <Kpi label="核心使用" value={payload.totals.core} sub="打开板块 / 开始测试 / 提问" />
        <Kpi label="注册 / 登录" value={payload.totals.logins} sub="NBTI + ARTi 可归属部分" />
      </div>

      <div className="bk-cards">
        {payload.cards.map((card) => (
          <button key={card.src} type="button" className="bk-src" onClick={() => onOpen(card.src)}>
            <header>
              <span className="bk-src-name">{card.label}</span>
              <span className={card.ageSec !== null && card.ageSec < 6 * 3600 ? "bk-live on" : "bk-live"} />
            </header>
            <p className="bk-src-sub">{card.sub}</p>
            <div className="bk-src-nums">
              <div>
                <b>{num(card.visitors)}</b>
                <span>访客</span>
              </div>
              <div>
                <b>{num(card.events)}</b>
                <span>事件</span>
              </div>
              <div>
                <b>{num(card.logins)}</b>
                <span>登录</span>
              </div>
            </div>
            <Spark values={card.spark} />
            <footer>
              <span>{card.instrumented ? `最近 ${ago(card.ageSec)}` : "暂无埋点"}</span>
              <span className="bk-src-open">查看详情 →</span>
            </footer>
          </button>
        ))}
      </div>

      <section className="bk-card">
        <header className="bk-card-head">
          <h2>四端合计趋势</h2>
          <span>{payload.rangeLabel} · 柱=事件 · 线=访客</span>
        </header>
        <Trend daily={payload.daily.map((d) => ({ day: d.day, events: d.events, visitors: d.visitors }))} />
      </section>

      {payload.notes.length > 0 && (
        <div className="bk-notes">
          {payload.notes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
      )}
    </>
  );
}

function SourceView({
  payload,
  usageLimit,
  userLimit,
  onMoreUsage,
  onMoreUsers,
}: {
  payload: SourcePayload;
  usageLimit: number;
  userLimit: number;
  onMoreUsage: () => void;
  onMoreUsers: () => void;
}) {
  const k = payload.kpi;
  return (
    <>
      <div className="bk-kpis bk-kpis-6">
        <Kpi label="访客 / 会话" value={k.visitors} sub="按会话去重" />
        <Kpi label="事件" value={k.events} sub={payload.rangeLabel} />
        <Kpi label="核心使用" value={k.core} sub={payload.src === "nbti" ? "开始测试次数" : `${share(k.core, k.visitors)}% 的访客`} />
        <Kpi
          label="注册 / 登录"
          value={k.logins}
          sub={k.logins ? "可归属登录" : payload.src === "onepage" ? "该端不可归属" : "窗口内无登录"}
        />
        <Kpi label="转化率" value={k.conversion} unit="%" sub="登录 / 访客" />
        <Kpi label="时长 P50" value={k.durationP50} unit="s" sub={`样本 ${num(payload.duration.n)}`} />
      </div>

      {payload.attribution && (
        <div className="bk-attr">
          <span className="bk-attr-label">{payload.attribution.label}</span>
          <code>{payload.attribution.param}</code>
          <span className="bk-attr-num">
            <b>{num(payload.attribution.visitors)}</b> 人到达
          </span>
          <span className="bk-attr-num">
            <b>{num(payload.attribution.events)}</b> 事件
          </span>
          <em>{payload.attribution.note}</em>
        </div>
      )}

      {!payload.instrumented && (
        <div className="bk-notice">
          <b>该端还没有埋点数据。</b> 下方为空状态；接入事件后自动填充。
        </div>
      )}

      <div className="bk-grid bk-grid-2">
        <section className="bk-card">
          <header className="bk-card-head">
            <h2>转化漏斗</h2>
            <span>访问 → 使用 → 注册 / 登录</span>
          </header>
          <div className="bk-funnel">
            {payload.funnel.map((step, i) => {
              const prev = i > 0 ? payload.funnel[i - 1].value : step.value;
              const drop = i > 0 && prev > 0 ? Math.round((step.value / prev) * 100) : null;
              return (
                <div key={step.key} className="bk-funnel-row">
                  <div className="bk-funnel-meta">
                    <span>{step.label}</span>
                    {drop !== null && <em className="bk-drop">上一步 {drop}%</em>}
                    <b>{num(step.value)}</b>
                    <em>{step.pct}%</em>
                  </div>
                  <div className="bk-track">
                    <i style={{ width: `${Math.max(step.pct, step.value > 0 ? 2 : 0)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bk-card">
          <header className="bk-card-head">
            <h2>使用时长</h2>
            <span>{payload.duration.stages.length ? "完成耗时 P50 / P95" : "会话内首末事件间隔"}</span>
          </header>
          <div className="bk-dur-head">
            <div>
              <b>{dur(payload.duration.p50)}</b>
              <span>P50</span>
            </div>
            <div>
              <b>{dur(payload.duration.p90)}</b>
              <span>P90</span>
            </div>
            <div>
              <b>{payload.duration.avg ? dur(payload.duration.avg) : "—"}</b>
              <span>平均</span>
            </div>
          </div>
          {payload.duration.buckets.length > 0 && (
            <ul className="bk-rows bk-buckets">
              {payload.duration.buckets.map((b) => (
                <li key={b.label}>
                  <span>{b.label}</span>
                  <div className="bk-mini-track">
                    <i style={{ width: `${share(b.count, payload.duration.n)}%` }} />
                  </div>
                  <b>{num(b.count)}</b>
                </li>
              ))}
            </ul>
          )}
          {payload.duration.stages.length > 0 && (
            <ul className="bk-stages">
              {payload.duration.stages.map((s) => (
                <li key={s.label}>
                  <span>{s.label}</span>
                  <b>{dur(Math.round(s.p50 / 1000))}</b>
                  <em>P95 {dur(Math.round(s.p95 / 1000))} · n={s.n}</em>
                </li>
              ))}
            </ul>
          )}
          {payload.duration.n === 0 && payload.duration.stages.length === 0 && <p className="bk-empty">暂无时长数据</p>}
        </section>
      </div>

      <section className="bk-card">
        <header className="bk-card-head">
          <h2>按天趋势</h2>
          <span>{payload.rangeLabel} · 柱=事件 · 线=访客</span>
        </header>
        <Trend daily={payload.daily.map((d) => ({ day: d.day, events: d.events, visitors: d.visitors }))} />
      </section>

      <div className="bk-grid bk-grid-3">
        <BreakdownCard title="语言" sub="按事件" items={payload.breakdowns.lang} />
        <BreakdownCard title="地区" sub="按事件" items={payload.breakdowns.country} />
        <div className="bk-card">
          <header className="bk-card-head">
            <h2>设备 / 分布</h2>
            <span>按事件</span>
          </header>
          <div className="bk-split">
            <div className="bk-split-col">
              <h3>设备</h3>
              {payload.breakdowns.device.map((d) => (
                <div key={d.key} className="bk-split-row">
                  <span>{d.label}</span>
                  <b>{num(d.count)}</b>
                </div>
              ))}
              {payload.breakdowns.device.length === 0 && <p className="bk-empty">—</p>}
            </div>
            {payload.breakdowns.extra && (
              <div className="bk-split-col">
                <h3>{payload.breakdowns.extra.title}</h3>
                {payload.breakdowns.extra.items.map((d) => (
                  <div key={d.key} className="bk-split-row">
                    <span>{d.label}</span>
                    <b>{num(d.count)}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="bk-card">
        <header className="bk-card-head">
          <h2>使用记录</h2>
          <span>最近 {Math.min(usageLimit, payload.usage.length)} / {payload.usage.length} 条</span>
        </header>
        {payload.usage.length === 0 ? (
          <p className="bk-empty">暂无记录</p>
        ) : (
          <>
            <div className="bk-table-wrap">
              <table className="bk-table">
                <thead>
                  <tr>
                    <th className="w-time">时间</th>
                    <th className="w-ev">事件</th>
                    <th>详情</th>
                    <th className="w-sid">会话</th>
                    <th className="w-geo">地区</th>
                    <th className="w-dev">设备</th>
                    <th className="w-lang">语言</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.usage.slice(0, usageLimit).map((row, i) => (
                    <tr key={`${row.ts}-${i}`}>
                      <td className="bk-mono">{dateClock(row.ts)}</td>
                      <td>
                        <span className="bk-tag">{row.event}</span>
                      </td>
                      <td className="bk-ellipsis" title={row.detail}>
                        {row.detail}
                      </td>
                      <td className="bk-mono">{row.session}</td>
                      <td>{row.country}</td>
                      <td>{row.device}</td>
                      <td>{row.lang}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usageLimit < payload.usage.length && (
              <button type="button" className="bk-more" onClick={onMoreUsage}>
                再看 {Math.min(30, payload.usage.length - usageLimit)} 条
              </button>
            )}
          </>
        )}
      </section>

      <section className="bk-card">
        <header className="bk-card-head">
          <h2>用户记录</h2>
          <span>最近 {Math.min(userLimit, payload.users.length)} / {payload.users.length}</span>
        </header>
        {payload.users.length === 0 ? (
          <p className="bk-empty">暂无用户记录</p>
        ) : (
          <>
            <div className="bk-table-wrap">
              <table className="bk-table">
                <thead>
                  <tr>
                    <th>用户 / 会话</th>
                    <th>身份</th>
                    <th className="w-time">首次</th>
                    <th className="w-time">最近</th>
                    <th className="w-num">时长</th>
                    <th className="w-num">事件</th>
                    <th>地区</th>
                    <th>设备</th>
                    <th>最近动作</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.users.slice(0, userLimit).map((row, i) => (
                    <tr key={`${row.id}-${i}`}>
                      <td>
                        <span className="bk-user">{row.label}</span>
                        <span className="bk-mono bk-dim">{row.id}</span>
                      </td>
                      <td>{row.identity}</td>
                      <td className="bk-mono">{dateClock(row.firstTs)}</td>
                      <td className="bk-mono">{dateClock(row.lastTs)}</td>
                      <td className="bk-mono bk-right">{row.durationS ? dur(row.durationS) : "—"}</td>
                      <td className="bk-mono bk-right">{num(row.events)}</td>
                      <td>{row.country}</td>
                      <td>{row.device}</td>
                      <td className="bk-ellipsis" title={row.extra}>
                        {row.extra}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {userLimit < payload.users.length && (
              <button type="button" className="bk-more" onClick={onMoreUsers}>
                再看 {Math.min(30, payload.users.length - userLimit)} 人
              </button>
            )}
          </>
        )}
      </section>

      {payload.notes.length > 0 && (
        <div className="bk-notes">
          {payload.notes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
      )}
    </>
  );
}

function Kpi({ label, value, sub, unit }: { label: string; value: number; sub?: string; unit?: string }) {
  return (
    <div className="bk-kpi">
      <span>{label}</span>
      <b>
        {num(value)}
        {unit && <em>{unit}</em>}
      </b>
      {sub && <small>{sub}</small>}
    </div>
  );
}

function BreakdownCard({ title, sub, items }: { title: string; sub: string; items: { key: string; label: string; count: number }[] }) {
  const total = items.reduce((sum, x) => sum + x.count, 0);
  return (
    <section className="bk-card">
      <header className="bk-card-head">
        <h2>{title}</h2>
        <span>{sub}</span>
      </header>
      <ul className="bk-rows">
        {items.map((item) => (
          <li key={item.key}>
            <span>{item.label}</span>
            <div className="bk-mini-track">
              <i style={{ width: `${share(item.count, total)}%` }} />
            </div>
            <b>{num(item.count)}</b>
          </li>
        ))}
        {items.length === 0 && <p className="bk-empty">—</p>}
      </ul>
    </section>
  );
}

function Spark({ values }: { values: number[] }) {
  const W = 120;
  const H = 26;
  const max = Math.max(1, ...values);
  const points = useMemo(() => {
    if (values.length < 2) return "";
    return values
      .map((v, i) => `${(i / (values.length - 1)) * W},${H - (v / max) * (H - 4) - 2}`)
      .join(" ");
  }, [values, max]);
  if (!points) return <div className="bk-spark bk-spark-empty" />;
  return (
    <svg className="bk-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="rgba(224,191,122,0.75)" strokeWidth="1.4" />
    </svg>
  );
}

function Trend({ daily }: { daily: { day: string; events: number; visitors: number }[] }) {
  const W = 900;
  const H = 200;
  const pad = { top: 14, right: 10, bottom: 24, left: 10 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(1, ...daily.map((d) => d.events), ...daily.map((d) => d.visitors));
  const slot = innerW / Math.max(1, daily.length);
  const barW = Math.max(2, Math.min(18, slot * 0.5));
  const line = daily
    .map((d, i) => {
      const x = pad.left + slot * i + slot / 2;
      const y = pad.top + innerH - (d.visitors / max) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  if (!daily.length) return <p className="bk-empty">暂无趋势数据</p>;
  return (
    <div className="bk-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="按天事件与访客趋势">
        <line x1={pad.left} y1={pad.top + innerH} x2={W - pad.right} y2={pad.top + innerH} stroke="rgba(224,191,122,0.18)" />
        {[0.5, 1].map((f) => (
          <line
            key={f}
            x1={pad.left}
            y1={pad.top + innerH - innerH * f}
            x2={W - pad.right}
            y2={pad.top + innerH - innerH * f}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="2 6"
          />
        ))}
        {daily.map((d, i) => {
          const h = (d.events / max) * innerH;
          return (
            <rect
              key={d.day}
              x={pad.left + slot * i + (slot - barW) / 2}
              y={pad.top + innerH - h}
              width={barW}
              height={Math.max(h, d.events > 0 ? 1.5 : 0)}
              rx={1.5}
              fill="rgba(224,191,122,0.34)"
            />
          );
        })}
        <polyline points={line} fill="none" stroke="#f4e2bd" strokeWidth="1.6" strokeLinejoin="round" />
        {daily.map((d, i) =>
          i % Math.ceil(daily.length / 8) === 0 || i === daily.length - 1 ? (
            <text key={`t-${d.day}`} x={pad.left + slot * i + slot / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="rgba(232,227,216,0.45)">
              {d.day.slice(5)}
            </text>
          ) : null,
        )}
      </svg>
      <div className="bk-legend">
        <span>
          <i className="bar" />
          事件
        </span>
        <span>
          <i className="line" />
          访客
        </span>
        <span className="max">峰值 {num(max)}</span>
      </div>
    </div>
  );
}
