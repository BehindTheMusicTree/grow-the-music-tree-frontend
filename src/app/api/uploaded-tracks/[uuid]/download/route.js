import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { withAuthHandling } from "@lib/auth-error-handler";

async function downloadTrackImpl(session, uuid) {
  const response = await fetch(`${process.env.API_BASE_URL}library/uploaded/${uuid}/download/`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download track");
  }

  const blob = await response.blob();
  const headers = new Headers();
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Content-Disposition", `attachment; filename="track-${uuid}.mp3"`);

  return new Response(blob, { headers });
}

export const GET = withAuthHandling(downloadTrackImpl);
