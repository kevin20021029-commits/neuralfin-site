import { SiteChrome } from "@/components/SiteChrome";
import { pressReleasesZh } from "@/lib/site";

export const metadata = {
  title: "投资者关系 | NeuralFin",
  description: "NeuralFin 投资者关系与新闻公告。",
  openGraph: {
    title: "投资者关系 | NeuralFin",
    description: "NeuralFin 公司动态、融资里程碑与新闻公告。",
  },
  twitter: {
    title: "投资者关系 | NeuralFin",
    description: "NeuralFin 公司动态、融资里程碑与新闻公告。",
  },
};

export default function InvestorRelationsZhPage() {
  return (
    <SiteChrome
      locale="zh"
      langHref="/investor-relations"
      hideVisual
      eyebrow="投资者关系"
      title="投资者关系"
      intro={<>NeuralFin 的公司动态、融资里程碑与新闻公告。公司正在为<span className="accent-inline prose">刷屏一代</span>构建 AI 原生金融平台。</>}
    >
      <section className="section paper">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <div className="section-label">新闻公告</div>
              <h2>最新公司公告。</h2>
            </div>
          </div>
          <div className="press-list">
            {pressReleasesZh.map((release) => (
              <a className="press-card" href={`/zh/investor-relations/${release.slug}`} key={release.slug}>
                <span>{release.location} | {release.date}</span>
                <strong>{release.title}</strong>
                <p>{release.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
