# App Integration Brief — Scroll Calculator → NeuralFin app

For the app/backend team picking up the Phase 2 claim flow: a user completes
the scroll audit on the web, installs the app, and carries their result into
their profile — with points awarded for joining that way.

This is a handover document. It describes what the web side already
provides, what is **not** connected, and the two constraints that must hold.
Nothing here is a request to change the web code.

Status: written 2026-07-31 against `main`.

---

## 1. What the web side hands over today

Every store link on `/scroll` (share card and sticky footer) carries:

| Param | Values | Meaning |
|---|---|---|
| `sc_hours` | `0.5`–`12`, one decimal | slider value — **scroll** hours/day, not total screen time |
| `sc_region` | `ww` \| `hk` \| `sg` \| `th` | market the user compared against |
| `sc_verified` | `1` \| `0` | the read came from a screenshot the parser could substantiate |
| `sc_lang` | `en` \| `zh-Hant` \| `zh-Hans` \| `th` | UI locale (legacy `zh` accepted inbound → `zh-Hant`) |

Plus `utm_source=scroll-calculator`, `utm_medium=web`,
`utm_campaign=scroll-audit`.

Defined in `lib/scroll/campaign.ts` (`SCROLL_DEEP_LINK_PARAMS`,
`SCROLL_CAMPAIGN_UTM`), assembled in `appLink()` in
`components/scroll/ScrollCalculator.tsx`. **Names and formats are a stable
contract** — BUILD_SPEC treats them as such and there are tests asserting
they have not drifted. Read them; do not rename them.

Example (Hong Kong, verified, 7.2 h/day):

```
https://apps.apple.com/hk/app/neuralfin/id6751037382
  ?utm_source=scroll-calculator&utm_medium=web&utm_campaign=scroll-audit
  &sc_hours=7.2&sc_region=hk&sc_verified=1&sc_lang=zh-Hant
```

---

## 2. ⚠ The pipe is not connected at your end

**These params ride on the store URL, and neither store forwards arbitrary
query params to a freshly installed app.**

- **iOS** — the App Store passes nothing through to a new install. There is
  no native deferred deep link. This requires an attribution provider
  (Branch / AppsFlyer / Adjust) or a first-party equivalent.
- **Android** — Play forwards only what is inside the `referrer=` parameter,
  surfaced via the Install Referrer API. The params above sit at the top
  level, so as written they are dropped. They would need repacking as
  `referrer=<url-encoded blob>`.

Decide this before building against `sc_*`. Options, roughly in order of
cost:

1. **Attribution SDK** — standard, works on both platforms, adds a vendor.
2. **Claim code** — the web shows a short code (on the card or after the
   scan); the user enters it once in-app. No SDK, no fingerprinting, works
   everywhere, and it is verifiable server-side because *you* issue the code.
3. **Re-scan in-app** — skip the handoff; the user redoes the audit once
   signed in. Least engineering, most friction, and the only option where
   the numbers are produced inside your trust boundary.

Option 2 composes well with the rewards system — see §3.

---

## 3. ⚠ Trust boundary — read this before wiring points

Everything in `sc_*` is **client-supplied and trivially forgeable**. Anyone
can open the store link by hand with `sc_hours=12&sc_verified=1`.

`sc_verified` is weaker than the name suggests even when honest. Screenshot
OCR runs **entirely on the user's device** (tesseract.js in the browser) and
this is deliberate — the site publicly promises "read on your device, never
uploaded", and CLAUDE.md Hard Rule 1 forbids any endpoint that receives
image data. Consequences:

- No image, and no OCR text, ever reaches a server. There is nothing stored
  anywhere that could be re-checked after the fact.
- `sc_verified=1` means *this browser's parse was internally consistent* —
  an anchored label, clean confidence, categories that reconcile. It is not
  an attestation by us.
- There is no server-side signature on any of it.

**Rule: `sc_*` is fine for attribution and personalisation. It must never be
the basis for granting points.** Reward the signup, or an in-app action you
can verify server-side. If you want the scroll result itself to carry value,
issue the claim code server-side (option 2 above) so the thing being
redeemed is something you minted.

---

## 4. ⚠ Privacy constraint that must survive integration

Two separate things, easily conflated:

**A user's own result in their own profile** — unproblematic. It is their
data, in their account, with their consent at signup.

**The community aggregate must stay unjoinable to identities.** The site
publicly promises anonymous community stats. `POST /api/scroll-results`
stores exactly `{hours, region, ts}` — no IPs, no identifiers, no cookies
(CLAUDE.md Hard Rule 2). IPs exist only in an in-memory rate-limit map
(60/hour) and are never persisted.

If a claimed profile result and an aggregate row become linkable, that
promise quietly stops being true while every line of code still looks
correct. Make it an explicit design decision — either the aggregate write is
a separate unattributable path, or it is a strict projection carrying no
user key. Do not let it emerge by accident.

Also: `/api/scroll-telemetry` accepts enum values only (layout, outcome,
fixed event names, webview env) and stores counters only. It has been
tested against attempts to smuggle OCR text, app names and image data
through it — all are discarded. Keep it that way.

---

## 5. State of the web-side store

`lib/scroll/resultsStore.ts` keeps results in a JavaScript array on
`globalThis`. On serverless this means: **instances recycle** (every deploy
and idle timeout wipes it) and **instances are plural** (each has its own
copy, so submissions fragment). BUILD_SPEC calls it a placeholder and says a
durable store is required for launch.

Consequence chain, which matters if you plan to use this data:

```
SCROLL_COMMUNITY_THRESHOLD = 500
  → the count can never reach it (resets + fragments)
  → percentiles stay on "benchmark", never switch to "community"
  → per-market averages never activate; the tape stays on demo rows
```

**What exists:** telemetry has a swappable storage interface —
`ScrollTelemetryStorage` with `setScrollTelemetryStorage()`. Drop in a
backend, no call sites change.

**What does not:** results have no equivalent. `addScrollResult()` and
`buildScrollSummary()` reach into the array directly. **A
`ScrollResultsStorage` interface mirroring the telemetry one is the first
piece of work** for any durable backend, wherever it lives.

Two constraints for that migration:

- The rate-limit map holds IPs. It must stay ephemeral and local — never
  persisted.
- The 5,000-row cap (`MAX_RESULTS`) becomes a retention policy rather than
  disappearing.

---

## 6. What only the app can supply

`flippedPercent` — "% of users who converted scroll minutes into lessons" —
is the ranking dimension of the Market Standings table. It is **in-app
behaviour the calculator cannot observe**, so it is deliberately absent from
`GET /api/scroll-results/summary` rather than omitted by oversight. The
standings currently cite published figures for it and the UI discloses this.

If you want that table live, the app has to report an aggregate flip rate
per market. Per §4, that must be an aggregate — not per-user rows.

---

## 7. Known accuracy limits (so nobody inherits them unknowingly)

- **The percentile is modelled, not measured.** A lognormal fitted to a
  published screen-time benchmark (mean 4.2 h/day, SD 2.1, in
  `SCROLL_BENCHMARK`). The constants carry no citation in the repo.
- **Users are ranked against the wrong quantity.** The slider collects
  *scroll* time (social/video/games); the benchmark is *total screen time*.
  This biases everyone's percentile low. BUILD_SPEC tracks it as
  `TODO: source scroll-specific benchmarks`.
- **The regional split runs on demo data.** `getRegionAverageHours()` reads
  per-market averages from `SCROLL_STANDINGS`, the same array the standings
  UI labels "Demo data".

Real community data fixes the first two automatically — the distribution
becomes scroll-hours from actual users in actual markets, which is
scroll-vs-scroll and market-specific by construction.

- **Curriculum numbers are unconfirmed.** `TODO(product)` in
  `lib/scroll/education.ts`: track names, per-track lesson counts, and the
  5-minute lesson length. Every duration printed on the share card derives
  from those three inputs, including the milestone date.

---

## 8. Reference

| Thing | Where |
|---|---|
| Deep-link params, benchmark, standings | `lib/scroll/campaign.ts` |
| Link assembly | `appLink()` in `components/scroll/ScrollCalculator.tsx` |
| Store + rate limit + summary | `lib/scroll/resultsStore.ts` |
| Results API | `app/api/scroll-results/`, `app/api/scroll-results/summary/` |
| Telemetry API | `app/api/scroll-telemetry/` |
| Parser + sanitizer | `lib/scroll/ocrSanitizer.ts` |
| Hard rules | `CLAUDE.md` |
| Product decisions, support matrix | `BUILD_SPEC.md` |
| Copy register, locale policy | `VOICE.md` |
