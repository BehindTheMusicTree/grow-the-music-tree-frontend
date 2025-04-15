// Environment validation for runtime checks
// Only validates in production to ensure all required variables are present

export function validateEnv() {
  // List of required environment variables
  const requiredVars = {
    public: [
      "NEXT_PUBLIC_API_BASE_URL",
      "NEXT_PUBLIC_SPOTIFY_CLIENT_ID",
      "NEXT_PUBLIC_SPOTIFY_SCOPE",
      "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI",
    ],
    private: ["ENV", "PORT", "SPOTIFY_CLIENT_SECRET", "NEXTAUTH_SECRET"],
  };

  // Check for missing variables
  const missingVars = {
    public: requiredVars.public.filter((name) => !process.env[name]),
    private: requiredVars.private.filter((name) => !process.env[name]),
  };

  // Only throw in production
  if (process.env.NODE_ENV === "production" && (missingVars.public.length > 0 || missingVars.private.length > 0)) {
    const errors = [];
    if (missingVars.public.length > 0) {
      errors.push(`Missing public variables: ${missingVars.public.join(", ")}`);
    }
    if (missingVars.private.length > 0) {
      errors.push(`Missing private variables: ${missingVars.private.join(", ")}`);
    }
    throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
  }
}
