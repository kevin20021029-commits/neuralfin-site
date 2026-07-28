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

## Maintenance

All personality strings live in config arrays with a `lastReviewed` date. Review and refresh them per campaign season, before launch, and whenever compliance or native-language review changes the register.
