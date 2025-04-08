import ApiService from "../api/ApiService";

export default class GenreService {
  static async getGenres() {
    let results = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await ApiService.fetchData("genres/", "GET", null, page);
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
    return await ApiService.fetchData("genres/", "POST", genreData, null);
  }

  static async putGenre(genreUuid, genreData, badRequestCatched = false) {
    return await ApiService.fetchData(`genres/${genreUuid}/`, "PUT", genreData, null, null, badRequestCatched);
  }

  static async deleteGenre(genreUuid) {
    return await ApiService.fetchData(`genres/${genreUuid}/`, "DELETE", null, null);
  }

  static async getGenrePlaylists() {
    console.log("[GenreService] Starting getGenrePlaylists request");
    let results = [];
    let page = 1;
    let hasMore = true;

    try {
      while (hasMore) {
        console.log("[GenreService] Fetching page", page);
        const data = await ApiService.fetchData("genre-playlists/", "GET", null, page);
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
    } catch (error) {
      console.error("[GenreService] Error in getGenrePlaylists:", error);
      throw error;
    }
  }
}
