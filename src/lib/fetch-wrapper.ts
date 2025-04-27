import { AppError } from "@app-types/app-errors/app-error";
import {
  createAppErrorFromUrlAndStatus,
  createAppErrorFromErrorCode,
  createNetworkOrBackendError,
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
      throw createAppErrorFromUrlAndStatus(res.url, res.status);
    }

    return res.json();
  } catch (caughtError: unknown) {
    console.log("caughtError", caughtError);
    const error = createNetworkOrBackendError(caughtError, finalUrl);

    if (handleError) {
      handleError(error);
      return null;
    } else {
      throw error;
    }
  }
};
