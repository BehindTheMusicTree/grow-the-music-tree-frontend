export class DebugCode {
  // Authentication errors
  static AUTH_REQUIRED = "AU001";
  static SESSION_EXPIRED = "AU002";
  static INVALID_CREDENTIALS = "AU003";

  // Network errors
  static NETWORK_ERROR = "NE001";
  static TIMEOUT = "NE002";
  static CONNECTION_FAILED = "NE003";

  // API errors
  static BAD_REQUEST = "AP001";
  static NOT_FOUND = "AP002";
  static SERVER_ERROR = "AP003";
  static VALIDATION_ERROR = "AP004";
  static SPOTIFY_AUTH_CALLBACK_FAILED = "AP005";

  // Business logic errors
  static INVALID_OPERATION = "BL001";
  static RESOURCE_CONFLICT = "BL002";
  static QUOTA_EXCEEDED = "BL003";

  // Configuration errors
  static MISSING_CONFIG = "CF001";
  static INVALID_CONFIG = "CF002";

  static getMessage(code) {
    const messages = {
      [DebugCode.AUTH_REQUIRED]: "Authentication required",
      [DebugCode.SESSION_EXPIRED]: "Session expired",
      [DebugCode.INVALID_CREDENTIALS]: "Invalid credentials",
      [DebugCode.NETWORK_ERROR]: "Network error",
      [DebugCode.TIMEOUT]: "Request timed out",
      [DebugCode.CONNECTION_FAILED]: "Connection failed",
      [DebugCode.BAD_REQUEST]: "Invalid request",
      [DebugCode.NOT_FOUND]: "Resource not found",
      [DebugCode.SERVER_ERROR]: "Server error",
      [DebugCode.VALIDATION_ERROR]: "Validation error",
      [DebugCode.INVALID_OPERATION]: "Invalid operation",
      [DebugCode.RESOURCE_CONFLICT]: "Resource conflict",
      [DebugCode.QUOTA_EXCEEDED]: "Quota exceeded",
      [DebugCode.MISSING_CONFIG]: "Missing configuration",
      [DebugCode.INVALID_CONFIG]: "Invalid configuration",
    };

    return messages[code] || "Unknown error";
  }

  static getType(code) {
    if (code.startsWith("AU")) return "AUTH";
    if (code.startsWith("NE")) return "NETWORK";
    if (code.startsWith("AP")) return "API";
    if (code.startsWith("BL")) return "BUSINESS";
    if (code.startsWith("CF")) return "CONFIG";
    return "UNKNOWN";
  }
}
