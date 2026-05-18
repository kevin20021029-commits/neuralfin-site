import { content, Locale, partners } from "@/lib/content";
import { appLinks, companyFacts, companyFactsZh, homeScreens, milestones, milestonesZh, siteNav, siteNavZh } from "@/lib/site";

type Props = {
  locale: Locale;
};

export function NeuralFinLanding({ locale }: Props) {
  const t = content[locale];
  const facts = locale === "zh" ? companyFactsZh : companyFacts;
  const timelineItems = locale === "zh" ? milestonesZh : milestones;
  const partnerRolesZh = ["生态合作伙伴", "生态合作伙伴", "生态合作伙伴", "交易合作伙伴"];
  const feedLabels = locale === "zh"
    ? ["ETF 脉冲", "创始人分析", "中资银行观察", "AI 摘要", "市场扫描"]
    : ["ETF pulse", "Founder analysis", "China bank watch", "AI summary", "Market scan"];
  const pulseLabels = locale === "zh"
    ? ["社区智能", "受监管执行", "注意力到行动"]
    : ["community intelligence", "regulated execution", "attention to action"];

  return (
    <>
      <nav className="site-nav" aria-label="Primary navigation">
        <div className="nav-inner">
          <a className="brand" href={`/${locale === "zh" ? "zh" : ""}`} aria-label="NeuralFin home">
            <img src="/assets/neuralfin-logo-transparent-cropped.png" alt="NeuralFin" />
          </a>
          <div className="nav-links">
            {locale === "en" ? (
              siteNav.map(([label, href]) => (
                <a className="nav-link" href={href} key={href}>{label}</a>
              ))
            ) : (
              siteNavZh.map(([label, href]) => (
                <a className="nav-link" href={href} key={href}>{label}</a>
              ))
            )}
            <a className="nav-link" href={t.localePath}>{t.localeLabel}</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">{t.eyebrow}</div>
              <h1>
                {locale === "zh" ? (
                  <span className="title-line accent">为滑屏一代而生</span>
                ) : (
                  <>
                    <span className="title-line">{t.headlineTop}</span>
                    <span className="title-line accent">{t.headlineAccent}</span>
                  </>
                )}
              </h1>
              <p className="hero-sub">
                {locale === "en" ? (
                  <>NeuralFin is a social-media-driven, next-generation <span className="accent-inline prose">TechFin</span> platform designed to transform daily mobile habits into powerful opportunities for growth and wealth accumulation.</>
                ) : t.subhead}
              </p>
              <div className="hero-actions">
                <a className="store-button" href={appLinks.appStore} aria-label={t.appStoreAlt} target="_blank" rel="noreferrer">
                  <img src="/assets/app-store.svg" alt={t.appStoreAlt} />
                </a>
                <a className="store-button" href={appLinks.googlePlay} aria-label={t.googlePlayAlt} target="_blank" rel="noreferrer">
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
                <div className="scroll-window product-stack-window">
                  <div className="hero-screen-strip">
                    {homeScreens.map((screen, index) => (
                      <img src={`/assets/${screen}`} alt={`NeuralFin home screen ${index + 1}`} key={screen} />
                    ))}
                  </div>
                </div>
                <div className="feed-stack" aria-hidden="true">
                  {feedLabels.map((item) => (
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
              <div className="product-pulse-row" aria-hidden="true">
                {pulseLabels.map((item) => (
                  <span key={item}>{item}</span>
                ))}
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
                <div className="partner-logo-plaque">
                  <img src="/assets/dl-securities-logo-cropped.png" alt="DL Securities" />
                </div>
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
                  <div className="loop-core"><strong>NeuralFin</strong><span>{locale === "zh" ? "学习闭环" : "learning loop"}</span></div>
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
              {partners.map(([logo, name, role], index) => (
                <div className="partner-cell" key={name}>
                  <div className="partner-mark"><img src={`/assets/${logo}`} alt={name} /></div>
                  <div><strong>{name}</strong><span>{locale === "zh" ? partnerRolesZh[index] : role}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section dark company-merge" id="company">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <div className="section-label">{locale === "zh" ? "公司" : "Company"}</div>
                <h2>{locale === "zh" ? <>为<span className="accent-inline">滑屏一代</span>构建 AI 驱动的金融社区生态系统。</> : <>Building the AI-powered financial community ecosystem for the <span className="accent-inline">scroll generation.</span></>}</h2>
              </div>
              <p className="section-copy">
                {locale === "zh" ? "NeuralFin 通过教育与技术推动投资普惠，降低理解市场与参与市场的门槛，让更多人能够更有信心地做出知情决策。" : "NeuralFin exists to democratize investing through education and technology, lowering barriers so more people can understand markets, participate confidently, and make informed decisions."}
              </p>
            </div>
            <div className="company-proof-grid">
              {facts.map(([title, copy]) => (
                <article key={title}>
                  <span>{title}</span>
                  <strong>{copy}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section paper" id="milestones">
          <div className="section-inner">
            <div className="section-head">
              <div>
                <div className="section-label">{locale === "zh" ? "里程碑" : "Milestones"}</div>
                <h2>{locale === "zh" ? "以速度、融资纪律与资本市场愿景推进建设。" : "Built with velocity, financing discipline, and public-market ambition."}</h2>
              </div>
            </div>
            <div className="timeline">
              {timelineItems.map(([date, copy]) => (
                <article className="timeline-item paper-timeline-item" key={date}>
                  <strong>{date}</strong>
                  <p>{copy}</p>
                </article>
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
        <span>{locale === "zh" ? "© 2026 NeuralFin Technologies. 版权所有。" : "© 2026 NeuralFin Technologies. All rights reserved."}</span>
        <span>{t.footer}</span>
      </footer>
    </>
  );
}
