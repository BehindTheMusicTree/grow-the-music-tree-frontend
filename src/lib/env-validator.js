// Environment validation for runtime checks
// Validates in all environments to catch configuration issues early

// List of required environment variables
const requiredVars = {
  public: [
    "NEXT_PUBLIC_API_BASE_URL",
    "NEXT_PUBLIC_SPOTIFY_CLIENT_ID",
    "NEXT_PUBLIC_SPOTIFY_SCOPE",
    "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI",
  ],
  private: ["NODE_ENV", "PORT", "NEXTAUTH_SECRET"],
};

// Variables that should have their values masked in logs
const sensitiveVars = ["NEXTAUTH_SECRET", "NEXT_PUBLIC_SPOTIFY_CLIENT_ID"];

// Cache validation results to avoid redundant checks
let serverValidationPerformed = false;
let clientValidationPerformed = false;

/**
 * Validates all environment variables (both public and private)
 * Use this on the server side only
 * @returns {boolean} true if validation passes
 * @throws {Error} if any required variables are missing
 */
export function validateServerEnv() {
  // Skip if already validated (since env vars won't change during runtime)
  if (serverValidationPerformed) return true;

  console.log("\n=== Server Environment Validation Start ===", new Date().toISOString());

  // Check for missing variables
  const missingVars = {
    public: requiredVars.public.filter((name) => !process.env[name]),
    private: requiredVars.private.filter((name) => !process.env[name]),
  };

  // Log the status of each variable
  console.group("Server Environment Variables Status:");
  [...requiredVars.public, ...requiredVars.private].forEach((varName) => {
    const value = process.env[varName];
    const status = value ? "✅" : "❌";
    const displayValue = value
      ? sensitiveVars.includes(varName)
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : value
      : "not set";
    console.log(`${status} ${varName}: ${displayValue}`);
  });
  console.groupEnd();

  if (missingVars.public.length > 0 || missingVars.private.length > 0) {
    console.error("\n❌ Server environment validation failed!");
    const errors = [];
    if (missingVars.public.length > 0) {
      errors.push(`Missing public variables: ${missingVars.public.join(", ")}`);
    }
    if (missingVars.private.length > 0) {
      errors.push(`Missing private variables: ${missingVars.private.join(", ")}`);
    }

    // In development, we can be more helpful by suggesting how to fix it
    if (process.env.NODE_ENV === "development") {
      errors.push("\nTo fix this:");
      errors.push("1. Create a .env.local file in your project root");
      errors.push("2. Add the missing variables with appropriate values");
      errors.push("3. Restart your development server");
    }

    const errorMessage = `Server environment validation failed:\n${errors.join("\n")}`;
    console.error(errorMessage);
    console.error("=== Server Environment Validation End ===\n");
    throw new Error(errorMessage);
  }

  console.log("✅ All server environment variables are properly set!");
  console.log("=== Server Environment Validation End ===\n");

  // Mark as validated to avoid redundant checks
  serverValidationPerformed = true;
  return true;
}

/**
 * Validates only public environment variables
 * Safe to use on client-side code
 * @returns {boolean} true if validation passes
 * @throws {Error} if any required public variables are missing
 */
export function validateClientEnv() {
  // Skip if already validated (since env vars won't change during runtime)
  if (clientValidationPerformed) return true;

  // Only check public variables on client side
  const missingPublicVars = requiredVars.public.filter((name) => !process.env[name]);

  if (missingPublicVars.length > 0) {
    const errorMessage = `Client environment validation failed! Missing: ${missingPublicVars.join(", ")}`;

    // Log the error for debugging
    console.error(errorMessage);

    // Throw an error that can be caught by error boundaries
    throw new Error(errorMessage);
  }

  // Mark as validated to avoid redundant checks
  clientValidationPerformed = true;
  return true;
}

/**
 * Legacy function that validates all environment variables
 * Kept for backward compatibility
 * @deprecated Use validateServerEnv() or validateClientEnv() instead
 */
export function validateEnv() {
  return validateServerEnv();
}
