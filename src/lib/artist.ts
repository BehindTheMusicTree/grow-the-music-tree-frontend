import { cache } from "react";
import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";
import { ArtistDetailedSchema, type ArtistDetailed } from "@schemas/api/artist";

// Wrapped in `cache` so generateMetadata and the page share one request.
export const fetchArtist = cache(async (uuid: string): Promise<ArtistDetailed | null> => {
  const response = await fetch(`${getGrowApiUpstreamBaseUrl().replace(/\/+$/, "")}/artists/${uuid}/`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch artist ${uuid}: ${response.status}`);
  return ArtistDetailedSchema.parse(await response.json());
});
