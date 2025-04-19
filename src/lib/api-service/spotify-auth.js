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

export async function exchangeSpotifyCode(code) {
  // This fetch call will be intercepted by the fetchInterceptor
  // The interceptor will throw standardized errors for non-OK responses
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

  // If we reach here, the response was OK (fetchInterceptor would have thrown otherwise)
  // Safe to parse JSON now
  return response.json();
}
