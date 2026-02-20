import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_IS_ACTIVE !== "true") {
    return;
  }

  const isBrowser = typeof window !== "undefined";

  if (!isBrowser) {
    return;
  }

  try {
    const integrations = [];

    if (typeof Sentry.browserTracingIntegration === "function") {
      integrations.push(Sentry.browserTracingIntegration());
    }

    if (typeof Sentry.replayIntegration === "function") {
      integrations.push(Sentry.replayIntegration());
    }

    const tracesSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) || 0.1;
    const replaysSessionSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE) || 0.1;
    const replaysOnErrorSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE) || 1.0;

    Sentry.init({
      dsn: "https://7f17fcd9feebfb634ad7ba2f638ba69a@o4507119053832192.ingest.de.sentry.io/4507119058026576",
      integrations,
      tracesSampleRate,
      tracePropagationTargets: [
        "localhost",
        new RegExp(`^${process.env.NEXT_PUBLIC_BACKEND_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      ],
      replaysSessionSampleRate,
      replaysOnErrorSampleRate,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === "development" ? false : process.env.NEXT_PUBLIC_SENTRY_IS_ACTIVE === "true",
    });
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
  }
}
