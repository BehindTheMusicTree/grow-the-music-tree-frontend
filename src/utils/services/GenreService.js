import ApiService from "@utils/ApiService";
import BadRequestError from "@utils/errors/BadRequestError";
import UnauthorizedRequestError from "@utils/errors/UnauthorizedRequestError";

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
    let results = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await ApiService.fetchData("genre-playlists/", "GET", null, page);
      results = results.concat(data.results);

      if (data.next) {
        page++;
      } else {
        hasMore = false;
      }
    }

    return results;
  }
}
