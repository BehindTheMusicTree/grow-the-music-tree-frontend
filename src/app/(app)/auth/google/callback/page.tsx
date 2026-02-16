"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePopup } from "@contexts/PopupContext";
import { AUTH_POPUP_TYPE } from "@contexts/PopupContext";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
import AuthPopup from "@components/ui/popup/child/AuthPopup";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { BackendError } from "@app-types/app-errors/app-error";

function getParamsFromUrl() {
  if (typeof window === "undefined") return { code: null, errorParam: null };
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get("code"),
    errorParam: params.get("error"),
  };
}

export default function GoogleOAuthCallbackPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { showPopup } = usePopup();
  const { handleSpotifyOAuth } = useSpotifyAuth();
  const { authToBackendFromGoogleCode, handleGoogleOAuth } = useGoogleAuth();
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const authAttempted = useRef(false);

  if (typeof window !== "undefined") {
    const { code } = getParamsFromUrl();
    console.log("[GoogleCallback] Page render", { pathname, hasCode: !!code, search: window.location.search.slice(0, 50) });
  }

  useEffect(() => {
    const { code, errorParam } = getParamsFromUrl();

    const handleAuth = async () => {
      if (errorParam) {
        if (authAttempted.current) return;
        authAttempted.current = true;
        setError(new Error(`Google authentication failed: ${errorParam}`));
        setIsPending(false);
        return;
      }

      if (!code) {
        if (authAttempted.current) return;
        authAttempted.current = true;
        setError(new Error("No authorization code received from Google"));
        setIsPending(false);
        return;
      }

      if (authAttempted.current) return;
      authAttempted.current = true;

      try {
        console.log("[GoogleCallback] Exchanging code with backend…");
        const redirectUrl = await authToBackendFromGoogleCode(code);
        if (redirectUrl) {
          // router.push(redirectUrl);
        }
      } catch (err) {
        if (err instanceof BackendError) {
          if (err.code === ErrorCode.BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED) {
            showPopup(
              <AuthPopup
                handleSpotifyOAuth={handleSpotifyOAuth}
                handleGoogleOAuth={handleGoogleOAuth}
              />,
              AUTH_POPUP_TYPE,
            );
            // router.push("/");
          } else if (err.code === ErrorCode.BACKEND_AUTH_ERROR) {
            setError(new Error("Failed to authenticate with the backend server. Please try again later."));
          } else {
            setError(new Error(err.message));
          }
        } else {
          setError(new Error("An unexpected error occurred. Please try again later."));
        }
      } finally {
        setIsPending(false);
      }
    };

    handleAuth();
  }, [authToBackendFromGoogleCode, handleSpotifyOAuth, handleGoogleOAuth, showPopup, router]);

  if (isPending) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        data-page="google-oauth-callback"
      >
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Connecting with Google...</h1>
          <p className="text-gray-600">Please wait while we complete the authentication process.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <h2 className="mb-2 font-semibold text-red-500">Authentication Error</h2>
          <p className="text-red-500/80">{error.message}</p>
        </div>
      </div>
    );
  }

  return null;
}
