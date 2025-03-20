import ApiService from "../ApiService";

export default class PlaylistService {
  static async retrievePlaylist(playlistUuid) {
    return await ApiService.fetchData(`playlists/${playlistUuid}/`, "GET", null, null);
  }

  static async postPlay(contentObjectUuid) {
    const data = { contentObjectUuid: contentObjectUuid };
    return await ApiService.fetchData(`plays/`, "POST", data, null);
  }
}