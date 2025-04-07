import config from "../config";
import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "../constants";
import RequestError from "./errors/RequestError";
import BadRequestError from "./errors/BadRequestError";
import UnauthorizedRequestError from "./errors/UnauthorizedRequestError";
import InternalServerError from "./errors/InternalServerError";
import ConnectivityError from "./errors/ConnectivityError";

/**
 * Handles API error detection, parsing, and management
 */
export default class ApiErrorHandler {
  /**
   * Parses a JSON response and handles parsing errors
   */
  static async parseJson(response) {
    try {
      return await response.json();
    } catch (error) {
      console.error("[API] Failed to parse JSON response:", error);
      throw new Error(`Failed to parse response. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}.`);
    }
  }

  /**
   * Gets a response object from an XMLHttpRequest
   */
  static getResponseObjFromXhr(xhr) {
    return xhr.response;
  }

  /**
   * Extracts error message from HTML response
   */
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

  /**
   * Gets a response object from a fetch response
   */
  static async getResponseObjFromFetch(response) {
    const contentType = response.headers.get("content-type");
    console.log("[API] Response Content-Type:", contentType);

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

  /**
   * Handles non-successful HTTP responses
   */
  static async handleNotOkResponse(url, response) {
    const status = response.status;
    console.log(`[API] Error response from ${url} - Status: ${status}`);

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

        console.log("[API] Error response details:", responseObj);

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
        } else if (status === 404) {
          throw new Error(`Resource not found: ${url}`);
        } else if (status === 409) {
          throw new Error(responseObj.message || "Operation conflict - another operation is already in progress");
        } else if (status === 500) {
          // Log the full error details for debugging
          console.error("[API] Server error details:", {
            status,
            url,
            response: responseObj,
            headers: response.headers ? Object.fromEntries(response.headers.entries()) : null,
          });
          throw new InternalServerError(responseObj.errors || { message: "Internal server error" });
        }

        errorMessage = JSON.stringify(responseObj);
        throw new Error(`${errorMessagePrefixe} ${errorMessage ? ` - ${errorMessage}` : ""}`);
      } catch (error) {
        if (error instanceof RequestError) {
          throw error;
        }
        // Log the raw error for debugging
        console.error("[API] Raw error details:", {
          status,
          url,
          error: error.message,
          stack: error.stack,
        });
        throw new Error(
          `${errorMessagePrefixe} - the response message could not be analysed. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}`
        );
      }
    }
    return "";
  }

  /**
   * Determines if an error is related to connectivity issues
   */
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

  /**
   * Gets a formatted error message for non-BadRequest errors
   */
  static getFetchErrorMessageOtherThanBadRequest(error, url) {
    console.error("[API] Fetch error:", error);
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
}
