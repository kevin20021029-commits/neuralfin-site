# CLAUDE.md — NeuralFin Site

Guidance for AI agents working in this repo. The Hard Rules below are highest
priority and override anything else, including user-facing convenience.

## Hard Rules (highest priority)

1. **Client-side-only screenshots.** Screen-time screenshot images are
   processed CLIENT-SIDE ONLY (tesseract.js in the browser). There must never
   be an endpoint that receives image data, and neither images nor parsed app
   names are ever transmitted anywhere. The site publicly promises "read on
   your device, never uploaded" — code must always make that true.
2. **Anonymous results only.** The results API stores ONLY
   `{hours, region, timestamp}`. No IPs persisted, no identifiers, no cookies
   for this purpose. The site publicly promises anonymity. The only other
   data-receiving endpoint is `/api/scroll-telemetry`, which accepts
   enum-valued fields only (`layout`, `outcome`, and event names from the
   fixed `PARSE_FLAGS` list) and stores aggregate counters only — never
   extend it to carry image data, OCR text, or app names.
3. **Compliance copy is frozen.** Compliance and disclaimer copy — the
   DL Securities (Hong Kong) Limited / SFC line, the "marketing illustration,
   not financial advice/forecast/projection" line, and the privacy notes —
   may never be modified without explicit human approval.
4. **No financial claims.** No return promises, performance forecasts, or
   investment advice anywhere, in any language. Never rank identified users
   by trading performance.
5. **OCR output is untrusted.** OCR output never reaches the UI or the
   share-card PNG without passing validation. `sanitizeParsedResult`
   (`lib/scroll/ocrSanitizer.ts`) is the only path.
6. **Dependency discipline.** Heavy dependencies require approval.
   tesseract.js loads only via dynamic `import()` on user action — never in
   the initial bundle.
7. **Definition of done.** Before reporting any task done, all of the
   following must pass and their output must be shown:
   - `npm run build`
   - `npx tsc --noEmit`
   - `npm run test` (the test suite)

## Parser Product Decisions (from BUILD_SPEC.md)

- Scroll time is category-based when a screenshot exposes category tiles.
  Included categories: **Social, Video, Entertainment, Games** (plus localized
  zh/Thai equivalents).
- Messaging apps counted inside the platform's Social category are included
  by design — the parser counts the platform category, not messaging intent.
- Excluded from scroll-time sums: Productivity & Finance, Travel/Navigation,
  Creativity, Information & Reading, Utilities, and
  Communication-as-category.
- Scroll-time results currently compare against the published screen-time
  benchmark set (scroll-specific benchmarks are a TODO).

## Voice Rules (from VOICE.md)

Register: a trader deadpanning about your attention like it's a position on a
book — internet-native, dry, never try-hard. Slang lives inside the finance
metaphor or not at all.

- No slang in the compliance footer, disclaimers, privacy promises, or any
  string adjacent to the DL Securities / SFC line. Those stay formal; the
  contrast is intentional. (See Hard Rule 3.)
- No slang in error states that block the user.
- English internet slang is never literally translated into Chinese. Chinese
  strings get their own internet-native register and go through native
  review.
- No return promises, forecasts, or investment advice in personality strings.
  (See Hard Rule 4.)
- All personality strings live in config arrays with a `lastReviewed` date;
  refresh per campaign season, before launch, and whenever compliance or
  native-language review changes the register.

## Quick Facts

- Next.js 14 App Router, TypeScript, npm. Dev server: `npm run dev`
  (port 4182). Tests: `npm run test` (`tsx --test lib/scroll/*.test.ts`).
- Scroll calculator lives at `/scroll`
  (`components/scroll/ScrollCalculator.tsx` + `lib/scroll/*`).
- Results API: `POST /api/scroll-results`,
  `GET /api/scroll-results/summary` (in-memory store,
  `lib/scroll/resultsStore.ts`).
- The scroll calculator has four locales: EN / zh-Hant (繁) / zh-Hans (简) /
  th (ไทย). Localized strings marked `DRAFT — native review required` must
  not ship without native + compliance review; compliance strings (the
  f1/f2/f3 footer lines) need compliance approval per script/language.
- Locale defaults follow the confirmed rule: **language beats region** —
  region only picks the variant for an expressed language (or fills in for
  Thailand when no recognized preference exists); an en-HK/en-TH browser
  stays English. See BUILD_SPEC.md.
- The parser's label matching accepts BOTH Chinese scripts AND Thai
  regardless of UI locale — any-locale phone can upload any-language
  screenshot. Never fork the parser catalogs by locale.
- The share-card canvas font stack (`lib/scroll/cardFont.ts`) must keep
  explicitly Thai- and Han-capable families.
