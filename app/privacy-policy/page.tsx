import { SiteChrome } from "@/components/SiteChrome";

export const metadata = {
  title: "Privacy Policy | NeuralFin",
};

export default function PrivacyPolicyPage() {
  return (
    <SiteChrome langHref="/zh/privacy-policy" compact eyebrow="Legal" title="Privacy Policy">
      <section className="section paper">
        <article className="article-body">
          <p>NeuralFin respects user privacy and handles information in connection with applicable data protection and financial services requirements.</p>
          <p>This website may collect basic technical information, enquiry details, and communication records when visitors contact NeuralFin. Such information is used to respond to enquiries, operate the website, and support business, compliance, and security needs.</p>
          <p>For privacy questions, contact <a href="mailto:info@neuralfin.ai">info@neuralfin.ai</a>.</p>
        </article>
      </section>
    </SiteChrome>
  );
}
