import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${process.env.API_BASE_URL}genre-playlists/`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  return NextResponse.json(await response.json());
}
