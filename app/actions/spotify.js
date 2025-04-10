"use server";

export async function getPlaylists() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}playlists/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function getTracks() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}library/spotify`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function playTrack(trackId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}play/start/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: trackId }),
  });
  return res.json();
}
