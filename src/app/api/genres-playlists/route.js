import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("pageSize") || 50;

  const response = await fetch(`${process.env.API_BASE_URL}genre-playlists/?page=${page}&pageSize=${pageSize}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  return NextResponse.json(await response.json());
}
