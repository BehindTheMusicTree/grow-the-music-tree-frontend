import { ErrorCode } from "./app-error-codes";

export const ErrorMessages: Record<ErrorCode, string> = {
  // Network Errors
  [ErrorCode.NETWORK_OFFLINE]: "Network connection unavailable",
  [ErrorCode.NETWORK_TIMEOUT]: "Request timed out",
  [ErrorCode.NETWORK_CONNECTION_REFUSED]: "Connection refused",
  [ErrorCode.NETWORK_NOT_FOUND]: "Network not found",
  [ErrorCode.NETWORK_ERROR]: "Network error occurred",
  [ErrorCode.NETWORK_FETCH_ERROR]: "Failed to fetch data",
  [ErrorCode.NETWORK_ABORT_ERROR]: "Request aborted",
  [ErrorCode.NETWORK_FAILED_TO_FETCH]: "Failed to fetch",
  [ErrorCode.NETWORK_UNKNOWN]: "Unknown network error",

  // Backend Errors
  [ErrorCode.BACKEND_UNAVAILABLE]: "Service temporarily unavailable",
  [ErrorCode.BACKEND_RATE_LIMIT]: "Too many requests, please try again later",
  [ErrorCode.BACKEND_AUTH_ERROR]: "Authentication failed",
  [ErrorCode.BACKEND_INTERNAL_ERROR]: "Internal server error",
  [ErrorCode.BACKEND_INVALID_RESPONSE]: "Invalid response from server",
  [ErrorCode.BACKEND_BAD_REQUEST]: "Bad request",
  [ErrorCode.BACKEND_UNAUTHORIZED]: "Unauthorized",
  [ErrorCode.BACKEND_FORBIDDEN]: "Forbidden",
  [ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED]: "Connect Spotify to continue",
  [ErrorCode.BACKEND_SPOTIFY_USER_NOT_ALLOWLISTED]: "Spotify account not in allowlist",
  [ErrorCode.BACKEND_SPOTIFY_CODE_EXPIRED_OR_USED]: "Authorization code expired or already used",
  [ErrorCode.BACKEND_NOT_FOUND]: "Not found",
  [ErrorCode.BACKEND_METHOD_NOT_ALLOWED]: "Method not allowed",
  [ErrorCode.BACKEND_REQUEST_TIMEOUT]: "Request timeout",
  [ErrorCode.BACKEND_INVALID_INPUT]: "Invalid input",

  // Session Errors
  [ErrorCode.SESSION_EXPIRED]: "Session expired",
  [ErrorCode.SESSION_REQUIRED]: "Session required",

  // Client Errors
  [ErrorCode.CLIENT_UNKNOWN]: "Unknown error",
  [ErrorCode.CLIENT_FORBIDDEN]: "Forbidden",
  [ErrorCode.CLIENT_NOT_FOUND]: "Not found",
  [ErrorCode.CLIENT_UNAUTHORIZED]: "Unauthorized",
  [ErrorCode.CLIENT_INTERNAL_ERROR]: "Internal server error",

  // Service Errors
  [ErrorCode.SERVICE_BAD_REQUEST]: "Bad request",
  [ErrorCode.SERVICE_UNAUTHORIZED]: "Unauthorized",
  [ErrorCode.SERVICE_FORBIDDEN]: "Forbidden",
  [ErrorCode.SERVICE_NOT_FOUND]: "Not found",
  [ErrorCode.SERVICE_INTERNAL_ERROR]: "Internal server error",
  [ErrorCode.SERVICE_UNKNOWN]: "Unknown service error",
  [ErrorCode.SERVICE_METHOD_NOT_ALLOWED]: "Method not allowed",
  [ErrorCode.SERVICE_REQUEST_TIMEOUT]: "Request timeout",
};
