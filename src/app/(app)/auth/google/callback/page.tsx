"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
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
  const router = useRouter();
  const { authToBackendFromGoogleCode } = useGoogleAuth();
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const authAttempted = useRef(false);

  useEffect(() => {
    const { code, errorParam } = getParamsFromUrl();

    const handleAuth = async () => {
      if (authAttempted.current) return;
      authAttempted.current = true;

      if (errorParam) {
        setError(new Error(`Google authentication failed: ${errorParam}`));
        setIsPending(false);
        return;
      }

      if (!code) {
        setError(new Error("No authorization code received from Google"));
        setIsPending(false);
        return;
      }

      try {
        const redirectUrl = await authToBackendFromGoogleCode(code);
        if (redirectUrl) {
          router.push(redirectUrl);
        }
      } catch (err) {
        if (err instanceof BackendError && err.code === ErrorCode.BACKEND_AUTH_ERROR) {
          setError(new Error("Failed to authenticate with the backend server. Please try again later."));
        } else {
          setError(new Error("An unexpected error occurred. Please try again later."));
        }
      } finally {
        setIsPending(false);
      }
    };

    handleAuth();
  }, [authToBackendFromGoogleCode, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
