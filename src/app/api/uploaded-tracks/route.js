import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("pageSize") || 50;

  const response = await fetch(`${process.env.API_BASE_URL}library/uploaded/?page=${page}&pageSize=${pageSize}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    return Response.json({ error: "Failed to fetch tracks" }, { status: response.status });
  }

  return Response.json(await response.json());
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  const response = await fetch(`${process.env.API_BASE_URL}library/uploaded/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    return Response.json({ error: "Failed to upload track" }, { status: response.status });
  }

  return Response.json(await response.json());
}
