"use client";

import { useEffect } from "react";
import {
  fetchTransport,
  sessionStore,
  startSiteTracking,
  type SiteLang,
  type StorePlatform,
} from "@/lib/tracking/siteEvents";

function safeSessionStorage(): Storage | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

/* apps.apple.com 对所有 iOS UA 都回 301 → itms-appss://，微信内置浏览器不跟随这个自定义
 * scheme，表现就是「点了没反应」。这是微信的平台限制，页面无法直接跳商店，只能拦下来引导
 * 用户去系统浏览器。Google Play / APK 在微信里同样打不开，一并拦。 */
const IN_APP_RE = /MicroMessenger|FBAN|FBAV|Instagram|Line\//i;

const TIP_COPY = {
  zh: {
    title: "请在浏览器中打开",
    body: "微信内无法直接跳转应用商店。请点右上角 ⋯，选择「在浏览器打开」后再下载。",
    ok: "我知道了",
  },
  en: {
    title: "Open in browser",
    body: "App stores can't open inside WeChat. Tap ⋯ at the top right and choose “Open in Browser” to download.",
    ok: "Got it",
  },
} as const;

function showInAppTip(lang: SiteLang) {
  if (document.getElementById("nf-inapp-tip")) return;
  const t = TIP_COPY[lang];

  const mask = document.createElement("div");
  mask.id = "nf-inapp-tip";
  mask.setAttribute("role", "dialog");
  mask.setAttribute("aria-modal", "true");
  mask.style.cssText =
    "position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;" +
    "padding:16px;background:rgba(0,0,0,.62)";

  const box = document.createElement("div");
  box.style.cssText =
    "width:100%;max-width:420px;border-radius:18px;padding:22px 20px 16px;background:#0f1114;color:#f6f7f9;" +
    "border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px rgba(0,0,0,.55);" +
    "font:15px/1.6 -apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif";

  const title = document.createElement("div");
  title.textContent = t.title;
  title.style.cssText = "font-size:17px;font-weight:600;margin-bottom:8px";

  const body = document.createElement("p");
  body.textContent = t.body;
  body.style.cssText = "margin:0 0 18px;color:#b9c0cb";

  const ok = document.createElement("button");
  ok.type = "button";
  ok.textContent = t.ok;
  ok.style.cssText =
    "width:100%;height:46px;border:0;border-radius:12px;background:#fff;color:#101216;font-size:15px;font-weight:600";
  ok.addEventListener("click", () => mask.remove());
  mask.addEventListener("click", (event) => {
    if (event.target === mask) mask.remove();
  });

  box.append(title, body, ok);
  mask.append(box);
  document.body.append(mask);
}

/**
 * Homepage-only tracking. Store buttons opt in with
 * `data-track-store="appstore" | "play"`; clicks are picked up by one
 * delegated listener, so the landing page stays a server component.
 */
export function SiteTracker({ lang }: { lang: SiteLang }) {
  useEffect(() => {
    let tracker: ReturnType<typeof startSiteTracking>;
    try {
      tracker = startSiteTracking(lang, {
        store: sessionStore(safeSessionStorage()),
        href: () => window.location.href,
        userAgent: navigator.userAgent,
        search: window.location.search,
        now: () => Date.now(),
        transport: fetchTransport,
      });
    } catch {
      return;
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("[data-track-store]") : null;
      const platform = target?.getAttribute("data-track-store");
      if (platform === "appstore" || platform === "play") tracker.trackStoreClick(platform satisfies StorePlatform);
      /* App 内浏览器：拦掉这次跳转，否则用户点了完全没反应 */
      if (target && IN_APP_RE.test(navigator.userAgent)) {
        event.preventDefault();
        showInAppTip(lang);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") tracker.trackLeave();
    };
    const onPageHide = () => tracker.trackLeave();

    document.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [lang]);

  return null;
}
