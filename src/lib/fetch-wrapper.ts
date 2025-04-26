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
  requestInterceptor?: RequestInterceptor,
  responseInterceptor?: ResponseInterceptor
): Promise<T> => {
  const urlWithParams = queryParams
    ? `${url}${url.includes("?") ? "&" : "?"}${new URLSearchParams(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)])
      ).toString()}`
    : url;

  let finalUrl = urlWithParams;
  let finalOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(options.headers || {}),
    },
  };

  // Apply request interceptor if provided
  if (requestInterceptor) {
    [finalUrl, finalOptions] = await requestInterceptor(finalUrl, finalOptions);
  }

  try {
    const res = await fetch(finalUrl, finalOptions);

    // Handle response errors
    if (!res.ok) {
      throw createAppErrorFromHttpUrlAndStatus(res.url, res.status);
    }

    // Apply response interceptor if provided
    if (responseInterceptor) {
      return responseInterceptor<T>(res);
    }

    return res.json();
  } catch (caughtError: unknown) {
    let error: Error;

    if (!navigator.onLine) {
      error = createAppErrorFromErrorCode(ErrorCode.NETWORK_OFFLINE);
    } else if (caughtError instanceof AppError) {
      error = caughtError;
    } else if (caughtError instanceof Error) {
      // Specifically handle network errors like ERR_CONNECTION_REFUSED
      if (caughtError instanceof TypeError && caughtError.message === "Failed to fetch") {
        error = createAppErrorFromErrorCode(ErrorCode.NETWORK_CONNECTION_REFUSED);
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

    throw error;
  }
};
