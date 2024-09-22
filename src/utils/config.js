const config = {
  authToken: import.meta.env.VITE_SENTRY_AUTH_TOKEN,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  username: import.meta.env.VITE_API_UMG_USERNAME,
  password: import.meta.env.VITE_API_UMG_USER_PASSWORD,
  contactEmail: import.meta.env.VITE_API_CONTACT_EMAIL,
};

export default config;
