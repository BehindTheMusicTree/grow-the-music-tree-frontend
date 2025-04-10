import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_IS_ACTIVE === "true") {
    Sentry.init({
      dsn: "https://7f17fcd9feebfb634ad7ba2f638ba69a@o4507119053832192.ingest.de.sentry.io/4507119058026576",
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      tracesSampleRate: 1.0,
      tracePropagationTargets: [
        "localhost",
        new RegExp(`^${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      ],
      replaysSessionSampleRate: 1.0,
      replaysOnErrorSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === "development" ? false : process.env.NEXT_PUBLIC_SENTRY_IS_ACTIVE === "true",
    });
  }
}
