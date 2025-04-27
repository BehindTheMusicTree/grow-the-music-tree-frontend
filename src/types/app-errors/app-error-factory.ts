import { ErrorCode } from "./app-error-codes";
import {
  AppError,
  NetworkError,
  BackendError,
  AuthRequired,
  ClientError,
  ServiceError,
  InvalidInputError,
} from "./app-error";

export function createAppErrorFromErrorCode(code: ErrorCode, json?: object): AppError {
  if ([ErrorCode.BACKEND_UNAUTHORIZED, ErrorCode.SESSION_EXPIRED, ErrorCode.SESSION_REQUIRED].includes(code)) {
    return new AuthRequired(code);
  } else if (code.startsWith("NET")) {
    return new NetworkError(code);
  } else if (code.startsWith("BAC")) {
    return new BackendError(code);
  } else if (code.startsWith("CLI")) {
    return new ClientError(code);
  } else if (code.startsWith("SER")) {
    return new ServiceError(code);
  } else if (code.startsWith("INP")) {
    return new InvalidInputError(code, json || {});
  }
  return new AppError(code);
}

export function createAppErrorFromHttpUrlAndErrorMessage(url: string, error: Error): AppError | null {
  if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
    return createAppErrorFromUrlAndStatus(url, 508);
  }
  return null;
}

export function createAppErrorFromUrlAndStatus(url: string, status: number, json?: object): AppError {
  const isBackendError = url.includes(process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "");
  if (status === 400) {
    if (isBackendError) {
      console.log("backend invalid input");
      const error = createAppErrorFromErrorCode(ErrorCode.BACKEND_INVALID_INPUT, json);
      console.log("backend", error);
      return error;
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_BAD_REQUEST);
    }
  } else if (status === 401) {
    if (isBackendError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_UNAUTHORIZED);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_UNAUTHORIZED);
    }
  } else if (status === 403) {
    if (isBackendError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_FORBIDDEN);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_FORBIDDEN);
    }
  } else if (status === 404) {
    if (isBackendError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_NOT_FOUND);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_NOT_FOUND);
    }
  } else if (status === 405) {
    if (isBackendError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_METHOD_NOT_ALLOWED);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_METHOD_NOT_ALLOWED);
    }
  } else if (status === 408) {
    if (isBackendError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_REQUEST_TIMEOUT);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_REQUEST_TIMEOUT);
    }
  } else if (status === 500) {
    if (isBackendError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_INTERNAL_ERROR);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_INTERNAL_ERROR);
    }
  }
  return createAppErrorFromErrorCode(ErrorCode.CLIENT_UNKNOWN);
}

export function createNetworkOrBackendError(error: unknown, url: string): AppError {
  const isBackendError = url.includes(process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "");

  if (!navigator.onLine) {
    return createAppErrorFromErrorCode(ErrorCode.NETWORK_OFFLINE);
  }

  // Handle non-Error objects
  if (!(error instanceof Error)) {
    if (typeof error === "string") {
      return isBackendError
        ? createAppErrorFromErrorCode(ErrorCode.BACKEND_INTERNAL_ERROR)
        : createAppErrorFromErrorCode(ErrorCode.NETWORK_UNKNOWN);
    }
    return createAppErrorFromErrorCode(ErrorCode.NETWORK_UNKNOWN);
  }

  if (error instanceof TypeError) {
    if (error.message === "Failed to fetch") {
      return isBackendError
        ? createAppErrorFromErrorCode(ErrorCode.BACKEND_UNAVAILABLE)
        : createAppErrorFromErrorCode(ErrorCode.NETWORK_FAILED_TO_FETCH);
    } else if (error.message === "Network request failed") {
      return isBackendError
        ? createAppErrorFromErrorCode(ErrorCode.BACKEND_UNAVAILABLE)
        : createAppErrorFromErrorCode(ErrorCode.NETWORK_CONNECTION_REFUSED);
    } else if (error.message.includes("timeout")) {
      return isBackendError
        ? createAppErrorFromErrorCode(ErrorCode.BACKEND_REQUEST_TIMEOUT)
        : createAppErrorFromErrorCode(ErrorCode.NETWORK_TIMEOUT);
    }
  }

  if (error.name === "AbortError") {
    return createAppErrorFromErrorCode(ErrorCode.NETWORK_ABORT_ERROR);
  }

  if (error.message?.includes("Failed to fetch")) {
    return isBackendError
      ? createAppErrorFromErrorCode(ErrorCode.BACKEND_UNAVAILABLE)
      : createAppErrorFromErrorCode(ErrorCode.NETWORK_FAILED_TO_FETCH);
  }

  if (error.message?.includes("not found")) {
    return isBackendError
      ? createAppErrorFromErrorCode(ErrorCode.BACKEND_NOT_FOUND)
      : createAppErrorFromErrorCode(ErrorCode.NETWORK_NOT_FOUND);
  }

  return isBackendError
    ? createAppErrorFromErrorCode(ErrorCode.BACKEND_INTERNAL_ERROR)
    : createAppErrorFromErrorCode(ErrorCode.NETWORK_UNKNOWN);
}
