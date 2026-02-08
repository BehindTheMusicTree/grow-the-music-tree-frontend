// Simple script to verify environment variables are properly loaded
import dotenv from "dotenv";
import { existsSync } from "node:fs";

const envFilePath = "./.env.development.local";
console.log("=== ENVIRONMENT VARIABLE VERIFICATION ===");

if (existsSync(envFilePath)) {
  console.log(`✅ Found environment file: ${envFilePath}`);
  dotenv.config({ path: envFilePath });
} else {
  console.log(`❌ Environment file not found: ${envFilePath}`);
  console.log("Note: Environment variables may be loaded from other sources (system env, .env, etc.)");
}

console.log("Checking required NEXT_PUBLIC_ variables:");

const requiredVars = [
  "NEXT_PUBLIC_BACKEND_BASE_URL",
  "NEXT_PUBLIC_SPOTIFY_CLIENT_ID",
  "NEXT_PUBLIC_SPOTIFY_SCOPES",
  "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI",
];

let allPresent = true;
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? "✅ PRESENT" : "❌ MISSING";
  console.log(`${varName}: ${status}`);

  if (!value) {
    allPresent = false;
  }
});

if (allPresent) {
  console.log("\n✅ SUCCESS: All required environment variables are present!");
} else {
  console.log("\n❌ ERROR: Some environment variables are missing!");
}
