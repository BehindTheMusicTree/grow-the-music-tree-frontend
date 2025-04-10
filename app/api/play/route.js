import { playTrack } from "@/actions/spotify";

export async function POST(request) {
  const { trackId } = await request.json();
  const result = await playTrack(trackId);
  return Response.json(result);
}
