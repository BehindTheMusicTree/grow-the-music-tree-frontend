import config from "../config";
import ApiService from "../ApiService";

export default class UploadedTrackService {
  static async getUploadedTracks() {
    let results = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await ApiService.fetchData("library/uploaded/", "GET", null, page);
      results = results.concat(data.results);

      if (data.next) {
        page++;
      } else {
        hasMore = false;
      }
    }

    return results;
  }

  static async retrieveUploadedTrack(uploadedTrackUuid) {
    return await ApiService.fetchData(`library/uploaded/${uploadedTrackUuid}/`, "GET", null, null);
  }

  static async uploadTrack(file, genreUuid, onProgress, badRequestCatched = false) {
    const formData = new FormData();
    formData.append("file", file);
    if (genreUuid) {
      formData.append("genre", genreUuid); // API expects "genre" instead of "genreUuid"
    }
    return await ApiService.fetchData("library/uploaded/", "POST", formData, null, onProgress, badRequestCatched);
  }

  static transformTrackData(data) {
    return {
      ...data,
      artistsNames: data.artistName ? [data.artistName] : data.artistsNames,
      artistName: undefined,
      genre: data.genre?.uuid || data.genreName,
      genreName: undefined,
    };
  }

  static async putUploadedTrack(uploadedTrackUuid, uploadedTrackData) {
    const transformedData = this.transformTrackData(uploadedTrackData);
    return await ApiService.fetchData(`library/uploaded/${uploadedTrackUuid}/`, "PUT", transformedData, null);
  }

  static async loadAudioAndGetUploadedTrackBlobUrl(uploadedTrackRelativeUrl) {
    if (!uploadedTrackRelativeUrl) {
      console.error("Cannot load audio: uploadedTrackRelativeUrl is undefined");
      throw new Error("Track URL is undefined");
    }
    const headers = { Authorization: `Bearer ${ApiService.getToken().access}` };
    const blob = await ApiService.streamAudio(`${config.apiBaseUrl}${uploadedTrackRelativeUrl}download/`, headers);
    return URL.createObjectURL(blob);
  }
}
