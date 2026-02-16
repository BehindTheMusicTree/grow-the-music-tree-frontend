"use client";

/**
 * Handles OAuth callbacks at layout level. With static export, a full load of
 * /auth/google/callback or /auth/spotify/callback serves index.html; the client
 * router may not mount the route's page, so the exchange runs here via
 * window.location. Rendered in the app shell (AppContent) so it runs on every load.
 *
 * Known issue: With static export, stack traces and Sources may not point at the
 * callback route's page file; callback logic and breakpoints are in this file.
 * This does not apply when running with a Next.js server (no output: 'export').
 * See https://github.com/vercel/next.js/issues/59986 (static export + App Router).
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePopup } from "@contexts/PopupContext";
import { AUTH_POPUP_TYPE } from "@contexts/PopupContext";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
import AuthPopup from "@components/ui/popup/child/AuthPopup";
import SpotifyAuthErrorPopup from "@components/ui/popup/child/SpotifyAuthErrorPopup";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { BackendError } from "@app-types/app-errors/app-error";

type CallbackState = "idle" | "handling" | "done" | "error";

export default function AuthCallbackHandler() {
  const router = useRouter();
  const { showPopup } = usePopup();
  const { handleSpotifyOAuth, authToBackendFromSpotifyCode } = useSpotifyAuth();
  const { authToBackendFromGoogleCode, handleGoogleOAuth } = useGoogleAuth();
  const [state, setState] = useState<CallbackState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || handled.current) return;

    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");

    const isGoogleCallback = pathname === "/auth/google/callback";
    const isSpotifyCallback = pathname === "/auth/spotify/callback";

    if (!isGoogleCallback && !isSpotifyCallback) return;

    handled.current = true;
    setState("handling");

    const runGoogle = async () => {
      if (errorParam) {
        setErrorMessage(`Google authentication failed: ${errorParam}`);
        setState("error");
        return;
      }
      if (!code) {
        setErrorMessage("No authorization code received from Google");
        setState("error");
        return;
      }
      try {
        const redirectUrl = await authToBackendFromGoogleCode(code);
        setState("done");
        router.replace(redirectUrl || "/");
      } catch (err) {
        if (err instanceof BackendError && err.code === ErrorCode.BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED) {
          showPopup(
            <AuthPopup handleSpotifyOAuth={handleSpotifyOAuth} handleGoogleOAuth={handleGoogleOAuth} />,
            AUTH_POPUP_TYPE,
          );
          router.replace("/");
        } else {
          setErrorMessage(err instanceof Error ? err.message : "Authentication failed");
          setState("error");
        }
      }
    };

    const runSpotify = async () => {
      if (errorParam) {
        showPopup(
          <SpotifyAuthErrorPopup
            message={`Spotify authentication failed: ${errorParam}`}
            onClose={() => router.replace("/")}
          />,
        );
        setState("done");
        return;
      }
      if (!code) {
        showPopup(
          <SpotifyAuthErrorPopup
            message="No authorization code received from Spotify"
            onClose={() => router.replace("/")}
          />,
        );
        setState("done");
        return;
      }
      try {
        const redirectUrl = await authToBackendFromSpotifyCode(code);
        setState("done");
        router.replace(redirectUrl || "/");
      } catch (err) {
        const message =
          err instanceof BackendError
            ? err.code === ErrorCode.BACKEND_AUTH_ERROR
              ? "Failed to authenticate with the backend server."
              : err.message
            : "An unexpected error occurred.";
        showPopup(
          <SpotifyAuthErrorPopup message={message} onClose={() => router.replace("/")} />,
        );
        setState("done");
      }
    };

    if (isGoogleCallback) runGoogle();
    else runSpotify();
  }, [
    authToBackendFromGoogleCode,
    authToBackendFromSpotifyCode,
    handleSpotifyOAuth,
    handleGoogleOAuth,
    showPopup,
    router,
  ]);

  if (state === "idle" || state === "done") return null;

  if (state === "error") {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <h2 className="mb-2 font-semibold text-red-500">Authentication Error</h2>
          <p className="text-red-500/80">{errorMessage}</p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-100" data-page="auth-callback-handler">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Connecting…</h1>
        <p className="text-gray-600">Completing sign-in.</p>
      </div>
    </div>
  );
}
