export const siteNav = [
  ["Platform", "/platform"],
  ["SocialFi", "/socialfi"],
  ["Trading", "/trading"],
  ["Investor Relations", "/investor-relations"],
] as const;

export const siteNavZh = [
  ["平台", "/zh/platform"],
  ["SocialFi", "/zh/socialfi"],
  ["交易", "/zh/trading"],
  ["投资者关系", "/zh/investor-relations"],
] as const;

export const contact = {
  email: "info@neuralfin.ai",
  location: "Headquartered in Hong Kong",
  address: "20/F DL Tower, 92 Wellington Street, Central, Hong Kong",
};

export const contactZh = {
  email: "info@neuralfin.ai",
  location: "总部位于香港",
  address: "香港中环威灵顿街 92 号 DL Tower 20 楼",
};

export const appLinks = {
  appStore: "https://apps.apple.com/cn/app/neuralfin/id6751037382",
  googlePlay: "https://play.google.com/store/apps/details?id=com.dlzq.rongmai",
  webApp: "http://web.neuralfin.ai/",
} as const;

// App Store links are storefront-scoped. The scroll calculator offers HK, SG
// and TH, so a /cn/ link sends those users to a storefront they cannot buy
// from. Google Play is storefront-agnostic and needs no equivalent.
const APP_STORE_STOREFRONTS = { ww: "us", hk: "hk", sg: "sg", th: "th" } as const;

export function appStoreLinkForRegion(region: keyof typeof APP_STORE_STOREFRONTS) {
  return appLinks.appStore.replace("/cn/", `/${APP_STORE_STOREFRONTS[region] ?? "us"}/`);
}

export const milestones = [
  ["August 2024", "Incorporated the holding company in the Cayman Islands."],
  ["March 2025", "NeuralFin completed its Series A financing at an implied valuation of approximately US$35 million."],
  ["September 2025", "NeuralFin completed its Series B financing at an implied valuation of approximately US$70 million."],
  ["December 2025", "NeuralFin conducted a soft launch and was successfully listed on the Apple App Store and Google Play."],
  ["February 2026", "Formally submitted the registration statement for an initial public offering."],
] as const;

export const milestonesZh = [
  ["2024年8月", "在开曼群岛成立控股公司。"],
  ["2025年3月", "NeuralFin 完成 A 轮融资，隐含估值约 3,500 万美元。"],
  ["2025年9月", "NeuralFin 完成 B 轮融资，隐含估值约 7,000 万美元。"],
  ["2025年12月", "NeuralFin 进行软启动，并成功上架 Apple App Store 与 Google Play。"],
  ["2026年2月", "正式递交首次公开发行注册声明。"],
] as const;

export const behaviorLoop = [
  ["Scroll", "Daily market attention enters the feed."],
  ["Learn", "AI compresses content into financial intelligence."],
  ["Discuss", "Community turns investing from isolated to collaborative."],
  ["Act", "Trading-ready infrastructure closes the loop."],
  ["Compound", "Every interaction strengthens insight, confidence, and signal."],
] as const;

export const behaviorLoopZh = [
  ["刷屏", "日常市场注意力进入信息流。"],
  ["学习", "AI 将内容压缩为金融智能。"],
  ["讨论", "社区让投资从孤立行为走向协作学习。"],
  ["行动", "交易就绪的基础设施完成闭环。"],
  ["复利", "每一次互动都在强化洞察、信心与信号。"],
] as const;

export const companyFacts = [
  ["Platform", "AI-native social trading"],
  ["Market", "Hong Kong and global investors"],
  ["Infrastructure", "DL Securities integration"],
  ["Model", "Content, community, AI, execution"],
] as const;

export const companyFactsZh = [
  ["平台", "AI 原生社交交易"],
  ["市场", "香港及全球投资者"],
  ["基础设施", "接入德林证券"],
  ["模式", "内容、社区、AI、执行"],
] as const;

export const homeScreens = [
  "home-screen-1.jpg",
  "home-screen-2.jpg",
  "home-screen-3.jpg",
] as const;

export const aiLearningScreens = [
  "ai-learning-1.png",
  "ai-learning-2.jpg",
  "ai-learning-3.jpg",
  "ai-learning-4.jpg",
  "ai-learning-5.jpg",
] as const;

export const communityScreens = [
  "community-social-1.png",
  "community-social-2.jpg",
  "community-social-3.jpg",
  "community-social-4.jpg",
] as const;

export const marketScreens = [
  "market-screen-1.jpg",
  "market-screen-2.jpg",
  "market-screen-3.jpg",
  "market-screen-4.jpg",
  "market-screen-5.jpg",
  "market-screen-6.jpg",
  "market-screen-7.jpg",
  "market-screen-8.jpg",
] as const;

export const pressReleases = [
  {
    slug: "neuralfin-technology-officially-launches-in-the-hong-kong-market",
    date: "August 27, 2026",
    location: "Hong Kong",
    title: "NeuralFin Technology Officially Launches in the Hong Kong Market, Continuing to Focus on AI Social and Fintech Innovation",
    excerpt:
      "NeuralFin, an AI-powered fintech social platform, announced its official launch in the Hong Kong market, marking the platform's transition from product testing to full public availability.",
    body: [
      "From product testing to full market rollout, NeuralFin is deepening its commitment to AI-driven social fintech.",
      "HONG KONG — NeuralFin, an AI-powered fintech social platform, today announced its official launch in the Hong Kong market, marking the platform's transition from the testing phase to full public availability.",
      "Official Launch: From Testing to Full Rollout",
      "NeuralFin was formerly known as DLiFO (DL DIGITAL FAMILY OFFICE (HK) LIMITED), and was rebranded and spun off as an independent operating entity in February 2025. The platform is positioned as a TechFin platform that integrates social discovery, financial education, AI-powered financial tools, and compliant securities trading.",
      "The project has completed two rounds of financing, Series A and Series B, raising tens of millions of Hong Kong dollars in total. In December 2025, NeuralFin completed a soft launch for product testing, and starting in February 2026, it began offering virtual asset trading services in collaboration with its affiliate, DL Securities.",
      "Following the official launch, users will be able to follow financial content creators, watch AI-generated research video summaries, and leverage tools such as AI-powered analysis and interpretation and the Global Capital Radar to gain investment insights.",
      "Through a seamless integration with DL Securities, users can execute one-click trades across Hong Kong, U.S., and Japanese equities, ETFs, and virtual assets, creating a fully connected experience spanning market data, community-based financial education, market research, and securities trading.",
      "Future Outlook",
      "This official launch marks NeuralFin's transition from the product testing phase to full market availability, laying the technological foundation for continued investment in AI research and product iteration. It further reinforces the company's commitment to building a financial ecosystem defined by technology empowerment, data-driven insights, and inclusive access.",
      "About NeuralFin Technology",
      "NeuralFin is an AI-driven fintech platform incubated by DL Holdings Group (1709.HK). Licensed and affiliated entities under the NeuralFin group hold licenses issued by the Hong Kong Securities and Futures Commission (SFC), authorizing them to conduct Type 1, Type 4, Type 6, and Type 9 regulated activities. For more information, please visit www.neuralfin.ai.",
    ],
  },
  {
    slug: "neuralfin-partners-with-leader-education-to-accelerate-global-ai-content-ecosystem",
    date: "August 24, 2026",
    location: "Hong Kong",
    title: "NeuralFin Partners with Leader Education to Seize First-Mover Advantage in AI Education, Accelerating a Global AI Content Ecosystem",
    excerpt:
      "NeuralFin Technology Limited and Leader Education Group Limited signed a strategic cooperation agreement to reshape talent development models and knowledge service systems through AI-enabled education.",
    body: [
      "On August 24, 2026, NeuralFin Technology Limited and Hong Kong-listed Leader Education Group Limited (HKEX: 1449.HK) officially signed a strategic cooperation agreement.",
      "Rather than pursuing a surface-level AI + Education integration, the two parties aim to use AI capabilities to fundamentally reshape talent development models and knowledge service systems in education, spanning curriculum development, platform integration, hands-on training tools, and teacher capability enhancement, to build a systematic framework for AI-enabled education.",
      "Leader Education brings a mature higher-education system and real-world teaching environments, while NeuralFin Technology contributes leading engineering capabilities in AI-driven content generation and knowledge services. This partnership signals AI's genuine entry into the core supply side of the education industry, not merely as a supporting tool, but as a foundational capability.",
      "This partnership underscores NeuralFin Technology's strong capability for product deployment and its potential for expansion across multiple use cases. The company's product portfolio currently spans three key dimensions: financial information, entertainment and interactivity, and fintech and financial education. NeuralFin employs a clearly tiered strategy to address different market segments and continuously strengthen its foothold across the industry.",
      "Financial Information: Building an AI-Powered Foundation for Global Asset Monitoring and Macroeconomic Insight",
      "NeuralFin Technology's proprietary AI agent serves individual investors and financial content consumers by providing clear capital flow mapping and macroeconomic interpretation services.",
      "On the data front, the company co-developed the AI Risk Signal product with leading South Korean AI fintech company Qraft Technologies. This tool delivers real-time market risk insights, helping users understand asset volatility from a global macroeconomic perspective. The app also features built-in macroeconomic briefings and interpretive tools, creating an efficient pipeline from information access to investment decision-making.",
      "Entertainment and Interactivity: Expanding User Reach Through AI-Driven Engagement",
      "NeuralFin Technology launched the 16 Personality Financial IQ Test, NBTI, modeled after the MBTI personality framework, blending financial literacy with interactive entertainment to quickly bridge the gap between AI products and mainstream users. Since its launch, the feature has generated strong engagement, becoming a key touchpoint for expanding the user base and enhancing brand awareness.",
      "Going forward, the company will continue rolling out AI-driven interactive features that combine entertainment value with practical utility, strengthening user retention and social sharing.",
      "In addition, Zhi xu jin suan, an AIGC creative work produced by NeuralFin Creative Studio, a subsidiary of NeuralFin Technology, was selected for CCTV.com's Intangible Cultural Heritage AI Art Co-Creation Initiative in the Tech-Art Fusion category and received an honorary certificate, further validating the company's strength in AI content creation.",
      "Knowledge Education: Podcasts + Interactive Learning as a Foundation for AI Training and Education",
      "NeuralFin Technology has already validated the potential of extending its AI + Content capabilities into education. The app features a suite of structured podcast programs, including Mi Cang Tian Xia, focused on global macroeconomics, Qu Jing Cai Ji for Economics, an economics education series, and business biography content, all designed to translate professional knowledge into accessible language.",
      "After listening, users can complete accompanying knowledge quizzes, forming a full learning loop of listen, learn, practice, and win.",
      "This partnership with Leader Education directly connects these capabilities with real-world higher-education environments, laying the groundwork for large-scale AI training programs, certification systems, and joint school-enterprise practical training initiatives. Rather than entering the traditional academic degree space, NeuralFin Technology is taking an industry-driven approach to embedding AI capabilities into practical talent development pathways.",
      "Accelerating Global Expansion",
      "On the higher-education front, NeuralFin Technology has successfully hosted multiple AI-and-finance-focused campus events at institutions including Fudan University, Capital University of Economics and Business, and Communication University of China, Nanjing, covering student enterprise practice, AI product design workshops, and research projects.",
      "The company is also in discussions with Junior Achievement China (JA China) to introduce internationally recognized approaches to youth financial literacy education, further expanding its educational footprint.",
      "On the international front, NeuralFin Technology will soon officially launch its core product in the Hong Kong market and is clearly accelerating its expansion into Thailand and other Southeast Asian markets. Leveraging local educational resources and fintech demand, the company aims to advance the localized rollout of its AI content platform in step with regional partnerships, securing a first-mover advantage in the regional AI education services market.",
      "Partnership Focus: Three Core Areas of Collaboration",
      "The partnership between the two parties centers on curriculum development and content co-creation, platform integration and data connectivity, and teacher capability development and training-base construction.",
      "Through curriculum development and content co-creation, the parties will leverage Leader Education's existing academic framework and NeuralFin Technology's AI content generation capabilities to jointly develop course modules in fintech, data analytics, and foundational AI applications, integrated into real teaching scenarios.",
      "Through platform integration and data connectivity, the parties will link with Leader Education's internal teaching systems to enable two-way integration of course content, learning tasks, and training data, improving teaching efficiency and personalized learning experiences.",
      "Through teacher capability development and training-base construction, the parties will use structured training programs to help educators master AI tools, while jointly building school-enterprise training bases that offer students hands-on, project-based learning opportunities and exploring certifiable micro-credential programs.",
      "These three focus areas are mutually reinforcing, reshaping AI's role in the core supply side of education across content, platform, and talent development, and establishing a standardized model for future replication across additional universities and international markets.",
      "High-Quality Cross-Industry Collaboration: NeuralFin Technology Strengthens Its Multi-Dimensional Position in the AI Content Space",
      "Backed by the long-term investment experience of its founding shareholder, DL Holdings, at the intersection of AI and fintech, NeuralFin Technology has demonstrated not only solid technological capabilities and a mature product ecosystem, but also an ability to rapidly adapt across use cases and regions.",
      "The strategic partnership with Leader Education, and the clarity of its collaborative direction, marks a pivotal evolution for NeuralFin Technology, from a content tool provider to an industry enabler. Looking ahead, NeuralFin Technology will continue to leverage its AI capabilities as a lever to unlock the vast market potential at the intersection of financial literacy, education innovation, and mass-market engagement.",
    ],
  },
  {
    slug: "neuralfin-enables-the-commercial-launch-of-regulated-virtual-asset-trading",
    date: "February 20, 2026",
    location: "Hong Kong",
    title: "NeuralFin Enables the Commercial Launch of Regulated Virtual Asset Trading",
    excerpt:
      "NeuralFin announced that it now enables eligible clients to access regulated virtual asset trading, marking the commercial launch of the service provided through DL Securities (Hong Kong) Limited, a Hong Kong licensed securities broker.",
    body: [
      "NeuralFin announced that it now enables eligible clients to access regulated virtual asset trading, marking the commercial launch of the service provided through DL Securities (Hong Kong) Limited (DL Securities), a Hong Kong licensed securities broker.",
      "Based on publicly disclosed information, clients who have opened securities accounts with DL Securities and completed professional investor certification may use the same securities account through NeuralFin to trade a range of mainstream digital assets.",
      "Order handling, clearing, custody, and compliance monitoring are conducted within the regulatory framework of the Securities and Futures Commission (SFC) of Hong Kong.",
      "NeuralFin will continue to deepen product experience and digital service collaboration with licensed partners, while expanding digital asset trading and related service capabilities for eligible clients under compliant operating principles.",
    ],
  },
  {
    slug: "neuralfin-series-b-financing-update-valuation-of-approximately-hk-546-million-proceeds-to-strengthen-ai-platform-and-scale-user-growth",
    date: "October 2, 2025",
    location: "Hong Kong",
    title:
      "NeuralFin Series B Financing Update: Valuation of Approximately HK$546 Million; Proceeds to Strengthen AI Platform and Scale User Growth",
    excerpt:
      "NeuralFin Technology provided an update on its Series B financing. The company completed its Series B round in September 2025, raising aggregate proceeds of approximately US$7.7 million.",
    body: [
      "NeuralFin Technology provided an update on its Series B financing. The company completed its Series B round in September 2025, raising aggregate proceeds of approximately US$7.7 million, or approximately HK$60.1 million.",
      "The round implies a 100% equity valuation of approximately US$70.0 million, or approximately HK$546.0 million.",
      "The proceeds are expected to support continued investment in the AI platform, product capabilities, and user growth initiatives as NeuralFin advances its next-generation TechFin ecosystem.",
      "NeuralFin will continue to pursue platform development and business expansion under prudent and compliant operating principles.",
    ],
  },
  {
    slug: "neuralfin-announces-completion-of-series-a-financing-at-implied-valuation-of-approximately-us-35-million",
    date: "March 31, 2025",
    location: "Hong Kong",
    title: "NeuralFin Announces Completion of Series A Financing at Implied Valuation of Approximately US$35 Million",
    excerpt:
      "NeuralFin announced the completion of its Series A financing through a share transfer arrangement at the level of DL Digital Family Office (Cayman) Limited.",
    body: [
      "NeuralFin announced the completion of its Series A financing. The transaction was conducted through a share transfer arrangement at the level of DL Digital Family Office (Cayman) Limited, implying a 100% equity valuation of approximately US$35 million.",
      "Based on publicly disclosed information, the transaction involved the transfer of an aggregate of 3,152 shares, representing approximately 28.0% of the issued share capital of DL Digital Family Office as of the date of the announcement, for a total consideration of approximately US$9,799,568, or US$3,109 per share.",
      "The investors include GPTX Tech-Driven LPF, C Capital AI Limited, and Shuren Education Limited.",
      "NeuralFin will continue to advance platform development and business expansion within its existing ecosystem framework, under prudent and compliant operating principles.",
    ],
  },
] as const;

export type PressRelease = (typeof pressReleases)[number];

export const pressReleasesZh = [
  {
    slug: "neuralfin-technology-officially-launches-in-the-hong-kong-market",
    date: "2026年8月27日",
    location: "香港",
    title: "突触科技 NeuralFin 正式上线香港市场，未来规划持续专注于 AI 社交及金融科技市场",
    excerpt:
      "人工智能金融科技社交平台突触科技（NeuralFin）宣布正式上线香港市场，标志着产品从测试阶段迈向全面开放。",
    body: [
      "从产品测试到全面开放，NeuralFin 持续加码深化 AI 社交金融科技布局。",
      "香港——人工智能金融科技社交平台突触科技（NeuralFin）今日宣布正式上线香港市场，标志着产品从测试阶段迈向全面开放。",
      "正式上线：从测试到全面开放",
      "NeuralFin 前身为德林数字家族办公室（DLiFO），2025 年 2 月更名独立运营，定位为融合社交发现、金融教育、AI 金融工具与合规证券交易的科技金融（TechFin）平台。",
      "项目历经 A、B 两轮融资，融资数千万港币，2025 年 12 月完成产品测试软发布上线，2026 年 2 月起与关联公司德林证券协同开放虚拟资产交易服务。",
      "正式上线后，用户可关注财经创作者、观看 AI 研报短视频，并借助 AI 咨询解读、全球资本雷达等工具获取投资洞见，再经德林证券一键交易港股、美股、日股、ETF 及虚拟资产，实现行情、社区金融教育、行情检索与证券交易的无缝衔接。",
      "展望",
      "此次正式上线，标志着 NeuralFin 从产品测试阶段迈向全面开放，为未来持续投入 AI 技术研发与产品迭代奠定技术路线，深化科技赋能、数据驱动、普惠共享的金融生态布局。",
      "关于突触科技（NeuralFin）",
      "NeuralFin 是一家人工智能金融科技平台，孵化自德林控股集团（1709.HK）。NeuralFin 集团公司旗下持牌主体及关联持牌主体，持有香港证监会（SFC）牌照，可从事第 1 类、第 4 类、第 6 类及第 9 类受规管活动。更多信息请访问 www.neuralfin.ai。",
    ],
  },
  {
    slug: "neuralfin-partners-with-leader-education-to-accelerate-global-ai-content-ecosystem",
    date: "2026年8月24日",
    location: "香港",
    title: "NeuralFin 携手立德教育，抢占 AI 教育赛道先机，加速构建全球化 AI 内容生态",
    excerpt:
      "突触科技有限公司与香港上市公司立德教育股份有限公司正式签署战略合作协议，双方将以 AI 能力重塑教育产业的人才模型与知识服务体系。",
    body: [
      "2026 年 8 月 24 日，突触科技有限公司与香港上市公司立德教育股份有限公司（HKEX：1449.HK）正式签署战略合作协议。",
      "双方并非停留在“AI+教育”的表层工具叠加，而是以 AI 能力重塑教育产业的人才模型与知识服务体系，从课程研发、平台协同、实训工具到教师素养提升，构建系统化的 AI 赋能逻辑。",
      "立德教育拥有成熟的高教体系和真实教学场景，突触科技则在 AI 驱动的内容生成与知识服务领域具备领先的工程化能力。此次联手，标志着 AI 正真正进入教育产业的核心供给端，而非仅作为辅助工具。",
      "此次合作标识着，突触科技已具备强大的产品落地能力与多场景延展潜力。目前，其产品矩阵覆盖财经信息、娱乐互动、金融科技与金融知识教育三大维度，并以清晰的分层策略切入不同市场层级，市场空间与赛道把控力持续增强。",
      "一、财经信息：构建全球资产监测与宏观经济洞察的 AI 能力底座",
      "突触科技自主研发的 AI Agent 面向个人投资者与财经内容消费者，提供清晰的资金地图与宏观经济解读服务。",
      "数据层面，突触科技与韩国 AI 金融科技领先公司 Qraft Technologies 共同开发的 AI Risk Signal（风险信号）产品，实时输出市场风险洞察，帮助用户从全球宏观视角理解资产波动逻辑。APP 内置宏观经济播报与解读功能，实现从信息获取到投资判断的高效闭环。",
      "二、娱乐互动：以 AI 驱动趣味互动，拓展用户触达边界",
      "突触科技推出十六人格财商测试（NBTI），对标 MBTI 人格模型，将财商认知与趣味测试结合，迅速拉近 AI 产品与大众用户的距离。该功能上线后反馈活跃，成为拓展用户圈层、提升品牌认知的重要触点。",
      "未来，公司将持续推出兼具娱乐性与实用性的 AI 互动功能，强化用户粘性与社交传播效应。",
      "此外，突触科技旗下突触创意工作室的 AIGC 作品《织序锦算》曾入选央视网“万象非遗”AI 艺术共创征集活动“智技融合”类作品并获颁荣誉证书，进一步印证了其 AI 内容创作实力。",
      "三、知识教育：播客+习题闭环，为 AI 培训教育蓄势",
      "突触科技已在“AI+内容”层面验证了教育延展可能性。APP 内设有系统化播客栏目，包括聚焦全球宏观经济的《米仓天下》、经济学科普《取经财记》，以及商业人物传记内容，以轻松语言转化专业知识。",
      "用户收听后可参与配套知识问答，完成听、学、练、赢的完整学习闭环。",
      "此次与立德教育的合作，正是将这一能力与真实高教场景深度绑定，为大规模 AI 培训课程、认证体系与校企联合实训项目奠定基础。突触科技并非切入传统学历教育，而是以产业需求为导向，重构 AI 能力在人才培养中的落地路径。",
      "四、全球化布局加速",
      "截至目前，突触科技在高校层面已与复旦大学、首都经济贸易大学、南京传媒学院等成功举办多场 AI 与财经结合的校园活动，涵盖学生公司实践、AI 产品设计工作坊及课题研究。",
      "同时，公司正与青年成就中国（JA 中国）洽谈合作，计划引入国际化青少年财商教育经验，进一步拓展教育场景。",
      "海外拓展方面，公司近期将会在香港市场正式推出核心产品，并明确加速布局泰国及其他东南亚国家，依托当地教育资源与金融科技需求，推动 AI 内容平台与本地化合作同步落地，抢占区域 AI 教育服务市场的先发优势。",
      "五、合作方向：聚焦三大核心领域",
      "双方本次合作主要集中在课程研发与内容共建、平台协同与数据互通、教师素养提升与实训基地建设三个方向。",
      "在课程研发与内容共建方面，双方将基于立德教育现有的学科体系和突触科技的 AI 内容生成能力，共同开发金融科技、数据分析、AI 应用基础等课程模块，并融入实际教学场景。",
      "在平台协同与数据互通方面，双方将与立德教育内部教学系统对接，实现课程内容、学习任务和实训数据的双向联动，提升教学效率与个性化学习体验。",
      "在教师素养提升与实训基地建设方面，双方将通过系统化培训项目帮助教师掌握 AI 工具应用，同时共建校企联合实训项目，为学生提供真实项目制学习机会，并探索可认证的微专业证书。",
      "这三个方向相辅相成，从内容、平台和人才三个层面重构 AI 在教育核心供给端的赋能路径，也为后续向更多高校及海外市场复制提供了标准化范本。",
      "优质的跨行业合作，突触科技多维度卡位 AI 内容新赛道",
      "受益于创始股东德林控股在 AI 与金融科技交叉领域的长期投资经验，突触科技不仅具备扎实的技术能力与产品体系，更展现出跨场景、跨区域的快速进化能力。",
      "与立德教育的战略合作及其清晰的合作方向，标志着突触科技从内容工具迈向产业赋能的关键跃升。未来，突触科技将持续以 AI 能力为支点，撬动财经认知、教育升级与大众趣味之间的巨大市场空间。",
    ],
  },
  {
    slug: "neuralfin-enables-the-commercial-launch-of-regulated-virtual-asset-trading",
    date: "2026年2月20日",
    location: "香港",
    title: "NeuralFin 推动受监管虚拟资产交易商业化上线",
    excerpt:
      "NeuralFin 宣布，其现已支持合资格客户通过德林证券（香港）有限公司接入受监管虚拟资产交易，标志着相关服务进入商业化上线阶段。",
    body: [
      "NeuralFin 宣布，其现已支持合资格客户通过德林证券（香港）有限公司（“德林证券”）接入受监管虚拟资产交易。德林证券为香港持牌证券经纪商。",
      "根据公开披露资料，已于德林证券开立证券账户并完成专业投资者认证的客户，可通过 NeuralFin 使用同一证券账户交易一系列主流数字资产。",
      "订单处理、结算、托管及合规监控均在香港证券及期货事务监察委员会（SFC）的监管框架内进行。",
      "NeuralFin 将继续深化与持牌合作伙伴在产品体验及数字服务方面的协同，并在审慎合规的运营原则下，拓展面向合资格客户的数字资产交易及相关服务能力。",
    ],
  },
  {
    slug: "neuralfin-series-b-financing-update-valuation-of-approximately-hk-546-million-proceeds-to-strengthen-ai-platform-and-scale-user-growth",
    date: "2025年10月2日",
    location: "香港",
    title: "NeuralFin B 轮融资进展：估值约 5.46 亿港元，融资所得将用于强化 AI 平台及扩大用户增长",
    excerpt:
      "NeuralFin Technology 公布 B 轮融资进展。公司已于 2025 年 9 月完成 B 轮融资，融资总额约 770 万美元。",
    body: [
      "NeuralFin Technology 公布 B 轮融资进展。公司已于 2025 年 9 月完成 B 轮融资，融资总额约 770 万美元，折合约 6,010 万港元。",
      "本轮融资对应公司 100% 股权估值约 7,000 万美元，折合约 5.46 亿港元。",
      "融资所得预计将用于持续投入 AI 平台、产品能力及用户增长计划，支持 NeuralFin 推进下一代 TechFin 生态系统建设。",
      "NeuralFin 将继续在审慎及合规的运营原则下推进平台发展与业务扩张。",
    ],
  },
  {
    slug: "neuralfin-announces-completion-of-series-a-financing-at-implied-valuation-of-approximately-us-35-million",
    date: "2025年3月31日",
    location: "香港",
    title: "NeuralFin 宣布完成 A 轮融资，隐含估值约 3,500 万美元",
    excerpt:
      "NeuralFin 宣布完成 A 轮融资。本次交易通过 DL Digital Family Office（Cayman）Limited 层面的股份转让安排完成。",
    body: [
      "NeuralFin 宣布完成 A 轮融资。本次交易通过 DL Digital Family Office（Cayman）Limited 层面的股份转让安排进行，对应公司 100% 股权隐含估值约 3,500 万美元。",
      "根据公开披露资料，本次交易涉及合共 3,152 股股份转让，占 DL Digital Family Office 截至公告日期已发行股本约 28.0%，总代价约 9,799,568 美元，即每股约 3,109 美元。",
      "投资方包括 GPTX Tech-Driven LPF、C Capital AI Limited 及 Shuren Education Limited。",
      "NeuralFin 将继续在现有生态框架下推进平台开发与业务拓展，并坚持审慎合规的运营原则。",
    ],
  },
] as const;

export type PressReleaseZh = (typeof pressReleasesZh)[number];
