"use client";

import { useEffect } from "react";
import {
  fetchTransport,
  sessionStore,
  startSiteTracking,
  trackStoreAttribute,
  type SiteLang,
} from "@/lib/tracking/siteEvents";

function safeSessionStorage(): Storage | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

/**
 * Homepage-only tracking. Store buttons opt in with a `data-track-store`
 * attribute holding one of STORE_PLATFORMS (appstore / play / apk); clicks are
 * picked up by one delegated listener, so the landing page stays a server
 * component.
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
      trackStoreAttribute(target?.getAttribute("data-track-store") ?? null, tracker);
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
