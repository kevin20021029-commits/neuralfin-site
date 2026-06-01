import { SiteChrome } from "@/components/SiteChrome";
import { aiLearningScreens, behaviorLoopZh, communityScreens } from "@/lib/site";

export const metadata = {
  title: "SocialFi | NeuralFin",
  description: "NeuralFin 的 SocialFi 层将金融内容、创作者、机构、AI 与社区信号连接为持续复利的网络。",
  openGraph: {
    title: "SocialFi | NeuralFin",
    description: "将社交发现、金融内容、AI 学习与市场参与连接为持续复利的网络。",
  },
  twitter: {
    title: "SocialFi | NeuralFin",
    description: "将社交发现、金融内容、AI 学习与市场参与连接为持续复利的网络。",
  },
};

const roles = [
  ["创作者", "将市场观点、教育内容与投资经验转化为可关注、可讨论的内容。"],
  ["机构", "分发研究、产品、活动与资本市场信息。"],
  ["AI 层", "将信号压缩为每日金融智能。"],
  ["用户", "通过关注、保存、讨论与行动持续参与网络。"],
] as const;

const flywheel = [
  ["更多用户", "更多日常金融注意力进入网络。"],
  ["更多内容", "创作者与机构持续贡献市场洞察。"],
  ["更多学习", "AI 将信息流压缩为可用的金融洞察。"],
  ["更多行动", "信心提升后，用户更容易走向受监管参与。"],
] as const;

export default function SocialFiZhPage() {
  return (
    <SiteChrome
      locale="zh"
      langHref="/socialfi"
      eyebrow="SocialFi"
      title="当社交发现转化为市场参与。"
      intro={<>NeuralFin 是为<span className="accent-inline prose">刷屏一代</span>设计的金融网络：内容、社区、AI 学习与交易就绪的行动在同一复利闭环内运转。</>}
      visual="community"
      hideContact
    >
      <section className="section paper network-section">
        <div className="section-inner socialfi-stage">
          <div className="network-flywheel" aria-label="SocialFi 网络效应闭环">
            <div className="network-flow-core">
              <span>SocialFi</span>
              <strong>注意力持续复利为行动。</strong>
            </div>
            {flywheel.map(([title, copy], index) => (
              <article className={`flywheel-node flywheel-${index}`} key={title}>
                <strong>{title}</strong>
                <span>{copy}</span>
              </article>
            ))}
          </div>
          <div>
            <div className="section-label">网络效应</div>
            <h2>更多用户带来更多内容、学习与交易信心。</h2>
            <p className="large-copy">NeuralFin 将专业人士、机构、创作者与个人投资者连接在一个移动优先的金融社区中。</p>
            <div className="loop-equation">
              {["内容", "社区", "AI", "市场数据", "受监管行动"].map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section dark community-engine">
        <div className="section-inner community-engine-grid">
          <div>
            <div className="section-label">社区产品</div>
            <h2>产品界面让金融学习、创作者洞察与社区参与持续流动。</h2>
            <p className="section-copy">积分体系与社区界面相互配合：用户公开学习、跟随市场讨论，并在参与过程中看到成长反馈。</p>
          </div>
          <div className="community-motion" aria-label="NeuralFin 社区与积分产品截图">
            <div className="motion-track">
              {[...communityScreens, "point-system.jpg", ...communityScreens].map((screen, index) => (
                <figure key={`${screen}-${index}`}>
                  <img src={`/assets/${screen}`} alt="NeuralFin 社区产品截图" loading="lazy" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section paper" id="ai-loop">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <div className="section-label">AI 闭环</div>
              <h2>AI 闭环支撑整个 SocialFi 平台逻辑。</h2>
            </div>
            <p className="section-copy">我们对 AI 的使用，是一个将内容、社区与市场数据转化为每日金融洞察的智能层。</p>
          </div>
          <div className="ai-command-center">
            <div className="ai-loop-stack">
              {behaviorLoopZh.map(([title, copy]) => (
                <article key={title}>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
            <div className="ai-screen-stage" aria-label="NeuralFin AI 学习截图">
              <div className="ai-gallery-track">
                {[...aiLearningScreens, ...aiLearningScreens].map((screen, index) => (
                  <figure key={`${screen}-${index}`}>
                    <img src={`/assets/${screen}`} alt="NeuralFin AI 学习截图" loading="lazy" />
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section paper">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <div className="section-label">生态角色</div>
              <h2>兼具消费者网络效应与机构级重力。</h2>
            </div>
          </div>
          <div className="role-grid">
            {roles.map(([title, copy]) => (
              <article key={title}>
                <span>{title}</span>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
