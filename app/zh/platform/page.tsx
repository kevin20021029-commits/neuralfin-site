import { SiteChrome } from "@/components/SiteChrome";
import { homeScreens, marketScreens } from "@/lib/site";

export const metadata = {
  title: "平台 | NeuralFin",
  description: "NeuralFin 平台连接社交发现、AI 学习、社区信号与交易就绪的行动路径。",
  openGraph: {
    title: "平台 | NeuralFin",
    description: "面向滑屏一代的消费金融界面，连接社交发现、AI 学习与市场行动。",
  },
  twitter: {
    title: "平台 | NeuralFin",
    description: "面向滑屏一代的消费金融界面，连接社交发现、AI 学习与市场行动。",
  },
};

const pillars = [
  ["内容优先的投资入口", "关注专业人士与机构观点，高效吸收高信号金融内容。"],
  ["社区驱动的学习", "让投资学习从孤立行为变成协作式理解与讨论。"],
  ["无缝走向行动", "当用户形成判断后，可顺畅进入交易与执行场景。"],
] as const;

const journeys = [
  ["滑屏", "日常移动端注意力成为金融学习界面。"],
  ["学习", "AI 工具将市场内容压缩为可理解的金融教育。"],
  ["讨论", "社区洞察帮助用户比较观点、理解风险。"],
  ["行动", "接入受监管交易基础设施，完成从洞察到行动的闭环。"],
] as const;

export default function PlatformZhPage() {
  return (
    <SiteChrome
      locale="zh"
      langHref="/platform"
      hideContact
      eyebrow="平台"
      title={<>面向<span className="accent-inline">滑屏一代</span>的消费金融界面。</>}
      intro="NeuralFin 将微滑屏转化为微学习，将日常金融注意力转化为真实投资理解，连接金融内容、教育、社交洞察与实际投资。"
    >
      <section className="section paper">
        <div className="section-inner product-surface-band">
          <div className="section-head">
            <div>
              <div className="section-label">产品界面</div>
              <h2>一个面向发现、教育与市场行动的 AI 原生移动闭环。</h2>
            </div>
            <p className="section-copy">平台围绕用户已经形成的行为设计：滑屏、关注、讨论、收藏，并在形成判断时进入行动。</p>
          </div>
          <div className="surface-product-row">
            <div className="surface-proof-grid">
              {pillars.map(([title, copy]) => (
                <article key={title}>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
            <div className="moving-gallery light-moving-gallery compact-product-gallery" aria-label="NeuralFin 产品截图">
              <div className="gallery-track">
                {[...homeScreens, ...marketScreens.slice(0, 4), ...homeScreens, ...marketScreens.slice(0, 4)].map((screen, index) => (
                  <figure key={`${screen}-${index}`}>
                    <img src={`/assets/${screen}`} alt="NeuralFin 应用截图" loading="lazy" />
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <div className="section-label">用户旅程</div>
              <h2>从信息流行为到金融智能。</h2>
            </div>
          </div>
          <div className="journey-grid">
            {journeys.map(([title, copy], index) => (
              <article className="journey-step" key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{title}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
