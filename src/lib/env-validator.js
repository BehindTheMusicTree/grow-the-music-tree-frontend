// Environment validation for runtime checks
// Validates in all environments to catch configuration issues early

export function validateEnv() {
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

  // Check for missing variables
  const missingVars = {
    public: requiredVars.public.filter((name) => !process.env[name]),
    private: requiredVars.private.filter((name) => !process.env[name]),
  };

  if (missingVars.public.length > 0 || missingVars.private.length > 0) {
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

    throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
  }
}
