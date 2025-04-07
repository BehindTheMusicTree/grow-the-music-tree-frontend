/**
 * Handles API logging functionality
 */
export default class ApiLogging {
  /**
   * Logs API call details
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} url - Request URL
   * @param {object|null} data - Request data
   */
  static logApiCall(method, url, data = null) {
    console.log(`[API] ${method} ${url}`, data ? `\nRequest data: ${JSON.stringify(data, null, 2)}` : "");
  }

  /**
   * Logs API response details
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} url - Request URL
   * @param {object} response - Response data
   */
  static logApiResponse(method, url, response) {
    console.log(`[API] ${method} ${url} Response:`, response);
  }

  /**
   * Logs API error details
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} url - Request URL
   * @param {Error} error - Error object
   */
  static logApiError(method, url, error) {
    console.error(`[API] ${method} ${url} Error:`, error);
  }

  /**
   * Logs request details with redacted authorization
   * @param {string} method - HTTP method
   * @param {string} url - Full URL
   * @param {object} params - Request parameters
   * @param {object} headers - Request headers
   * @param {object} data - Request body data (for POST, PUT)
   */
  static logRequest(method, url, params = null, headers = {}, data = null) {
    console.log(`[API] ${method} Request:`, {
      url: url,
      params,
      headers: {
        ...headers,
        Authorization: headers.Authorization ? "Bearer [REDACTED]" : undefined,
      },
      ...(data && { data }),
    });
  }

  /**
   * Logs response details
   * @param {string} method - HTTP method
   * @param {string} url - Full URL
   * @param {number} status - Response status code
   * @param {string} statusText - Response status text
   * @param {object} data - Response data
   */
  static logResponse(method, url, status, statusText, data) {
    console.log(`[API] ${method} Response:`, {
      url: url,
      status,
      statusText,
      data,
    });
  }

  /**
   * Logs error details
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Error} error - Error object
   */
  static logError(method, url, error) {
    console.error(`[API] ${method} Error:`, {
      url,
      error: error.message,
      stack: error.stack,
    });
  }
}