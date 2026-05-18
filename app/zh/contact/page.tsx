import { SiteChrome } from "@/components/SiteChrome";
import { contactZh } from "@/lib/site";

export const metadata = {
  title: "联系 | NeuralFin",
  description: "联系 NeuralFin，咨询平台、合作、投资者关系及公司相关事宜。",
  openGraph: {
    title: "联系 | NeuralFin",
    description: "联系 NeuralFin，咨询平台、合作、投资者关系及公司相关事宜。",
  },
  twitter: {
    title: "联系 | NeuralFin",
    description: "联系 NeuralFin，咨询平台、合作、投资者关系及公司相关事宜。",
  },
};

export default function ContactZhPage() {
  return (
    <SiteChrome
      locale="zh"
      langHref="/contact"
      hideContact
      eyebrow="联系"
      title="与我们一起构建下一代金融界面。"
      intro="适用于 NeuralFin AI 原生社交交易平台相关的平台、合作、投资者关系及公司咨询。"
    >
      <section className="section paper">
        <div className="section-inner contact-page-grid">
          <article>
            <span>邮箱</span>
            <a href={`mailto:${contactZh.email}`}>{contactZh.email}</a>
          </article>
          <article>
            <span>地点</span>
            <strong>{contactZh.location}</strong>
            <p>{contactZh.address}</p>
          </article>
          <article>
            <span>投资者关系</span>
            <a href="mailto:pr@neuralfin.ai">pr@neuralfin.ai</a>
          </article>
        </div>
      </section>
    </SiteChrome>
  );
}
