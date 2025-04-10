"use client";

export function useMusic() {
  const getGenres = async () => {
    const response = await fetch("/api/music?type=genres");
    return response.json();
  };

  const getPlaylist = async (uuid) => {
    const response = await fetch(`/api/music?type=playlist&id=${uuid}`);
    return response.json();
  };

  const getTrack = async (trackId) => {
    const response = await fetch(`/api/music?type=track&id=${trackId}`);
    return response.json();
  };

  return { getGenres, getPlaylist, getTrack };
}
