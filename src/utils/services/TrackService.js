import config from "../config";
import ApiService from "../ApiService";

export default class TrackService {
  static async getLibTracks() {
    let results = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await ApiService.fetchData("tracks/", "GET", null, page);
      results = results.concat(data.results);

      if (data.next) {
        page++;
      } else {
        hasMore = false;
      }
    }

    return results;
  }

  static async retrieveLibTrack(libTrackUuid) {
    return await ApiService.fetchData(`tracks/${libTrackUuid}/`, "GET", null, null);
  }

  static async postLibTrack(file, genreUuid, onProgress, badRequestCatched = false) {
    const formData = new FormData();
    formData.append("file", file);
    if (genreUuid) {
      formData.append("genreUuid", genreUuid);
    }
    return await ApiService.fetchData("tracks/", "POST", formData, null, onProgress, badRequestCatched);
  }

  static async putLibTrack(libTrackUuid, libTrackData) {
    return await ApiService.fetchData(`tracks/${libTrackUuid}/`, "PUT", libTrackData, null);
  }

  static async loadAudioAndGetLibTrackBlobUrl(libTrackRelativeUrl) {
    const headers = { Authorization: `Bearer ${ApiService.getToken().access}` };
    const blob = await ApiService.streamAudio(`${config.apiBaseUrl}${libTrackRelativeUrl}download/`, headers);
    return URL.createObjectURL(blob);
  }
}
