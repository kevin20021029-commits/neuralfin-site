// Font stacks for the share-card canvas PNG. Canvas text has no CSS
// fallback UI beyond this list plus system last-resort fonts, so every
// script the card can render — Latin, Han (both scripts), and Thai — needs
// an explicitly capable family for deterministic glyphs across platforms:
// PingFang (macOS/iOS zh), JhengHei/YaHei + Leelawadee UI (Windows),
// Noto Sans TC/SC/Thai (Android/Linux), Thonburi (macOS/iOS th).
export const CARD_FONT_FAMILIES =
  'Inter, -apple-system, "PingFang TC", "PingFang SC", "Microsoft JhengHei", "Microsoft YaHei", "Noto Sans TC", "Noto Sans SC", "Noto Sans Thai", Thonburi, "Leelawadee UI", sans-serif';

export const CARD_MONO_FAMILIES = "Consolas, Menlo, monospace";
