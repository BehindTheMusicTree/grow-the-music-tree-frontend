import config from "./config";
import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "./constants";
import RequestError from "./errors/RequestError";
import BadRequestError from "./errors/BadRequestError";
import UnauthorizedRequestError from "./errors/UnauthorizedRequestError";
import InternalServerError from "./errors/InternalServerError";
import ConnectivityError from "./errors/ConnectivityError";
import SpotifyService from "./services/SpotifyService";

/**
 * Core API service handling authentication, HTTP requests, and error management
 * Now uses Spotify authentication instead of UMG credentials
 */
export default class ApiService {
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

  static extractErrorFromHtml(html) {
    // Extract title content which usually contains the error type
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    // Extract error message from explanation div if it exists
    const explanationMatch = html.match(/<div id="explanation">(.*?)<\/div>/s);
    if (explanationMatch) {
      return explanationMatch[1].replace(/<[^>]*>/g, "").trim();
    }

    return "Unknown error occurred";
  }

  static async getResponseObjFromFetch(response) {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const json = await this.parseJson(response);
      return json;
    } else {
      const text = await response.text();
      // If the response is HTML, try to extract error message
      if (contentType && contentType.includes("text/html")) {
        const errors = { errors: this.extractErrorFromHtml(text) };
        return errors;
      }
      return text;
    }
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
          // Format the error data according to the API response structure
          const errorObj = {
            code: responseObj.details?.code || "unknown_error",
            message: responseObj.details?.message || "Bad Request",
          };

          // If fieldErrors exist, create a map with fieldname -> message, code
          if (responseObj.details?.fieldErrors) {
            const fieldErrorsMap = {};

            Object.entries(responseObj.details.fieldErrors).forEach(([fieldName, errors]) => {
              fieldErrorsMap[fieldName] = errors.map((error) => ({
                message: error.message,
                code: error.code,
              }));
            });

            errorObj.fieldErrors = fieldErrorsMap;
          }

          throw new BadRequestError(errorObj);
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

  static isConnectivityError(error) {
    // Check if the error message contains connectivity-related terms
    const errorMessage = error.message ? error.message.toLowerCase() : "";
    const connectivityTerms = [
      // CORS terms (English)
      "cors",
      "cross-origin",
      "access-control-allow-origin",
      "same origin policy",
      // CORS terms (French)
      "requête multiorigine",
      "politique same origin",
      "cross-origin request",
      "blocage d'une requête",
      // Common network error terms
      "failed to fetch",
      "network error",
      "status: (null)",
      "status: null",
      "status: 0",
      // API unreachability terms
      "networkerror when attempting to fetch resource",
      "could not connect to the server",
      "connection refused",
      "no such host",
      "dns lookup failed",
      "connection timed out",
      "unable to connect",
      "unable to reach",
      "unreachable",
      "refused",
      "timeout",
    ];

    const hasConnectivityErrorMessage = connectivityTerms.some((term) => errorMessage.includes(term));

    // Connectivity errors often appear as TypeErrors with network error messages
    const isLikelyConnectivityError =
      error instanceof TypeError ||
      (error instanceof Error && errorMessage.includes("status: (null)")) ||
      (error instanceof Error && errorMessage.includes("status: null")) ||
      (error instanceof Error && errorMessage.includes("status: 0")) ||
      // Check for network errors that might indicate API unreachability
      (error instanceof Error && error.name === "TypeError" && error.message.includes("Failed to fetch")) ||
      (error instanceof Error && error.name === "NetworkError");

    return hasConnectivityErrorMessage || isLikelyConnectivityError;
  }

  static getFetchErrorMessageOtherThanBadRequest(error, url) {
    if (this.isConnectivityError(error)) {
      // Create a connectivity error object with details
      const connectivityErrorObj = {
        message: "API Connection Error",
        url: url || "Unknown URL",
        details: {
          type: "connection_error",
          message: error.message,
          expectedUrl: config.apiBaseUrl,
        },
      };

      throw new ConnectivityError(connectivityErrorObj);
    } else if (error instanceof TypeError) {
      return `${error.message} probably because of a network error.`;
    } else {
      return error.message;
    }
  }

  static getToken() {
    return SpotifyService.getSpotifyToken();
  }

  static hasValidToken() {
    return SpotifyService.hasValidSpotifyToken();
  }

  static throwAuthError() {
    throw new UnauthorizedRequestError({
      message: "Spotify authentication required",
      status: 401,
      details: "You must connect with Spotify to access this feature",
    });
  }

  static async getHeaders() {
    try {
      if (!this.hasValidToken()) {
        this.throwAuthError();
      }

      const spotifyToken = this.getToken();

      return {
        Authorization: `Bearer ${spotifyToken}`,
        "Content-Type": "application/json",
      };
    } catch (error) {
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
      if (!this.hasValidToken()) {
        this.throwAuthError();
      }

      /* We use XMLHttpRequest because fetch doesn't provide progression for file uploads */
      const xhr = await ApiService.getXhr(url, method, data, page, onProgress);

      return new Promise((resolve, reject) => {
        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            try {
              await this.handleNotOkResponse(url, xhr, badRequestCatched);
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
              reject(
                new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`)
              );
            }
          } catch (error) {
            if (error instanceof ConnectivityError) {
              this.errorSubscribers.forEach((callback) => callback(error));
            }
            reject(error);
          }
        };

        xhr.send(data ? (data instanceof FormData ? data : JSON.stringify(data)) : null);
      });
    } catch (error) {
      // If this is an auth error, let it propagate so components can show the auth popup
      if (error instanceof UnauthorizedRequestError) {
        this.errorSubscribers.forEach((callback) => callback(error));
        throw error;
      }

      try {
        const fetchErrorMessage = await this.getFetchErrorMessageOtherThanBadRequest(error, url);
        throw new Error(`Failed to ${method} ${endpoint}. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${fetchErrorMessage}`);
      } catch (innerError) {
        if (innerError instanceof ConnectivityError) {
          this.errorSubscribers.forEach((callback) => callback(innerError));
          throw innerError;
        } else {
          throw innerError;
        }
      }
    }
  }

  static async streamAudio(trackUrl) {
    if (!this.hasValidToken()) {
      this.throwAuthError();
    }

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
}
