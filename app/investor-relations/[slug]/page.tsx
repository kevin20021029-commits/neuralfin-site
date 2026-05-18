import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/SiteChrome";
import { pressReleases } from "@/lib/site";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return pressReleases.map((release) => ({ slug: release.slug }));
}

export function generateMetadata({ params }: Props) {
  const release = pressReleases.find((item) => item.slug === params.slug);
  return {
    title: release ? `${release.title} | NeuralFin` : "Press Release | NeuralFin",
    description: release?.excerpt,
  };
}

export default function PressReleasePage({ params }: Props) {
  const release = pressReleases.find((item) => item.slug === params.slug);

  if (!release) notFound();

  return (
    <SiteChrome compact hideVisual langHref={`/zh/investor-relations/${release.slug}`} eyebrow="Investor Relations" title={release.title} intro={`${release.location} | ${release.date}`}>
      <section className="section paper">
        <article className="article-body">
          {release.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="article-signoff">
            <strong>Investor Relations</strong>
            <span>NeuralFin Technology</span>
            <a href="mailto:pr@neuralfin.ai">pr@neuralfin.ai</a>
          </div>
          <a className="back-link" href="/investor-relations">Back to Investor Relations</a>
        </article>
      </section>
    </SiteChrome>
  );
}
