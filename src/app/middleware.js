import { NextResponse } from "next/server";
import { validateAllEnv } from "@lib/env-validator";

// Validate all environment variables at startup
try {
  validateAllEnv();
} catch (error) {
  console.error("Environment validation failed:", error.message);
  // In production, you might want to prevent the app from starting
  if (process.env.NODE_ENV === "production") {
    throw error;
  }
}

export function middleware(request) {
  // Redirect root to music page
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/genre-tree", request.url));
  }

  return NextResponse.next();
}

// Only run middleware on root path
export const config = {
  matcher: "/",
};