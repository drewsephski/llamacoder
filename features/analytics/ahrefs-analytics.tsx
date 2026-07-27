"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  AHREFS_ANALYTICS_KEY,
  AHREFS_ANALYTICS_SCRIPT_ID,
  AHREFS_ANALYTICS_SCRIPT_URL,
  isAhrefsAnalyticsHost,
  isAhrefsAnalyticsPath,
  normalizeAnalyticsPathname,
} from "@/features/analytics/ahrefs-config";

type AhrefsAnalyticsApi = {
  sendEvent: (eventName: string) => void;
};

function getAhrefsAnalyticsApi() {
  return (
    window as typeof window & {
      AhrefsAnalytics?: AhrefsAnalyticsApi;
    }
  ).AhrefsAnalytics;
}

function getAhrefsAnalyticsScript() {
  return document.getElementById(
    AHREFS_ANALYTICS_SCRIPT_ID,
  ) as HTMLScriptElement | null;
}

export function AhrefsAnalytics() {
  const pathname = usePathname();
  const trackerRequestedRef = useRef(false);
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAhrefsAnalyticsHost(window.location.hostname)) return;

    const shouldTrack = isAhrefsAnalyticsPath(pathname);
    const existingScript = getAhrefsAnalyticsScript();
    const existingApi = getAhrefsAnalyticsApi();

    if (!shouldTrack) {
      if (trackerRequestedRef.current || existingScript || existingApi) {
        // Ahrefs installs persistent navigation and interaction listeners and
        // exposes no teardown API. Reloading at this boundary guarantees the
        // tracker cannot survive into chats, dashboards, or account routes.
        window.location.reload();
      }
      return;
    }

    trackerRequestedRef.current = true;
    const normalizedPathname = normalizeAnalyticsPathname(pathname);

    const sendPageview = () => {
      const api = getAhrefsAnalyticsApi();
      if (!api || lastTrackedPathRef.current === normalizedPathname) return;

      // Keep query strings and hashes out of the analytics payload. The Ahrefs
      // client reads this attribute each time an event is sent.
      getAhrefsAnalyticsScript()?.setAttribute(
        "data-page-location",
        normalizedPathname,
      );
      api.sendEvent("pageview");
      lastTrackedPathRef.current = normalizedPathname;
    };

    if (existingApi) {
      sendPageview();
      return;
    }

    const script = existingScript ?? document.createElement("script");
    script.id = AHREFS_ANALYTICS_SCRIPT_ID;
    script.async = true;
    script.src = AHREFS_ANALYTICS_SCRIPT_URL;
    script.setAttribute("data-key", AHREFS_ANALYTICS_KEY);
    script.setAttribute("data-no-pageview-on-load", "");
    script.setAttribute("data-no-pageview-auto", "");
    script.setAttribute("data-page-location", normalizedPathname);
    script.addEventListener("load", sendPageview, { once: true });

    if (!existingScript) document.head.appendChild(script);

    return () => script.removeEventListener("load", sendPageview);
  }, [pathname]);

  return null;
}
