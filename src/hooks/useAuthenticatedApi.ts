"use client";

import { useSession, Session } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";

interface FetchOptions extends RequestInit {
  resolveOnError?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

interface ResponseError extends Error {
  status?: number;
  response?: Response;
}

export type AuthFetch = (endpoint: string, options?: FetchOptions) => Promise<Response>;
type ServiceFn<T, Args extends unknown[] = unknown[]> = (authFetch: AuthFetch, ...args: Args) => Promise<T>;

function createAuthFetch(session: Session) {
  return async (endpoint: string, options: FetchOptions = {}) => {
    const { resolveOnError, ...fetchOptions } = options;

    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      ...fetchOptions.headers,
    };

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      const error = new Error("API base URL is not configured") as ResponseError;
      error.name = "ConfigurationError";
      throw error;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok && !resolveOnError) {
      const error = new Error(`API request failed with status ${response.status}`) as ResponseError;
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response;
  };
}

export function useAuthenticatedApi<T, Args extends unknown[] = unknown[]>(serviceFn: ServiceFn<T, Args>) {
  const { setAppError: setConnectivityError } = useConnectivityError();
  const { session } = useSession();

  return async (...args: Args): Promise<ApiResponse<T>> => {
    try {
      const authFetch = createAuthFetch(session);
      const response = await serviceFn(authFetch, ...args);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const customError = error as ResponseError;

      if (customError?.message === "Unauthorized" || customError?.status === 401) {
        setConnectivityError({
          type: "AUTH_REQUIRED",
          message: "Authentication is required to access this resource",
          code: "AUTH_REQUIRED",
        });
        return { success: false, error: { message: "Authentication is required to access this resource" } };
      }

      if (customError?.name === "TypeError" && customError?.message === "Failed to fetch") {
        setConnectivityError({
          type: "INTERNAL",
          message: "An internal server error occurred",
          code: "INTERNAL",
        });
        return { success: false, error: { message: "An internal server error occurred" } };
      }

      console.error("API error:", error);
      throw error;
    }
  };
}
