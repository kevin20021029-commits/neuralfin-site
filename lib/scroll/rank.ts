import type { ScrollLocale } from "./campaign";

export type RankLang = ScrollLocale;

export function getRankFrame(percentile: number, regionName: string, lang: RankLang) {
  const p = Math.max(0, Math.min(100, Math.round(Number.isFinite(percentile) ? percentile : 50)));
  const inverse = Math.max(1, 100 - p);

  if (p < 50) {
    const light = {
      en: {
        title: `Lighter than ${100 - p}% of people 🌱`,
        subtitle: "nice — your feed doesn't own you",
      },
      // DRAFT — native review required
      "zh-Hant": {
        title: `比 ${100 - p}% 的人更輕倉 🌱`,
        subtitle: "不錯——feed 還沒收購你",
      },
      // DRAFT — native review required
      "zh-Hans": {
        title: `比 ${100 - p}% 的人更轻仓 🌱`,
        subtitle: "不错——feed 还没收购你",
      },
    } as const;
    return { ...light[lang], displayPercent: `P${p}` };
  }

  const top = {
    en: {
      title: `Top ${inverse}% scroller · ${regionName}`,
      subtitle: `you scroll more than ${p}% of people`,
    },
    // DRAFT — native review required
    "zh-Hant": {
      title: `${regionName}前 ${inverse}% 滑屏員`,
      subtitle: `你滑得比 ${p}% 的人多`,
    },
    // DRAFT — native review required
    "zh-Hans": {
      title: `${regionName}前 ${inverse}% 滑屏员`,
      subtitle: `你滑得比 ${p}% 的人多`,
    },
  } as const;
  return { ...top[lang], displayPercent: `P${p}` };
}
