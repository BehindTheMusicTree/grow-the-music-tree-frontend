"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSpotifyAuth } from "@contexts/SpotifyAuthContext";

export default function SpotifyCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback } = useSpotifyAuth();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.push("/");
      return;
    }

    const handleAuth = async () => {
      try {
        await handleCallback(code);
        router.push("/");
      } catch (error) {
        console.error("Failed to exchange Spotify code:", error);
        router.push("/?error=auth_failed");
      }
    };

    handleAuth();
  }, [searchParams, router, handleCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to Spotify...</h1>
        <p className="text-gray-600">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
