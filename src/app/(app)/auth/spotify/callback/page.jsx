"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePopup } from "@contexts/PopupContext";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import SpotifyAuthErrorPopup from "@components/ui/popup/child/SpotifyAuthErrorPopup";
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

export default function SpotifyOAuthCallbackPage() {
  const router = useRouter();
  const { showPopup, hidePopup } = usePopup();
  const { authToBackendFromSpotifyCode } = useSpotifyAuth();
  const [isPending, setIsPending] = useState(true);
  const authAttempted = useRef(false);

  useEffect(() => {
    const { code, errorParam } = getParamsFromUrl();

    const handleAuth = async () => {
      if (errorParam) {
        if (authAttempted.current) return;
        authAttempted.current = true;
        showPopup(
          <SpotifyAuthErrorPopup
            message={`Spotify authentication failed: ${errorParam}`}
            onClose={() => {
              hidePopup();
              // router.push("/");
            }}
          />,
        );
        // router.push("/");
        setIsPending(false);
        return;
      }

      if (!code) {
        if (authAttempted.current) return;
        authAttempted.current = true;
        showPopup(
          <SpotifyAuthErrorPopup
            message="No authorization code received from Spotify"
            onClose={() => {
              hidePopup();
              // router.push("/");
            }}
          />,
        );
        // router.push("/");
        setIsPending(false);
        return;
      }

      if (authAttempted.current) return;
      authAttempted.current = true;

      try {
        const redirectUrl = await authToBackendFromSpotifyCode(code);
        if (redirectUrl) {
          // router.push(redirectUrl);
        }
      } catch (err) {
        const message =
          err instanceof BackendError
            ? err.code === ErrorCode.BACKEND_AUTH_ERROR
              ? "Failed to authenticate with the backend server. Please try again later."
              : err.message
            : "An unexpected error occurred. Please try again later.";
        showPopup(
          <SpotifyAuthErrorPopup
            message={message}
            onClose={() => {
              hidePopup();
              // router.push("/");
            }}
          />,
        );
        // router.push("/");
      } finally {
        setIsPending(false);
      }
    };

    handleAuth();
  }, [authToBackendFromSpotifyCode, router, showPopup, hidePopup]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Connecting to Spotify...</h1>
          <p className="text-gray-600">Please wait while we complete the authentication process.</p>
        </div>
      </div>
    );
  }

  return null;
}
