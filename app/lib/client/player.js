"use client";

export async function playTrack(trackId) {
  const response = await fetch("/api/play", {
    method: "POST",
    body: JSON.stringify({ trackId }),
  });
  return response.json();
}

export async function pauseTrack() {
  const response = await fetch("/api/pause", {
    method: "POST",
  });
  return response.json();
}
