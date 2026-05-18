import { SiteChrome } from "@/components/SiteChrome";
import { marketScreens } from "@/lib/site";

export const metadata = {
  title: "Trading | NeuralFin",
  description: "NeuralFin connects social discovery and AI learning to trading-ready infrastructure through DL Securities.",
};

const layers = [
  ["Account layer", "Eligible users connect through licensed trading infrastructure."],
  ["Market layer", "Product surfaces keep market data, watchlists, and education close together."],
  ["Compliance layer", "Execution workflows are grounded in regulated partner infrastructure."],
  ["Action layer", "Users can move from insight to participation when ready."],
] as const;

export default function TradingPage() {
  return (
    <SiteChrome
      eyebrow="Trading"
      title="From attention to regulated market action."
      intro="NeuralFin's product journey is built to keep discovery, education, community context, and trading-ready infrastructure inside one financial experience."
      langHref="/zh/trading"
      visual="market"
      hideContact
    >
      <section className="section dark">
        <div className="section-inner trading-terminal">
          <div>
            <div className="section-label">Trading partner</div>
            <h2>DL Securities infrastructure underneath the NeuralFin product layer.</h2>
            <p>NeuralFin has integrated the trading platform of DL Securities (Hong Kong) Limited, a licensed corporation regulated by the Securities and Futures Commission (SFC) of Hong Kong.</p>
            <div className="license-strip">
              {["SFC regulated", "Hong Kong licensed corporation", "Integrated trading platform"].map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
          <div className="execution-architecture-panel">
              <div className="section-label">Execution architecture</div>
              <h2>Consumer-grade product experience, serious market infrastructure.</h2>
            <div className="execution-flow">
              {layers.map(([title, copy], index) => (
                <article className="execution-node" key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="section-inner">
          <div className="section-head">
            <div>
              <div className="section-label">Market product</div>
              <h2>Market screens built for watchlists, quotes, charts, and trading-ready context.</h2>
            </div>
          </div>
          <div className="moving-gallery dark-moving-gallery compact-product-gallery" aria-label="Animated NeuralFin market screenshots">
            <div className="gallery-track reverse-track">
              {[...marketScreens, ...marketScreens].map((screen, index) => (
                <figure key={`${screen}-${index}`}>
                  <img src={`/assets/${screen}`} alt="NeuralFin market screenshot" loading="lazy" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
