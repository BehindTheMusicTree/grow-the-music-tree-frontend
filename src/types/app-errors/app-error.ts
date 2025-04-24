import { ErrorCode } from "./app-error-codes";
import { ErrorMessages } from "./app-error-messages";

export class AppError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(ErrorMessages[code]);
    this.name = "AppError";
  }
}

export class NetworkError extends AppError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "NetworkError";
  }
}

export class ApiError extends AppError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "ApiError";
  }
}

export class AuthError extends AppError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}

export class ClientError extends AppError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "ClientError";
  }
}

export class ServerError extends AppError {
  constructor(code: ErrorCode) {
    super(code);
    this.name = "ServerError";
  }
}
