import ApiService from "../api/ApiService";

class PlaylistService {
  static async listPlaylists() {
    return ApiService.fetchData("playlists/");
  }

  static async retrievePlaylist(uuid) {
    return ApiService.fetchData(`playlists/${uuid}/`);
  }
}

export default PlaylistService;
