"use server";

export async function getGenres() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}genre-playlists/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function getPlaylist(uuid) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}playlists/${uuid}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function getTrack(trackId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}spotify/tracks/${trackId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}
