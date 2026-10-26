"use client";

import { useEffect } from "react";
import Script from "next/script";
import { publicEnv } from "@lib/env";
import { ANALYTICS_OPT_OUT_KEY } from "@lib/analytics";
import { useIsAdmin } from "@hooks/useIsAdmin";

export default function Analytics() {
  const isAdmin = useIsAdmin();
  const websiteId = publicEnv.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  useEffect(() => {
    if (!isAdmin) return;
    try {
      window.localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "1");
    } catch {
      // storage unavailable (private mode): admin visits are tracked, which is acceptable
    }
  }, [isAdmin]);

  if (!websiteId) return null;

  return <Script src="/stats/script.js" data-website-id={websiteId} data-host-url="/stats" strategy="afterInteractive" />;
}
