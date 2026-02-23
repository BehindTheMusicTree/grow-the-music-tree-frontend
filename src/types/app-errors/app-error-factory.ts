import { ErrorCode } from "./app-error-codes";
import { getSpotifyAllowlistMessage } from "./app-error-messages";
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

export async function createAppErrorFromHttpUrlAndErrorMessage(url: string, error: Error): Promise<AppError | null> {
  if (error.message.includes("Failed to fetch") || error.message.includes("Network request failed")) {
    const result = new Response(null, {
      status: 508,
    });
    Object.defineProperty(result, "url", { value: url });
    const appError = await createAppErrorFromResult(result);
    return appError;
  }
  return null;
}

export async function createAppErrorFromResult(result: Response): Promise<AppError> {
  const isBackendError = result.url.includes(process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "");
  if (result.status === 400) {
    if (isBackendError) {
      try {
        const json = await result.json();
        return createAppErrorFromErrorCode(ErrorCode.BACKEND_INVALID_INPUT, json);
      } catch {
        return createAppErrorFromErrorCode(ErrorCode.BACKEND_INVALID_INPUT);
      }
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_BAD_REQUEST);
    }
  } else if (result.status === 401) {
    if (isBackendError) {
      try {
        };
        const apiCode = body?.code;
        const detailsCode = body?.details?.code;
        if (detailsCode === "google_oauth_code_invalid_or_expired") {
          return new BackendError(
            ErrorCode.BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED,
            body.details?.message,
          );
        }
        if (detailsCode === "spotify_oauth_code_invalid_or_expired") {
          return new BackendError(
            ErrorCode.BACKEND_SPOTIFY_OAUTH_CODE_INVALID_OR_EXPIRED,
            body.details?.message,
          );
        }
        if (detailsCode === "spotify_user_not_in_allowlist") {
          return new BackendError(
            ErrorCode.BACKEND_SPOTIFY_USER_NOT_IN_ALLOWLIST,
            getSpotifyAllowlistMessage(),
          );
        }
        if (detailsCode === "spotify_authentication_error") {
          return new BackendError(
            ErrorCode.BACKEND_SPOTIFY_AUTHENTICATION_ERROR,
            body.details?.message,
          );
        }
        if (detailsCode === "google_authentication_error") {
          return new BackendError(
            ErrorCode.BACKEND_GOOGLE_AUTHENTICATION_ERROR,
            body.details?.message,
          );
        }
        if (
          detailsCode === "google_oauth_redirect_uri_mismatch" ||
          detailsCode === "google_oauth_invalid_client"
        ) {
          return new BackendError(
            ErrorCode.BACKEND_GOOGLE_OAUTH_MISCONFIGURED,
            body.details?.message,
          );
        }
        if (detailsCode === "google_oauth_unauthorized_client") {
          return new BackendError(
            ErrorCode.BACKEND_GOOGLE_OAUTH_UNAUTHORIZED_CLIENT,
            body.details?.message,
          );
        }
        if (
          apiCode === 1006 ||
          detailsCode === "authentication_required" ||
          apiCode === 1001
        ) {
          return createAppErrorFromErrorCode(ErrorCode.BACKEND_UNAUTHORIZED);
        }
      } catch {
        // ignore parse failure, fallback below
      }
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_UNAUTHORIZED);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_UNAUTHORIZED);
    }
  } else if (result.status === 403) {
    if (isBackendError) {
      try {
        const body = (await result.json()) as { code?: number; details?: { code?: string } };
        const apiCode = body?.code;
        const detailsCode = body?.details?.code;
        console.log("[createAppErrorFromResult] 403 response", {
          url: result.url,
          body,
          apiCode,
          detailsCode,
          match: apiCode === 1005 || detailsCode === "spotify_authorization_required",
        });
        if (apiCode === 1005 || detailsCode === "spotify_authorization_required") {
          return createAppErrorFromErrorCode(ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED);
        }
      } catch (e) {
        console.log("[createAppErrorFromResult] 403 parse failed", { url: result.url, error: e });
      }
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_FORBIDDEN);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_FORBIDDEN);
    }
  } else if (result.status === 404) {
    if (isBackendError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_NOT_FOUND);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_NOT_FOUND);
    }
  } else if (result.status === 405) {
    if (isBackendError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_METHOD_NOT_ALLOWED);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_METHOD_NOT_ALLOWED);
    }
  } else if (result.status === 408) {
    if (isBackendError) {
      return createAppErrorFromErrorCode(ErrorCode.BACKEND_REQUEST_TIMEOUT);
    } else {
      return createAppErrorFromErrorCode(ErrorCode.SERVICE_REQUEST_TIMEOUT);
    }
  } else if (result.status === 500) {
    if (isBackendError) {
      try {
        const body = (await result.json()) as { details?: { code?: string; message?: string } };
        const detailsCode = body?.details?.code;
        if (detailsCode === "spotify_invalid_client") {
          return new BackendError(
            ErrorCode.BACKEND_SPOTIFY_OAUTH_INVALID_CLIENT,
            body.details?.message,
          );
        }
      } catch {
        // ignore parse failure
      }
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
