# NeuralFin Voice

Last reviewed: 2026-07-30

## Register

A trader deadpanning about your attention like it is a position on a book: internet-native, dry, never try-hard. Slang lives inside the finance metaphor or not at all.

## Examples

On voice:
- "My most shorted stock is my attention span."
- "Scroll position: open loss."
- "The feed knows your name."

Off voice:
- "Your phone addiction is totally cooked fr fr."
- "Guaranteed gains if you stop scrolling."
- "DL Securities says your vibes are bearish."

## Hard Rules

- Slang never appears in the compliance footer, disclaimers, privacy promises, or any string adjacent to the DL Securities / SFC line. Those stay formal; the contrast is intentional.
- No slang in error states that block the user.
- English internet slang is never literally translated into Chinese. Chinese strings get their own internet-native register and go through native review.
- No return promises, forecasts, or investment advice in personality strings.

## Chinese script policy (decided 2026-07-30)

**zh-Hans is the reviewed source of truth for both Chinese scripts.**
zh-Hant is generated from it by character conversion only (OpenCC-style
`s2t`), and carries the marker `REVIEWED-BY-MIRROR (source: reviewed
zh-Hans)`.

- **Vocabulary is not re-chosen during conversion.** Only characters
  convert. The Hans set's word choices carry over as-is: 视频 → 視頻 (not
  影片), 设置 → 設置 (not 設定), 设备 → 設備 (not 裝置), 屏幕 → 屏幕
  (unchanged). Do not "improve" the Hant copy toward Taiwan-standard
  vocabulary — that is what `s2twp` would do, and it is out of policy.
- **Punctuation follows each script's convention.** Hans uses `“”`; Hant
  uses `「」`. This is the one thing conversion changes beyond characters.
- **The previous Cantonese-register zh-Hant copy is superseded and
  removed.** Both scripts now share vocabulary. The register judgments that
  used to live here — 你個名, 小注怡情, 群組貼士, 有在守紀律,
  組合：感覺派, 演算法 vs 算法 — no longer apply and have been deleted
  rather than migrated.
- **Compliance strings need their own sign-off, separate from the mirror.**
  Character conversion is not compliance approval. The converted zh-Hant
  f1/f2/f3 were signed off on 2026-07-31 and are now frozen again under
  CLAUDE.md Hard Rule 3 — any future edit, including a re-run of the
  conversion, needs a fresh approval.

When zh-Hans changes, regenerate zh-Hant from it in the same change — never
edit the Hant strings independently, or the two scripts drift.

### zh-Hans (Simplified) — REVIEWED

Native review complete (reviewer: internal team, 2026-07-30). The full
zh-Hans tables live in `components/scroll/ScrollCalculator.tsx`,
`lib/scroll/personality.ts`, `lib/scroll/education.ts`, and
`lib/scroll/rank.ts`.

Open item carried out of that review: compliance strings (f1/f2/f3) still
need compliance approval per script — native review does not cover them.

### th (Thai)

REVIEWED (2026-07-30). The th set is written in a Thai-native internet
register, not a literal translation of the EN slang. The judgment calls
below were made during that pass and are recorded so a future reviewer can
challenge them rather than rediscover them:

- Trading-slang substitutions: "down bad" → ดอยแล้ว (bagholder slang),
  "open loss" → ขาดทุนลอยตัว, "most shorted" → ช็อตหนักสุด, "portfolio:
  vibes" → พอร์ต: ใช้ความรู้สึกล้วน ๆ
- "Touch grass" kept as the borrowed meme (ไปสัมผัสหญ้า), which circulates
  in Thai internet culture as-is
- Scrolling rendered as การไถฟีด/การไถ/นักเลื่อน — confirm register
- First person: DECIDED — เรา everywhere, including the
  card title (P&L การไถของเรา) and challenge line. Gender-neutral
  consistency beats formality; reviewer may overrule.
- Years: DECIDED — Gregorian (2026), not Buddhist era
  (2569), on the card and milestone dates. Rationale: the share card mixes
  with an English URL/hashtag, CE years are conventional in Thai fintech,
  and Buddhist-era years would break shared-card comparability across
  markets. Thai month names are kept (กันยายน 2026). Reviewer may
  challenge.
- Company name stays in English in f1 (no official Thai name); SFC rendered
  as สำนักงาน ก.ล.ต. ฮ่องกง (SFC). f1/f2/f3 were signed off on 2026-07-31
  and are frozen again under CLAUDE.md Hard Rule 3 — native review does not
  cover compliance copy, and any future edit needs a fresh approval.
- Thai spacing and ๆ usage throughout
- The full th tables live in `components/scroll/ScrollCalculator.tsx`,
  `lib/scroll/personality.ts`, `lib/scroll/education.ts`, and
  `lib/scroll/rank.ts`

## Maintenance

All personality strings live in config arrays with a `lastReviewed` date. Review and refresh them per campaign season, before launch, and whenever compliance or native-language review changes the register.
