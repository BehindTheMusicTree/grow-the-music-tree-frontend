import PopupContentObject from "./PopupContentObject";
import config from "../../utils/config";

export default class CorsErrorPopupContentObject extends PopupContentObject {
  constructor(errorObj) {
    super("API Connection Error", "CorsErrorPopupContentObject");

    this.code = "cors_error";
    this.message = errorObj.message || "Cross-Origin Request Blocked";
    this.url = errorObj.url || "Unknown URL";

    // Format errors for UI display
    this.operationErrors = [];

    // Add main error message
    this.operationErrors.push({
      name: "Error",
      errors: [this.message],
    });

    // Add explanation about CORS
    this.operationErrors.push({
      name: "Details",
      errors: [
        "A Cross-Origin Resource Sharing (CORS) error has occurred. This happens when a web page from one domain tries to access resources from another domain, but the server doesn't allow it.",
        `Attempted to access: ${this.url}`,
        `Expected API URL: ${config.apiBaseUrl}`,
      ],
    });

    // Add possible solutions
    this.operationErrors.push({
      name: "Troubleshooting Steps",
      errors: [
        "1. Check if the API server is running",
        "2. Verify the API URL is correct in your environment configuration",
        "3. Ensure the API server has CORS properly configured",
        "4. Try refreshing the page",
        "5. Check your network connection",
      ],
    });

    // Add contact information
    this.operationErrors.push({
      name: "Need Help?",
      errors: [
        `If the problem persists, please contact us at: <a href="mailto:${config.contactEmail}">${config.contactEmail}</a>`,
      ],
    });
  }
}
