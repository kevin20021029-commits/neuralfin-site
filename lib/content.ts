export type Locale = "en" | "zh";

export const content = {
  en: {
    lang: "en",
    localePath: "/zh",
    localeLabel: "中文",
    nav: ["Platform", "AI Loop", "Partners", "Contact"],
    ir: "Investor Relations",
    eyebrow: "AI-native platform",
    headlineTop: "Built for the",
    headlineAccent: "scroll generation.",
    subhead:
      "NeuralFin is a social-media-driven, next-generation TechFin platform designed to transform daily mobile habits into powerful opportunities for growth and wealth accumulation.",
    appStoreAlt: "Download on the App Store",
    googlePlayAlt: "Get it on Google Play",
    apkAlt: "Download APK",
    launchApp: "Launch App",
    stats: [
      ["Consumer fintech", "Designed around daily mobile attention and social discovery."],
      ["AI-native layer", "Financial content, community, and market data in one loop."],
    ],
    heroSignals: {
      ai: ["AI learning loop", "Content, community, and market data compressed into daily financial intelligence."],
      market: ["Market pulse", "The user journey stays inside one product surface."],
    },
    positioning: {
      label: "Core positioning",
      title: "The consumer finance interface for social discovery, AI learning, and action.",
      copy:
        "NeuralFin brings together mobile-first financial content and community learning for the next generation of investors.",
      cards: [
        ["01 / DISCOVER", "Content-first investing", "Follow professionals, institutions, influencers, and your network."],
        ["02 / LEARN", "Community-powered learning", "Investing becomes collaborative, not isolated."],
      ],
    },
    motion: [
      ["Scroll", "Daily mobile attention becomes a financial learning surface."],
      ["Learn", "AI-enabled tools compress content into actionable education."],
      ["Discuss", "Community turns investing from isolated to collaborative."],
      ["Compound", "Every scroll can become signal, context, or action."],
    ],
    infrastructure: {
      label: "Technology",
      title: "An AI-powered financial ecosystem.",
    },
    loop: {
      label: "AI orchestration",
      title: "Discovery and education in one loop.",
      nodes: [
        ["Input", "Financial content and market behavior flow into the product layer.", "live signal"],
        ["Model", "AI-enabled tools transform discovery into learning and decision support.", "adaptive"],
        ["Network", "Professionals, institutions, and community signals compound context.", "social graph"],
      ],
    },
    partners: {
      label: "Ecosystem and partnerships",
      title: "A platform company built across technology, content, and capital markets.",
      copy:
        "NeuralFin works across an ecosystem of technology, financial infrastructure, and digital wealth partners.",
    },
    contact: {
      label: "Contact us",
      title: "Build the next generation financial interface with us.",
      copy: "For platform, partnership, investor relations, and company enquiries.",
      location: "Headquartered in Hong Kong",
      address: "20/F DL Tower, 92 Wellington Street, Central, Hong Kong",
    },
    footer:
      "Information on this site is for general purposes only and not financial advice. We disclaim liability for any errors or omissions.",
  },
  zh: {
    lang: "zh-Hans",
    localePath: "/",
    localeLabel: "EN",
    nav: ["平台", "AI 闭环", "合作伙伴", "联系"],
    ir: "投资者关系",
    eyebrow: "AI 原生平台",
    headlineTop: "为",
    headlineAccent: "刷屏一代而生",
    subhead:
      "NeuralFin 是面向下一代用户的社交媒体驱动型 TechFin 平台，旨在将日常移动端使用习惯转化为增长、学习与财富积累的机会。",
    appStoreAlt: "在 App Store 下载",
    googlePlayAlt: "在 Google Play 获取",
    apkAlt: "直接下载 APK",
    launchApp: "启动应用",
    stats: [
      ["消费金融科技", "围绕移动端注意力与社交发现重新设计。"],
      ["AI 原生层", "将金融内容、社区与市场数据整合进同一个闭环。"],
    ],
    heroSignals: {
      ai: ["AI 学习闭环", "将内容、社区与市场数据压缩为日常金融智能。"],
      market: ["市场脉冲", "用户旅程留在同一个产品界面内。"],
    },
    positioning: {
      label: "核心定位",
      title: "面向社交发现、AI 学习与行动的消费金融界面。",
      copy:
        "NeuralFin 将移动优先的金融内容与社区学习连接起来，服务下一代投资者。",
      cards: [
        ["01 / 发现", "内容优先的投资入口", "关注专业人士、机构、影响者与自己的网络。"],
        ["02 / 学习", "社区驱动的金融学习", "让投资学习从孤立行为变成协作过程。"],
      ],
    },
    motion: [
      ["刷屏", "日常移动端注意力成为金融学习界面。"],
      ["学习", "AI 工具将内容压缩为可行动的教育。"],
      ["讨论", "社区让投资从孤立走向协作。"],
      ["复利", "每一次刷屏都可能成为信号、洞察或行动。"],
    ],
    infrastructure: {
      label: "技术",
      title: "AI 金融生态系统。",
    },
    loop: {
      label: "AI 编排",
      title: "发现与教育，形成同一个闭环。",
      nodes: [
        ["输入", "金融内容与市场行为流入产品层。", "实时信号"],
        ["模型", "AI 工具将发现转化为学习与决策支持。", "自适应"],
        ["网络", "专业人士、机构与社区信号持续沉淀洞察。", "社交图谱"],
      ],
    },
    partners: {
      label: "生态与合作",
      title: "横跨技术、内容与资本市场的平台型公司。",
      copy: "NeuralFin 连接技术、金融基础设施与数字财富生态合作伙伴。",
    },
    contact: {
      label: "联系我们",
      title: "与我们一起构建下一代金融界面。",
      copy: "平台、合作、投资者关系与公司咨询。",
      location: "总部位于香港",
      address: "香港中环威灵顿街 92 号 DL Tower 20 楼",
    },
    footer: "本网站信息仅供一般参考，不构成金融建议。对于任何错误或遗漏，我们不承担责任。",
  },
} satisfies Record<Locale, any>;

export const partners = [
  ["xiaobing-logo-cropped.png", "XiaoBing", "Ecosystem partner"],
  ["qraft-logo-cropped.png", "Qraft Technologies", "Ecosystem partner"],
  ["DLH.png", "DL Holdings", "Ecosystem partner"],
];
