/**
 * Generic API logging utility
 */
export default class ApiLogger {
  /**
   * Logs API request details
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {object} params - Request parameters
   * @param {object} headers - Request headers
   * @param {object} data - Request body data
   */
  static logRequest(method, url, params = null, headers = {}, data = null) {
    const logData = {
      timestamp: new Date().toISOString(),
      method,
      url,
      ...(params && { params }),
      headers: {
        ...headers,
        Authorization: headers.Authorization ? "Bearer [REDACTED]" : undefined,
      },
      ...(data && { data }),
    };
    console.log("[API] Request:", logData);
  }

  /**
   * Logs API response details
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status code
   * @param {string} statusText - Response status text
   * @param {object} data - Response data
   */
  static logResponse(method, url, status, statusText, data) {
    const logData = {
      timestamp: new Date().toISOString(),
      method,
      url,
      status,
      statusText,
      data,
    };
    console.log("[API] Response:", logData);
  }

  /**
   * Logs API error details
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Error} error - Error object
   */
  static logError(method, url, error) {
    const logData = {
      timestamp: new Date().toISOString(),
      method,
      url,
      error: {
        message: error.message,
        stack: error.stack,
        ...(error.response && { response: error.response }),
      },
    };
    console.error("[API] Error:", logData);
  }
}
