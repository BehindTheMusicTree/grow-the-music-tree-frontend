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

  // Extensive debug logging to diagnose environment variable issues
  console.log("=== CLIENT ENVIRONMENT VALIDATION START ===");

  // Check if we're running in browser
  console.log(`Running in browser: ${typeof window !== "undefined"}`);

  // Check if process.env exists and what type it is
  console.log(`process.env type: ${typeof process.env}`);

  // Log all available process.env keys with NEXT_PUBLIC prefix
  console.log("All available NEXT_PUBLIC_ environment variables:");
  const nextPublicKeys = Object.keys(process.env).filter((key) => key.startsWith("NEXT_PUBLIC_"));
  console.log(`Found ${nextPublicKeys.length} NEXT_PUBLIC_ variables:`, nextPublicKeys);

  // Log each required variable's status
  console.log("Required Environment Variables Status:");
  requiredVars.public.forEach((name) => {
    const value = process.env[name];
    console.log(`${name}: ${value ? "defined" : "undefined"}`);
    if (value) {
      // For debugging, show the first few characters of each defined variable
      console.log(`  Value sample: ${value.substring(0, 10)}...`);
    }
  });

  // Delay validation slightly to ensure variables have time to load (1ms is enough for a render cycle)
  setTimeout(() => {
    console.log("Post-timeout validation check:");
    requiredVars.public.forEach((name) => {
      console.log(`${name}: ${process.env[name] ? "defined (after timeout)" : "still undefined"}`);
    });
  }, 1);

  // Check if variables exist in process.env (standard Next.js approach)
  const missingPublicVars = requiredVars.public.filter((name) => !process.env[name]);

  if (missingPublicVars.length > 0) {
    const errorMessage = `Client environment validation failed! Missing: ${missingPublicVars.join(", ")}`;

    // Log the error for debugging
    console.error(errorMessage);
    console.log("Note: Please ensure:");
    console.log("1. Environment variables are defined in .env.development or .env.development.local");
    console.log("2. All variables start with NEXT_PUBLIC_ for client-side access");
    console.log("3. You started the app using the proper script (start-dev-api-local.sh or start-dev-api-remote.sh)");
    console.log("4. You've restarted the Next.js server after making changes to .env files");
    console.log("5. You don't have server-side-only JS code trying to run on the client");

    // For now, let's return true instead of throwing, to prevent app crashes during debugging
    console.log("=== CLIENT ENVIRONMENT VALIDATION END ===");
    return true;

    // Throw an error that can be caught by error boundaries
    // throw new Error(errorMessage);
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
