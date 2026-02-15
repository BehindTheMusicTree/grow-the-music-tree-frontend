"use client";

import { useCallback } from "react";

import { useSession } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import {
  exchangeCodeWithBackend,
  GOOGLE_EXCHANGE_CONFIG,
  resolveRedirectUri,
  storeRedirectUrl,
} from "@lib/auth/code-exchange";

const DEFAULT_GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const DEFAULT_GOOGLE_SCOPES = "openid email profile";

export function useGoogleAuth() {
  const { setSession } = useSession();
  const { setConnectivityError } = useConnectivityError();
  const { fetch } = useFetchWrapper();

  const handleGoogleOAuth = (redirectAfterAuthPath?: string) => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUriEnv = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    if (!clientId || !redirectUriEnv) {
      console.error("[GoogleAuth] Missing Google env vars", {
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: clientId,
        NEXT_PUBLIC_GOOGLE_REDIRECT_URI: redirectUriEnv,
      });
      throw new Error("Google configuration is missing. Please check your environment variables.");
    }

    const resolvedRedirectUri = resolveRedirectUri(redirectUriEnv);
    storeRedirectUrl(GOOGLE_EXCHANGE_CONFIG.redirectStorageKey, redirectAfterAuthPath);

    const authUrl = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ?? DEFAULT_GOOGLE_AUTH_URL;
    const scope = (process.env.NEXT_PUBLIC_GOOGLE_SCOPES ?? DEFAULT_GOOGLE_SCOPES).replace(/\s+/g, " ").trim();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: resolvedRedirectUri,
      response_type: "code",
      scope,
      access_type: "offline",
    });

    window.location.href = `${authUrl}?${params.toString()}`;
  };

  const authToBackendFromGoogleCode = useCallback(
    async (code: string) =>
      exchangeCodeWithBackend(fetch, setSession, setConnectivityError, GOOGLE_EXCHANGE_CONFIG, code),
    [fetch, setSession, setConnectivityError],
  );

  return {
    handleGoogleOAuth,
    authToBackendFromGoogleCode,
  };
}
