import { cookies } from "next/headers";

export async function GET(request, { params }) {
  const token = cookies().get("auth_token")?.value;
  const { uuid } = params;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${process.env.API_BASE_URL}library/uploaded/${uuid}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return Response.json({ error: "Failed to fetch track" }, { status: response.status });
  }

  return Response.json(await response.json());
}

export async function PUT(request, { params }) {
  const token = cookies().get("auth_token")?.value;
  const { uuid } = params;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  // Transform data as in the original service
  const transformedData = {
    ...data,
    artistsNames: data.artistName ? [data.artistName] : data.artistsNames,
    artistName: undefined,
    genre: data.genre?.uuid || data.genreName,
    genreName: undefined,
  };

  const response = await fetch(`${process.env.API_BASE_URL}library/uploaded/${uuid}/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transformedData),
  });

  if (!response.ok) {
    return Response.json({ error: "Failed to update track" }, { status: response.status });
  }

  return Response.json(await response.json());
}
