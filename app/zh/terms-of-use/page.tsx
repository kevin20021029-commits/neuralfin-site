import { SiteChrome } from "@/components/SiteChrome";

export const metadata = {
  title: "使用条款 | NeuralFin",
  description: "NeuralFin 使用条款。",
  openGraph: {
    title: "使用条款 | NeuralFin",
    description: "NeuralFin 使用条款。",
  },
  twitter: {
    title: "使用条款 | NeuralFin",
    description: "NeuralFin 使用条款。",
  },
};

export default function TermsOfUseZhPage() {
  return (
    <SiteChrome locale="zh" langHref="/terms-of-use" compact eyebrow="法律" title="使用条款">
      <section className="section paper">
        <article className="article-body">
          <p>本网站所载信息仅供一般参考，不构成投资、金融、法律、税务或其他专业建议。</p>
          <p>NeuralFin 不保证网站信息的准确性、完整性或及时性，并在法律允许的最大范围内不对任何错误或遗漏承担责任。</p>
          <p>访客应自行对其决策负责，并在根据本网站任何信息采取行动前，咨询具备资格的专业人士。</p>
        </article>
      </section>
    </SiteChrome>
  );
}
