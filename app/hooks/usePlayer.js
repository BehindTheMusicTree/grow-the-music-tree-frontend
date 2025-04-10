"use client";

export function usePlayer() {
  const play = async (trackId) => {
    const response = await fetch("/api/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trackId }),
    });
    return response.json();
  };

  const pause = async () => {
    const response = await fetch("/api/pause", {
      method: "POST",
    });
    return response.json();
  };

  return { play, pause };
}
