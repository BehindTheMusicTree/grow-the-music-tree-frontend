import PopupContentObject from "./PopupContentObject";
import config from "../../utils/config";

export default class ConnectivityErrorPopupContentObject extends PopupContentObject {
  constructor(errorObj) {
    // Determine the specific type of connectivity issue
    const connectivityIssueType = ConnectivityErrorPopupContentObject.detectConnectivityIssueType(errorObj);

    // Set title based on the detected issue type
    const title = connectivityIssueType.title || "API Connectivity Error";

    super(title, "ConnectivityErrorPopupContentObject");

    this.code = connectivityIssueType.code;
    this.message = errorObj.message || connectivityIssueType.defaultMessage;
    this.url = errorObj.url || "Unknown URL";
    this.connectivityIssueType = connectivityIssueType.type;

    // Format errors for UI display
    this.operationErrors = [];

    // Add main error message
    this.operationErrors.push({
      name: "Error",
      errors: [this.message],
    });

    // Add explanation based on connectivity issue type
    this.operationErrors.push({
      name: "Details",
      errors: [
        connectivityIssueType.detailsMessage,
        `Attempted to access: ${this.url}`,
        `Expected API URL: ${config.apiBaseUrl}`,
      ],
    });

    // Add possible solutions based on connectivity issue type
    this.operationErrors.push({
      name: "Troubleshooting Steps",
      errors: connectivityIssueType.troubleshootingSteps,
    });

    // Add contact information
    this.operationErrors.push({
      name: "Need Help?",
      errors: [
        `If the problem persists, please contact us at: <a href="mailto:${config.contactEmail}">${config.contactEmail}</a>`,
      ],
    });
  }

  static detectConnectivityIssueType(errorObj) {
    const issueTypes = {
      server_not_found: {
        type: "server_not_found",
        code: "SERVER_NOT_FOUND",
        title: "Server Not Available",
        defaultMessage: "The server is not responding or the endpoint doesn't exist",
        detailsMessage: "We couldn't reach the server or the requested endpoint.",
        troubleshootingSteps: [
          "Please try refreshing the page",
          "Check if the server is running",
          "Verify your internet connection",
          "If the issue persists, the server might be down for maintenance",
        ],
      },
      connection_error: {
        type: "connection_error",
        code: "CONNECTION_ERROR",
        title: "Connection Error",
        defaultMessage: "Could not connect to the server",
        detailsMessage: "There was a problem connecting to the server.",
        troubleshootingSteps: [
          "Check your internet connection",
          "Try refreshing the page",
          "If using a VPN, try disabling it",
          "Clear your browser cache and try again",
        ],
      },
      cors_error: {
        type: "cors_error",
        code: "CORS_ERROR",
        title: "Cross-Origin Error",
        defaultMessage: "Cross-Origin Request Blocked",
        detailsMessage: "The browser blocked the request due to security restrictions.",
        troubleshootingSteps: [
          "Try refreshing the page",
          "Clear your browser cache",
          "If the issue persists, contact support",
        ],
      },
      default: {
        type: "unknown",
        code: "UNKNOWN_ERROR",
        title: "Connection Error",
        defaultMessage: "An unexpected error occurred while connecting to the server",
        detailsMessage: "We encountered an unexpected error while trying to connect to the server.",
        troubleshootingSteps: [
          "Try refreshing the page",
          "Check your internet connection",
          "If the issue persists, contact support",
        ],
      },
    };

    // Check for specific error types
    if (errorObj.details?.type === "server_not_found") {
      return issueTypes.server_not_found;
    }

    if (errorObj.details?.type === "connection_error") {
      return issueTypes.connection_error;
    }

    // Check for CORS errors
    if (errorObj.message?.toLowerCase().includes("cors") || errorObj.message?.toLowerCase().includes("cross-origin")) {
      return issueTypes.cors_error;
    }

    // Default case
    return issueTypes.default;
  }
}
