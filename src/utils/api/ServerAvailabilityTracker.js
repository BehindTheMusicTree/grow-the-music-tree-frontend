import config from "../config";
import ConnectivityError from "./errors/ConnectivityError";

/**
 * Tracks server availability and manages connectivity error notifications
 * Shows error popup on first 404/500, with cooldown to prevent duplicate popups
 */
export default class ServerAvailabilityTracker {
  constructor() {
    this.lastServerDownNotification = 0;
    this.notificationCooldownMs = 30000; // 30 seconds between server down notifications
  }

  /**
   * Records an API error and determines if it should trigger a connectivity popup
   * @param {Object} error - The error object
   * @param {string} endpoint - The API endpoint that failed
   * @param {string} method - HTTP method used for the request
   * @returns {boolean} - Whether this error should trigger a connectivity error popup
   */
  recordError(error, endpoint, method = "UNKNOWN") {
    const now = Date.now();
    const statusCode = error.statusCode || 0;

    // Is this a connectivity-related error?
    const isConnectivityError =
      statusCode === 404 ||
      statusCode === 500 ||
      statusCode === 502 ||
      statusCode === 503 ||
      statusCode === 504 ||
      error.name === "TypeError" ||
      (error.message && error.message.includes("Failed to fetch"));

    if (!isConnectivityError) {
      return false; // Not a connectivity error
    }

    // Check if we're still in cooldown from a previous notification
    const isInCooldown =
      this.lastServerDownNotification > 0 && now - this.lastServerDownNotification <= this.notificationCooldownMs;

    // Only notify if we're not in cooldown
    const shouldNotify = !isInCooldown;

    if (shouldNotify) {
      console.log(`[ServerAvailabilityTracker] Connectivity error detected: ${method} ${endpoint} (${statusCode})`);
      this.lastServerDownNotification = now;
    }

    return shouldNotify;
  }

  /**
   * Creates a server down error object
   * @param {string} endpoint - The API endpoint that failed
   * @param {string} method - HTTP method used for the request
   * @returns {ConnectivityError} - A connectivity error with server down details
   */
  createServerDownError(endpoint, method = "UNKNOWN") {
    const errorObj = {
      message: "Server appears to be down or unreachable",
      url: `${config.apiBaseUrl}${endpoint}`,
      details: {
        type: "server_not_found",
        message: "The server appears to be unavailable or unreachable.",
      },
    };

    return new ConnectivityError(errorObj);
  }

  /**
   * Resets the tracker, typically after server comes back online
   */
  reset() {
    this.recentErrors = [];
    this.isServerDown = false;
  }
}
