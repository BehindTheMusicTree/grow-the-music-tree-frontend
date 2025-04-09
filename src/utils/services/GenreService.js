import ApiService from "../api/ApiService";

export default class GenreService {
  // Authentication is now handled by ApiService

  static async getGenres() {
    // ApiService handles authentication and connectivity errors
    let results = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await ApiService.fetchData("genres/", "GET", null, page, null, false, true);
      results = results.concat(data.results);

      if (data.next) {
        page++;
      } else {
        hasMore = false;
      }
    }

    return results;
  }

  static async postGenre(genreData) {
    // ApiService handles authentication and connectivity errors
    return await ApiService.fetchData("genres/", "POST", genreData, null, null, false, true);
  }

  static async putGenre(genreUuid, genreData, badRequestCatched = false) {
    // Pass badRequestCatched parameter directly to ApiService
    // ApiService will handle authentication, connectivity, and badRequest errors
    return await ApiService.fetchData(`genres/${genreUuid}/`, "PUT", genreData, null, null, badRequestCatched, true);
  }

  static async deleteGenre(genreUuid) {
    // ApiService handles authentication and connectivity errors
    return await ApiService.fetchData(`genres/${genreUuid}/`, "DELETE", null, null, null, false, true);
  }

  static async getGenrePlaylists() {
    // ApiService handles authentication and connectivity errors
    let results = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log("[GenreService] Fetching page", page);
      const data = await ApiService.fetchData("genre-playlists/", "GET", null, page, null, false, true);
      console.log("[GenreService] Received data for page", page, data);
      results = results.concat(data.results);

      if (data.next) {
        page++;
      } else {
        hasMore = false;
      }
    }

    console.log("[GenreService] Completed fetching all pages, total results:", results.length);
    return results;
  }
}
