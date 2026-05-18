import { SiteChrome } from "@/components/SiteChrome";

export const metadata = {
  title: "Terms of Use | NeuralFin",
};

export default function TermsOfUsePage() {
  return (
    <SiteChrome langHref="/zh/terms-of-use" compact eyebrow="Legal" title="Terms of Use">
      <section className="section paper">
        <article className="article-body">
          <p>The information on this website is provided for general information only and does not constitute investment, financial, legal, tax, or other professional advice.</p>
          <p>NeuralFin does not guarantee the accuracy, completeness, or timeliness of website information and disclaims liability for any errors or omissions to the fullest extent permitted by law.</p>
          <p>Visitors are responsible for their own decisions and should seek advice from qualified professionals before acting on any information presented here.</p>
        </article>
      </section>
    </SiteChrome>
  );
}
