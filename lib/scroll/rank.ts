export type RankLang = "en" | "zh";

export function getRankFrame(percentile: number, regionName: string, lang: RankLang) {
  const p = Math.max(0, Math.min(100, Math.round(Number.isFinite(percentile) ? percentile : 50)));
  const inverse = Math.max(1, 100 - p);

  if (p < 50) {
    return lang === "zh"
      // DRAFT — native review required
      ? {
          title: `比 ${100 - p}% 的人更輕倉 🌱`,
          subtitle: "不錯——feed 還沒收購你",
          displayPercent: `P${p}`,
        }
      : {
          title: `Lighter than ${100 - p}% of people 🌱`,
          subtitle: "nice — your feed doesn't own you",
          displayPercent: `P${p}`,
        };
  }

  return lang === "zh"
    ? {
        title: `${regionName}前 ${inverse}% 滑屏員`,
        subtitle: `你滑得比 ${p}% 的人多`,
        displayPercent: `P${p}`,
      }
    : {
        title: `Top ${inverse}% scroller · ${regionName}`,
        subtitle: `you scroll more than ${p}% of people`,
        displayPercent: `P${p}`,
      };
}
