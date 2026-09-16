import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuralFin | AI-Native Social Trading Platform",
  description:
    "NeuralFin is a social-media-driven, next-generation TechFin platform built for mobile financial discovery, AI learning, and regulated market action.",
  // 站点自指基址:相对 OG/图片 URL 都从它派生。
  // 默认值 = 改动前原值(.ai)。只有显式传 SITE_ORIGIN 时才变 ——
  // .cn 的静态包必须自称 .cn,否则全站元数据仍指 .ai,搜索引擎把 .cn 判成副本、
  // 不予收录,ICP 就白办了;而 .ai 那条构建不传这个变量,行为逐字不变。
  metadataBase: new URL(process.env.SITE_ORIGIN ?? "https://www.neuralfin.ai"),
  openGraph: {
    title: "NeuralFin | Built for the scroll generation",
    description:
      "A next-generation TechFin platform turning mobile attention into financial learning, community intelligence, and trading-ready action.",
    images: ["/assets/neuralfin-logo-transparent-cropped.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
