import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/SiteChrome";
import { pressReleasesZh } from "@/lib/site";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return pressReleasesZh.map((release) => ({ slug: release.slug }));
}

export function generateMetadata({ params }: Props) {
  const release = pressReleasesZh.find((item) => item.slug === params.slug);
  return {
    title: release ? `${release.title} | NeuralFin` : "新闻公告 | NeuralFin",
    description: release?.excerpt,
    openGraph: {
      title: release ? `${release.title} | NeuralFin` : "新闻公告 | NeuralFin",
      description: release?.excerpt,
    },
    twitter: {
      title: release ? `${release.title} | NeuralFin` : "新闻公告 | NeuralFin",
      description: release?.excerpt,
    },
  };
}

export default function PressReleaseZhPage({ params }: Props) {
  const release = pressReleasesZh.find((item) => item.slug === params.slug);

  if (!release) notFound();

  return (
    <SiteChrome
      locale="zh"
      langHref={`/investor-relations/${release.slug}`}
      compact
      hideVisual
      eyebrow="投资者关系"
      title={release.title}
      intro={`${release.location} | ${release.date}`}
    >
      <section className="section paper">
        <article className="article-body">
          {release.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="article-signoff">
            <strong>投资者关系</strong>
            <span>NeuralFin Technology</span>
            <a href="mailto:pr@neuralfin.ai">pr@neuralfin.ai</a>
          </div>
          <a className="back-link" href="/zh/investor-relations">返回投资者关系</a>
        </article>
      </section>
    </SiteChrome>
  );
}
