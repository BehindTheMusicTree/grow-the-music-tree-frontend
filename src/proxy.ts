import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  try {
    // Redirect root to music page
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/genre-tree", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Proxy Error:", error);
    // In development, show the error details
    if (process.env.NODE_ENV === "development") {
      return new NextResponse(
        JSON.stringify({
          error: "Configuration Error",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    // In production, show a generic error
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Run middleware on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
