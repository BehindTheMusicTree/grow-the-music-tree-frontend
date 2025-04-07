import ApiService from "../api/ApiService";

export default class PlaylistService {
  static async retrievePlaylist(playlistUuid) {
    return await ApiService.fetchData(`playlists/${playlistUuid}/`, "GET", null, null);
  }

  static async postPlay(contentUuid) {
    const data = { content: contentUuid }; // API expects "content" instead of "contentUuid"
    return await ApiService.fetchData(`plays/`, "POST", data, null);
  }
}
