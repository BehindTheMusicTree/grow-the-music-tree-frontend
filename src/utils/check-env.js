const requiredEnvVars = [
  "VITE_API_CONTACT_EMAIL",
  "VITE_API_BASE_URL",
  "VITE_API_UMG_USERNAME",
  "VITE_API_UMG_USER_PASSWORD",
  "dsddsf",
];

export function checkRequiredEnvVars() {
  const missingEnvVars = requiredEnvVars.filter((envVar) => !import.meta.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }
}
