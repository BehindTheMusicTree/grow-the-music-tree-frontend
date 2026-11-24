import { defineConfig, devices } from "@playwright/test";
import { adminApiOrigin, authSecret } from "./e2e/support/admin-config";

const port = 3100;

export default defineConfig({
  testDir: "e2e",
  retries: process.env.CI ? 1 : 0,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node .next/standalone/server.js",
    url: `http://localhost:${port}`,
    env: {
      PORT: String(port),
      HOSTNAME: "localhost",
      AUTH_SECRET: authSecret,
      AUTH_GOOGLE_ID: "e2e-google-id",
      AUTH_GOOGLE_SECRET: "e2e-google-secret",
      GROW_API_ORIGIN: adminApiOrigin,
    },
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
