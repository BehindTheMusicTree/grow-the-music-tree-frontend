import { NextResponse } from "next/server";

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
