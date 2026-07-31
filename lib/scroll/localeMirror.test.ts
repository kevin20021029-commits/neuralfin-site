import assert from "node:assert/strict";
import test from "node:test";
import { str } from "@/components/scroll/ScrollCalculator";
import { FLIP_MINUTES_PER_DAY } from "./education";
import { parseScreenTimeText } from "./ocrSanitizer";
import { getRankFrame } from "./rank";
import { getArchetypeCopy, getTapeNote } from "./personality";
import { getEducationOutput } from "./education";

const LOCALES = ["en", "zh-Hant", "zh-Hans", "th"] as const;
const CHINESE = ["zh-Hant", "zh-Hans"] as const;

// Probes are deliberately unlikely to occur naturally, so a missing slot
// shows up as an absent probe rather than a coincidental match.
const HOURS = "@@H@@";
const TOTAL = "@@T@@";
const SCROLL = "@@S@@";
const DUR = "@@D@@";
const DATE = "@@DT@@";
const TRACK = "@@TR@@";
const PHRASE = "@@P@@";

test("every interpolation slot survives in all four locales", () => {
  for (const locale of LOCALES) {
    const t = str[locale];
    const where = (key: string) => `${locale}.${key}`;

    const yield_ = t.lessonYield(HOURS, 42, PHRASE, TRACK);
    for (const probe of [HOURS, "42", PHRASE, TRACK]) {
      assert.ok(yield_.includes(probe), `${where("lessonYield")} lost ${probe}: ${yield_}`);
    }

    assert.ok(t.milestone(DATE).join(" ").includes(DATE), `${where("milestone")} lost the date`);
    assert.ok(t.dropRead(DUR).includes(DUR), where("dropRead"));
    assert.ok(t.dropDay(DUR).includes(DUR), where("dropDay"));
    assert.ok(t.dropReadScroll(SCROLL).includes(SCROLL), where("dropReadScroll"));
    assert.ok(t.cardtitle(2026).includes("2026"), where("cardtitle"));
    assert.ok(t.youAt(HOURS).includes(HOURS), where("youAt"));

    for (const key of ["dropReadScrollDay", "dropReadScrollWeek", "scrollChip"] as const) {
      const rendered = t[key](SCROLL, TOTAL);
      assert.ok(rendered.includes(SCROLL), `${where(key)} lost the scroll slot: ${rendered}`);
      assert.ok(rendered.includes(TOTAL), `${where(key)} lost the total slot: ${rendered}`);
    }

    // The slider figure is substituted by string replace, not a template.
    assert.ok(t.dropDone.includes("{hours}"), `${where("dropDone")} lost the {hours} token`);
    assert.ok(t.cardflip.includes(String(FLIP_MINUTES_PER_DAY)), where("cardflip"));

    for (const yearly of [400, 900, 5000]) {
      const fun = t.fun(yearly);
      assert.match(fun.num, /×\d/, `${where("fun")} lost its multiplier at ${yearly}`);
      assert.ok(fun.title.length > 0 && fun.sub.length > 0, where("fun"));
    }

    const rank = getRankFrame(63, "@@R@@", locale);
    assert.ok(rank.title.includes("63"), `${where("rank")} lost the percentile`);
    assert.ok(rank.title.includes("@@R@@"), `${where("rank")} lost the region name`);
  }
});

// zh-Hant is a character-conversion mirror of the reviewed zh-Hans set, so
// the two tables must stay structurally identical — same keys, same shapes.
// Any drift means someone edited one script independently.
test("zh-Hant and zh-Hans stay structurally identical", () => {
  const [hant, hans] = [str["zh-Hant"], str["zh-Hans"]] as const;
  assert.deepEqual(Object.keys(hant).sort(), Object.keys(hans).sort());

  for (const key of Object.keys(hant) as Array<keyof typeof hant>) {
    assert.equal(typeof hant[key], typeof hans[key], `${key}: type drift between scripts`);
  }

  assert.equal(hant.ladder.length, hans.ladder.length);
  hant.ladder.forEach((rung, index) => {
    assert.equal(rung.length, hans.ladder[index].length, `ladder[${index}]: arity drift`);
  });
  assert.equal(hant.milestone(DATE).length, hans.milestone(DATE).length);
  assert.equal(hant.axis.length, hans.axis.length);
  assert.equal(hant.steps.length, hans.steps.length);
});

// Punctuation is the one thing conversion changes beyond characters.
test("each Chinese script uses its own quote convention", () => {
  assert.ok(str["zh-Hans"].standsub.includes("“"), "zh-Hans should use “” quotes");
  assert.ok(!str["zh-Hans"].standsub.includes("「"), "zh-Hans must not use 「」");
  assert.ok(str["zh-Hant"].standsub.includes("「"), "zh-Hant should use 「」 quotes");
  assert.ok(!str["zh-Hant"].standsub.includes("“"), "zh-Hant must not use “”");
});

test("no Simplified-only characters leak into zh-Hant", () => {
  // A spot set drawn from this conversion: 时长与市场统计, 视频, 游戏, 号.
  const simplifiedOnly = /[时长与场统计视频游戏号无图检验证书济产际]/;
  const samples = [
    str["zh-Hant"].sliderSub,
    str["zh-Hant"].standnote,
    str["zh-Hant"].tapenote,
    str["zh-Hant"].saveFailed,
    str["zh-Hant"].shareOptIn,
    str["zh-Hant"].fun(900).title,
  ];
  for (const sample of samples) {
    assert.doesNotMatch(sample, simplifiedOnly, `Simplified character survived into zh-Hant: ${sample}`);
  }
});

// CLAUDE.md: the parser's label catalogs are independent of UI locale — an
// any-locale phone must read an any-language screenshot. This change touched
// UI strings only, so both scripts must still parse regardless.
test("parser accepts both Chinese scripts regardless of UI locale", () => {
  const hant = ["螢幕使用時間", "社交 2 小時 41 分鐘", "遊戲 58 分鐘"].join("\n");
  const hans = ["屏幕使用时间", "社交 2 小时 41 分钟", "游戏 58 分钟"].join("\n");

  for (const [label, text] of [["zh-Hant", hant], ["zh-Hans", hans]] as const) {
    const parsed = parseScreenTimeText(text, 90);
    assert.ok(parsed.sawCategories, `${label}: category rows not recognized`);
    assert.equal(Math.round((parsed.scrollHours ?? 0) * 60), 219, `${label}: 2h41m + 58m`);
  }
});

// The Thai reviewer's rows arrived with several literal values where the
// code carries slots (a hardcoded "42", a frozen "2026", a fixed
// "กรกฎาคม 2027"). These lock the slots in so a future copy paste cannot
// silently freeze a computed figure.
test("Thai keeps computed figures on slots, not literals", () => {
  const t = str.th;
  const yielded = t.lessonYield("7.0", 84, "ภายใน 20 วัน", "พื้นฐานการลงทุน");
  assert.ok(yielded.includes("84"), `lessonYield froze the lesson count: ${yielded}`);
  assert.ok(!yielded.includes("42"), `lessonYield still carries the reviewer's literal 42: ${yielded}`);

  assert.ok(t.cardtitle(2031).includes("2031"), "cardtitle froze the year");
  assert.ok(!t.cardtitle(2031).includes("2026"), "cardtitle still carries a literal 2026");

  assert.ok(t.cardflip.includes(String(FLIP_MINUTES_PER_DAY)), "cardflip froze the flip minutes");

  const edu = getEducationOutput(3.5, "th", new Date("2026-07-28T12:00:00Z"));
  assert.ok(!edu.cardLine.includes("2027"), `cardLine froze the milestone year: ${edu.cardLine}`);
  assert.ok(edu.cardLine.includes(edu.milestoneLabel), "cardLine must use the derived milestone");
  assert.ok(!edu.cardLine.includes("42"), `cardLine still carries the reviewer's literal 42: ${edu.cardLine}`);
});

// The reviewer replaced เลื่อน/นักเลื่อน with ไถ/นักไถ everywhere, and
// replaced ดอยแล้ว with จมดิ่ง. Guard against reinstatement.
test("Thai uses the reviewed vocabulary consistently", () => {
  const surfaces = [
    str.th.sliderSub, str.th.scrollpos, str.th.mostShorted, str.th.openloss,
    getRankFrame(63, "ไทย", "th").title,
    getArchetypeCopy(4, "th").title,
    getArchetypeCopy(1, "th").title,
    getTapeNote("th", false, 3),
  ];
  for (const s of surfaces) {
    assert.ok(!s.includes("เลื่อน"), `superseded เลื่อน survives in: ${s}`);
    assert.ok(!s.includes("ดอยแล้ว"), `superseded ดอยแล้ว survives in: ${s}`);
    assert.ok(!s.includes("ช็อตหนักสุด"), `superseded ช็อตหนักสุด survives in: ${s}`);
  }
  assert.equal(getTapeNote("th", false, 3), "จมดิ่ง");
  assert.equal(getArchetypeCopy(1, "th").title, "มีวินัย");
});
