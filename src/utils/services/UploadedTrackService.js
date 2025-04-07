import config from "../config";
import ApiService from "../api/ApiService";
import SpotifyTokenService from "./SpotifyTokenService";

export default class UploadedTrackService {
  /**
   * Gets uploaded tracks with background operation support
   * @param {number} page - The page number to fetch
   * @param {number} pageSize - The number of items per page
   * @param {boolean} showErrors - Whether to show errors to the user
   * @returns {Promise<Object>} The uploaded tracks data
   */
  static async getUploadedTracks(page = 1, pageSize = 50, showErrors = true) {
    // Check token but don't throw - background operations will handle auth gracefully
    if (!SpotifyTokenService.hasValidSpotifyToken()) {
      // Signal auth required but return empty data to prevent UI crashes
      return { results: [], count: 0, authentication_required: true };
    }

    try {
      const data = await ApiService.fetchData(`library/uploaded/?page=${page}&pageSize=${pageSize}`, "GET");
      return data;
    } catch (error) {
      if (showErrors) {
        // Signal auth required if appropriate
        if (error.statusCode === 401) {
          return { results: [], count: 0, authentication_required: true };
        }
        // Handle 404 as empty results
        if (error.message?.includes("Resource not found")) {
          return { results: [], count: 0 };
        }
      }

      // Rethrow for components that want to handle errors directly
      throw error;
    }
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
