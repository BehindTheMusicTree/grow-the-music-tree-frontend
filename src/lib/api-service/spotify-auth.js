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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/spotify/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    }),
  });

  // Explicitly handle non-OK responses to ensure they're properly caught
  if (!response.ok) {
    // Create a standardized error object similar to what fetchInterceptor would create
    const error = new Error(`Request to "${response.url}" failed with status ${response.status}`);
    error.response = {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url,
    };

    // Internal server errors (500)
    if (response.status >= 500) {
      error.name = "ServerError";
    }

    throw error;
  }

  // Parse JSON for successful responses
  return response.json();
}
