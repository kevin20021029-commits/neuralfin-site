import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuralFin | AI-Native Social Trading Platform",
  description:
    "NeuralFin is a social-media-driven, next-generation TechFin platform built for mobile financial discovery, AI learning, and regulated market action.",
  metadataBase: new URL("https://www.neuralfintech.ai"),
  openGraph: {
    title: "NeuralFin | Built for the scroll generation",
    description:
      "A next-generation TechFin platform turning mobile attention into financial learning, community intelligence, and trading-ready action.",
    images: ["/assets/neuralfin-logo-transparent-cropped.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
