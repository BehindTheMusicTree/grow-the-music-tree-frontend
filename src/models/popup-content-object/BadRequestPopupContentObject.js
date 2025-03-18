import PopupContentObject from "./PopupContentObject";

export default class BadRequestPopupContentObject extends PopupContentObject {
  constructor(errorObj) {
    super("An error occurred", "BadRequestPopupContentObject");

    this.code = errorObj.code || "unknown_error";
    this.message = errorObj.message || "Bad Request";
    this.fieldErrors = errorObj.fieldErrors || {};

    // Convert to operationErrors format for UI display
    this.operationErrors = [];

    // Add general message error if it exists
    if (this.message) {
      this.operationErrors.push({
        name: "Error",
        errors: [this.message],
      });
    }

    // Add field errors
    if (this.fieldErrors) {
      Object.entries(this.fieldErrors).forEach(([fieldName, errors]) => {
        const errorMessages = errors.map((error) => `${fieldName}: ${error.message} (${error.code})`);
        this.operationErrors.push({
          name: fieldName,
          errors: errorMessages,
        });
      });
    }
  }
}
