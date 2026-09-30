import { NextRequest, NextResponse } from "next/server";
import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";
import { getAdminIdToken } from "@lib/auth";

const AUTHENTICATION_REQUIRED_MESSAGE = "Authentication credentials were not provided.";

async function forward(request: NextRequest, path: string[]): Promise<NextResponse> {
  const upstreamBase = getGrowApiUpstreamBaseUrl().replace(/\/+$/, "");
  const upstreamUrl = `${upstreamBase}/${path.join("/")}/${request.nextUrl.search}`;

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const idToken = await getAdminIdToken(request);
  if (hasBody && !idToken) {
    return NextResponse.json(
      {
        code: 401,
        message: AUTHENTICATION_REQUIRED_MESSAGE,
        success: false,
        details: { message: AUTHENTICATION_REQUIRED_MESSAGE, code: "authentication_required" },
      },
      { status: 401 },
    );
  }

  const contentType = request.headers.get("content-type");
  const ifNoneMatch = request.headers.get("if-none-match");

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...(ifNoneMatch ? { "If-None-Match": ifNoneMatch } : {}),
    },
    body: hasBody ? await request.arrayBuffer() : undefined,
  });

  const etag = upstreamResponse.headers.get("etag");
  const headers: Record<string, string> = {
    "Content-Type": upstreamResponse.headers.get("content-type") ?? "application/json",
    // Makes the browser keep the body and revalidate it with If-None-Match on every fetch.
    ...(etag ? { ETag: etag, "Cache-Control": "private, no-cache" } : {}),
  };

  if (upstreamResponse.status === 304) {
    return new NextResponse(null, { status: 304, headers });
  }
  return new NextResponse(upstreamResponse.body, { status: upstreamResponse.status, headers });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}
export async function POST(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}
export async function PUT(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}
