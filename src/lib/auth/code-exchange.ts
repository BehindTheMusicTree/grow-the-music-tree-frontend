import { BackendError, ConnectivityError } from "@app-types/app-errors/app-error";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";
import { Session } from "@app-types/Session";

export type BackendAuthResponse = Pick<Session, "accessToken" | "refreshToken" | "expiresAt"> & {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export interface ExchangeCodeConfig {
  endpoint: string;
  redirectStorageKey: string;
  rethrowErrorCodes: readonly ErrorCode[];
}

export const SPOTIFY_EXCHANGE_CONFIG: ExchangeCodeConfig = {
  endpoint: "auth/spotify/",
  redirectStorageKey: "spotifyAuthRedirect",
  rethrowErrorCodes: [
    ErrorCode.BACKEND_SPOTIFY_USER_NOT_IN_ALLOWLIST,
    ErrorCode.BACKEND_SPOTIFY_AUTHENTICATION_ERROR,
  ],
};

export const GOOGLE_EXCHANGE_CONFIG: ExchangeCodeConfig = {
  endpoint: "auth/google/",
  redirectStorageKey: "googleAuthRedirect",
  rethrowErrorCodes: [
    ErrorCode.BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED,
    ErrorCode.BACKEND_GOOGLE_OAUTH_UNAUTHORIZED_CLIENT,
    ErrorCode.BACKEND_GOOGLE_AUTHENTICATION_ERROR,
    ErrorCode.BACKEND_GOOGLE_OAUTH_MISCONFIGURED,
  ],
};

type FetchAuth = <T>(
  url: string,
  fromBackend: boolean,
  requiresAuth: boolean,
  options: RequestInit,
) => Promise<T | null>;

export async function exchangeCodeWithBackend(
  fetchAuth: FetchAuth,
  setSession: (session: Session) => void,
  setConnectivityError: (error: ConnectivityError | null) => void,
  config: ExchangeCodeConfig,
  code: string,
): Promise<string | null> {
  const { endpoint, redirectStorageKey, rethrowErrorCodes } = config;
  const setBackendAuthError = () =>
    setConnectivityError(createAppErrorFromErrorCode(ErrorCode.BACKEND_AUTH_ERROR));

  try {
    const response = await fetchAuth<BackendAuthResponse>(endpoint, true, false, {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    if (!response) {
      setBackendAuthError();
      return null;
    }
    setSession({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    });
    const stored = localStorage.getItem(redirectStorageKey);
    if (stored) {
      localStorage.removeItem(redirectStorageKey);
      try {
        const url = new URL(stored);
        return url.pathname + url.search;
      } catch {
        return "/";
      }
    }
    return "/";
  } catch (e) {
    if (e instanceof BackendError && rethrowErrorCodes.includes(e.code)) {
      throw e;
    }
    console.log("[auth] exchangeCodeWithBackend error", e);
    setBackendAuthError();
    return null;
  }
}

export function resolveRedirectUri(redirectUriEnv: string): string {
  return redirectUriEnv.startsWith("http")
    ? redirectUriEnv
    : `${window.location.origin}${redirectUriEnv.startsWith("/") ? "" : "/"}${redirectUriEnv}`;
}

export function storeRedirectUrl(redirectStorageKey: string, redirectAfterAuthPath?: string): void {
  const path =
    typeof redirectAfterAuthPath === "string" ? redirectAfterAuthPath : undefined;
  const urlToStore = path
    ? `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`
    : window.location.href;
  localStorage.setItem(redirectStorageKey, urlToStore);
}

export function clearStoredRedirectUrl(redirectStorageKey: string): void {
  localStorage.removeItem(redirectStorageKey);
}

export function createLogout(
  clearConnectivityError: () => void,
  clearSession: () => void,
): () => void {
  return () => {
    clearConnectivityError();
    clearSession();
  };
}
