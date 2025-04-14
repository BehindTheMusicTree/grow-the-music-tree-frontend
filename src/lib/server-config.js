// Check required private environment variables
const requiredPrivateEnvVars = ["ENV", "PORT", "SPOTIFY_CLIENT_SECRET", "NEXTAUTH_SECRET"];

const missingPrivateVars = requiredPrivateEnvVars.filter((envVar) => !process?.env?.[envVar]);

if (missingPrivateVars.length > 0) {
  throw new Error(`Missing required private environment variables: ${missingPrivateVars.join(", ")}`);
}

const getPrivateEnvVar = (key) => {
  const value = process?.env?.[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Import public config for URL construction
import { publicConfig } from "./public-config";

// Server-side only config
export const serverConfig = {
  env: getPrivateEnvVar("ENV"),
  spotifyClientSecret: getPrivateEnvVar("SPOTIFY_CLIENT_SECRET"),
  authOptions: {
    secret: getPrivateEnvVar("NEXTAUTH_SECRET"),
    url: publicConfig.baseUrl + ":" + getPrivateEnvVar("PORT"),
  },
};
