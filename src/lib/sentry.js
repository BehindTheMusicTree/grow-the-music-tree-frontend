import * as Sentry from "@sentry/nextjs";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { publicEnv } from "@lib/env";

export function initSentry() {
  if (publicEnv.NEXT_PUBLIC_SENTRY_IS_ACTIVE !== "true") {
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

    const tracesSampleRate = publicEnv.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE;
    const replaysSessionSampleRate = publicEnv.NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE;
    const replaysOnErrorSampleRate = publicEnv.NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE;

    Sentry.init({
      dsn: "https://7f17fcd9feebfb634ad7ba2f638ba69a@o4507119053832192.ingest.de.sentry.io/4507119058026576",
      integrations,
      tracesSampleRate,
      tracePropagationTargets: ["localhost", getGrowBackendBaseUrl()],
      replaysSessionSampleRate,
      replaysOnErrorSampleRate,
      enabled: publicEnv.NEXT_PUBLIC_SENTRY_IS_ACTIVE === "true",
    });
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
  }
}
