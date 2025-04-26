import { ErrorCode } from "./app-error-codes";
import { ErrorMessages } from "./app-error-messages";

export class AppError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(ErrorMessages[code]);
    this.name = "AppError";
  }
}

export class ClientError extends AppError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "ClientError";
  }
}

export class ConnectivityError extends AppError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "ConnectivityError";
  }
}

export class BadRequestError extends ConnectivityError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "BadRequestError";
  }
}

export class NetworkError extends ConnectivityError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "NetworkError";
  }
}

export class BackendError extends ConnectivityError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "ApiError";
  }
}

export class AuthError extends ConnectivityError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}

export class ServerError extends ConnectivityError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "ServerError";
  }
}

/**
 * Union type of all error classes.
 * Required because TypeScript's type system doesn't automatically recognize
 * class inheritance for type checking in instanceof expressions.
 */
export type AppErrorType =
  | AppError
  | ClientError
  | ConnectivityError
  | BadRequestError
  | NetworkError
  | BackendError
  | AuthError
  | ServerError;
