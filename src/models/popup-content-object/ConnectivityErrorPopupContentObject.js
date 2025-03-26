import PopupContentObject from "./PopupContentObject";
import config from "../../utils/config";

export default class ConnectivityErrorPopupContentObject extends PopupContentObject {
  constructor(errorObj) {
    // Determine the specific type of connectivity issue
    const connectivityIssueType = ConnectivityErrorPopupContentObject.detectConnectivityIssueType(errorObj);

    // Set title based on the detected issue type
    const title = "API Connectivity Error";

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

  // Static helper method to detect the specific type of connectivity issue
  static detectConnectivityIssueType(errorObj) {
    // Check error message for common connectivity issue indicators
    const errorMessage = (errorObj.details?.message || errorObj.message || "").toLowerCase();

    // Check for server unreachability first
    const unreachabilityIndicators = [
      "failed to fetch",
      "network error",
      "connection refused",
      "server unreachable",
      "cannot connect to server",
      "unable to connect",
      "network request failed",
      "status: (null)",
      "status: null",
      "status: 0",
      "unable to reach",
      "timeout",
      "no such host",
      "dns lookup failed",
    ];

    if (unreachabilityIndicators.some((indicator) => errorMessage.includes(indicator))) {
      return {
        type: "server_unreachable",
        code: "server_unreachable",
        defaultMessage: "Connection Failed",
        detailsMessage:
          "The application cannot establish a connection to the service. This typically happens when the service is unavailable, there are network issues, or your internet connection is interrupted.",
        troubleshootingSteps: [
          "1. Check if the API server is running",
          "2. Verify your internet connection",
          "3. Check if the service is experiencing an outage",
          "4. Wait a few minutes and try again",
          "5. Contact support if the problem persists",
        ],
      };
    }

    // Check for CORS issues
    const corsIndicators = [
      "cors",
      "cross-origin",
      "access-control-allow-origin",
      "same origin policy",
      "requête multiorigine",
      "politique same origin",
      "cross-origin request",
      "blocage d'une requête",
    ];

    if (corsIndicators.some((indicator) => errorMessage.includes(indicator))) {
      return {
        type: "cors_error",
        code: "cors_error",
        defaultMessage: "Connection Access Restricted",
        detailsMessage:
          "The browser prevented the connection due to security restrictions. This is one type of connectivity issue that happens when a web page from one domain tries to access resources from another domain, but the server doesn't allow it (also known as a CORS issue).",
        troubleshootingSteps: [
          "1. Check if the API server is running",
          "2. Verify the API URL is correct in your environment configuration",
          "3. Ensure the API server has CORS properly configured",
          "4. Try refreshing the page",
          "5. Check your network connection",
        ],
      };
    }

    // Default to generic connectivity issue
    return {
      type: "connectivity_error",
      code: "connectivity_error",
      defaultMessage: "Network Connection Problem",
      detailsMessage:
        "The application is having trouble communicating with the service. This could be due to various reasons including network instability, service availability issues, or connection configuration problems.",
      troubleshootingSteps: [
        "1. Check if the API server is running",
        "2. Verify your internet connection",
        "3. Verify the API URL is correct in your environment configuration",
        "4. Try refreshing the page",
        "5. Contact support if the problem persists",
      ],
    };
  }
}
