import { NextRequest, NextResponse } from "next/server";
import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";

async function forward(request: NextRequest, path: string[]): Promise<NextResponse> {
  const apiKey = process.env.GTMT_API_KEY;
  if (!apiKey) {
    throw new Error("GTMT_API_KEY is required to proxy grow-api requests");
  }

  const upstreamBase = getGrowApiUpstreamBaseUrl().replace(/\/+$/, "");
  const upstreamUrl = `${upstreamBase}/${path.join("/")}/${request.nextUrl.search}`;

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const contentType = request.headers.get("content-type");

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: {
      "X-API-Key": apiKey,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body: hasBody ? await request.arrayBuffer() : undefined,
  });

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type": upstreamResponse.headers.get("content-type") ?? "application/json",
    },
  });
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
