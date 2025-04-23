import { ErrorCode } from "@contexts/error-codes";

// Base error type for all errors
export class Error {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }

  static getMessage(code) {
    return ErrorCode.getMessage(code);
  }
}

// Network related errors
export class NetworkError extends Error {
  static CONNECTION_REFUSED = new NetworkError(
    ErrorCode.NETWORK_ERROR,
    "Unable to connect to the server. Please check your network or the server might be down."
  );
  static TIMEOUT = new NetworkError(ErrorCode.TIMEOUT, "Request timed out. Please try again.");
  static OFFLINE = new NetworkError(
    ErrorCode.CONNECTION_FAILED,
    "You appear to be offline. Please check your internet connection."
  );
}

// Authentication related errors
export class AuthError extends Error {
  static UNAUTHORIZED = new AuthError(ErrorCode.AUTH_REQUIRED, "You need to be logged in to access this resource.");
  static SESSION_EXPIRED = new AuthError(ErrorCode.SESSION_EXPIRED, "Your session has expired. Please log in again.");
  static INVALID_TOKEN = new AuthError(
    ErrorCode.INVALID_CREDENTIALS,
    "Invalid authentication token. Please log in again."
  );
}

// Server related errors
export class ServerError extends Error {
  static INTERNAL = new ServerError(
    ErrorCode.SERVER_ERROR,
    "An internal server error occurred. Please try again later."
  );
  static BAD_GATEWAY = new ServerError(
    ErrorCode.SERVER_ERROR,
    "Server is temporarily unavailable. Please try again later."
  );
  static SERVICE_UNAVAILABLE = new ServerError(
    ErrorCode.SERVER_ERROR,
    "Service is temporarily unavailable. Please try again later."
  );
}

// Client related errors
export class ClientError extends Error {
  static BAD_REQUEST = new ClientError(
    ErrorCode.BAD_REQUEST,
    "Invalid request. Please check your input and try again."
  );
  static NOT_FOUND = new ClientError(ErrorCode.NOT_FOUND, "The requested resource was not found.");
  static FORBIDDEN = new ClientError(ErrorCode.BAD_REQUEST, "You don't have permission to access this resource.");
}

// Helper functions for error handling
export class ErrorHandler {
  static getErrorFromStatus(status) {
    if (status >= 500) return ServerError.INTERNAL;
    if (status === 401) return AuthError.UNAUTHORIZED;
    if (status === 403) return AuthError.INVALID_TOKEN;
    if (status === 404) return ClientError.NOT_FOUND;
    if (status === 400) return ClientError.BAD_REQUEST;
    return ServerError.INTERNAL;
  }

  static getMessageFromError(error) {
    if (error instanceof Error) return error.message;
    if (error.isNetworkError) return NetworkError.CONNECTION_REFUSED.message;
    return ServerError.INTERNAL.message;
  }
}
