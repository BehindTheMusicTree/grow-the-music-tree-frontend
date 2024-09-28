import config from "./config";
import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "./constants";
import RequestError from "./errors/RequestError";
import BadRequestError from "./errors/BadRequestError";
import UnauthorizedRequestError from "./errors/UnauthorizedRequestError";
import InternalServerError from "./errors/InternalServerError";

export default class ApiService {
  static credentials = { username: config.apiUsername, password: config.apiUserPassword };
  static errorSubscribers = [];

  static onError(callback) {
    this.errorSubscribers.push(callback);

    return () => {
      this.errorSubscribers = this.errorSubscribers.filter((subscriber) => subscriber !== callback);
    };
  }

  static async parseJson(response) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to parse response. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}.`);
    }
  }

  static getResponseObjFromXhr(xhr) {
    return xhr.response;
  }

  static async getResponseObjFromFetch(response) {
    const responseObj = await this.parseJson(response);
    return responseObj;
  }

  static async handleNotOkResponse(url, response) {
    const status = response.status;
    if (status >= 400 && status < 600) {
      let errorMessage = "";
      const errorMessagePrefixe = `url ${url} - status ${status}`;
      try {
        let responseObj;
        if (response.json) {
          responseObj = await this.getResponseObjFromFetch(response);
        } else if (response.responseType && response.responseType === "json") {
          responseObj = this.getResponseObjFromXhr(response);
        }

        if (status === 400) {
          throw new BadRequestError(responseObj.errors);
        } else if (status === 401) {
          throw new UnauthorizedRequestError(responseObj.errors);
        } else if (status === 500) {
          throw new InternalServerError(responseObj.errors);
        }

        errorMessage = JSON.stringify(responseObj);
        throw new Error(`${errorMessagePrefixe} ${errorMessage ? ` - ${errorMessage}` : ""}`);
      } catch (error) {
        if (error instanceof RequestError) {
          throw error;
        }
        throw new Error(
          `${errorMessagePrefixe} - the response message could not be analysed. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}`
        );
      }
    }
    return "";
  }

  static getFetchErrorMessageOtherThanBadRequest(error) {
    if (error instanceof TypeError) {
      return `${error.message} probably because of a network error.`;
    } else {
      return error.message;
    }
  }

  static getToken() {
    return JSON.parse(localStorage.getItem("jwtToken"));
  }

  static setToken(jwtToken) {
    localStorage.setItem("jwtToken", JSON.stringify(jwtToken));
  }

  static async refreshToken() {
    const refreshToken = ApiService.getToken().refresh;
    try {
      if (refreshToken) {
        const url = `${config.apiBaseUrl}auth/token/refresh/`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
          const responseJson = await response.json();
          let newToken = ApiService.getToken();
          newToken.access = responseJson.access;
          ApiService.setToken(newToken);
        } else if (response.status === 401) {
          await ApiService.login();
        } else {
          await this.handleNotOkResponse(url, response);
        }
      } else {
        await ApiService.login();
      }
    } catch (error) {
      const fetchErrorMessage = await this.getFetchErrorMessageOtherThanBadRequest(error);
      throw new Error(`Failed to refresh token. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`);
    }
  }

  static async getHeaders() {
    const token = ApiService.getToken();
    let accessToken = token ? token.access : null;
    try {
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          const expDate = new Date(payload.exp * 1000);
          if (expDate < new Date()) {
            await ApiService.refreshToken();
            accessToken = ApiService.getToken().access;
          }
        } catch (error) {
          throw new Error(`Error setting access token. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}`);
        }
        return {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        };
      } else {
        await ApiService.login();
        return ApiService.getHeaders();
      }
    } catch (error) {
      throw new Error(`Failed to get headers. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}`);
    }
  }

  static async login() {
    try {
      const url = `${config.apiBaseUrl}auth/token/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ApiService.credentials),
      });

      if (!response.ok) {
        await this.handleNotOkResponse(url, response);
      } else {
        const responseJson = await this.parseJson(response);
        ApiService.setToken(responseJson);
      }
    } catch (error) {
      const fetchErrorMessage = await this.getFetchErrorMessageOtherThanBadRequest(error);
      throw new Error(`Failed to login. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`);
    }
  }

  static async getXhr(url, method, data, page, onProgress) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open(method, url, true);
    const headers = await ApiService.getHeaders();
    if (data instanceof FormData) {
      delete headers["Content-Type"];
    }

    Object.keys(headers).forEach((key) => {
      xhr.setRequestHeader(key, headers[key]);
    });

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      };
    }
    return xhr;
  }

  static async fetchData(endpoint, method, data = null, page = null, onProgress = null, badRequestCatched = false) {
    let url = `${config.apiBaseUrl}${endpoint}`;
    if (page) {
      url += `?page=${page}`;
    }

    try {
      /* We use XMLHttpRequest because fetch doesn't provide progression for file uploads */
      const xhr = await ApiService.getXhr(url, method, data, page, onProgress);

      return new Promise((resolve, reject) => {
        let mustRetryIfUnauthorized = true;
        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            try {
              await this.handleNotOkResponse(url, xhr, badRequestCatched);
              reject(new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${xhr.statusText}`));
            } catch (error) {
              if (error instanceof UnauthorizedRequestError && mustRetryIfUnauthorized) {
                mustRetryIfUnauthorized = false;
                await ApiService.login();
                const xhr = await ApiService.getXhr(url, method, data, page, onProgress);
                xhr.send(data ? (data instanceof FormData ? data : JSON.stringify(data)) : null);
                reject(error);
              } else if (error instanceof RequestError) {
                if (!(error instanceof BadRequestError) || !badRequestCatched) {
                  this.errorSubscribers.forEach((callback) => callback(error));
                } else {
                  reject(error);
                }
              }
            }
          }
        };

        xhr.onerror = async () => {
          try {
            const fetchErrorMessage = await this.getFetchErrorMessageOtherThanBadRequest(xhr);
            reject(new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`));
          } catch (error) {
            reject(error);
          }
        };

        xhr.send(data ? (data instanceof FormData ? data : JSON.stringify(data)) : null);
      });
    } catch (error) {
      const fetchErrorMessage = await this.getFetchErrorMessageOtherThanBadRequest(error);
      throw new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`);
    }
  }

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
      formData.append("genreUuid", genreUuid);
    }
    return await ApiService.fetchData("tracks/", "POST", formData, null, onProgress, badRequestCatched);
  }

  static async putLibTrack(libTrackUuid, libTrackData) {
    return await ApiService.fetchData(`tracks/${libTrackUuid}/`, "PUT", libTrackData, null);
  }

  static async loadAudioAndGetLibTrackBlobUrl(libTrackRelativeUrl) {
    const headers = { Authorization: `Bearer ${ApiService.getToken().access}` };
    const blob = await ApiService.streamAudio(`${config.apiBaseUrl}${libTrackRelativeUrl}download/`, headers);
    return URL.createObjectURL(blob);
  }

  static async streamAudio(trackUrl) {
    const headers = await ApiService.getHeaders();
    const response = await fetch(trackUrl, { headers });

    if (!response.ok) {
      await this.handleNotOkResponse(trackUrl, response);
    }

    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "audio/*" },
    }).blob();
  }

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

  static async putGenre(genreUuid, genreData) {
    return await ApiService.fetchData(`genres/${genreUuid}/`, "PUT", genreData, null);
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

  static async retrievePlaylist(playlistUuid) {
    return await ApiService.fetchData(`playlists/${playlistUuid}/`, "GET", null, null);
  }

  static async postPlay(contentObjectUuid) {
    const data = { contentObjectUuid: contentObjectUuid };
    return await ApiService.fetchData(`plays/`, "POST", data, null);
  }
}
