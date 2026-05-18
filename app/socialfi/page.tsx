import { SiteChrome } from "@/components/SiteChrome";
import { aiLearningScreens, behaviorLoop, communityScreens } from "@/lib/site";

export const metadata = {
  title: "SocialFi | NeuralFin",
  description: "NeuralFin's SocialFi layer turns financial content, creators, institutions, AI, and community signal into a compounding network.",
};

const roles = [
  ["Investors", "Scroll, learn, follow, discuss, save, and act."],
  ["Creators", "Build audience around market expertise and financial education."],
  ["Institutions", "Distribute research, products, events, and capital-markets context."],
  ["AI layer", "Compresses signals into daily financial intelligence."],
] as const;

export default function SocialFiPage() {
  return (
    <SiteChrome
      eyebrow="SocialFi"
      title={<>Where social<br className="mobile-break" /> discovery<br className="mobile-break" /> becomes market participation.</>}
      intro={<>NeuralFin is designed as a financial network for the <span className="accent-inline prose">scroll generation</span>: content, community, AI learning, and trading-ready action operating inside one compounding loop.</>}
      langHref="/zh/socialfi"
      visual="community"
      hideContact
    >
      <section className="section paper network-section">
        <div className="section-inner socialfi-stage">
          <div className="network-flywheel" aria-label="SocialFi network effects loop">
            <div className="network-flow-core">
              <span>SocialFi</span>
              <strong>Attention compounds into action.</strong>
            </div>
            {[
              ["More users", "More daily financial attention enters the network."],
              ["More content", "Creators and institutions add market context."],
              ["More learning", "AI compresses the feed into usable intelligence."],
              ["More action", "Confidence moves users toward regulated participation."],
            ].map(([title, tag], index) => (
              <div className={`flywheel-node flywheel-${index}`} key={title}>
                <strong>{title}</strong>
                <span>{tag}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="section-label">Network effects</div>
            <h2>The financial feed gets smarter as the network grows.</h2>
            <p className="large-copy">The SocialFi layer is the strategic moat: attention creates content, content creates learning, learning creates confidence, and confidence creates action.</p>
            <div className="loop-equation" aria-label="Network effects equation">
              {["Users", "Content", "Learning", "Action"].map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section dark community-engine">
        <div className="section-inner community-engine-grid">
          <div>
            <div className="section-label">Community product</div>
            <h2>Community, participation, and creator context in motion.</h2>
            <p className="section-copy">The point system and community screens work together: users learn in public, follow market conversations, and see progress as they participate.</p>
          </div>
          <div className="community-motion" aria-label="NeuralFin community and points product screenshots">
            <div className="motion-track">
              {[...communityScreens, "point-system.jpg", ...communityScreens].map((screen, index) => (
                <figure key={`${screen}-${index}`}>
                  <img src={`/assets/${screen}`} alt="NeuralFin community product screenshot" loading="lazy" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section paper" id="ai-loop">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <div className="section-label">AI loop</div>
              <h2>The AI loop underpins the entire SocialFi thesis.</h2>
            </div>
            <p className="section-copy">Our AI acts as the intelligence layer that transforms content, community, and market data into daily financial insight.</p>
          </div>
          <div className="ai-command-center">
            <div className="ai-loop-stack">
              {behaviorLoop.map(([title, copy]) => (
                <article key={title}>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
            <div className="ai-screen-stage" aria-label="NeuralFin AI learning screenshot gallery">
              <div className="ai-gallery-track">
                {[...aiLearningScreens, ...aiLearningScreens].map((screen, index) => (
                  <figure key={`${screen}-${index}`}>
                    <img src={`/assets/${screen}`} alt="NeuralFin AI learning screenshot" loading="lazy" />
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section paper">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <div className="section-label">Ecosystem roles</div>
              <h2>A consumer network with institutional gravity.</h2>
            </div>
          </div>
          <div className="role-grid">
            {roles.map(([title, copy]) => (
              <article key={title}>
                <span>{title}</span>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
