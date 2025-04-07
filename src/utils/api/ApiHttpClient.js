import config from "../config";
import ApiAuthHelper from "./ApiAuthHelper";
import ApiErrorHandler from "./ApiErrorHandler";
import ApiLogger from "./ApiLogger";

/**
 * Handles API HTTP requests
 */
export default class ApiHttpClient {
  /**
   * Subscribers for API error events
   */
  static errorSubscribers = [];

  /**
   * Base URL for API requests
   */
  static baseUrl = config.apiBaseUrl;

  /**
   * Registers an error callback
   * @param {Function} callback - Function to call when an error occurs
   * @returns {Function} Unsubscribe function
   */
  static onError(callback) {
    this.errorSubscribers.push(callback);

    return () => {
      this.errorSubscribers = this.errorSubscribers.filter((subscriber) => subscriber !== callback);
    };
  }

  /**
   * Creates an XMLHttpRequest object with headers
   */
  static async getXhr(url, method, data, page, onProgress) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open(method, url, true);
    const headers = await ApiAuthHelper.getHeaders();
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
          console.log(`[API] Upload progress: ${progress}%`);
          onProgress(progress);
        }
      };
    }
    return xhr;
  }

  /**
   * Main method for making API requests
   */
  static async fetchData(endpoint, method, data = null, page = null, onProgress = null, badRequestCatched = false) {
    let url = `${config.apiBaseUrl}${endpoint}`;
    if (page) {
      url += `?page=${page}`;
    }

    try {
      if (!ApiAuthHelper.hasValidToken()) {
        ApiAuthHelper.throwAuthError();
      }

      /* We use XMLHttpRequest because fetch doesn't provide progression for file uploads */
      const xhr = await this.getXhr(url, method, data, page, onProgress);

      return new Promise((resolve, reject) => {
        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = xhr.response;
            ApiLogger.logApiResponse(method, url, response);
            resolve(response);
          } else {
            try {
              await ApiErrorHandler.handleNotOkResponse(url, xhr);
              reject(new Error(`Failed to ${method} ${endpoint}. ${xhr.statusText}`));
            } catch (error) {
              if (error.name === "UnauthorizedRequestError") {
                // Token is invalid or expired - notify subscribers so popup can be shown
                this.errorSubscribers.forEach((callback) => callback(error));
                reject(error);
              } else if (error.name && error.name.includes("RequestError")) {
                if (error.name === "ConnectivityError" || !(error.name === "BadRequestError") || !badRequestCatched) {
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
            // XMLHttpRequest errors are often CORS-related
            if (xhr.status === 0) {
              // Status 0 often indicates a CORS error
              const corsErrorObj = {
                message: "A connectivity error occurred",
                url: url,
              };

              const connectivityError = { name: "ConnectivityError", ...corsErrorObj };
              this.errorSubscribers.forEach((callback) => callback(connectivityError));
              reject(connectivityError);
            } else {
              const fetchErrorMessage = await ApiErrorHandler.getFetchErrorMessageOtherThanBadRequest(xhr, url);
              reject(new Error(fetchErrorMessage));
            }
          } catch (error) {
            reject(error);
          }
        };

        xhr.send(data);
      });
    } catch (error) {
      ApiLogger.logApiError(method, url, error);
      throw error;
    }
  }

  /**
   * Streams audio from a URL
   */
  static async streamAudio(trackUrl) {
    console.log("[API] Streaming audio from:", trackUrl);
    const headers = await ApiAuthHelper.getHeaders();
    const response = await fetch(trackUrl, { headers });

    if (!response.ok) {
      console.error("[API] Audio stream error:", response.status, response.statusText);
      throw new Error(`Failed to stream audio: ${response.status} ${response.statusText}`);
    }

    return new ReadableStream({
      start(controller) {
        const reader = response.body.getReader();
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
  }

  /**
   * Performs a GET request
   */
  static async get(url, params = {}, badRequestCatched = false) {
    try {
      const token = await ApiAuthHelper.getSpotifyToken();
      const headers = ApiAuthHelper.generateHeaders(token);
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
      const fullUrl = `${this.baseUrl}${url}${queryString}`;

      ApiLogger.logRequest("GET", fullUrl, params, headers);

      const response = await fetch(fullUrl, {
        method: "GET",
        headers,
      });

      const responseData = await response.json();
      ApiLogger.logResponse("GET", fullUrl, response.status, response.statusText, responseData);

      if (!response.ok) {
        if (response.status === 401) {
          throw { name: "UnauthorizedRequestError", message: "Unauthorized request" };
        }
        if (response.status === 400 && !badRequestCatched) {
          throw { name: "BadRequestError", ...responseData };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      ApiLogger.logError("GET", url, error);
      throw error;
    }
  }

  /**
   * Performs a POST request
   */
  static async post(url, data = {}, badRequestCatched = false) {
    try {
      const token = await ApiAuthHelper.getSpotifyToken();
      const headers = ApiAuthHelper.generateHeaders(token);
      const fullUrl = `${this.baseUrl}${url}`;

      ApiLogger.logRequest("POST", fullUrl, null, headers, data);

      const response = await fetch(fullUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      ApiLogger.logResponse("POST", fullUrl, response.status, response.statusText, responseData);

      if (!response.ok) {
        if (response.status === 401) {
          throw { name: "UnauthorizedRequestError", message: "Unauthorized request" };
        }
        if (response.status === 400 && !badRequestCatched) {
          throw { name: "BadRequestError", ...responseData };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      ApiLogger.logError("POST", url, error);
      throw error;
    }
  }

  /**
   * Performs a PUT request
   */
  static async put(url, data = {}, badRequestCatched = false) {
    try {
      const token = await ApiAuthHelper.getSpotifyToken();
      const headers = ApiAuthHelper.generateHeaders(token);
      const fullUrl = `${this.baseUrl}${url}`;

      ApiLogger.logRequest("PUT", fullUrl, null, headers, data);

      const response = await fetch(fullUrl, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      ApiLogger.logResponse("PUT", fullUrl, response.status, response.statusText, responseData);

      if (!response.ok) {
        if (response.status === 401) {
          throw { name: "UnauthorizedRequestError", message: "Unauthorized request" };
        }
        if (response.status === 400 && !badRequestCatched) {
          throw { name: "BadRequestError", ...responseData };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      ApiLogger.logError("PUT", url, error);
      throw error;
    }
  }

  /**
   * Performs a DELETE request
   */
  static async delete(url, badRequestCatched = false) {
    try {
      const token = await ApiAuthHelper.getSpotifyToken();
      const headers = ApiAuthHelper.generateHeaders(token);
      const fullUrl = `${this.baseUrl}${url}`;

      ApiLogger.logRequest("DELETE", fullUrl, null, headers);

      const response = await fetch(fullUrl, {
        method: "DELETE",
        headers,
      });

      const responseData = await response.json();
      ApiLogger.logResponse("DELETE", fullUrl, response.status, response.statusText, responseData);

      if (!response.ok) {
        if (response.status === 401) {
          throw { name: "UnauthorizedRequestError", message: "Unauthorized request" };
        }
        if (response.status === 400 && !badRequestCatched) {
          throw { name: "BadRequestError", ...responseData };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      ApiLogger.logError("DELETE", url, error);
      throw error;
    }
  }
}
