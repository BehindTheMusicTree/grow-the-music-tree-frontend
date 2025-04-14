import { withAuthProtection } from "@lib/server/auth-api";

/**
 * Handler for downloading track files
 * This is an API route that serves binary file data
 */
async function downloadTrackImpl(session, authFetch, { params }) {
  const { uuid } = params;

  // Use authFetch but get the raw response without throwing errors
  // This is a special case since we're handling binary data
  const response = await authFetch(
    `${process.env.API_BASE_URL}library/uploaded/${uuid}/download/`,
    { resolveOnError: true } // Special option to prevent auto-error throwing for binary handling
  );

  // Handle error manually for binary responses
  if (!response.ok) {
    throw new Error("Failed to download track");
  }

  // Get binary data and set appropriate headers for download
  const blob = await response.blob();
  const headers = new Headers();
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Content-Disposition", `attachment; filename="track-${uuid}.mp3"`);

  // Return proper Response object for the API route
  return new Response(blob, { headers });
}

// Export with auth protection - API route specific pattern
export const GET = withAuthProtection(downloadTrackImpl);
