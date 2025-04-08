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
  static async getUploadedTracks(page = 1, pageSize = 50, showErrors = true, requiresAuth = false) {
    // Don't require auth by default - this allows background operations to handle auth failures gracefully
    try {
      const data = await ApiService.fetchData(
        `library/uploaded/?page=${page}&pageSize=${pageSize}`,
        "GET",
        null,
        null,
        null,
        false,
        requiresAuth
      );
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
    // ApiService handles authentication
    return await ApiService.fetchData(`library/uploaded/${uploadedTrackUuid}/`, "GET", null, null, null, false, true);
  }

  static async uploadTrack(file, genreUuid, onProgress, badRequestCatched = false) {
    // ApiService handles authentication
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
    // ApiService handles authentication
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
    // ApiService will handle authentication internally
    const blob = await ApiService.streamAudio(`${config.apiBaseUrl}${uploadedTrackRelativeUrl}download/`);
    return URL.createObjectURL(blob);
  }
}
