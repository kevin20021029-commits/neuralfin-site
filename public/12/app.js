/* ==========================================================================
   NeuralFin · 2027 campaign H5
   --------------------------------------------------------------------------
   链接配置：上线前只需改这里。
   bazi 留空 = 显示「即将上线」，点击弹出提示；填上链接后自动变为可点击。
   ========================================================================== */

const CONFIG = {
  home: "https://neuralfin.ai",
  nbti: "https://nbti.neuralfin.ai",
  arti: "https://neuralfin.ai/arti",
  bazi: "https://nbti.neuralfin.ai/bazi",
  upgradeAt: "2026-12-07T00:00:00+08:00",
};

const LANG_KEY = "nf-campaign-lang";

/* ==========================================================================
   Copy
   ========================================================================== */

const I18N = {
  "zh-Hans": {
    title: "NeuralFin · 懂自己，才敢投｜2027 投资前瞻",
    desc: "2027 财运开局：ARTi 智能投研、NBTI 投资人格测试、五行财格，以及 12.07 交易系统升级。",
    locale: "zh_CN",
    s: {
      "nav.download": "下载 App",

      "hero.eyebrow": "NeuralFin · 2027 投资前瞻",
      "hero.l1": "懂自己，",
      "hero.l2": "才敢投。",
      "hero.sub": "2027 财运开局。",
      "hero.cta1": "2027 财运开局",
      "hero.cta2": "了解详情",
      "hero.scroll": "往下看看",

      "up.kicker": "系统升级",
      "up.l1": "12 月 7 日，",
      "up.l2": "交易系统换新。",
      "up.body": "行情、下单、研报、社区，收进同一个 App。快的不只是成交速度，是你按下买入前那几秒。",
      "up.cdlabel": "距离升级",
      "up.cddone": "已完成升级",
      "cd.days": "天",
      "cd.hours": "时",
      "cd.mins": "分",
      "cd.secs": "秒",
      "up.f1t": "即时行情交易",
      "up.f1d": "美股、港股、加密资产，一个界面看全。",
      "up.f2t": "AI 投资研报",
      "up.f2d": "多维分析，机构级洞察，前提和失效条件一起讲清楚。",
      "up.f3t": "投资社区交流",
      "up.f3d": "分享观点，讨论策略，和认真看盘的人待在一起。",
      "up.quote": "不止交易，更懂投资判断。",
      "up.alt": "NeuralFin 升级后的交易界面",

      "arti.kicker": "AI 智能投研",
      "arti.shotAlt": "ARTi 智能投研对话界面",
      "arti.l1": "以 ARTi 为引擎，",
      "arti.l2": "重新定义投研。",
      "arti.body": "NeuralFin 推出 AI 智能投研平台。九个分析师各自出结论，再交叉验证——分歧不藏，错的那次也留着。",
      "arti.p1t": "九个分析师，不是一个",
      "arti.p1d": "宏观、基本面、技术面、风险各自独立判断，再交叉验证。",
      "arti.p2t": "每条判断都带前提",
      "arti.p2d": "依赖哪条逻辑、什么情况下会失效，全部写在报告里。",
      "arti.p3t": "判断会被验证",
      "arti.p3d": "前提被证伪时，系统会标记出来，包括它自己错的那次。",
      "arti.cta": "问 ARTi",
      "arti.mock.live": "在线",
      "arti.mock.title": "和 NeuralFin 聊一只股票",
      "arti.mock.sub": "ARTi 研究引擎现场出报告。行情、估值、事件，一次说清。",
      "arti.mock.q1": "9988.HK 现在有哪些风险",
      "arti.mock.q2": "帮我体检 AAPL",
      "arti.mock.q3": "NVDA 的估值贵不贵",
      "arti.mock.q4": "0700.HK 值不值得拿",
      "arti.mock.ph": "问一只股票，例如 AAPL 现在贵不贵",
      "arti.mock.note": "教育性信息整理，不构成投资建议。",

      "play.kicker": "趣玩投资",
      "play.l1": "命里有时终须有，",
      "play.l2": "命里无时问 NeuralFin。",
      "play.l3": "问 NeuralFin。",
      "play.body": "两个小测试，不能保证你赚钱。但至少能让你知道，自己是哪一种人。",
      "play.nbti.label": "人格测试",
      "play.nbti.alt": "金融 NBTI 投资人格测试插画",
      "play.nbti.title": "NBTI 投资人格测试",
      "play.nbti.desc": "16 种投资人格，测你在贪婪与恐惧之间的真实坐标。",
      "play.nbti.badge": "16 题 · 5 分钟",
      "play.nbti.cta": "开始测试",
      "play.bazi.label": "五行财格",
      "play.bazi.title": "测你的财富人格",
      "play.bazi.desc": "输入生辰排出十二宫：财帛、风险偏好、未来十年。51.8 万种生辰，归为五十种财格；只在你的手机上推算，不上传、不留存。",
      "play.bazi.badge": "即将上线",
      "play.bazi.badgeLive": "在线测算",
      "play.bazi.cta": "看看我的财格",
      "play.toast": "五行财格即将上线，敬请期待。",

      "year.kicker": "终点 · 2027",
      "year.l1": "2027 怎么投？",
      "year.l2": "先测再说。",
      "year.body": "答案不在别人的预测里，在你的风险偏好、持有耐心和现金流里。三个入口，任选一个开始。",
      "year.dl": "下载 App",
      "year.arti": "问 ARTi",
      "year.nbti": "测试你的投资人格",
      "year.bazi": "看看我的财格",

      "sticky.text": "2027 怎么投？先测再说。",
      "sticky.btn": "去测一测",

      "foot.tagline": "AI 投研 · 交易 · 社区",
      "foot.site": "官网 neuralfin.ai",
      "foot.arti": "ARTi 平台",
      "foot.disc": "本页面内容为教育性信息整理与风险提示，不构成任何证券、虚拟资产或其他投资产品的要约、招揽或投资建议。市场有风险，投资需谨慎。交易服务由香港证监会持牌机构德林证券提供；虚拟资产服务仅限专业投资者。",
      "foot.rights": "© 2026 NeuralFin. 保留所有权利。",
    },
  },

  "zh-Hant": {
    title: "NeuralFin · 懂自己，才敢投｜2027 投資前瞻",
    desc: "2027 財運開局：ARTi 智能投研、NBTI 投資人格測試、五行財格，以及 12.07 交易系統升級。",
    locale: "zh_HK",
    s: {
      "nav.download": "下載 App",

      "hero.eyebrow": "NeuralFin · 2027 投資前瞻",
      "hero.l1": "懂自己，",
      "hero.l2": "才敢投。",
      "hero.sub": "2027 財運開局。",
      "hero.cta1": "2027 財運開局",
      "hero.cta2": "了解詳情",
      "hero.scroll": "往下看看",

      "up.kicker": "系統升級",
      "up.l1": "12 月 7 日，",
      "up.l2": "交易系統換新。",
      "up.body": "行情、下單、研報、社群，收進同一個 App。快嘅唔止係成交速度，仲係你落單前嗰幾秒。",
      "up.cdlabel": "距離升級",
      "up.cddone": "已完成升級",
      "cd.days": "天",
      "cd.hours": "時",
      "cd.mins": "分",
      "cd.secs": "秒",
      "up.f1t": "即時行情交易",
      "up.f1d": "美股、港股、加密資產，一個介面睇齊。",
      "up.f2t": "AI 投資研報",
      "up.f2d": "多維分析，機構級洞察，前提同失效條件一次講清楚。",
      "up.f3t": "投資社群交流",
      "up.f3d": "分享觀點，討論策略，同認真睇盤嘅人一齊。",
      "up.quote": "唔止交易，更懂投資判斷。",
      "up.alt": "NeuralFin 升級後的交易介面",

      "arti.kicker": "AI 智能投研",
      "arti.shotAlt": "ARTi 智能投研對話介面",
      "arti.l1": "以 ARTi 為引擎，",
      "arti.l2": "重新定義投研。",
      "arti.body": "NeuralFin 推出 AI 智能投研平台。九個分析師各自出結論，再交叉驗證——分歧唔會收埋，錯嗰次都會留低。",
      "arti.p1t": "九個分析師，唔係一個",
      "arti.p1d": "宏觀、基本面、技術面、風險各自獨立判斷，再交叉驗證。",
      "arti.p2t": "每個判斷都帶前提",
      "arti.p2d": "依賴邊條邏輯、咩情況下會失效，全部寫入報告。",
      "arti.p3t": "判斷會被驗證",
      "arti.p3d": "前提被推翻時，系統會標記出嚟，包括佢自己錯嗰次。",
      "arti.cta": "問 ARTi",
      "arti.mock.live": "在線",
      "arti.mock.title": "和 NeuralFin 聊一隻股票",
      "arti.mock.sub": "ARTi 研究引擎現場出報告。行情、估值、事件，一次說清。",
      "arti.mock.q1": "9988.HK 現在有哪些風險",
      "arti.mock.q2": "幫我體檢 AAPL",
      "arti.mock.q3": "NVDA 的估值貴不貴",
      "arti.mock.q4": "0700.HK 值不值得拿",
      "arti.mock.ph": "問一隻股票，例如 AAPL 現在貴不貴",
      "arti.mock.note": "教育性資訊整理，不構成投資建議。",

      "play.kicker": "趣玩投資",
      "play.l1": "命裡有時終須有，",
      "play.l2": "命裡無時問 NeuralFin。",
      "play.l3": "問 NeuralFin。",
      "play.body": "兩個小測試，唔保證你賺錢。但至少讓你知，自己係邊種人。",
      "play.nbti.label": "人格測試",
      "play.nbti.alt": "金融 NBTI 投資人格測試插畫",
      "play.nbti.title": "NBTI 投資人格測試",
      "play.nbti.desc": "16 種投資人格，測你在貪婪與恐懼之間的真實座標。",
      "play.nbti.badge": "16 題 · 5 分鐘",
      "play.nbti.cta": "開始測試",
      "play.bazi.label": "五行財格",
      "play.bazi.title": "測你的財富人格",
      "play.bazi.desc": "輸入生辰排出十二宮：財帛、風險偏好、未來十年。51.8 萬種生辰，歸為五十種財格；只喺你部手機度推算，唔上傳、唔保留。",
      "play.bazi.badge": "即將上線",
      "play.bazi.badgeLive": "線上測算",
      "play.bazi.cta": "睇睇我嘅財格",
      "play.toast": "五行財格即將上線，敬請期待。",

      "year.kicker": "終點 · 2027",
      "year.l1": "2027 怎麼投？",
      "year.l2": "先測再說。",
      "year.body": "答案不在別人的預測裡，而在你自己的風險偏好、持倉耐性同現金流裡。三個入口，揀一個開始。",
      "year.dl": "下載 App",
      "year.arti": "問 ARTi",
      "year.nbti": "測試你的投資人格",
      "year.bazi": "睇睇我嘅財格",

      "sticky.text": "2027 怎麼投？先測再說。",
      "sticky.btn": "去測一測",

      "foot.tagline": "AI 投研 · 交易 · 社群",
      "foot.site": "官網 neuralfin.ai",
      "foot.arti": "ARTi 平台",
      "foot.disc": "本頁面內容為教育性資訊整理與風險提示，不構成任何證券、虛擬資產或其他投資產品的要約、招攬或投資建議。市場有風險，投資需謹慎。交易服務由香港證監會持牌機構德林證券提供；虛擬資產服務僅限專業投資者。",
      "foot.rights": "© 2026 NeuralFin. 保留所有權利。",
    },
  },

  en: {
    title: "NeuralFin · Know yourself. Then invest. | 2027 Outlook",
    desc: "2027, your wealth opening move: ARTi research, the NBTI investor test, a five-element wealth chart, and the 12.07 trading upgrade.",
    locale: "en_US",
    s: {
      "nav.download": "Get the app",

      "hero.eyebrow": "NeuralFin · 2027 Outlook",
      "hero.l1": "Know yourself.",
      "hero.l2": "Then invest.",
      "hero.sub": "2027: your wealth opening move.",
      "hero.cta1": "2027 wealth opening",
      "hero.cta2": "Learn more",
      "hero.scroll": "Scroll",

      "up.kicker": "System upgrade",
      "up.l1": "On December 7,",
      "up.l2": "trading, rebuilt.",
      "up.body": "Quotes, orders, research and community in one app. What gets faster isn't just execution — it's the few seconds before you decide.",
      "up.cdlabel": "Upgrades in",
      "up.cddone": "Upgrade complete",
      "cd.days": "Days",
      "cd.hours": "Hrs",
      "cd.mins": "Min",
      "cd.secs": "Sec",
      "up.f1t": "Live quotes & trading",
      "up.f1d": "US, Hong Kong and crypto markets in one screen.",
      "up.f2t": "AI research",
      "up.f2d": "Multi-factor analysis with institutional depth — premises and failure conditions included.",
      "up.f3t": "Investor community",
      "up.f3d": "Share a view, stress-test a strategy, watch the tape with people who mean it.",
      "up.quote": "More than trading. Sharper judgement.",
      "up.alt": "The upgraded NeuralFin trading interface",

      "arti.kicker": "AI research platform",
      "arti.shotAlt": "The ARTi research chat interface",
      "arti.l1": "Powered by ARTi,",
      "arti.l2": "research, rebuilt.",
      "arti.body": "NeuralFin's AI research platform runs on ARTi. Nine analysts reach conclusions independently, then cross-check. Disagreement stays visible; so does the call that was wrong.",
      "arti.p1t": "Nine analysts, not one",
      "arti.p1d": "Macro, fundamentals, technicals and risk argue separately, then cross-check.",
      "arti.p2t": "Every call states its premises",
      "arti.p2d": "Which logic it rests on, and what would make it fail — written into the report.",
      "arti.p3t": "Calls are checked later",
      "arti.p3d": "When a premise breaks, the system flags it. Including its own misses.",
      "arti.cta": "Ask ARTi",
      "arti.mock.live": "Live",
      "arti.mock.title": "Chat with NeuralFin about a stock",
      "arti.mock.sub": "ARTi writes the research live — price, valuation, events, in one pass.",
      "arti.mock.q1": "9988.HK — key risks?",
      "arti.mock.q2": "Check up on AAPL",
      "arti.mock.q3": "Is NVDA expensive?",
      "arti.mock.q4": "Is 0700.HK a hold?",
      "arti.mock.ph": "Ask about a stock — e.g. AAPL",
      "arti.mock.note": "Educational information, not investment advice.",

      "play.kicker": "Play the market",
      "play.l1": "What's meant to be, will be.",
      "play.l2": "What isn't — ask NeuralFin.",
      "play.l3": "ask NeuralFin.",
      "play.body": "Two small tests. They won't make you money. They will tell you who you are.",
      "play.nbti.label": "Personality test",
      "play.nbti.alt": "NBTI investor personality test artwork",
      "play.nbti.title": "The NBTI investor type",
      "play.nbti.desc": "Sixteen investor personalities. Your true position between greed and fear.",
      "play.nbti.badge": "16 Q · 5 MIN",
      "play.nbti.cta": "Take the test",
      "play.bazi.label": "Wealth in Five Elements",
      "play.bazi.title": "Read your wealth personality",
      "play.bazi.desc": "A twelve-palace reading: wealth palace, risk appetite, the next ten years. 518,400 charts, 50 types — calculated on your phone, never uploaded.",
      "play.bazi.badge": "COMING SOON",
      "play.bazi.badgeLive": "ONLINE",
      "play.bazi.cta": "See my wealth type",
      "play.toast": "The wealth chart is coming soon.",

      "year.kicker": "DESTINATION · 2027",
      "year.l1": "How do you invest in 2027?",
      "year.l2": "Test first.",
      "year.body": "The answer isn't in a forecast. It's in your risk appetite, your patience and your cash flow. Three doors — pick one.",
      "year.dl": "Get the app",
      "year.arti": "Ask ARTi",
      "year.nbti": "Test your investor type",
      "year.bazi": "See my wealth type",

      "sticky.text": "How will you invest in 2027?",
      "sticky.btn": "Start",

      "foot.tagline": "AI research · Trading · Community",
      "foot.site": "neuralfin.ai",
      "foot.arti": "ARTi platform",
      "foot.disc": "This page is educational information and risk disclosure only. It is not an offer, solicitation or investment advice for any security, virtual asset or other investment product. Markets carry risk; invest with care. Trading services are provided by DL Securities, a licensed corporation regulated by the SFC. Virtual asset services are for professional investors only.",
      "foot.rights": "© 2026 NeuralFin. All rights reserved.",
    },
  },
};

/* ==========================================================================
   Language
   ========================================================================== */

const root = document.documentElement;
const body = document.body;
let currentLang = "zh-Hans";
let countdownDone = false;

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && I18N[saved]) return saved;
  } catch (e) {}
  const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
  const first = String(list[0] || "").toLowerCase();
  if (first.indexOf("zh") === 0) return /hant|hk|tw|mo/.test(first) ? "zh-Hant" : "zh-Hans";
  if (first.indexOf("en") === 0) return "en";
  return "zh-Hans";
}

function t(key) {
  const dict = I18N[currentLang] || I18N["zh-Hans"];
  return dict.s[key] != null ? dict.s[key] : I18N["zh-Hans"].s[key] || "";
}

function replayHero() {
  body.classList.remove("is-ready");
  void body.offsetWidth;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      body.classList.add("is-ready");
    });
  });
}

function applyLang(lang, animate) {
  if (!I18N[lang]) lang = "zh-Hans";
  currentLang = lang;
  const dict = I18N[lang];

  root.lang = lang;
  root.setAttribute("data-lang", lang);
  document.title = dict.title;

  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", dict.desc);
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.setAttribute("content", dict.locale);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", dict.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", dict.desc);

  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    const v = dict.s[el.getAttribute("data-i18n")];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
    const v = dict.s[el.getAttribute("data-i18n-alt")];
    if (v != null) el.setAttribute("alt", v);
  });

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    const on = btn.getAttribute("data-lang") === lang;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });

  const cdEl = document.getElementById("countdown");
  if (cdEl) cdEl.setAttribute("aria-label", dict.s["up.cdlabel"] + " 2026.12.07");

  if (countdownDone) {
    const label = document.getElementById("cdLabel");
    if (label) label.textContent = dict.s["up.cddone"];
  }

  syncLinks();
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {}

  if (animate !== false) replayHero();
}

/* ==========================================================================
   Links + pending state
   ========================================================================== */

function setHref(id, url) {
  const el = document.getElementById(id);
  if (el && url) el.setAttribute("href", url);
}

function syncLinks() {
  setHref("navDownload", CONFIG.home);
  setHref("yearDownload", CONFIG.home);
  setHref("artiLink", CONFIG.arti);
  setHref("nbtiLink", CONFIG.nbti);
  setHref("yearNbti", CONFIG.nbti);
  setHref("yearArti", CONFIG.arti);

  const baziLinks = [document.getElementById("baziLink"), document.getElementById("yearBazi")];
  const badge = document.querySelector(".card-bazi .badge");

  baziLinks.forEach(function (a) {
    if (!a) return;
    if (CONFIG.bazi) {
      a.setAttribute("href", CONFIG.bazi);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
      a.removeAttribute("aria-disabled");
      a.classList.remove("is-soon");
    } else {
      a.setAttribute("href", "#play");
      a.removeAttribute("target");
      a.removeAttribute("rel");
      a.setAttribute("aria-disabled", "true");
      a.classList.add("is-soon");
    }
  });

  const yb = document.getElementById("yearBazi");
  if (yb) yb.textContent = t("year.bazi");

  if (badge) {
    if (CONFIG.bazi) {
      badge.textContent = t("play.bazi.badgeLive");
      badge.classList.remove("badge-soon");
    } else {
      badge.textContent = t("play.bazi.badge");
      badge.classList.add("badge-soon");
    }
  }
}

/* ==========================================================================
   Countdown
   ========================================================================== */

const target = new Date(CONFIG.upgradeAt).getTime();

function pad(n) {
  return n < 10 ? "0" + n : String(n);
}

function tickCountdown() {
  const cd = document.getElementById("countdown");
  if (!cd) return;
  const diff = target - Date.now();

  if (diff <= 0) {
    ["d", "h", "m", "s"].forEach(function (k) {
      const el = cd.querySelector('[data-cd="' + k + '"]');
      if (el) el.textContent = "00";
    });
    if (!countdownDone) {
      countdownDone = true;
      const label = document.getElementById("cdLabel");
      if (label) label.textContent = t("up.cddone");
    }
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const vals = { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
  Object.keys(vals).forEach(function (k) {
    const el = cd.querySelector('[data-cd="' + k + '"]');
    if (el && el.textContent !== vals[k]) el.textContent = vals[k];
  });
}

/* ==========================================================================
   Decoration: dial ticks + dust
   ========================================================================== */

function buildDial() {
  const g = document.getElementById("dialTicks");
  if (!g) return;
  const NS = "http://www.w3.org/2000/svg";
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", "320");
    line.setAttribute("x2", "320");
    line.setAttribute("y1", "34");
    line.setAttribute("y2", major ? "50" : "42");
    line.setAttribute("transform", "rotate(" + i * 6 + " 320 320)");
    if (major) line.setAttribute("class", "major");
    g.appendChild(line);
  }
}

function buildDust() {
  const host = document.getElementById("dust");
  if (!host) return;
  const count = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : window.innerWidth < 720 ? 16 : 28;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("i");
    const size = (1 + Math.random() * 1.8).toFixed(1);
    dot.style.left = (3 + Math.random() * 94).toFixed(2) + "%";
    dot.style.width = size + "px";
    dot.style.height = size + "px";
    dot.style.animationDuration = (17 + Math.random() * 20).toFixed(1) + "s";
    dot.style.animationDelay = (-Math.random() * 30).toFixed(1) + "s";
    dot.style.setProperty("--dx", ((Math.random() - 0.5) * 70).toFixed(0) + "px");
    dot.style.setProperty("--o", (0.18 + Math.random() * 0.5).toFixed(2));
    host.appendChild(dot);
  }
}

/* ==========================================================================
   Scroll: reveal, progress, parallax, sticky CTA
   ========================================================================== */

function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -9% 0px", threshold: 0.08 }
  );
  items.forEach(function (el) { io.observe(el); });
}

const nav = document.getElementById("nav");
const progressBar = document.getElementById("progressBar");
const stickyCta = document.getElementById("stickyCta");
const frameImg = document.getElementById("upgradeImg");
const yearGhost = document.getElementById("yearGhost");
const footer = document.querySelector(".footer");
const hero = document.getElementById("top");
const playSection = document.getElementById("play");
const yearSection = document.getElementById("year");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let ticking = false;

function updateScroll() {
  ticking = false;
  const y = window.scrollY || window.pageYOffset;
  const vh = window.innerHeight;

  if (nav) nav.classList.toggle("scrolled", y > 18);

  if (progressBar) {
    const max = document.documentElement.scrollHeight - vh;
    progressBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
  }

  if (!reduceMotion.matches) {
    if (frameImg) {
      const r = frameImg.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const center = r.top + r.height / 2;
        const offset = Math.max(-16, Math.min(16, (vh / 2 - center) * 0.055));
        frameImg.style.setProperty("--py", offset.toFixed(1) + "px");
      }
    }
    if (yearGhost) {
      const r = yearGhost.parentElement.getBoundingClientRect();
      if (r.bottom > -200 && r.top < vh + 200) {
        const center = r.top + r.height / 2;
        const offset = Math.max(-46, Math.min(46, (vh / 2 - center) * 0.1));
        yearGhost.style.setProperty("--gy", offset.toFixed(1) + "px");
      }
    }
  }

  if (stickyCta && window.matchMedia("(max-width: 720px)").matches) {
    const pastHero = y > (hero ? hero.offsetHeight * 0.72 : vh * 0.72);
    const footerTop = footer ? footer.getBoundingClientRect().top : vh;
    const nearFooter = footerTop < vh - 30;
    const pr = playSection ? playSection.getBoundingClientRect() : null;
    const inPlay = pr ? pr.top < vh * 0.6 && pr.bottom > vh * 0.25 : false;
    const inYear = yearSection ? yearSection.getBoundingClientRect().top < vh * 0.6 : false;
    stickyCta.classList.toggle("show", pastHero && !nearFooter && !inPlay && !inYear);
  } else if (stickyCta) {
    stickyCta.classList.remove("show");
  }
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateScroll);
  }
}

/* ==========================================================================
   Pointer tilt
   ========================================================================== */

function initTilt() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (reduceMotion.matches) return;

  document.querySelectorAll("[data-tilt]").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      const rx = (0.5 - py) * 3.6;
      const ry = (px - 0.5) * -4.4;
      card.style.transform =
        "perspective(1000px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-4px)";
    });
    card.addEventListener("pointerleave", function () {
      card.style.transform = "";
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "0%");
    });
  });
}

/* ==========================================================================
   Toast
   ========================================================================== */

let toastTimer = null;

function toast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    el.classList.remove("show");
  }, 2600);
}

function initSoonLinks() {
  document.querySelectorAll(".is-soon").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (CONFIG.bazi) return;
      e.preventDefault();
      toast(t("play.toast"));
    });
  });
}

/* ==========================================================================
   Boot
   ========================================================================== */

function boot() {
  buildDial();
  buildDust();

  const initial = detectLang();
  applyLang(initial, false);
  replayHero();

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const lang = btn.getAttribute("data-lang");
      if (lang && lang !== currentLang) applyLang(lang, true);
    });
  });

  tickCountdown();
  setInterval(tickCountdown, 1000);

  initReveal();
  initTilt();
  initSoonLinks();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
