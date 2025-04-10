import { cookies } from "next/headers";

export async function GET(request, { params }) {
  const token = cookies().get("auth_token")?.value;
  const { uuid } = params;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${process.env.API_BASE_URL}library/uploaded/${uuid}/download/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return Response.json({ error: "Failed to download track" }, { status: response.status });
  }

  // Get the blob from the response
  const blob = await response.blob();

  // Create headers for the response
  const headers = new Headers();
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Content-Disposition", `attachment; filename="track-${uuid}.mp3"`);

  // Return the blob with appropriate headers
  return new Response(blob, { headers });
}
