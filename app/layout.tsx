import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ICP_COPYRIGHT_YEAR, ICP_HOLDER, ICP_LINK, ICP_SITE_NUMBER } from "@/lib/icp";

export const metadata: Metadata = {
  title: "NeuralFin | AI-Native Platform",
  description:
    "NeuralFin is a social-media-driven, next-generation TechFin platform built for mobile financial discovery and AI learning.",
  // 站点自指基址:相对 OG/图片 URL 都从它派生。
  // 默认值 = 改动前原值(.ai)。只有显式传 SITE_ORIGIN 时才变 ——
  // .cn 的静态包必须自称 .cn,否则全站元数据仍指 .ai,搜索引擎把 .cn 判成副本、
  // 不予收录,ICP 就白办了;而 .ai 那条构建不传这个变量,行为逐字不变。
  metadataBase: new URL(process.env.SITE_ORIGIN ?? "https://www.neuralfin.ai"),
  openGraph: {
    title: "NeuralFin | Built for the scroll generation",
    description:
      "A next-generation TechFin platform turning mobile attention into financial learning and community intelligence.",
    images: ["/assets/neuralfin-logo-transparent-cropped.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// ★ ICP 备案页脚只挂【大陆站(.cn)】。
// 挂载判据 = SITE_ORIGIN 是否给出，与 metadataBase 同一判据：
//   next.config.mjs 有两道互斥硬闸（STATIC_EXPORT=1 且无 SITE_ORIGIN ⇒ throw；
//   有 SITE_ORIGIN 且无 STATIC_EXPORT ⇒ throw）⇒「给了 SITE_ORIGIN」⟺「这是 .cn 静态包」，
//   没有静默路径。.ai 那条 Vercel 构建不传该变量 ⇒ 产物逐字不含本行。
// ★ 为什么挂在这里（而不是并入 NeuralFinLanding/SiteChrome 里那两个既有 footer）：
//   实测 out/404.html 里 `<footer` 出现 0 次 —— 404 页【根本没有页脚】，
//   并入那两个会漏掉 404。放在 layout 一处渲染 ⇒ 每个页面载体都覆盖到。
// ★ 为什么用 <div> 不用 <footer>：那两个既有 footer 也是 body 的直接子元素，
//   再加一个 <footer> 会出现两个 contentinfo landmark；且 globals.css 的
//   `footer` 元素选择器（L2457 起，display:grid 两栏）会外溢到本行。
const MAINLAND_SITE = Boolean(process.env.SITE_ORIGIN);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        {MAINLAND_SITE ? (
          // 依据《非经营性互联网信息服务备案管理办法》第十三条：
          // 页面底部中央标明备案编号 + 版权所有，备案编号链接到备案管理系统。
          <div className="icp-footer" lang="zh-Hans">
            <span>© {ICP_COPYRIGHT_YEAR} {ICP_HOLDER} 版权所有</span>
            <a href={ICP_LINK} target="_blank" rel="noreferrer">
              {ICP_SITE_NUMBER}
            </a>
          </div>
        ) : null}
      </body>
    </html>
  );
}
