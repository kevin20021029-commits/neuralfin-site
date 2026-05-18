import { SiteChrome } from "@/components/SiteChrome";
import { homeScreens, marketScreens } from "@/lib/site";

export const metadata = {
  title: "Platform | NeuralFin",
  description: "The NeuralFin platform connects social discovery, AI learning, community context, and trading-ready action.",
};

const pillars = [
  ["Content-first investing", "Follow peers, professionals and institutions. Absorb high-signal insights efficiently."],
  ["Community-powered learning", "Investing becomes collaborative, not isolated."],
  ["Seamless transition to action", "When users are ready, they can move from learning to execution without friction."],
] as const;

const journeys = [
  ["Scroll", "Daily mobile attention becomes a financial learning surface."],
  ["Learn", "AI-enabled tools compress market content into usable education."],
  ["Discuss", "Community context helps investors compare ideas and understand risk."],
  ["Act", "Integrated regulated trading infrastructure closes the loop."],
] as const;

export default function PlatformPage() {
  return (
    <SiteChrome
      eyebrow="Platform"
      title={<>The consumer finance interface for the <span className="accent-inline">scroll generation.</span></>}
      intro="NeuralFin turns micro scrolling into micro learning, and micro spending into micro investing, bridging financial content, education, social context, and real investing."
      langHref="/zh/platform"
      hideContact
    >
      <section className="section paper">
        <div className="section-inner product-surface-band">
          <div className="section-head">
            <div>
              <div className="section-label">Product surface</div>
              <h2>One AI-native mobile loop for discovery, education, and market action.</h2>
            </div>
            <p className="section-copy">The platform is designed around the behavior users already have: scrolling, following, discussing, saving, and acting when conviction forms.</p>
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
            <div className="moving-gallery light-moving-gallery compact-product-gallery" aria-label="Animated NeuralFin product screenshots">
              <div className="gallery-track">
                {[...homeScreens, ...marketScreens.slice(0, 4), ...homeScreens, ...marketScreens.slice(0, 4)].map((screen, index) => (
                  <figure key={`${screen}-${index}`}>
                    <img src={`/assets/${screen}`} alt="NeuralFin app screenshot" loading="lazy" />
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
              <div className="section-label">User journey</div>
              <h2>From feed behavior to financial intelligence.</h2>
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
