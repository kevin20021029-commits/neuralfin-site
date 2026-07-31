import { ScrollCalculator } from "@/components/scroll/ScrollCalculator";
import "./scroll.css";

export const metadata = {
  metadataBase: new URL("https://www.neuralfin.ai"),
  title: "Your Scroll Has a P&L | NeuralFin",
  description: "Audit your daily screen time, see your scroll P&L, and flip ten minutes a day into financial learning.",
  alternates: {
    canonical: "https://www.neuralfin.ai/scroll",
  },
  openGraph: {
    title: "Your Scroll Has a P&L | NeuralFin",
    description: "Audit your daily screen time and turn scroll into skill.",
    url: "https://www.neuralfin.ai/scroll",
    // 1200x630 is what every platform crops to. The previous image was the
    // 731x300 logo, which letterboxed badly on the exact surface this
    // campaign spreads through. Regenerate via `npm run og:render`.
    images: [{ url: "/assets/scroll-og.png", width: 1200, height: 630, alt: "Your scroll has a P&L — NeuralFin scroll audit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Scroll Has a P&L | NeuralFin",
    description: "Audit your daily screen time and turn scroll into skill.",
    images: ["/assets/scroll-og.png"],
  },
  other: {
    "apple-itunes-app": "app-id=6751037382, app-argument=https://www.neuralfin.ai/scroll",
  },
};

export default function ScrollPage() {
  return <ScrollCalculator />;
}
