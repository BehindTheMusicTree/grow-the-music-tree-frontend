const getEnvVar = (key) => {
  // Check Next.js environment variables first
  const nextKey = `NEXT_PUBLIC_${key}`;
  if (typeof process !== "undefined" && process.env && process.env[nextKey]) {
    return process.env[nextKey];
  }

  // Fall back to Vite environment variables
  const viteKey = `VITE_${key}`;
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }

  return null;
};

// Extract API version from the API base URL
const extractApiVersion = (baseUrl) => {
  if (!baseUrl) return null;
  const versionMatch = baseUrl.match(/\/api\/(v[0-9]+\.[0-9]+\.[0-9]+)\//);
  return versionMatch ? versionMatch[1] : null;
};

const apiBaseUrl = getEnvVar("API_BASE_URL");

const config = {
  env: getEnvVar("ENV") || "development",
  apiVersion: extractApiVersion(apiBaseUrl),
  apiBaseUrl,
  contactEmail: getEnvVar("CONTACT_EMAIL"),
  sentryIsActive: getEnvVar("SENTRY_IS_ACTIVE"),
  spotifyClientId: getEnvVar("SPOTIFY_CLIENT_ID"),
  spotifyRedirectUri: getEnvVar("SPOTIFY_REDIRECT_URI"),
  spotifyScope: getEnvVar("SPOTIFY_SCOPE"),
};

export default config;

export function checkRequiredConfigVars() {
  const requiredEnvVars = [
    "env",
    "apiVersion",
    "apiBaseUrl",
    "contactEmail",
    "sentryIsActive",
    "spotifyClientId",
    "spotifyRedirectUri",
    "spotifyScope",
  ];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !config[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }
}
