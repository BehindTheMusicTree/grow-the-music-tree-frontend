// Simple script to verify environment variables are properly loaded
// Using CommonJS for simplicity in a Node script
/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require("dotenv");
/* eslint-enable @typescript-eslint/no-var-requires */
dotenv.config({ path: "./.env.development.local" });

console.log("=== ENVIRONMENT VARIABLE VERIFICATION ===");
console.log("Checking required NEXT_PUBLIC_ variables:");

const requiredVars = [
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_SPOTIFY_CLIENT_ID",
  "NEXT_PUBLIC_SPOTIFY_SCOPE",
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
  console.log("Make sure to:");
  console.log("1. Start the app using npm run dev:local or npm run dev:remote");
  console.log("2. If debugging in VS Code, use the 'Start Dev Server' launch configuration");
}
