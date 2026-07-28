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
    images: ["/assets/neuralfin-logo-transparent-cropped.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Scroll Has a P&L | NeuralFin",
    description: "Audit your daily screen time and turn scroll into skill.",
    images: ["/assets/neuralfin-logo-transparent-cropped.png"],
  },
  other: {
    "apple-itunes-app": "app-id=6751037382, app-argument=https://www.neuralfin.ai/scroll",
  },
};

export default function ScrollPage() {
  return <ScrollCalculator />;
}
