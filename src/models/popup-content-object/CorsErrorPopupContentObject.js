import PopupContentObject from "./PopupContentObject";

export default class CorsErrorPopupContentObject extends PopupContentObject {
  constructor(errorObj) {
    super("Cross-Origin Request Error", "CorsErrorPopupContentObject");

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
      ],
    });

    // Add possible solutions
    this.operationErrors.push({
      name: "Possible Solutions",
      errors: [
        "Check that the API server is running and properly configured for CORS",
        "Ensure you're using the correct API URL",
        "Try refreshing the page or logging in again",
      ],
    });
  }
}