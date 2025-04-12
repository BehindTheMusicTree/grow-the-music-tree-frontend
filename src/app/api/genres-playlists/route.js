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

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch genre playlists" }, { status: response.status });
  }

  return NextResponse.json(await response.json());
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const response = await fetch(`${process.env.API_BASE_URL}genre-playlists/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to create genre playlist" }, { status: response.status });
  }

  return NextResponse.json(await response.json());
}
