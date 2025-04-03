import PopupContentObject from "./PopupContentObject";

export default class InvalidInputContentObject extends PopupContentObject {
  constructor(errorObj) {
    super("An error occurred", "InvalidInputContentObject");

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
    this.message = errorData.message || "Something went wrong";
    console.log("this.message", this.message);
    this.fieldErrors = errorData.fieldErrors || {};
    console.log("this.fieldErrors", this.fieldErrors);

    // Convert to a simple error format
    this.operationErrors = [];

    // Create a single error message
    let errorMessage = "";

    // First check for specific field errors
    if (this.fieldErrors && Object.keys(this.fieldErrors).length > 0) {
      // Get the first field error
      const firstField = Object.keys(this.fieldErrors)[0];
      const firstError = this.fieldErrors[firstField][0];

      // Create a simplified error message based on the error type
      if (firstField === "name" && firstError.code === "name_duplicate") {
        errorMessage = "The name already exists. Please choose a different name.";
      } else if (firstError.code === "required") {
        errorMessage = `Please provide a ${firstField}.`;
      } else if (firstError.code === "invalid_format") {
        errorMessage = `Invalid ${firstField} format.`;
      } else {
        // Use the API message directly
        errorMessage = firstError.message;
      }
    } else {
      // Use general message if no field errors
      errorMessage = this.message.includes("invalid data") ? "One or more fields contain invalid data." : this.message;
    }

    // Add just one error entry with the simplified message
    this.operationErrors.push({
      name: "Error",
      errors: [errorMessage],
    });
  }
}
