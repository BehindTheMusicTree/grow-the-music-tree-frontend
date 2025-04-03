import ApiService from "../ApiService";

export default class SpotifyService {
  static async getUserProfile() {
    return await ApiService.fetchData("spotify/user/profile", "GET");
  }

  static async getUserPlaylists(limit = 50, offset = 0) {
    return await ApiService.fetchData(`spotify/user/playlists?limit=${limit}&offset=${offset}`, "GET");
  }

  static async getUserSavedTracks(limit = 50, offset = 0) {
    return await ApiService.fetchData(`spotify/user/tracks?limit=${limit}&offset=${offset}`, "GET");
  }

  static async getUserTopArtists(timeRange = "medium_term", limit = 50) {
    return await ApiService.fetchData(`spotify/user/top/artists?time_range=${timeRange}&limit=${limit}`, "GET");
  }

  static async getUserTopTracks(timeRange = "medium_term", limit = 50) {
    return await ApiService.fetchData(`spotify/user/top/tracks?time_range=${timeRange}&limit=${limit}`, "GET");
  }

  static async getPlaylistTracks(playlistId, limit = 50, offset = 0) {
    return await ApiService.fetchData(`spotify/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`, "GET");
  }
}
