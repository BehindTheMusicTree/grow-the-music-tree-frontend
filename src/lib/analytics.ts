export type AnalyticsEvent = "genre_select" | "track_play" | "tipeee_click";

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (name: string, data?: EventData) => void };
  }
}

export const ANALYTICS_OPT_OUT_KEY = "umami.disabled";

export function trackEvent(name: AnalyticsEvent, data?: EventData): void {
  if (typeof window === "undefined") return;
  window.umami?.track(name, data);
}
