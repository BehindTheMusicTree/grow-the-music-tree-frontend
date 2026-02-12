import { createAppErrorFromResult, createNetworkOrBackendError } from "@app-types/app-errors/app-error-factory";
import { AppError } from "@app-types/app-errors/app-error";

export const fetchWrapper = async <T>(
  url: string,
  requiresAuth: boolean,
  options: RequestInit = {},
  accessToken?: string,
  queryParams?: Record<string, string | number | boolean>,
  handleMissingRequiredSession?: () => void,
  handleError?: (error: Error) => void,
  expectBinary: boolean = false,
): Promise<T | null> => {
  const urlWithParams = queryParams
    ? `${url}${url.includes("?") ? "&" : "?"}${new URLSearchParams(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)]),
      ).toString()}`
    : url;

  const finalUrl = urlWithParams;

  // Don't set Content-Type for FormData - let browser set it with boundary
  const isFormData = options.body instanceof FormData;
  const finalOptions: RequestInit = {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(options.headers || {}),
    },
  };

  if (requiresAuth && !accessToken) {
    handleMissingRequiredSession?.();
    return null;
  }

  try {
    const result = await fetch(finalUrl, finalOptions);

    if (!result.ok) {
      const appError = await createAppErrorFromResult(result);
      throw appError;
    }

    // Return binary data or JSON based on expectBinary flag
    if (expectBinary) {
      return result.arrayBuffer() as T;
    } else {
      return result.json();
    }
  } catch (caughtError: unknown) {
    let appError: AppError | null = null;
    if (caughtError instanceof AppError) {
      appError = caughtError;
    } else {
      appError = createNetworkOrBackendError(caughtError, finalUrl);
    }

    if (handleError && appError) {
      handleError(appError);
      return null;
    } else {
      throw appError;
    }
  }
};
