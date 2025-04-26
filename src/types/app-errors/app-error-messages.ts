import { ErrorCode } from "./app-error-codes";

export const ErrorMessages: Record<ErrorCode, string> = {
  // Network Errors
  [ErrorCode.NETWORK_OFFLINE]: "Network connection unavailable",
  [ErrorCode.NETWORK_TIMEOUT]: "Request timed out",
  [ErrorCode.NETWORK_CONNECTION_REFUSED]: "Connection refused",
  [ErrorCode.NETWORK_NOT_FOUND]: "Network not found",
  [ErrorCode.NETWORK_ERROR]: "Network error occurred",
  [ErrorCode.NETWORK_FETCH_ERROR]: "Failed to fetch data",

  // API Errors
  [ErrorCode.BACKEND_UNAVAILABLE]: "Service temporarily unavailable",
  [ErrorCode.API_RATE_LIMIT]: "Too many requests, please try again later",
  [ErrorCode.API_AUTH_ERROR]: "Authentication failed",
  [ErrorCode.API_INTERNAL_ERROR]: "Internal server error",
  [ErrorCode.API_INVALID_RESPONSE]: "Invalid response from server",

  // Authentication Errors
  [ErrorCode.AUTH_UNAUTHORIZED]: "Unauthorized",
  [ErrorCode.AUTH_SESSION_EXPIRED]: "Session expired",
  [ErrorCode.AUTH_SESSION_REQUIRED]: "Session required",
  [ErrorCode.AUTH_INVALID_TOKEN]: "Invalid token",

  // Client Errors
  [ErrorCode.CLIENT_UNKNOWN]: "Unknown error",
  [ErrorCode.CLIENT_BAD_REQUEST]: "Bad request",
  [ErrorCode.CLIENT_FORBIDDEN]: "Forbidden",
  [ErrorCode.CLIENT_NOT_FOUND]: "Not found",
  [ErrorCode.CLIENT_UNAUTHORIZED]: "Unauthorized",
  [ErrorCode.CLIENT_INTERNAL_ERROR]: "Internal server error",
};
