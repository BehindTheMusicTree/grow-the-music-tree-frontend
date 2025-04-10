import { getGenres } from "@/actions/music";

export async function GET() {
  const genres = await getGenres();
  return Response.json(genres);
}

export async function POST(request) {
  const genreData = await request.json();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}genre-playlists/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(genreData),
  });
  return Response.json(await response.json());
}

export async function PUT(request) {
  const { genreUuid, genreData } = await request.json();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}genre-playlists/${genreUuid}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(genreData),
  });
  return Response.json(await response.json());
}

export async function DELETE(request) {
  const { genreUuid } = await request.json();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}genre-playlists/${genreUuid}/`, {
    method: "DELETE",
  });
  return Response.json(await response.json());
}
