import { SiteChrome } from "@/components/SiteChrome";

export const metadata = {
  title: "隐私政策 | NeuralFin",
  description: "NeuralFin 隐私政策。",
  openGraph: {
    title: "隐私政策 | NeuralFin",
    description: "NeuralFin 隐私政策。",
  },
  twitter: {
    title: "隐私政策 | NeuralFin",
    description: "NeuralFin 隐私政策。",
  },
};

export default function PrivacyPolicyZhPage() {
  return (
    <SiteChrome locale="zh" langHref="/privacy-policy" compact eyebrow="法律" title="隐私政策">
      <section className="section paper">
        <article className="article-body">
          <p>NeuralFin 尊重用户隐私，并会结合适用的数据保护及金融服务相关要求处理信息。</p>
          <p>当访客联系 NeuralFin 时，本网站可能会收集基本技术信息、咨询内容及沟通记录。相关信息用于回应咨询、运营网站，并支持业务、合规及安全需求。</p>
          <p>如有隐私相关问题，请联系 <a href="mailto:info@neuralfin.ai">info@neuralfin.ai</a>。</p>
        </article>
      </section>
    </SiteChrome>
  );
}
