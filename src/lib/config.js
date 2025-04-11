const ensurePublicEnvVarIsSet = (key) => {
  const nextKey = `NEXT_PUBLIC_${key}`;
  return process?.env?.[nextKey] ?? null;
};

const ensurePrivateEnvVarIsSet = (key) => {
  return process?.env?.[key] ?? null;
};

const extractApiVersionFromBaseUrl = (baseUrl) => {
  if (!baseUrl) return null;
  const versionMatch = baseUrl.match(/\/api\/(v[0-9]+\.[0-9]+\.[0-9]+)\//);
  return versionMatch ? versionMatch[1] : null;
};

const apiBaseUrl = ensurePublicEnvVarIsSet("API_BASE_URL");

// Server-side only config
export const serverConfig = {
  env: ensurePrivateEnvVarIsSet("ENV"),
};

// Public config (client-side accessible)
export const publicConfig = {
  apiVersion: extractApiVersionFromBaseUrl(apiBaseUrl),
  apiBaseUrl,
  contactEmail: ensurePublicEnvVarIsSet("CONTACT_EMAIL"),
  sentryIsActive: ensurePublicEnvVarIsSet("SENTRY_IS_ACTIVE"),
  spotifyClientId: ensurePublicEnvVarIsSet("SPOTIFY_CLIENT_ID"),
  spotifyRedirectUri: ensurePublicEnvVarIsSet("SPOTIFY_REDIRECT_URI"),
  spotifyScope: ensurePublicEnvVarIsSet("SPOTIFY_SCOPE"),
};

// Combined config for internal use
const config = {
  ...serverConfig,
  ...publicConfig,
};

export default config;

export function checkRequiredConfigVars() {
  const requiredPublicEnvVars = [
    "apiVersion",
    "apiBaseUrl",
    "contactEmail",
    "sentryIsActive",
    "spotifyClientId",
    "spotifyRedirectUri",
    "spotifyScope",
  ];
  const requiredPrivateEnvVars = ["env"];

  const missingPublicVars = requiredPublicEnvVars.filter((envVar) => !publicConfig[envVar]);
  const missingPrivateVars = requiredPrivateEnvVars.filter((envVar) => !serverConfig[envVar]);

  if (missingPublicVars.length > 0 || missingPrivateVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${[...missingPublicVars, ...missingPrivateVars].join(", ")}`
    );
  }
}
