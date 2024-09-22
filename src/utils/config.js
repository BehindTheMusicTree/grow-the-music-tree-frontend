const getEnvVar = (key) => {
  const a = window._env_;
  console.log(a);
  return import.meta.env[key] || window._env_[key];
};

const config = {
  env: getEnvVar("VITE_ENV"),
  apiBaseUrl: getEnvVar("VITE_API_BASE_URL"),
  username: getEnvVar("VITE_API_UMG_USERNAME"),
  password: getEnvVar("VITE_API_UMG_USER_PASSWORD"),
  contactEmail: getEnvVar("VITE_API_CONTACT_EMAIL"),
  sentryIsActive: getEnvVar("VITE_SENTRY_IS_ACTIVE"),
};

export default config;

export function checkRequiredConfigVars() {
  const requiredEnvVars = ["env", "apiBaseUrl", "username", "password", "contactEmail", "sentryIsActive"];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !config[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }
}
