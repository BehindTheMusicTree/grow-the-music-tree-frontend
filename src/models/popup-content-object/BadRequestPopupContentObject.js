import PopupContentObject from "./PopupContentObject";

export default class BadRequestPopupContentObject extends PopupContentObject {
  constructor(errorObj) {
    super("An error occurred", "BadRequestPopupContentObject");

    console.log("errorObj", errorObj);

    // Extract the actual error data
    // For BadRequestError objects, the error data is in the message property as a stringified JSON
    let errorData = errorObj;

    if (errorObj instanceof Error) {
      try {
        // First try to parse the message directly
        errorData = JSON.parse(errorObj.message);
      } catch (e) {
        console.error("Failed to parse error message as JSON:", e);

        // Fallback to trying to extract JSON from the "Error: {...}" format
        try {
          const jsonMatch = errorObj.message.match(/(\{.*\})/s);
          if (jsonMatch && jsonMatch[1]) {
            errorData = JSON.parse(jsonMatch[1]);
          }
        } catch (e2) {
          console.error("Failed to extract JSON from error message:", e2);
        }
      }
    } else if (typeof errorObj === "string") {
      try {
        // Try to parse string directly
        errorData = JSON.parse(errorObj);
      } catch (e) {
        // Try to extract JSON from the Error: {...} format
        try {
          const jsonMatch = errorObj.match(/Error:\s*(\{.*\})/s);
          if (jsonMatch && jsonMatch[1]) {
            errorData = JSON.parse(jsonMatch[1]);
          }
        } catch (e2) {
          console.error("Failed to extract JSON from error string:", e2);
        }
      }
    }

    // Extract properties from the error data
    this.code = errorData.code || "unknown_error";
    console.log("this.code", this.code);
    this.message = errorData.message || "Bad Request";
    console.log("this.message", this.message);
    this.fieldErrors = errorData.fieldErrors || {};
    console.log("this.fieldErrors", this.fieldErrors);

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
        // Format error messages in a more user-friendly way
        const errorMessages = errors.map((error) => {
          // Special case for duplicate name errors
          if (fieldName === "name" && error.code === "name_duplicate") {
            return "The name already exists. Please choose a different name.";
          }
          // Other error types just show the message without the code
          return error.message;
        });

        this.operationErrors.push({
          name: fieldName.charAt(0).toUpperCase() + fieldName.slice(1), // Capitalize field name
          errors: errorMessages,
        });
      });
    }
  }
}
