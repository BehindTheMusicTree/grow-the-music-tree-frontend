const getViteVar = (key) => {
  const viteKey = `VITE_${key}`;
  return import.meta.env[viteKey] || null;
};

const config = {
  env: getViteVar("ENV"),
  apiBaseUrl: getViteVar("API_BASE_URL"),
  apiUsername: getViteVar("API_UMG_USERNAME"),
  apiUserPassword: getViteVar("API_UMG_USER_PASSWORD"),
  contactEmail: getViteVar("CONTACT_EMAIL"),
  sentryIsActive: getViteVar("SENTRY_IS_ACTIVE"),
};

export default config;

export function checkRequiredConfigVars() {
  const requiredEnvVars = ["env", "apiBaseUrl", "apiUsername", "apiUserPassword", "contactEmail", "sentryIsActive"];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !config[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }
}
