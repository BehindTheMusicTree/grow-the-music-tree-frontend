import { NextResponse } from "next/server";
import { publicConfig } from "@lib/public-config";

export async function POST(request) {
  try {
    const { code, redirect_uri } = await request.json();

    if (!code || !redirect_uri) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const response = await fetch(`${publicConfig.apiBaseUrl}/auth/spotify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        redirect_uri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error in Spotify auth callback:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    });
  } catch (error) {
    console.error("Error in Spotify auth callback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
