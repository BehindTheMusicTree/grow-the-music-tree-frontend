import { useCallback } from "react";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { useSession } from "@contexts/SessionContext";
import {
  BackendError,
  AuthRequired,
  ConnectivityError,
} from "@app-types/app-errors/app-error";
import { fetchWrapper as rawFetch } from "@lib/fetch-wrapper";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";

export const useFetchWrapper = () => {
  const { setConnectivityError } = useConnectivityError();
  const { clearSession, session } = useSession();

  const handleError = useCallback((error: Error) => {
    if (error instanceof ConnectivityError) {
      if (error instanceof AuthRequired) {
        clearSession();
      }
      if (
        error instanceof BackendError &&
        (error.code === ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED ||
          error.code === ErrorCode.BACKEND_SPOTIFY_USER_NOT_ALLOWLISTED ||
          error.code === ErrorCode.BACKEND_SPOTIFY_CODE_EXPIRED_OR_USED)
      ) {
        throw error;
      }
      setConnectivityError(error);
    } else {
      throw error;
    }
  }, [clearSession, setConnectivityError]);

  const handleMissingRequiredSession = useCallback(() => {
    setConnectivityError(createAppErrorFromErrorCode(ErrorCode.SESSION_REQUIRED));
  }, [setConnectivityError]);

  const fetch = useCallback(<T>(
    backendEndpointOrUrl: string,
    fromBackend: boolean = true,
    requiresAuth: boolean = true,
    options: RequestInit = {},
    queryParams?: Record<string, string | number | boolean>,
    expectBinary: boolean = false,
    skipGlobalError: boolean = false,
  ) => {
    const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "").replace(/\/+$/, "");
    const endpointPath = String(backendEndpointOrUrl);
    if (fromBackend && endpointPath.startsWith("/")) {
      throw new Error(
        `Endpoint path must be relative (no leading slash). Got: "${endpointPath}". See src/api/endpoints/README.md.`,
      );
    }
    const url = fromBackend ? (endpointPath ? `${baseUrl}/${endpointPath}` : baseUrl) : backendEndpointOrUrl;
    return rawFetch<T>(
      url,
      requiresAuth,
      options,
      session?.accessToken || undefined,
      queryParams,
      handleMissingRequiredSession,
      skipGlobalError ? undefined : handleError,
      expectBinary,
    );
  }, [session?.accessToken, handleError, handleMissingRequiredSession]);

  return { fetch };
};
