import type { ReactNode } from "react";
import { aiLearningScreens, communityScreens, contact, contactZh, homeScreens, marketScreens, siteNav, siteNavZh } from "@/lib/site";

type Props = {
  children: ReactNode;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  compact?: boolean;
  hideContact?: boolean;
  hideVisual?: boolean;
  langHref?: string;
  locale?: "en" | "zh";
  visual?: "home" | "community" | "market";
};

const visualScreens = {
  home: [homeScreens[0], homeScreens[1], homeScreens[2], aiLearningScreens[0]],
  community: [communityScreens[0], communityScreens[1], communityScreens[2], "point-system.jpg"],
  market: [marketScreens[0], marketScreens[1], marketScreens[3], marketScreens[6]],
} as const;

const visualLabels = {
  home: ["Founder analysis", "AI summary", "attention to action"],
  community: ["Creator thread", "AI learning", "community signal"],
  market: ["Watchlist pulse", "Risk reviewed", "regulated action"],
} as const;

const visualLabelsZh = {
  home: ["创始人分析", "AI 摘要", "注意力到行动"],
  community: ["创作者内容", "AI 学习", "社区信号"],
  market: ["自选股脉冲", "风险已审阅", "受监管行动"],
} as const;

export function SiteChrome({ children, eyebrow, title, intro, compact = false, hideContact = false, hideVisual = false, langHref, locale = "en", visual = "home" }: Props) {
  const labels = locale === "zh" ? visualLabelsZh[visual] : visualLabels[visual];
  const heroClassName = `${compact ? "subpage-hero compact" : "subpage-hero"} visual-${visual}-hero${hideVisual ? " no-visual" : ""}`;
  const navItems = locale === "zh" ? siteNavZh : siteNav;
  const contactContent = locale === "zh" ? contactZh : contact;
  const languageHref = langHref ?? (locale === "zh" ? "/" : "/zh");
  const metricSaves = locale === "zh" ? "12.8K 次收藏" : "12.8K saves";
  const metricRisks = locale === "zh" ? "3 个关键风险" : "3 key risks";
  const footerCopyright = locale === "zh" ? "© 2026 NeuralFin Technologies. 版权所有。" : "© 2026 NeuralFin Technologies. All rights reserved.";

  return (
    <>
      <nav className="site-nav" aria-label="Primary navigation">
        <div className="nav-inner">
          <a className="brand" href={locale === "zh" ? "/zh" : "/"} aria-label="NeuralFin home">
            <img src="/assets/neuralfin-logo-transparent-cropped.png" alt="NeuralFin" />
          </a>
          <div className="nav-links">
            {navItems.map(([label, href]) => (
              <a className="nav-link" href={href} key={href}>
                {label}
              </a>
            ))}
            <a className="nav-link" href={languageHref}>{locale === "zh" ? "EN" : "中文"}</a>
          </div>
        </div>
      </nav>

      <main>
        {title ? (
          <section className={heroClassName}>
            <div className="subpage-hero-inner">
              <div className="subpage-copy">
                {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
                <h1>{title}</h1>
                {intro ? <p>{intro}</p> : null}
              </div>
              {hideVisual ? null : (
                <div className={`signal-board product-signal-board visual-${visual}`} aria-hidden="true">
                  <div className="hero-device-stage">
                    {visualScreens[visual].map((screen, index) => (
                      <figure className={`hero-device device-${index}`} key={screen}>
                        <img src={`/assets/${screen}`} alt="" />
                      </figure>
                    ))}
                  </div>
                  <div className="creator-card creator-one">
                    <strong>{labels[0]}</strong>
                    <span>{metricSaves}</span>
                  </div>
                  <div className="creator-card creator-two">
                    <strong>{labels[1]}</strong>
                    <span>{metricRisks}</span>
                  </div>
                  <div className="signal-readout">
                    <strong>NeuralFin</strong>
                    <span>{labels[2]}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : null}
        {children}
      </main>

      {hideContact ? null : (
        <section className="contact" id="contact">
          <div className="contact-inner">
            <div>
              <div className="section-label">{locale === "zh" ? "联系我们" : "Contact us"}</div>
              <h2>{locale === "zh" ? "与 NeuralFin 一起构建下一代金融界面。" : "Build the next financial interface with NeuralFin."}</h2>
              <p>{locale === "zh" ? "适用于平台、合作、投资者关系及公司相关咨询。" : "For platform, partnership, investor relations, and company enquiries."}</p>
            </div>
            <div className="contact-actions">
              <a href={`mailto:${contactContent.email}`}>{contactContent.email}</a>
              <span>{contactContent.location}</span>
              <span>{contactContent.address}</span>
            </div>
          </div>
        </section>
      )}

      <footer>
        <span>{footerCopyright}</span>
        <span>{locale === "zh" ? "本网站信息仅供一般参考，不构成金融建议。对于任何错误或遗漏，我们不承担责任。" : "Information on this site is for general purposes only and not financial advice. We disclaim liability for any errors or omissions."}</span>
      </footer>
    </>
  );
}
