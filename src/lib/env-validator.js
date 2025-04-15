// Environment validation
// This file centralizes all environment variable validation
// Called during initialization to ensure all required variables are present

/**
 * Validates that all required public environment variables are defined
 * Throws an error if any are missing
 */
export function validatePublicEnv() {
  // List of required public environment variables
  const requiredPublicVars = [
    "NEXT_PUBLIC_API_BASE_URL",
    "NEXT_PUBLIC_SPOTIFY_CLIENT_ID", 
    "NEXT_PUBLIC_SPOTIFY_SCOPE",
    "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI"
  ];

  // Check for missing required variables
  const missingVars = requiredPublicVars.filter(name => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required public environment variables: ${missingVars.join(", ")}`);
  }
}

/**
 * Validates that all required server (private) environment variables are defined
 * Throws an error if any are missing
 */
export function validateServerEnv() {
  // List of required private environment variables
  const requiredPrivateVars = [
    "ENV",
    "PORT",
    "SPOTIFY_CLIENT_SECRET",
    "NEXTAUTH_SECRET"
  ];

  // Check for missing required variables
  const missingVars = requiredPrivateVars.filter(name => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required private environment variables: ${missingVars.join(", ")}`);
  }
}

/**
 * Validates all environment variables at once
 * Useful for startup validation in pages/_app.js or similar
 */
export function validateAllEnv() {
  validatePublicEnv();
  validateServerEnv();
}