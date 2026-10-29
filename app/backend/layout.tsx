import type { Metadata, Viewport } from "next";
import "./campaign.css";
import "./console-shell.css";

export const metadata: Metadata = {
  title: "NeuralFin · 数据后台",
  description: "12/one · NBTI · 八字 · ARTi 统一数据后台",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070907",
};

export default function BackendLayout({ children }: { children: React.ReactNode }) {
  return <div className="bk-root">{children}</div>;
}
