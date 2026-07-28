# NeuralFin Voice

Last reviewed: 2026-07-28

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

## Pending native review

Before launch, the following zh strings require native + compliance review
(checklist moved here from internal notes previously shipped in the
ScrollCalculator string tables):

- 「照這個節奏」 (the "at your current pace" line)
- zh step strip (步驟提示)
- zh track names (課程名稱)
- archetype subtitles (卡片副標)
- tape notes
- scan stages (掃描狀態)
- share variants (分享文案)
- micro-takeaway / lesson-zero copy (第零課文案)

Strings marked `DRAFT — native review required` in
`components/scroll/ScrollCalculator.tsx` are part of the same pass.

### zh-Hans (Simplified)

The entire zh-Hans string set is machine-converted from zh-Hant with
vocabulary adjustments for mainland/SG usage, and every string is DRAFT —
native review required. Reviewers should specifically check:

- Vocabulary swaps made during conversion: 螢幕→屏幕, 影片→视频,
  設定→设置, 裝置→设备, 數位健康→数字健康, 即時→实时, 社群→社区,
  示範→演示, 儲存→存储, 時數→时长, 演算法→算法, 沽空→做空,
  未平虧損→浮亏, 里數→里程, 鐵達尼號→泰坦尼克号, 「」→“”
- De-Cantonesed phrasing: 你個名→你的名字, 小注怡情→小赌怡情,
  群組貼士→群里的荐股贴, 有在守紀律→守住纪律了, 組合：感覺派→组合：全凭感觉
- The full zh-Hans tables in `components/scroll/ScrollCalculator.tsx`,
  `lib/scroll/personality.ts`, `lib/scroll/education.ts`, and
  `lib/scroll/rank.ts`
- Compliance strings (f1/f2/f3) additionally need compliance approval per
  script — see the compliance rule in CLAUDE.md.

### th (Thai)

The entire th string set is drafted in a Thai-native internet register (not
literal translation of the EN slang) and every string is DRAFT — native
review required. Judgment calls for the reviewer:

- Trading-slang substitutions: "down bad" → ดอยแล้ว (bagholder slang),
  "open loss" → ขาดทุนลอยตัว, "most shorted" → ช็อตหนักสุด, "portfolio:
  vibes" → พอร์ต: ใช้ความรู้สึกล้วน ๆ
- "Touch grass" kept as the borrowed meme (ไปสัมผัสหญ้า), which circulates
  in Thai internet culture as-is
- Scrolling rendered as การไถฟีด/การไถ/นักเลื่อน — confirm register
- First person is เรา (gender-neutral internet register); no ผม/ดิฉัน.
  The card title uses ของฉัน — confirm or align with เรา
- "Top X%" kept in English inside Thai rank lines (internet-native mixing)
- Company name stays in English in f1 (no official Thai name); SFC rendered
  as สำนักงาน ก.ล.ต. ฮ่องกง (SFC) — needs compliance confirmation
- Milestone dates use th-TH formatting with Buddhist-era years
  (2027 CE → 2570) — confirm this is desired on the share card
- Thai spacing and ๆ usage throughout
- The full th tables live in `components/scroll/ScrollCalculator.tsx`,
  `lib/scroll/personality.ts`, `lib/scroll/education.ts`, and
  `lib/scroll/rank.ts`

## Maintenance

All personality strings live in config arrays with a `lastReviewed` date. Review and refresh them per campaign season, before launch, and whenever compliance or native-language review changes the register.
