"use client";

import { useSession } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { ErrorCode, CustomError, getMessage } from "@types/error";
import { Session, ConnectivityErrorType } from "@types/context";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

interface FetchOptions extends RequestInit {
  resolveOnError?: boolean;
}

function createAuthFetch(session: Session) {
  return async (endpoint: string, options: FetchOptions = {}) => {
    const { resolveOnError, ...fetchOptions } = options;

    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      ...fetchOptions.headers,
    };

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      const error = new Error("API base URL is not configured") as CustomError;
      error.name = "ConfigurationError";
      throw error;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok && !resolveOnError) {
      const error = new Error(`API request failed with status ${response.status}`) as CustomError;
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response;
  };
}

type ServiceFn<T> = (fetch: ReturnType<typeof createAuthFetch>, ...args: unknown[]) => Promise<Response>;

export function useAuthenticatedApi<T>(serviceFn: ServiceFn<T>) {
  const { setConnectivityError, ConnectivityErrorType } = useConnectivityError();
  const { session } = useSession();

  return async (...args: unknown[]): Promise<ApiResponse<T>> => {
    if (!session) {
      setConnectivityError({
        type: ConnectivityErrorType.AUTH_REQUIRED,
        message: getMessage(ErrorCode.AUTH_REQUIRED),
        code: ErrorCode.AUTH_REQUIRED,
      });
      return { success: false, error: { message: getMessage(ErrorCode.AUTH_REQUIRED) } };
    }

    try {
      const authFetch = createAuthFetch(session);
      const response = await serviceFn(authFetch, ...args);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const customError = error as CustomError;

      if (customError?.message === "Unauthorized" || customError?.status === 401) {
        setConnectivityError({
          type: ConnectivityErrorType.AUTH_REQUIRED,
          message: getMessage(ErrorCode.AUTH_REQUIRED),
          code: ErrorCode.AUTH_REQUIRED,
        });
        return { success: false, error: { message: getMessage(ErrorCode.AUTH_REQUIRED) } };
      }

      if (customError?.name === "TypeError" && customError?.message === "Failed to fetch") {
        setConnectivityError({
          type: ConnectivityErrorType.INTERNAL,
          message: getMessage(ErrorCode.INTERNAL),
          code: ErrorCode.INTERNAL,
        });
        return { success: false, error: { message: getMessage(ErrorCode.INTERNAL) } };
      }

      console.error("API error:", error);
      throw error;
    }
  };
}
