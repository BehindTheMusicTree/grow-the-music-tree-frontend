const getPublicEnvVar = (key) => {
  const nextKey = `NEXT_PUBLIC_${key}`;
  return process?.env?.[nextKey] ?? null;
};

const getPrivateEnvVar = (key) => {
  return process?.env?.[key] ?? null;
};

const extractApiVersionFromBaseUrl = (baseUrl) => {
  if (!baseUrl) return null;
  const versionMatch = baseUrl.match(/\/api\/(v[0-9]+\.[0-9]+\.[0-9]+)\//);
  return versionMatch ? versionMatch[1] : null;
};

const apiBaseUrl = getPublicEnvVar("API_BASE_URL");

// Server-side only config
export const serverConfig = {
  env: getPrivateEnvVar("ENV"),
};

// Public config (client-side accessible)
export const publicConfig = {
  apiBaseUrl,
  apiVersion: extractApiVersionFromBaseUrl(apiBaseUrl),
  contactEmail: getPublicEnvVar("CONTACT_EMAIL"),
  sentryIsActive: getPublicEnvVar("SENTRY_IS_ACTIVE"),
  spotifyClientId: getPublicEnvVar("SPOTIFY_CLIENT_ID"),
  spotifyRedirectUri: getPublicEnvVar("SPOTIFY_REDIRECT_URI"),
  spotifyScope: getPublicEnvVar("SPOTIFY_SCOPE"),
};

// Combined config for internal use
const config = {
  ...serverConfig,
  ...publicConfig,
};

export default config;

export function checkRequiredConfigVars() {
  const requiredPublicEnvVars = [
    "API_BASE_URL",
    "CONTACT_EMAIL",
    "SENTRY_IS_ACTIVE",
    "SPOTIFY_CLIENT_ID",
    "SPOTIFY_REDIRECT_URI",
    "SPOTIFY_SCOPE",
  ];
  const requiredPrivateEnvVars = ["ENV"];

  const missingPublicVars = requiredPublicEnvVars.filter((envVar) => !getPublicEnvVar(envVar));
  const missingPrivateVars = requiredPrivateEnvVars.filter((envVar) => !getPrivateEnvVar(envVar));

  if (missingPublicVars.length > 0 || missingPrivateVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${[...missingPublicVars, ...missingPrivateVars].join(", ")}`
    );
  }
}
