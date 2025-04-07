import config from "./config";
import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "./constants";
import RequestError from "./api/errors/RequestError";
import BadRequestError from "./api/errors/BadRequestError";
import UnauthorizedRequestError from "./api/errors/UnauthorizedRequestError";
import InternalServerError from "./api/errors/InternalServerError";
import ConnectivityError from "./api/errors/ConnectivityError";
import ApiLogger from "./api/ApiLogger";
import ApiErrorHandler from "./ApiErrorHandler";
import ApiAuthHelper from "./ApiAuthHelper";

/**
 * Core API service handling HTTP requests and response management
 */
export default class ApiService {
  static errorSubscribers = [];

  static logApiCall(method, url, data = null) {
    console.log(`[API] ${method} ${url}`, data ? `\nRequest data: ${JSON.stringify(data, null, 2)}` : "");
  }

  static logApiResponse(method, url, response) {
    console.log(`[API] ${method} ${url} Response:`, response);
  }

  static logApiError(method, url, error) {
    console.error(`[API] ${method} ${url} Error:`, error);
  }

  static onError(callback) {
    this.errorSubscribers.push(callback);
    return () => {
      this.errorSubscribers = this.errorSubscribers.filter((subscriber) => subscriber !== callback);
    };
  }

  static async parseJson(response) {
    return ApiErrorHandler.parseJson(response);
  }

  static getResponseObjFromXhr(xhr) {
    return ApiErrorHandler.getResponseObjFromXhr(xhr);
  }

  static extractErrorFromHtml(html) {
    return ApiErrorHandler.extractErrorFromHtml(html);
  }

  static async getResponseObjFromFetch(response) {
    return ApiErrorHandler.getResponseObjFromFetch(response);
  }

  static async handleNotOkResponse(url, response) {
    return ApiErrorHandler.handleNotOkResponse(url, response);
  }

  static isConnectivityError(error) {
    return ApiErrorHandler.isConnectivityError(error);
  }

  static getFetchErrorMessageOtherThanBadRequest(error, url) {
    return ApiErrorHandler.getFetchErrorMessageOtherThanBadRequest(error, url);
  }

  static getToken() {
    return ApiAuthHelper.getSpotifyToken();
  }

  static hasValidToken() {
    return ApiAuthHelper.hasValidToken();
  }

  static throwAuthError() {
    return ApiAuthHelper.throwAuthError();
  }

  static async getHeaders() {
    try {
      if (!this.hasValidToken()) {
        this.throwAuthError();
      }

      const spotifyToken = this.getToken();
      return ApiAuthHelper.generateHeaders(spotifyToken);
    } catch (error) {
      console.error("[API] Failed to get headers:", error);
      throw new Error(`Failed to get headers. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}`);
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
          console.log(`[API] Upload progress: ${progress}%`);
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

    // this.logApiCall(method, url, data);

    try {
      if (!this.hasValidToken()) {
        this.throwAuthError();
      }

      /* We use XMLHttpRequest because fetch doesn't provide progression for file uploads */
      const xhr = await ApiService.getXhr(url, method, data, page, onProgress);

      return new Promise((resolve, reject) => {
        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = xhr.response;
            this.logApiResponse(method, url, response);
            resolve(response);
          } else {
            try {
              await this.handleNotOkResponse(url, xhr);
              reject(new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${xhr.statusText}`));
            } catch (error) {
              if (error instanceof UnauthorizedRequestError) {
                // Token is invalid or expired - notify subscribers so popup can be shown
                this.errorSubscribers.forEach((callback) => callback(error));
                reject(error);
              } else if (error instanceof RequestError) {
                if (error instanceof ConnectivityError || !(error instanceof BadRequestError) || !badRequestCatched) {
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

              const connectivityError = new ConnectivityError(corsErrorObj);
              this.errorSubscribers.forEach((callback) => callback(connectivityError));
              reject(connectivityError);
            } else {
              const fetchErrorMessage = await this.getFetchErrorMessageOtherThanBadRequest(xhr, url);
              reject(new Error(fetchErrorMessage));
            }
          } catch (error) {
            reject(error);
          }
        };

        xhr.send(data);
      });
    } catch (error) {
      this.logApiError(method, url, error);
      throw error;
    }
  }

  static async streamAudio(trackUrl) {
    console.log("[API] Streaming audio from:", trackUrl);
    const headers = await ApiService.getHeaders();
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

  static async get(url, params = {}, badRequestCatched = false) {
    try {
      const headers = await ApiAuthHelper.getHeaders();
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
          throw new UnauthorizedRequestError("Unauthorized request");
        }
        if (response.status === 400 && !badRequestCatched) {
          throw new BadRequestError(responseData);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      ApiLogger.logError("GET", url, error);
      throw error;
    }
  }

  static async post(url, data = {}, badRequestCatched = false) {
    try {
      const headers = await ApiAuthHelper.getHeaders();
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
          throw new UnauthorizedRequestError("Unauthorized request");
        }
        if (response.status === 400 && !badRequestCatched) {
          throw new BadRequestError(responseData);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      ApiLogger.logError("POST", url, error);
      throw error;
    }
  }

  static async put(url, data = {}, badRequestCatched = false) {
    try {
      const headers = await ApiAuthHelper.getHeaders();
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
          throw new UnauthorizedRequestError("Unauthorized request");
        }
        if (response.status === 400 && !badRequestCatched) {
          throw new BadRequestError(responseData);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      ApiLogger.logError("PUT", url, error);
      throw error;
    }
  }

  static async delete(url, badRequestCatched = false) {
    try {
      const headers = await ApiAuthHelper.getHeaders();
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
          throw new UnauthorizedRequestError("Unauthorized request");
        }
        if (response.status === 400 && !badRequestCatched) {
          throw new BadRequestError(responseData);
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
