import { AppError } from "@app-types/app-errors/app-error";
import {
  createAppErrorFromHttpUrlAndStatus,
  createAppErrorFromErrorCode,
} from "@app-types/app-errors/app-error-factory";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";

export type RequestInterceptor = (url: string, options: RequestInit) => Promise<[string, RequestInit]>;
export type ResponseInterceptor = <T>(response: Response) => Promise<T>;

export const fetchWrapper = async <T>(
  url: string,
  options: RequestInit = {},
  accessToken?: string,
  queryParams?: Record<string, string | number | boolean>,
  handleError?: (error: Error) => void
): Promise<T | null> => {
  const urlWithParams = queryParams
    ? `${url}${url.includes("?") ? "&" : "?"}${new URLSearchParams(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)])
      ).toString()}`
    : url;

  const finalUrl = urlWithParams;
  const finalOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(finalUrl, finalOptions);

    // Handle response errors
    if (!res.ok) {
      throw createAppErrorFromHttpUrlAndStatus(res.url, res.status);
    }

    return res.json();
  } catch (caughtError: unknown) {
    console.log("fetchWrapper caughtError", caughtError);
    let error: Error;

    if (!navigator.onLine) {
      error = createAppErrorFromErrorCode(ErrorCode.NETWORK_OFFLINE);
    } else if (caughtError instanceof AppError) {
      error = caughtError;
    } else if (caughtError instanceof Error) {
      // Specifically handle network errors like ERR_CONNECTION_REFUSED
      if (caughtError instanceof TypeError) {
        if (caughtError.message === "Failed to fetch") {
          error = createAppErrorFromErrorCode(ErrorCode.NETWORK_FAILED_TO_FETCH);
        } else if (caughtError.message === "Network request failed") {
          error = createAppErrorFromErrorCode(ErrorCode.NETWORK_CONNECTION_REFUSED);
        } else {
          error = createAppErrorFromErrorCode(ErrorCode.NETWORK_UNKNOWN);
        }
      } else if (caughtError.name === "AbortError") {
        error = createAppErrorFromErrorCode(ErrorCode.NETWORK_ABORT_ERROR);
      } else if (caughtError.message?.includes("Failed to fetch")) {
        error = createAppErrorFromErrorCode(ErrorCode.NETWORK_FAILED_TO_FETCH);
      } else {
        error = createAppErrorFromErrorCode(ErrorCode.NETWORK_UNKNOWN);
      }
    } else {
      error = createAppErrorFromErrorCode(ErrorCode.NETWORK_UNKNOWN);
    }

    if (handleError) {
      handleError(error);
      return null;
    } else {
      throw error;
    }
  }
};
