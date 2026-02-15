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
  const { clearSession, session, sessionRestored } = useSession();

  const handleError = (error: Error) => {
    if (error instanceof ConnectivityError) {
      const authDetailErrors = [
        ErrorCode.BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED,
        ErrorCode.BACKEND_SPOTIFY_USER_NOT_IN_ALLOWLIST,
        ErrorCode.BACKEND_SPOTIFY_AUTHENTICATION_ERROR,
        ErrorCode.BACKEND_GOOGLE_AUTHENTICATION_ERROR,
        ErrorCode.BACKEND_GOOGLE_OAUTH_MISCONFIGURED,
      ];
      if (
        error instanceof BackendError &&
        authDetailErrors.includes(error.code)
      ) {
        throw error;
      }
      if (error instanceof AuthRequired) {
        clearSession();
      }
      setConnectivityError(error);
      if (
        error instanceof BackendError &&
        error.code === ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED
      ) {
        throw error;
      }
    } else {
      throw error;
    }
  };

  const handleMissingRequiredSession = () => {
    if (!sessionRestored) return;
    setConnectivityError(createAppErrorFromErrorCode(ErrorCode.SESSION_REQUIRED));
  };

  const fetch = <T>(
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
  };

  return { fetch };
};
