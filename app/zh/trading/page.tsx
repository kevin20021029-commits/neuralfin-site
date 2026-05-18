import { SiteChrome } from "@/components/SiteChrome";
import { marketScreens } from "@/lib/site";

export const metadata = {
  title: "交易 | NeuralFin",
  description: "NeuralFin 通过德林证券将社交发现与 AI 学习连接到交易就绪的基础设施。",
  openGraph: {
    title: "交易 | NeuralFin",
    description: "从注意力、学习与社区洞察走向受监管市场行动。",
  },
  twitter: {
    title: "交易 | NeuralFin",
    description: "从注意力、学习与社区洞察走向受监管市场行动。",
  },
};

const layers = [
  ["账户层", "合资格用户通过持牌交易基础设施接入。"],
  ["市场层", "产品界面将市场数据、自选股与教育内容放在同一场景。"],
  ["合规层", "执行流程建立在受监管合作伙伴基础设施之上。"],
  ["行动层", "用户可在准备好时从洞察走向市场参与。"],
] as const;

export default function TradingZhPage() {
  return (
    <SiteChrome
      locale="zh"
      langHref="/trading"
      hideContact
      eyebrow="交易"
      title="从注意力到受监管市场行动。"
      intro="NeuralFin 的产品旅程将发现、教育、社区洞察与交易就绪的基础设施整合进同一个金融体验。"
      visual="market"
    >
      <section className="section dark">
        <div className="section-inner trading-terminal">
          <div>
            <div className="section-label">交易合作伙伴</div>
            <h2>德林证券基础设施支撑 NeuralFin 产品层。</h2>
            <p>NeuralFin 已接入德林证券（香港）有限公司的交易平台。德林证券为受香港证券及期货事务监察委员会（SFC）监管的持牌法团。</p>
            <div className="license-strip">
              {["受 SFC 监管", "香港持牌法团", "已接入交易平台"].map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
          <div className="execution-architecture-panel">
            <div className="section-label">执行架构</div>
            <h2>消费级产品体验，严肃的市场基础设施。</h2>
            <div className="execution-flow">
              {layers.map(([title, copy], index) => (
                <article className="execution-node" key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <div className="section-label">市场产品</div>
              <h2>面向自选股、报价、图表与交易决策的市场界面。</h2>
            </div>
          </div>
          <div className="moving-gallery dark-moving-gallery" aria-label="NeuralFin 市场截图">
            <div className="gallery-track reverse-track">
              {[...marketScreens, ...marketScreens].map((screen, index) => (
                <figure key={`${screen}-${index}`}>
                  <img src={`/assets/${screen}`} alt="NeuralFin 市场截图" loading="lazy" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
