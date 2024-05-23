import config from "../../config/config";
import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "../../constants";
import RequestError from "../errors/RequestError";
import BadRequestError from "../errors/BadRequestError";
import UnauthorizedRequestError from "../errors/UnauthorizedRequestError";

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse response. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}.`);
  }
};

const getResponseObjFromXhr = (xhr) => {
  return xhr.response;
};

const getResponseObjFromFetch = async (response) => {
  const responseObj = await parseJson(response);
  return responseObj;
};

const handleNotOkResponse = async (url, response) => {
  const status = response.status;
  if (status >= 400 && status < 600) {
    let errorMessage = "";
    const errorMessagePrefixe = `url ${url} - status ${status}`;
    try {
      let responseObj;
      if (response.json) {
        responseObj = await getResponseObjFromFetch(response);
      } else if (response.responseType && response.responseType === "json") {
        responseObj = getResponseObjFromXhr(response);
      }

      if (status === 400) {
        throw new BadRequestError(responseObj.errors);
      } else if (status === 401) {
        throw new UnauthorizedRequestError(responseObj.errors);
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
};

const getFetchErrorMessageOtherThanBadRequest = (error) => {
  if (error instanceof TypeError) {
    return `${error.message} probably because of a network error.`;
  } else {
    return error.message;
  }
};

const ApiService = {
  credentials: { username: config.username, password: config.password },

  getToken: () => {
    return JSON.parse(localStorage.getItem("jwtToken"));
  },

  setToken: (jwtToken) => {
    localStorage.setItem("jwtToken", JSON.stringify(jwtToken));
  },

  refreshToken: async () => {
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
          await handleNotOkResponse(url, response);
        }
      } else {
        await ApiService.login();
      }
    } catch (error) {
      const fetchErrorMessage = await getFetchErrorMessageOtherThanBadRequest(error);
      throw new Error(`Failed to refresh token. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`);
    }
  },

  getHeaders: async () => {
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
  },

  login: async () => {
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
        await handleNotOkResponse(url, response);
      } else {
        const responseJson = await parseJson(response);
        ApiService.setToken(responseJson);
      }
    } catch (error) {
      const fetchErrorMessage = await getFetchErrorMessageOtherThanBadRequest(error);
      throw new Error(`Failed to login. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`);
    }
  },

  getXhr: async (url, method, data, page, onProgress) => {
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
  },

  fetchData: async (endpoint, method, data = null, page = null, onProgress = null) => {
    console.log(`data: ${JSON.stringify(data, null, 2)}`);
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
              await handleNotOkResponse(url, xhr);
              reject(new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${xhr.statusText}`));
            } catch (error) {
              if (error instanceof UnauthorizedRequestError && mustRetryIfUnauthorized) {
                mustRetryIfUnauthorized = false;
                await ApiService.login();
                const xhr = await ApiService.getXhr(url, method, data, page, onProgress);
                xhr.send(data ? (data instanceof FormData ? data : JSON.stringify(data)) : null);
              }
              reject(error);
            }
          }
        };

        xhr.onerror = async () => {
          try {
            const fetchErrorMessage = await getFetchErrorMessageOtherThanBadRequest(xhr);
            reject(new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`));
          } catch (error) {
            reject(error);
          }
        };

        xhr.send(data ? (data instanceof FormData ? data : JSON.stringify(data)) : null);
      });
    } catch (error) {
      const fetchErrorMessage = await getFetchErrorMessageOtherThanBadRequest(error);
      throw new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`);
    }
  },

  getLibTracks: async () => {
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
  },

  retrieveLibTrack: async (libTrackUuid) => {
    return await ApiService.fetchData(`tracks/${libTrackUuid}/`, "GET", null, null);
  },

  postLibTrack: async (file, genreUuid, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    if (genreUuid !== null) {
      formData.append("genreUuid", genreUuid);
    }
    return await ApiService.fetchData("tracks/", "POST", formData, null, onProgress);
  },

  putLibTrack: async (libTrackUuid, libTrackData) => {
    return await ApiService.fetchData(`tracks/${libTrackUuid}/`, "PUT", libTrackData, null);
  },

  loadAudioAndGetLibTrackBlobUrl: async (libTrackRelativeUrl) => {
    const headers = { Authorization: `Bearer ${ApiService.getToken().access}` };
    const blob = await ApiService.streamAudio(`${config.apiBaseUrl}${libTrackRelativeUrl}download/`, headers);
    return URL.createObjectURL(blob);
  },

  streamAudio: async (trackUrl) => {
    const headers = await ApiService.getHeaders();
    const response = await fetch(trackUrl, { headers });

    if (!response.ok) {
      await handleNotOkResponse(trackUrl, response);
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
  },

  getGenres: async () => {
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
  },

  postGenre: async (genreData) => {
    return await ApiService.fetchData("genres/", "POST", genreData, null);
  },

  getGenrePlaylists: async () => {
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
  },

  retrievePlaylist: async (playlistUuid) => {
    return await ApiService.fetchData(`playlists/${playlistUuid}/`, "GET", null, null);
  },

  postPlay: async (contentObjectUuid) => {
    const data = { contentObjectUuid: contentObjectUuid };
    return await ApiService.fetchData(`plays/`, "POST", data, null);
  },
};

export default ApiService;
