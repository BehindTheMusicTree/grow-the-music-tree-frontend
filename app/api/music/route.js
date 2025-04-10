import { getGenres, getPlaylist, getTrack } from "@/actions/music";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  switch (type) {
    case "genres":
      return Response.json(await getGenres());
    case "playlist":
      return Response.json(await getPlaylist(id));
    case "track":
      return Response.json(await getTrack(id));
    default:
      return Response.json({ error: "Invalid type" }, { status: 400 });
  }
}
