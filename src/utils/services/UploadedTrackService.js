import config from "../config";
import ApiService from "../api/ApiService";

export default class UploadedTrackService {
  /**
   * Gets uploaded tracks with background operation support
   * @param {number} page - The page number to fetch
   * @param {number} pageSize - The number of items per page
   * @param {boolean} showErrors - Whether to show errors to the user
   * @param {boolean} requiresAuth - Whether authentication is required
   * @returns {Promise<Object>} The uploaded tracks data
   */
  static async getUploadedTracks(page = 1, pageSize = 50) {
    return await ApiService.fetchData(
      `library/uploaded/?page=${page}&pageSize=${pageSize}`,
      "GET",
      null,
      null,
      null,
      false,
      true
    );
  }

  static async retrieveUploadedTrack(uploadedTrackUuid) {
    return await ApiService.fetchData(`library/uploaded/${uploadedTrackUuid}/`, "GET", null, null, null, false, true);
  }

  static async uploadTrack(file, genreUuid, onProgress, badRequestCatched = false) {
    const formData = new FormData();
    formData.append("file", file);
    if (genreUuid) {
      formData.append("genre", genreUuid); // API expects "genre" instead of "genreUuid"
    }
    return await ApiService.fetchData("library/uploaded/", "POST", formData, null, onProgress, badRequestCatched, true);
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
    return await ApiService.fetchData(
      `library/uploaded/${uploadedTrackUuid}/`,
      "PUT",
      transformedData,
      null,
      null,
      false,
      true
    );
  }

  static async loadAudioAndGetUploadedTrackBlobUrl(uploadedTrackRelativeUrl) {
    if (!uploadedTrackRelativeUrl) {
      console.error("Cannot load audio: uploadedTrackRelativeUrl is undefined");
      throw new Error("Track URL is undefined");
    }
    const blob = await ApiService.streamAudio(`${config.apiBaseUrl}${uploadedTrackRelativeUrl}download/`);
    return URL.createObjectURL(blob);
  }
}
