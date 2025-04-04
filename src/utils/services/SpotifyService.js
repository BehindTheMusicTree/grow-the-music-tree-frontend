import ApiService from "../ApiService";

export default class SpotifyService {
  static async getLibTracks(page = 1, pageSize = 50) {
    return await ApiService.fetchData(`tracks/spotify?page=${page}&page_size=${pageSize}`, "GET");
  }
}
