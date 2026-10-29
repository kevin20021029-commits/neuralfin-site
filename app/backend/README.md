# /backend — NeuralFin 统一数据后台

`https://www.neuralfin.ai/backend`。一个页面看四个端的数据，可切换：

| Tab | 数据源 | 口径 |
|---|---|---|
| 总览 | 四端合计 | 访客直接相加，不跨端去重 |
| 12/one | Supabase `events`（`nf2027_*`） | 自建埋点，会话去重 |
| NBTI | `nbti.neuralfin.ai/api/stats` | 官方看板同口径（纯净 / 完全真人） |
| 八字 | Supabase `events`（`bazi_*`） | **今天没有埋点**，空状态 |
| ARTi | Supabase `arti_events` | 产品自己的埋点表 |

每个 Tab 都有：转化漏斗（访问 → 使用 → 注册/登录）、按天趋势、使用时长、
使用记录明细、用户记录明细、语言/地区/设备构成。

## 鉴权

- `GET /api/backend/session` → `{ authed, configured }`
- `POST /api/backend/login` `{ password }` → HttpOnly cookie `nfadm`，12 小时
- `POST /api/backend/logout`
- 其它所有数据接口都要这个 cookie，否则 401。
- 密码来自 `BACKEND_PASSWORD`（回退 `DASH_PASSWORD`）；cookie 签名密钥来自
  `DASH_TOKEN`。同 IP 每分钟 8 次登录尝试。

## 数据链路

```
12/one 页面 ─ track-2027.js ─ POST /api/track ─┐
ARTi 产品 ────────────────── arti_events ──────┤
NBTI 看板 API ─ /api/dash-login + /api/stats ──┤
八字页面 ──────────────────── bazi_* 事件 ─────┤
                                                ▼
                       GET /api/backend/stats?src=&range=
                       服务端鉴权 → 拉取 → 归一化（lib/backend/sources/*）
                                                ▼
                       components/backend/campaign/Console.tsx
```

浏览器从头到尾拿不到 Supabase key，也不直连 NBTI。

## 归一化接口

`GET /api/backend/stats?src=overview|onepage|nbti|bazi|arti&range=1|7|30|all`

返回统一形状（`lib/backend/types.ts`）：

```ts
{
  kpi: { visitors, events, core, logins, conversion, durationP50 },
  funnel: [{ key, label, value, pct }],
  daily: [{ day, visitors, events, core, login }],
  duration: { n, avg, p50, p90, buckets[], stages[] },
  usage: [{ ts, event, detail, session, country, device, lang }],
  users: [{ id, label, firstTs, lastTs, durationS, events, country, device, lang, identity, extra }],
  breakdowns: { lang[], country[], device[], extra? },
  health: { lastTs, ageSec, todayEvents, stale },
  instrumented, notes[]
}
```

`src=overview` 返回 `{ kind: "overview", totals, cards[], daily[] }`，四个源并行拉取，
单个源失败只影响自己那张卡。

## 口径与取舍

- 时间一律 Asia/Shanghai 自然日；`range=all` 取全量但受 2 万行上限约束。
- 转化率分母是访客（会话），不是事件数。
- **12/one 的注册/登录不可归属**：点击外链后身份分离，最后一步只能统计到「点击外链」。
- **NBTI 的时长**是主版本完成耗时分位数（P50/P75），不是逐会话时长。
- **八字没有埋点**：页面只调 `/api/auth`，事件无法归属到本页，目前显示空状态。
- 接口进程内缓存 20s，页面自动刷新 30s。

## 环境变量

| 变量 | 用途 |
|---|---|
| `SUPABASE_URL` | 与 NBTI 共用的项目 |
| `SUPABASE_SERVICE_ROLE_KEY` | 读 `events` / `arti_events`；只在服务端 |
| `BACKEND_PASSWORD` | 后台访问密码（回退 `DASH_PASSWORD`） |
| `DASH_PASSWORD` | 换 NBTI `/api/stats` 令牌时用 |
| `DASH_TOKEN` | 后台 cookie 签名 |

改完环境变量要重新部署才生效。

## 本地

```bash
npm run build && npx next start -p 4184   # http://127.0.0.1:4184/backend
```

`.env.local` 放上面几个变量（已 gitignore），密码用交接文档里的那个。
