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
      formData.append("genre", genreUuid); // API expects "genre" instead of "genreUuid"
    }
    return await ApiService.fetchData("tracks/", "POST", formData, null, onProgress, badRequestCatched);
  }

  static transformTrackData(data) {
    return {
      ...data,
      artistsNames: data.artistName ? [data.artistName] : data.artistsNames,
      // Remove artistName if it exists as it's not needed in the API
      artistName: undefined,
      genre: data.genre?.uuid || data.genre,
    };
  }

  static async putLibTrack(libTrackUuid, libTrackData) {
    const transformedData = this.transformTrackData(libTrackData);
    return await ApiService.fetchData(`tracks/${libTrackUuid}/`, "PUT", transformedData, null);
  }

  static async loadAudioAndGetLibTrackBlobUrl(libTrackRelativeUrl) {
    if (!libTrackRelativeUrl) {
      console.error("Cannot load audio: libTrackRelativeUrl is undefined");
      throw new Error("Track URL is undefined");
    }
    const headers = { Authorization: `Bearer ${ApiService.getToken().access}` };
    const blob = await ApiService.streamAudio(`${config.apiBaseUrl}${libTrackRelativeUrl}download/`, headers);
    return URL.createObjectURL(blob);
  }
}
