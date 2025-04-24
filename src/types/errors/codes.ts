export enum ErrorCode {
  // Network Errors
  NETWORK_OFFLINE = "NET1000",
  NETWORK_TIMEOUT = "NET1001",
  NETWORK_CONNECTION_REFUSED = "NET1002",
  NETWORK_NOT_FOUND = "NET1003",
  NETWORK_ERROR = "NET1004",
  NETWORK_FETCH_ERROR = "NET1005",

  // API Errors
  API_UNAVAILABLE = "API2000",
  API_RATE_LIMIT = "API2001",
  API_AUTH_ERROR = "API2002",
  API_INVALID_RESPONSE = "API2003",
  API_INTERNAL_ERROR = "API2004",

  // Authentication Errors
  AUTH_UNAUTHORIZED = "AUT2000",
  AUTH_SESSION_EXPIRED = "AUT2001",
  AUTH_SESSION_REQUIRED = "AUT2002",
  AUTH_INVALID_TOKEN = "AUT2003",

  // Client Errors
  CLIENT_UNKNOWN = "CLI5000",
  CLIENT_BAD_REQUEST = "CLI4000",
  CLIENT_FORBIDDEN = "CLI4001",
  CLIENT_NOT_FOUND = "CLI4002",
  CLIENT_UNAUTHORIZED = "CLI4003",
  CLIENT_INTERNAL_ERROR = "CLI4004",
}

// Type guards
export function isNetworkError(code: ErrorCode): boolean {
  return code.startsWith("NET");
}

export function isApiError(code: ErrorCode): boolean {
  return code.startsWith("API");
}

export function isAuthError(code: ErrorCode): boolean {
  return code.startsWith("AUT");
}

export function isClientError(code: ErrorCode): boolean {
  return code.startsWith("CLI");
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_OFFLINE]: "Network connection unavailable",
  [ErrorCode.NETWORK_TIMEOUT]: "Request timed out",
  [ErrorCode.NETWORK_CONNECTION_REFUSED]: "Connection refused",
  [ErrorCode.NETWORK_NOT_FOUND]: "Network not found",
  [ErrorCode.NETWORK_ERROR]: "Network error occurred",
  [ErrorCode.NETWORK_FETCH_ERROR]: "Failed to fetch data",
  [ErrorCode.API_UNAVAILABLE]: "Service temporarily unavailable",
  [ErrorCode.API_RATE_LIMIT]: "Too many requests, please try again later",
  [ErrorCode.API_AUTH_ERROR]: "Authentication failed",
  [ErrorCode.API_INTERNAL_ERROR]: "Internal server error",
  [ErrorCode.API_INVALID_RESPONSE]: "Invalid response from server",
  [ErrorCode.AUTH_UNAUTHORIZED]: "Unauthorized",
  [ErrorCode.AUTH_SESSION_EXPIRED]: "Session expired",
  [ErrorCode.AUTH_SESSION_REQUIRED]: "Session required",
  [ErrorCode.AUTH_INVALID_TOKEN]: "Invalid token",
  [ErrorCode.CLIENT_UNKNOWN]: "Unknown error",
  [ErrorCode.CLIENT_BAD_REQUEST]: "Bad request",
  [ErrorCode.CLIENT_FORBIDDEN]: "Forbidden",
  [ErrorCode.CLIENT_NOT_FOUND]: "Not found",
  [ErrorCode.CLIENT_UNAUTHORIZED]: "Unauthorized",
  [ErrorCode.CLIENT_INTERNAL_ERROR]: "Internal server error",
};
