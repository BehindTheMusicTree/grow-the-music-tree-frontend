import { ErrorCode } from "./app-error-codes";
import { AppError, NetworkError, BackendError, AuthError as AuthRequired, ClientError, ServerError } from "./app-error";

export function createAppErrorFromErrorCode(code: ErrorCode): AppError {
  if ([ErrorCode.BACKEND_UNAUTHORIZED, ErrorCode.SESSION_EXPIRED, ErrorCode.SESSION_REQUIRED].includes(code)) {
    return new AuthRequired(code);
  } else if (code.startsWith("NET")) {
    return new NetworkError(code);
  } else if (code.startsWith("BAC")) {
    return new BackendError(code);
  } else if (code.startsWith("CLI")) {
    return new ClientError(code);
  } else if (code.startsWith("SER")) {
    return new ServerError(code);
  }
  return new AppError(code);
}

export function createAppErrorFromHttpUrlAndStatus(url: string, status: number): AppError {
  const isApiError = url.includes(process.env.NEXT_PUBLIC_API_BASE_URL || "");
  if (status === 400) {
    if (isApiError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_BAD_REQUEST);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_BAD_REQUEST);
    }
  } else if (status === 401) {
    if (isApiError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_UNAUTHORIZED);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_UNAUTHORIZED);
    }
  } else if (status === 403) {
    if (isApiError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_FORBIDDEN);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_FORBIDDEN);
    }
  } else if (status === 404) {
    if (isApiError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_NOT_FOUND);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_NOT_FOUND);
    }
  } else if (status === 405) {
    if (isApiError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_METHOD_NOT_ALLOWED);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_METHOD_NOT_ALLOWED);
    }
  } else if (status === 408) {
    if (isApiError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_REQUEST_TIMEOUT);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_REQUEST_TIMEOUT);
    }
  } else if (status === 500) {
    if (isApiError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_INTERNAL_ERROR);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_INTERNAL_ERROR);
    }
  }
  return createAppErrorFromErrorCode(ErrorCode.CLIENT_UNKNOWN);
}
