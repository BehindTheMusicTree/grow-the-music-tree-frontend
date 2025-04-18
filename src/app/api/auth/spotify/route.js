import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code, redirect_uri } = await request.json();

    if (!code || !redirect_uri) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Exchange code for tokens with your backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/spotify`, {
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
