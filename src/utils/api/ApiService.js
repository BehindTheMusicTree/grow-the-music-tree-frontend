import config from "@utils/config";
import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "../constants";
import RequestError from "./errors/RequestError";
import BadRequestError from "./errors/BadRequestError";
import UnauthorizedRequestError from "./errors/UnauthorizedRequestError";
import ConnectivityError from "./errors/ConnectivityError";
import ServerAvailabilityTracker from "./ServerAvailabilityTracker";
import ApiLogger from "./ApiLogger";
import ApiErrorHandler from "./ApiErrorHandler";
import ApiAuthHelper from "./ApiAuthHelper";
/**
 * Core API service handling HTTP requests and response management
 */
export default class ApiService {
  static errorSubscribers = [];
  static serverTracker = new ServerAvailabilityTracker();
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

  /**
   * Handles an error by checking server status and notifying subscribers
   * @param {Object} error - The error that occurred
   * @param {string} endpoint - The API endpoint that failed
   * @param {string} method - The HTTP method that was used (GET, POST, etc.)
   */
  static handleError(error, endpoint, method = "UNKNOWN") {
    // Record the error and check if server is likely down
    const shouldNotifyServerDown = this.serverTracker.recordError(error, endpoint, method);

    if (shouldNotifyServerDown) {
      // Create a special server-down connectivity error
      const serverDownError = this.serverTracker.createServerDownError(endpoint, method);

      // Notify subscribers about the server down status
      this.errorSubscribers.forEach((callback) => callback(serverDownError));
      return true;
    }

    return false;
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

  static async getToken() {
    const token = ApiAuthHelper.getApiToken();
    console.log("[API] Retrieved token:", { exists: !!token, length: token?.length });
    return token;
  }

  static hasValidToken() {
    console.log("[ApiService hasValidToken] Checking token status");
    const hasToken = ApiAuthHelper.hasValidToken();
    console.log("[API] Token validation check:", { hasValidToken: hasToken });
    return hasToken;
  }

  /**
   * Centralized method to check authentication
   * @throws {UnauthorizedRequestError} If not authenticated
   */
  static ensureAuthenticated() {
    console.log("[ApiService ensureAuthenticated] Checking token status");
    if (!this.hasValidToken()) {
      console.log("[ApiService ensureAuthenticated] No valid token, throwing auth error");
      throw new UnauthorizedRequestError({
        message: "Authentication required",
        details: {
          type: "spotify_auth_required",
          message: "Please authenticate with Spotify to continue",
        },
      });
    }
  }

  static throwAuthError() {
    return ApiAuthHelper.throwAuthError();
  }

  static async getHeaders() {
    try {
      console.log("[ApiService getHeaders] Checking token status");
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

  static async fetchData(
    endpoint,
    method,
    data = null,
    page = null,
    onProgress = null,
    badRequestCatched = false,
    requiresAuth = true
  ) {
    console.log("[ApiService] Starting fetchData:", { endpoint, method, page, requiresAuth });
    let url = `${config.apiBaseUrl}${endpoint}`;
    if (page) {
      url += `?page=${page}`;
    }
    console.log("[ApiService] Constructed URL:", url);

    try {
      // Check auth if required
      if (requiresAuth) {
        console.log("[ApiService] Auth required, checking token validity");
        this.ensureAuthenticated();
      }

      console.log("[ApiService] Getting XHR with headers");
      const xhr = await ApiService.getXhr(url, method, data, page, onProgress);
      console.log("[ApiService] XHR configured");

      return new Promise((resolve, reject) => {
        xhr.onload = async () => {
          console.log("[ApiService] XHR loaded, status:", xhr.status);
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = xhr.response;
            console.log("[ApiService] Successful response:", response);
            this.logApiResponse(method, url, response);
            resolve(response);
          } else {
            console.log("[ApiService] Error response:", xhr.status, xhr.statusText);
            try {
              await this.handleNotOkResponse(url, xhr);
              reject(new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${xhr.statusText}`));
            } catch (error) {
              console.error("[ApiService] Error handling response:", error);
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
          console.error("[ApiService] XHR error occurred");
          try {
            // XMLHttpRequest errors are often CORS-related
            if (xhr.status === 0) {
              console.log("[ApiService] CORS error detected");
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
            console.error("[ApiService] Error in onerror handler:", error);
            reject(error);
          }
        };

        console.log("[ApiService] Sending XHR request");
        xhr.send(data);
      });
    } catch (error) {
      console.error("[ApiService] Error in fetchData:", error);
      this.logApiError(method, url, error);
      throw error;
    }
  }

  /**
   * Centralized method to handle API connectivity errors
   * @param {Error} error - The error that occurred
   * @param {string} endpoint - The API endpoint that failed
   * @param {string} method - The HTTP method that was used
   * @param {string} fullUrl - The full URL that was requested
   * @returns {ConnectivityError} - The connectivity error to throw
   */
  static handleApiConnectivityError(error, endpoint, method, fullUrl) {
    // Check if it's a network error
    if (error.message.includes("Failed to fetch") || error.name === "TypeError") {
      const connectivityError = new ConnectivityError({
        message: "Could not connect to the server",
        url: fullUrl,
        details: {
          type: "connection_error",
          message: "The server appears to be down or unreachable",
        },
      });

      // Record error and notify subscribers if needed
      this.handleError(error, endpoint, method);

      return connectivityError;
    }

    // For server errors (404, 500+)
    if (error.status === 404 || error.status >= 500) {
      const requestError = new RequestError("ServerError", error.status, null, {
        message: `Server error: ${error.status} ${error.statusText || ""}`,
        url: fullUrl,
      });

      // Record error and notify subscribers if needed
      this.handleError(requestError, endpoint, method);

      return requestError;
    }

    // For other errors, just pass them through
    return error;
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

  static async get(url, params = {}, badRequestCatched = false, requiresAuth = true) {
    console.log("[ApiService] ====== Starting GET request ======");
    console.log("[ApiService] URL:", url);
    console.log("[ApiService] Params:", params, "Requires Auth:", requiresAuth);

    try {
      // Check auth if required
      if (requiresAuth) {
        console.log("[ApiService] Auth required, checking token validity");
        this.ensureAuthenticated();
      }

      console.log("[ApiService] Getting auth headers...");
      const headers = await ApiAuthHelper.getHeaders();
      console.log("[ApiService] Headers received:", { hasAuth: !!headers.Authorization });

      const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
      const fullUrl = `${config.apiBaseUrl}${url}${queryString}`;
      console.log("[ApiService] Full URL constructed:", fullUrl);
      console.log("[ApiService] API Base URL from config:", config.apiBaseUrl);

      ApiLogger.logRequest("GET", fullUrl, params, headers);

      try {
        console.log("[ApiService] Initiating fetch request...");
        const response = await fetch(fullUrl, {
          method: "GET",
          headers,
        });
        console.log("[ApiService] Fetch response received:", {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
        });

        const responseData = await response.json();
        console.log("[ApiService] Response data:", responseData);

        ApiLogger.logResponse("GET", fullUrl, response.status, response.statusText, responseData);

        if (!response.ok) {
          console.log("[ApiService] Response not OK, handling error...");
          if (response.status === 401) {
            throw new UnauthorizedRequestError("Unauthorized request");
          }
          if (response.status === 400 && !badRequestCatched) {
            throw new BadRequestError(responseData);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return responseData;
      } catch (fetchError) {
        console.error("[ApiService] Fetch error occurred:", fetchError);
        // Extract endpoint from URL
        const endpoint = url.split("?")[0];

        // Use centralized error handling
        const errorToThrow = this.handleApiConnectivityError(fetchError, endpoint, "GET", fullUrl);
        throw errorToThrow;
      }
    } catch (error) {
      console.error("[ApiService] General error in GET request:", error);
      ApiLogger.logError("GET", url, error);
      throw error;
    }
  }

  static async post(url, data = {}, badRequestCatched = false, requiresAuth = true) {
    try {
      // Check auth if required
      if (requiresAuth) {
        console.log("[ApiService] POST Auth required, checking token validity");
        this.ensureAuthenticated();
      }

      const headers = await ApiAuthHelper.getHeaders();
      const fullUrl = `${config.apiBaseUrl}${url}`;

      ApiLogger.logRequest("POST", fullUrl, null, headers, data);

      try {
        const response = await fetch(fullUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });

        const responseData = await response.json();
        ApiLogger.logResponse("POST", fullUrl, response.status, response.statusText, responseData);

        if (!response.ok) {
          // Extract endpoint from URL
          const endpoint = url.split("?")[0];

          if (response.status === 401) {
            throw new UnauthorizedRequestError("Unauthorized request");
          }
          if (response.status === 400 && !badRequestCatched) {
            throw new BadRequestError(responseData);
          }
          // For 404, 500, and other server errors, show connectivity popup
          if (response.status === 404 || response.status >= 500) {
            // Create a request error with status code
            const requestError = new RequestError("ServerError", response.status, null, {
              message: `Server error: ${response.status} ${response.statusText}`,
              url: fullUrl,
            });

            // Handle error and show popup (if not in cooldown)
            this.handleError(requestError, endpoint, "POST");
            throw requestError;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return responseData;
      } catch (fetchError) {
        // Extract endpoint from URL
        const endpoint = url.split("?")[0];

        // Use centralized error handling
        const errorToThrow = this.handleApiConnectivityError(fetchError, endpoint, "POST", fullUrl);
        throw errorToThrow;
      }
    } catch (error) {
      ApiLogger.logError("POST", url, error);
      throw error;
    }
  }

  static async put(url, data = {}, badRequestCatched = false, requiresAuth = true) {
    try {
      // Check auth if required
      if (requiresAuth) {
        console.log("[ApiService] PUT Auth required, checking token validity");
        this.ensureAuthenticated();
      }

      const headers = await ApiAuthHelper.getHeaders();
      const fullUrl = `${config.apiBaseUrl}${url}`;

      ApiLogger.logRequest("PUT", fullUrl, null, headers, data);

      try {
        const response = await fetch(fullUrl, {
          method: "PUT",
          headers,
          body: JSON.stringify(data),
        });

        const responseData = await response.json();
        ApiLogger.logResponse("PUT", fullUrl, response.status, response.statusText, responseData);

        if (!response.ok) {
          // Extract endpoint from URL
          const endpoint = url.split("?")[0];

          if (response.status === 401) {
            throw new UnauthorizedRequestError("Unauthorized request");
          }
          if (response.status === 400 && !badRequestCatched) {
            throw new BadRequestError(responseData);
          }
          // For 404, 500, and other server errors, show connectivity popup
          if (response.status === 404 || response.status >= 500) {
            // Create a request error with status code
            const requestError = new RequestError("ServerError", response.status, null, {
              message: `Server error: ${response.status} ${response.statusText}`,
              url: fullUrl,
            });

            // Handle error and show popup (if not in cooldown)
            this.handleError(requestError, endpoint, "PUT");
            throw requestError;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return responseData;
      } catch (fetchError) {
        // Extract endpoint from URL
        const endpoint = url.split("?")[0];

        // Use centralized error handling
        const errorToThrow = this.handleApiConnectivityError(fetchError, endpoint, "PUT", fullUrl);
        throw errorToThrow;
      }
    } catch (error) {
      ApiLogger.logError("PUT", url, error);
      throw error;
    }
  }

  static async delete(url, badRequestCatched = false, requiresAuth = true) {
    try {
      // Check auth if required
      if (requiresAuth) {
        console.log("[ApiService] DELETE Auth required, checking token validity");
        this.ensureAuthenticated();
      }

      const headers = await ApiAuthHelper.getHeaders();
      const fullUrl = `${config.apiBaseUrl}${url}`;

      ApiLogger.logRequest("DELETE", fullUrl, null, headers);

      try {
        const response = await fetch(fullUrl, {
          method: "DELETE",
          headers,
        });

        const responseData = await response.json();
        ApiLogger.logResponse("DELETE", fullUrl, response.status, response.statusText, responseData);

        if (!response.ok) {
          // Extract endpoint from URL
          const endpoint = url.split("?")[0];

          if (response.status === 401) {
            throw new UnauthorizedRequestError("Unauthorized request");
          }
          if (response.status === 400 && !badRequestCatched) {
            throw new BadRequestError(responseData);
          }
          // For 404, 500, and other server errors, show connectivity popup
          if (response.status === 404 || response.status >= 500) {
            // Create a request error with status code
            const requestError = new RequestError("ServerError", response.status, null, {
              message: `Server error: ${response.status} ${response.statusText}`,
              url: fullUrl,
            });

            // Handle error and show popup (if not in cooldown)
            this.handleError(requestError, endpoint, "DELETE");
            throw requestError;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return responseData;
      } catch (fetchError) {
        // Extract endpoint from URL
        const endpoint = url.split("?")[0];

        // Use centralized error handling
        const errorToThrow = this.handleApiConnectivityError(fetchError, endpoint, "DELETE", fullUrl);
        throw errorToThrow;
      }
    } catch (error) {
      ApiLogger.logError("DELETE", url, error);
      throw error;
    }
  }
}
