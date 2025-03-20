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
  apiUsername: getViteVar("API_UMG_USERNAME"),
  apiUserPassword: getViteVar("API_UMG_USER_PASSWORD"),
  contactEmail: getViteVar("CONTACT_EMAIL"),
  sentryIsActive: getViteVar("SENTRY_IS_ACTIVE"),
};

export default config;

export function checkRequiredConfigVars() {
  const requiredEnvVars = [
    "env",
    "apiVersion",
    "apiBaseUrl",
    "apiUsername",
    "apiUserPassword",
    "contactEmail",
    "sentryIsActive",
  ];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !config[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }
}
