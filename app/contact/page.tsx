import { SiteChrome } from "@/components/SiteChrome";
import { contact } from "@/lib/site";

export const metadata = {
  title: "Contact | NeuralFin",
  description: "Contact NeuralFin for platform, partnership, investor relations, and company enquiries.",
};

export default function ContactPage() {
  return (
    <SiteChrome langHref="/zh/contact" hideContact eyebrow="Contact" title="Build the next financial interface with NeuralFin." intro="For platform, partnership, investor relations, and company enquiries related to NeuralFin's AI-native social trading platform.">
      <section className="section paper">
        <div className="section-inner contact-page-grid">
          <article>
            <span>Email</span>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </article>
          <article>
            <span>Location</span>
            <strong>{contact.location}</strong>
            <p>{contact.address}</p>
          </article>
          <article>
            <span>Investor relations</span>
            <a href="mailto:pr@neuralfin.ai">pr@neuralfin.ai</a>
          </article>
        </div>
      </section>
    </SiteChrome>
  );
}
