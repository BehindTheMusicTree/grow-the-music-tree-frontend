import config from "../../config/config";
import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "../../constants";
import { BadRequestError } from "../errors/BadRequestError";

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse response. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}.`);
  }
};

const handleNotOkResponse = async (url, response) => {
  if (response.status >= 400 && response.status < 600) {
    let errorMessage = "";
    const errorMessagePrefixe = `url ${url} - status ${response.status}`;
    try {
      const responseObj = await parseJson(response);
      if (response.status === 400) {
        throw new BadRequestError(responseObj.errors);
      }
      errorMessage = JSON.stringify(responseObj);
      throw new Error(`${errorMessagePrefixe} ${errorMessage ? ` - ${errorMessage}` : ""}`);
    } catch (error) {
      if (error instanceof BadRequestError) {
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

  fetchData: async (endpoint, method, data = null, page = null) => {
    let url = `${config.apiBaseUrl}${endpoint}`;
    if (page) {
      url += `?page=${page}`;
    }

    try {
      const headers = await ApiService.getHeaders();

      if (data instanceof FormData) {
        delete headers["Content-Type"];
      }

      const response = await fetch(url, {
        method,
        headers: headers,
        body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : null,
      });

      if (!response.ok) {
        await handleNotOkResponse(url, response);
      } else {
        const resonseJson = await parseJson(response);
        return resonseJson;
      }
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      } else {
        const fetchErrorMessage = await getFetchErrorMessageOtherThanBadRequest(error);
        throw new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`);
      }
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

  postLibTracks: async (file, genreUuid) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("genreUuid", genreUuid);
    return await ApiService.fetchData("tracks/", "POST", formData, null);
  },
};

export default ApiService;
