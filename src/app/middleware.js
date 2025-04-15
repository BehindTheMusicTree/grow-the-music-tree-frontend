import { NextResponse } from "next/server";
import { validateEnv } from "@lib/env-validator";

// Validate environment variables at runtime
if (process.env.NODE_ENV === "production") {
  validateEnv();
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
