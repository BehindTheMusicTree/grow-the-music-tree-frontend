import ApiService from "./ApiService";

class PlayService {
  static async playContent(contentUuid) {
    return ApiService.fetchData("play/start/", {
      method: "POST",
      body: JSON.stringify({ content: contentUuid }),
    });
  }

  static async pause() {
    return ApiService.fetchData("play/pause/", {
      method: "POST",
    });
  }

  static async resume() {
    return ApiService.fetchData("play/resume/", {
      method: "POST",
    });
  }

  static async stop() {
    return ApiService.fetchData("play/stop/", {
      method: "POST",
    });
  }

  static async next() {
    return ApiService.fetchData("play/next/", {
      method: "POST",
    });
  }

  static async previous() {
    return ApiService.fetchData("play/previous/", {
      method: "POST",
    });
  }

  static async seek(position) {
    return ApiService.fetchData("play/seek/", {
      method: "POST",
      body: JSON.stringify({ position }),
    });
  }

  static async getStatus() {
    return ApiService.fetchData("play/status/");
  }
}

export default PlayService;
