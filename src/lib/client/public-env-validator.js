"use client";

let checkPerformed = false;

export function validateClientEnv() {
  if (typeof window !== "undefined" && !checkPerformed) {
    checkPerformed = true;

    const clientEnvVars = {
      NEXT_PUBLIC_BASE_URL_WITHOUT_PORT: process.env.NEXT_PUBLIC_BASE_URL_WITHOUT_PORT,
      NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_SENTRY_IS_ACTIVE: process.env.NEXT_PUBLIC_SENTRY_IS_ACTIVE,
      NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      NEXT_PUBLIC_SPOTIFY_SCOPE: process.env.NEXT_PUBLIC_SPOTIFY_SCOPE,
      NEXT_PUBLIC_SPOTIFY_REDIRECT_URI: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    };

    var hasMissingEnvVars = false;
    for (const [key, value] of Object.entries(clientEnvVars)) {
      if (value === undefined || value === "") {
        console.error(`Environment variable ${key} is ${value === "" ? "empty" : "undefined"}`);
        hasMissingEnvVars = true;
      }
    }
    if (hasMissingEnvVars) {
      throw new Error("❌ Missing environment variables");
    }
    console.log("✅ All environment variables are defined");
  }
}
