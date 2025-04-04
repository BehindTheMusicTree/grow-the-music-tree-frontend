const getViteVar = (key) => {
  const viteKey = `VITE_${key}`;
  return import.meta.env[viteKey] || null;
};

// Extract API version from the API base URL
const extractApiVersion = (baseUrl) => {
  if (!baseUrl) return null;
  const versionMatch = baseUrl.match(/\/api\/(v[0-9]+\.[0-9]+\.[0-9]+)\//);
  return versionMatch ? versionMatch[1] : null;
};

const apiBaseUrl = getViteVar("API_BASE_URL");

const config = {
  env: getViteVar("ENV"),
  apiVersion: extractApiVersion(apiBaseUrl),
  apiBaseUrl,
  contactEmail: getViteVar("CONTACT_EMAIL"),
  sentryIsActive: getViteVar("SENTRY_IS_ACTIVE"),
  spotifyClientId: getViteVar("SPOTIFY_CLIENT_ID"),
  spotifyRedirectUri: getViteVar("SPOTIFY_REDIRECT_URI"),
  spotifyScope: getViteVar("SPOTIFY_SCOPE"),
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
