import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_IS_ACTIVE === "true") {
    Sentry.init({
      dsn: "https://7f17fcd9feebfb634ad7ba2f638ba69a@o4507119053832192.ingest.de.sentry.io/4507119058026576",
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of the transactions
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        "localhost",
        new RegExp(`^${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      ],
      // Session Replay
      replaysSessionSampleRate: 1.0, // Set sample at a lower rate in production (e.g. 0.1 for 10% of sessions)
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      // Development server configuration
      environment: process.env.NODE_ENV,
      // Disable Sentry in development
      enabled: process.env.NODE_ENV === "development" ? false : process.env.NEXT_PUBLIC_SENTRY_IS_ACTIVE === "true",
    });
  }
}
