"use client";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_SCOPES = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "user-top-read",
].join(" ");

export function getSpotifyAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
  });

  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function getApiTokenFromSpotifyCode(code) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/spotify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    }),
  });

  // Let the fetchInterceptor handle non-OK responses naturally
  // by not throwing a custom error here
  return response.json();
}
