import "server-only";
import ApiService from "@/utils/api/ApiService";

export async function getPlaylists() {
  const playlists = await ApiService.fetchData("playlists/");
  return playlists;
}

export async function getTracks() {
  const tracks = await ApiService.fetchData("library/spotify");
  return tracks;
}

export async function playTrack(trackId) {
  return ApiService.fetchData("play/start/", {
    method: "POST",
    body: JSON.stringify({ content: trackId }),
  });
}
