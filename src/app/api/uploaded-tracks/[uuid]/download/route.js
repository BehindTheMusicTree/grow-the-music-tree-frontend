import { NextResponse } from "next/server";
import { useAuthenticatedFetch } from "@hooks/useAuthenticatedFetch";

/**
 * Handler for downloading track files
 * This is an API route that serves binary file data
 */
async function downloadTrackImpl(authFetch, { params }) {
  const { uuid } = params;

  // Use authFetch but get the raw response without throwing errors
  // This is a special case since we're handling binary data
  const response = await authFetch(
    `library/uploaded/${uuid}/download/`,
    { resolveOnError: true } // Special option to prevent auto-error throwing for binary handling
  );

  // Handle error manually for binary responses
  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message }, { status: response.status });
  }

  // Get the content type from the response or determine from filename
  const contentType = response.headers.get("content-type") || "audio/mpeg";
  const contentDisposition = response.headers.get("content-disposition");
  const filename = contentDisposition ? contentDisposition.split("filename=")[1].replace(/"/g, "") : `track-${uuid}`;

  // Create response with the correct content type
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);

  return new NextResponse(response.body, {
    headers,
  });
}

// Export with auth protection - API route specific pattern
export const GET = useAuthenticatedFetch(downloadTrackImpl);
