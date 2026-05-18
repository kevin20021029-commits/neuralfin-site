import { content, Locale, partners } from "@/lib/content";

type Props = {
  locale: Locale;
};

export function NeuralFinLanding({ locale }: Props) {
  const t = content[locale];

  return (
    <>
      <nav className="site-nav" aria-label="Primary navigation">
        <div className="nav-inner">
          <a className="brand" href={`/${locale === "zh" ? "zh" : ""}`} aria-label="NeuralFin home">
            <img src="/assets/neuralfin-logo-transparent-cropped.png" alt="NeuralFin" />
          </a>
          <div className="nav-links">
            <a className="nav-link" href="#platform">{t.nav[0]}</a>
            <a className="nav-link" href="#loop">{t.nav[1]}</a>
            <a className="nav-link" href="#partners">{t.nav[2]}</a>
            <a className="nav-link" href="#contact">{t.nav[3]}</a>
            <a className="nav-link" href={t.localePath}>{t.localeLabel}</a>
            <a className="nav-link nav-cta" href="#contact">{t.ir}</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">{t.eyebrow}</div>
              <h1>
                <span className="title-line">{t.headlineTop}</span>
                <span className="title-line accent">{t.headlineAccent}</span>
              </h1>
              <p className="hero-sub">{t.subhead}</p>
              <div className="hero-actions">
                <a className="store-button" href="#platform" aria-label={t.appStoreAlt}>
                  <img src="/assets/app-store.svg" alt={t.appStoreAlt} />
                </a>
                <a className="store-button" href="#platform" aria-label={t.googlePlayAlt}>
                  <img src="/assets/google-play.svg" alt={t.googlePlayAlt} />
                </a>
              </div>
              <div className="roadshow-row" aria-label="NeuralFin investment narrative">
                {t.stats.map(([title, copy]: string[]) => (
                  <div className="roadshow-stat" key={title}>
                    <strong>{title}</strong>
                    <span>{copy}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-theater" aria-label="NeuralFin product experience">
              <div className="scroll-phone">
                <div className="scroll-window">
                  <img className="app-panorama" src="/assets/app-screens.png" alt="NeuralFin app screens" />
                </div>
                <div className="feed-stack" aria-hidden="true">
                  {["ETF pulse", "Founder analysis", "China bank watch", "AI summary", "Market scan"].map((item) => (
                    <div className="feed-card" key={item}>
                      <strong>{item}</strong>
                      <div className="feed-stat"><span /><span /><span /><span /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="floating-signal ai">
                <strong>{t.heroSignals.ai[0]}</strong>
                <p>{t.heroSignals.ai[1]}</p>
              </div>
              <div className="floating-signal market">
                <strong>{t.heroSignals.market[0]}</strong>
                <p>{t.heroSignals.market[1]}</p>
              </div>
              <div className="crawl" aria-hidden="true">
                <div className="crawl-track">
                  {["social discovery", "AI education", "market data", "community intelligence", "regulated execution", "social discovery", "AI education", "market data", "community intelligence", "regulated execution"].map((item, index) => (
                    <span key={`${item}-${index}`}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section paper" id="platform">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <div className="section-label">{t.positioning.label}</div>
                <h2>{t.positioning.title}</h2>
              </div>
              <p className="section-copy">{t.positioning.copy}</p>
            </div>
            <div className="positioning-grid">
              {t.positioning.cards.map(([kicker, title, copy]: string[]) => (
                <article className="position-card" key={kicker}>
                  <span>{kicker}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="immersive-strip" aria-label="NeuralFin platform motion">
          <div className="strip-track">
            {[...t.motion, ...t.motion].map(([title, copy]: string[], index) => (
              <div className="strip-card" key={`${title}-${index}`}>
                <strong>{title}</strong>
                <span>{copy}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section dark" id="loop">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <div className="section-label">{t.infrastructure.label}</div>
                <h2>{t.infrastructure.title}</h2>
              </div>
            </div>
            <div className="infra-grid">
              <article className="partner-feature">
                <div className="section-label">{t.infrastructure.partnerLabel}</div>
                <img src="/assets/dl-securities-logo-cropped.png" alt="DL Securities" />
                <h2>{t.infrastructure.partnerTitle}</h2>
                <p>{t.infrastructure.partnerCopy}</p>
                <div className="license-strip">
                  {t.infrastructure.tags.map((tag: string) => <span key={tag}>{tag}</span>)}
                </div>
              </article>
              <article className="loop-panel">
                <div className="section-label">{t.loop.label}</div>
                <h2>{t.loop.title}</h2>
                <div className="ai-loop">
                  <div className="loop-orbit" />
                  <div className="loop-core"><strong>NeuralFin</strong><span>learning loop</span></div>
                  {t.loop.nodes.map(([title, copy, tag]: string[], index: number) => (
                    <div className={`loop-node node-${index}`} key={title}>
                      <strong>{title}</strong>
                      <p>{copy}</p>
                      <em>{tag}</em>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section paper" id="partners">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <div className="section-label">{t.partners.label}</div>
                <h2>{t.partners.title}</h2>
              </div>
              <p className="section-copy">{t.partners.copy}</p>
            </div>
            <div className="partners-grid">
              {partners.map(([logo, name, role]) => (
                <div className="partner-cell" key={name}>
                  <div className="partner-mark"><img src={`/assets/${logo}`} alt={name} /></div>
                  <div><strong>{name}</strong><span>{role}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-inner">
            <div>
              <div className="section-label">{t.contact.label}</div>
              <h2>{t.contact.title}</h2>
              <p>{t.contact.copy}</p>
            </div>
            <div className="contact-actions">
              <a href="mailto:info@neuralfin.ai">info@neuralfin.ai</a>
              <span>{t.contact.location}</span>
              <span>{t.contact.address}</span>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>© 2026 NeuralFin Technologies. All rights reserved.</span>
        <span>{t.footer}</span>
      </footer>
    </>
  );
}
