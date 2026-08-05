"use client";

import { AuthCallbackHandler } from "@behindthemusictree/app-kit/auth";
import { ErrorCode } from "@behindthemusictree/app-kit/transport";
import { usePopup, AUTH_POPUP_TYPE } from "@behindthemusictree/app-kit/popup";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
import AuthPopup from "@components/ui/popup/child/AuthPopup";
import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";
import SpotifyAuthErrorPopup from "@components/ui/popup/child/SpotifyAuthErrorPopup";

export default function GrowAuthCallbackHandler() {
  const { showPopup } = usePopup();
  const { handleSpotifyOAuth, authToBackendFromSpotifyCode } = useSpotifyAuth();
  const { authToBackendFromGoogleCode, handleGoogleOAuth } = useGoogleAuth();

  return (
    <AuthCallbackHandler
      authToBackendFromGoogleCode={authToBackendFromGoogleCode}
      authToBackendFromSpotifyCode={authToBackendFromSpotifyCode}
      onReauthRequired={() =>
        showPopup(
          <AuthPopup handleSpotifyOAuth={handleSpotifyOAuth} handleGoogleOAuth={handleGoogleOAuth} />,
          AUTH_POPUP_TYPE,
        )
      }
      onOAuthMisconfigured={(errorCode: ErrorCode) => showPopup(<InternalErrorPopup errorCode={errorCode} />)}
      onSpotifyAuthError={(message: string, onClose: () => void) =>
        showPopup(<SpotifyAuthErrorPopup message={message} onClose={onClose} />)
      }
    />
  );
}
