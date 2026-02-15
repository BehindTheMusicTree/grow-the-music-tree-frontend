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

export class InvalidInputError extends ClientError {
  constructor(code: ErrorCode, public readonly json: object) {
    super(code);
    this.name = "InvalidInputError";
  }

  toString(): string {
    return `${super.toString()}\nJSON: ${JSON.stringify(this.json, null, 2)}`;
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
    this.name = "BackendError";
  }
}

export class BackendSpotifyUserNotAllowlistedError extends BackendError {
  constructor(
    code: ErrorCode,
    public readonly detailsMessage: string,
  ) {
    super(code);
    this.name = "BackendSpotifyUserNotAllowlistedError";
  }
}

export class AuthRequired extends ConnectivityError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "AuthRequired";
  }
}

export class ServiceError extends ConnectivityError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "ServiceError";
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
  | BackendSpotifyUserNotAllowlistedError
  | AuthRequired
  | ServiceError;
