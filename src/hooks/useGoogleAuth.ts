"use client";

import { useCallback } from "react";

import { useSession } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";

const DEFAULT_GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const DEFAULT_GOOGLE_SCOPES = "openid email profile";

export function useGoogleAuth() {
  const { clearSession, setSession } = useSession();
  const { setConnectivityError, clearConnectivityError } = useConnectivityError();
  const { fetch } = useFetchWrapper();

  const handleGoogleOAuth = (redirectAfterAuthPath?: string) => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      console.error("[GoogleAuth] Missing Google env vars", {
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: clientId,
        NEXT_PUBLIC_GOOGLE_REDIRECT_URI: redirectUri,
      });
      throw new Error("Google configuration is missing. Please check your environment variables.");
    }

    const redirectPath = redirectUri;
    const resolvedRedirectUri = redirectPath.startsWith("http")
      ? redirectPath
      : `${window.location.origin}${redirectPath.startsWith("/") ? "" : "/"}${redirectPath}`;

    const urlToStore = redirectAfterAuthPath
      ? `${window.location.origin}${redirectAfterAuthPath.startsWith("/") ? "" : "/"}${redirectAfterAuthPath}`
      : window.location.href;
    localStorage.setItem("googleAuthRedirect", urlToStore);

    const authUrl = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ?? DEFAULT_GOOGLE_AUTH_URL;
    const scope = process.env.NEXT_PUBLIC_GOOGLE_SCOPES ?? DEFAULT_GOOGLE_SCOPES;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: resolvedRedirectUri,
      response_type: "code",
      scope: scope.replace(/\s+/g, " ").trim(),
      access_type: "offline",
      prompt: "consent",
    });

    window.location.href = `${authUrl}?${params.toString()}`;
  };

  const authToBackendFromGoogleCode = useCallback(
    async (code: string): Promise<string | null> => {
      const setCreateBackendAuthConnectivityError = () => {
        return setConnectivityError(createAppErrorFromErrorCode(ErrorCode.BACKEND_AUTH_ERROR));
      };
      type BackendGoogleAuthResponse = {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
      };

      try {
        const backendResponse = await fetch<BackendGoogleAuthResponse>("auth/google/", true, false, {
          method: "POST",
          body: JSON.stringify({ code }),
        });
        if (!backendResponse) {
          setCreateBackendAuthConnectivityError();
          return null;
        }
        setSession({
          accessToken: backendResponse.accessToken,
          refreshToken: backendResponse.refreshToken,
          expiresAt: backendResponse.expiresAt,
        });
        const originalUrl = localStorage.getItem("googleAuthRedirect");
        if (originalUrl) {
          localStorage.removeItem("googleAuthRedirect");
          try {
            const url = new URL(originalUrl);
            return url.pathname + url.search;
          } catch {
            return "/";
          }
        }
        return "/";
      } catch (e) {
        console.log("authToBackendFromGoogleCode error", e);
        setCreateBackendAuthConnectivityError();
        return null;
      }
    },
    [fetch, setSession, setConnectivityError],
  );

  const logout = useCallback(() => {
    clearConnectivityError();
    clearSession();
  }, [clearConnectivityError, clearSession]);

  return {
    handleGoogleOAuth,
    authToBackendFromGoogleCode,
    logout,
  };
}
