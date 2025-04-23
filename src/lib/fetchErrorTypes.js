export class FetchErrorType {
  // Network related errors
  static NETWORK = {
    CONNECTION_REFUSED: "NETWORK_CONNECTION_REFUSED",
    TIMEOUT: "NETWORK_TIMEOUT",
    OFFLINE: "NETWORK_OFFLINE",
    getMessage: (type) => {
      const messages = {
        [FetchErrorType.NETWORK.CONNECTION_REFUSED]:
          "Unable to connect to the server. Please check your network or the server might be down.",
        [FetchErrorType.NETWORK.TIMEOUT]: "Request timed out. Please try again.",
        [FetchErrorType.NETWORK.OFFLINE]: "You appear to be offline. Please check your internet connection.",
      };
      return messages[type] || "Network error occurred";
    },
  };

  // Authentication related errors
  static AUTH = {
    UNAUTHORIZED: "AUTH_UNAUTHORIZED",
    SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
    INVALID_TOKEN: "AUTH_INVALID_TOKEN",
    getMessage: (type) => {
      const messages = {
        [FetchErrorType.AUTH.UNAUTHORIZED]: "You need to be logged in to access this resource.",
        [FetchErrorType.AUTH.SESSION_EXPIRED]: "Your session has expired. Please log in again.",
        [FetchErrorType.AUTH.INVALID_TOKEN]: "Invalid authentication token. Please log in again.",
      };
      return messages[type] || "Authentication error occurred";
    },
  };

  // Server related errors
  static SERVER = {
    INTERNAL: "SERVER_INTERNAL",
    BAD_GATEWAY: "SERVER_BAD_GATEWAY",
    SERVICE_UNAVAILABLE: "SERVER_SERVICE_UNAVAILABLE",
    getMessage: (type) => {
      const messages = {
        [FetchErrorType.SERVER.INTERNAL]: "An internal server error occurred. Please try again later.",
        [FetchErrorType.SERVER.BAD_GATEWAY]: "Server is temporarily unavailable. Please try again later.",
        [FetchErrorType.SERVER.SERVICE_UNAVAILABLE]: "Service is temporarily unavailable. Please try again later.",
      };
      return messages[type] || "Server error occurred";
    },
  };

  // Client related errors
  static CLIENT = {
    BAD_REQUEST: "CLIENT_BAD_REQUEST",
    NOT_FOUND: "CLIENT_NOT_FOUND",
    FORBIDDEN: "CLIENT_FORBIDDEN",
    getMessage: (type) => {
      const messages = {
        [FetchErrorType.CLIENT.BAD_REQUEST]: "Invalid request. Please check your input and try again.",
        [FetchErrorType.CLIENT.NOT_FOUND]: "The requested resource was not found.",
        [FetchErrorType.CLIENT.FORBIDDEN]: "You don't have permission to access this resource.",
      };
      return messages[type] || "Client error occurred";
    },
  };

  static getTypeFromStatus(status) {
    if (status >= 500) return FetchErrorType.SERVER;
    if (status === 401 || status === 403) return FetchErrorType.AUTH;
    if (status >= 400 && status < 500) return FetchErrorType.CLIENT;
    return null;
  }

  static getSpecificErrorFromStatus(status) {
    const type = FetchErrorType.getTypeFromStatus(status);
    if (!type) return null;

    switch (status) {
      case 401:
        return type.UNAUTHORIZED;
      case 403:
        return type.FORBIDDEN;
      case 404:
        return type.NOT_FOUND;
      case 400:
        return type.BAD_REQUEST;
      case 500:
        return type.INTERNAL;
      case 502:
        return type.BAD_GATEWAY;
      case 503:
        return type.SERVICE_UNAVAILABLE;
      default:
        return null;
    }
  }

  static getMessageFromError(error) {
    if (error.isNetworkError) {
      return FetchErrorType.NETWORK.getMessage(FetchErrorType.NETWORK.CONNECTION_REFUSED);
    }

    const status = error.response?.status;
    if (status) {
      const type = FetchErrorType.getTypeFromStatus(status);
      const specificError = FetchErrorType.getSpecificErrorFromStatus(status);
      if (type && specificError) {
        return type.getMessage(specificError);
      }
    }

    return "An unexpected error occurred";
  }
}
