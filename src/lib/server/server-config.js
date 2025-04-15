// Server-side configuration
// This file contains private, server-only configuration values
// Validation happens at app startup in middleware.js

import { publicConfig } from "@lib/public-config";

// Create clean configuration object with values only
export const serverConfig = Object.freeze({
  // Environment
  env: process.env.ENV,
  port: process.env.PORT,

  // Auth configuration
  authOptions: {
    secret: process.env.NEXTAUTH_SECRET,
    url: `${publicConfig.apiBaseUrl.split("/api")[0]}:${process.env.PORT}`,
  },
});
