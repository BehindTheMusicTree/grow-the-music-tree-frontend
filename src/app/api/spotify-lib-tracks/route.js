import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.API_BASE_URL}library/uploaded/?page=${page}&pageSize=${pageSize}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch library tracks from Spotify");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { trackIds } = await request.json();
    if (!trackIds || !Array.isArray(trackIds)) {
      return NextResponse.json({ error: "Invalid track IDs" }, { status: 400 });
    }

    const response = await fetch("https://api.spotify.com/v1/me/tracks", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: trackIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to add tracks to Spotify library");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { trackIds } = await request.json();
    if (!trackIds || !Array.isArray(trackIds)) {
      return NextResponse.json({ error: "Invalid track IDs" }, { status: 400 });
    }

    const response = await fetch("https://api.spotify.com/v1/me/tracks", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: trackIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to remove tracks from Spotify library");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
