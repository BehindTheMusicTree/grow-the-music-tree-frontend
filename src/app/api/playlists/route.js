import { getPlaylists } from "@/lib/services/spotify";

export async function GET() {
  const playlists = await getPlaylists();
  return Response.json(playlists);
}
