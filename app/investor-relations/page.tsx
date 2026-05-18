import { SiteChrome } from "@/components/SiteChrome";
import { pressReleases } from "@/lib/site";

export const metadata = {
  title: "Investor Relations | NeuralFin",
  description: "NeuralFin investor relations and press releases.",
};

export default function InvestorRelationsPage() {
  return (
    <SiteChrome langHref="/zh/investor-relations" hideVisual eyebrow="Investor Relations" title="Investor Relations" intro={<>Company updates, financing milestones, and press releases from NeuralFin Technology as it builds the AI-native financial platform for the <span className="accent-inline prose">scroll generation.</span></>}>
      <section className="section paper">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <div className="section-label">Press releases</div>
              <h2>Latest company announcements.</h2>
            </div>
          </div>
          <div className="press-list">
            {pressReleases.map((release) => (
              <a className="press-card" href={`/investor-relations/${release.slug}`} key={release.slug}>
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
