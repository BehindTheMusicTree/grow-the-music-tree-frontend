"use client";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import SpotifyOAuthCallbackPage from "./page";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { BackendError } from "@app-types/app-errors/app-error";

const mockReplace = vi.fn();
const showPopupSpy = vi.fn();
const hidePopupSpy = vi.fn();
const mockAuthToBackendFromSpotifyCode = vi.fn();
const mockHandleSpotifyOAuth = vi.fn();
const mockHandleGoogleOAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@contexts/PopupContext", () => ({
  usePopup: () => ({ showPopup: showPopupSpy, hidePopup: hidePopupSpy }),
  AUTH_POPUP_TYPE: "auth",
}));

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({
    authToBackendFromSpotifyCode: mockAuthToBackendFromSpotifyCode,
    handleSpotifyOAuth: mockHandleSpotifyOAuth,
  }),
}));

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({ handleGoogleOAuth: mockHandleGoogleOAuth }),
}));

describe("SpotifyOAuthCallbackPage when backend returns user not in allowlist", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        pathname: "/auth/spotify/callback",
        search: "?code=spotify-code",
        href: "http://localhost/auth/spotify/callback?code=spotify-code",
      },
      writable: true,
    });
  });

  it("shows error popup when auth exchange throws allowlist error", async () => {
    mockAuthToBackendFromSpotifyCode.mockRejectedValue(
      new BackendError(
        ErrorCode.BACKEND_SPOTIFY_USER_NOT_IN_ALLOWLIST,
        "Your Spotify account is not yet authorized for this app.",
      ),
    );

    render(<SpotifyOAuthCallbackPage />);

    await waitFor(() => {
      expect(showPopupSpy).toHaveBeenCalled();
    });

    expect(showPopupSpy).toHaveBeenCalledTimes(1);
    const popupContent = showPopupSpy.mock.calls[0][0];
    expect(popupContent.props.message).toBe("Your Spotify account is not yet authorized for this app.");
  });
});
