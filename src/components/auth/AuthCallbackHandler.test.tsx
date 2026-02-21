"use client";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import AuthCallbackHandler from "./AuthCallbackHandler";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { BackendError } from "@app-types/app-errors/app-error";
import {
  GOOGLE_EXCHANGE_CONFIG,
  SPOTIFY_EXCHANGE_CONFIG,
} from "@lib/auth/code-exchange";
import { AUTH_POPUP_TYPE } from "@contexts/PopupContext";

const mockReplace = vi.fn();
const showPopupSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@contexts/PopupContext", () => ({
  usePopup: () => ({ showPopup: showPopupSpy }),
  AUTH_POPUP_TYPE: "auth",
}));

const mockAuthToBackendFromGoogleCode = vi.fn();
const mockAuthToBackendFromSpotifyCode = vi.fn();

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({
    authToBackendFromGoogleCode: mockAuthToBackendFromGoogleCode,
    handleGoogleOAuth: vi.fn(),
  }),
}));

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({
    authToBackendFromSpotifyCode: mockAuthToBackendFromSpotifyCode,
    handleSpotifyOAuth: vi.fn(),
  }),
}));

describe("AuthCallbackHandler when API returns code invalid or expired", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockAuthToBackendFromGoogleCode.mockResolvedValue("/");
    mockAuthToBackendFromSpotifyCode.mockResolvedValue("/");
  });

  it("clears stored redirect and shows auth popup for Google callback", async () => {
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        pathname: "/auth/google/callback",
        search: "?code=google-code",
        href: "http://localhost/auth/google/callback?code=google-code",
      },
      writable: true,
    });
    mockAuthToBackendFromGoogleCode.mockRejectedValue(
      new BackendError(ErrorCode.BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED, "Code invalid"),
    );

    localStorage.setItem(GOOGLE_EXCHANGE_CONFIG.redirectStorageKey, "http://localhost/dashboard");

    render(<AuthCallbackHandler />);

    await waitFor(() => {
      expect(localStorage.getItem(GOOGLE_EXCHANGE_CONFIG.redirectStorageKey)).toBeNull();
    });

    expect(showPopupSpy).toHaveBeenCalledWith(expect.anything(), AUTH_POPUP_TYPE);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("clears stored redirect and shows auth popup for Spotify callback", async () => {
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        pathname: "/auth/spotify/callback",
        search: "?code=spotify-code",
        href: "http://localhost/auth/spotify/callback?code=spotify-code",
      },
      writable: true,
    });
    mockAuthToBackendFromSpotifyCode.mockRejectedValue(
      new BackendError(ErrorCode.BACKEND_SPOTIFY_OAUTH_CODE_INVALID_OR_EXPIRED, "Code invalid"),
    );

    localStorage.setItem(SPOTIFY_EXCHANGE_CONFIG.redirectStorageKey, "http://localhost/playlists");

    render(<AuthCallbackHandler />);

    await waitFor(() => {
      expect(localStorage.getItem(SPOTIFY_EXCHANGE_CONFIG.redirectStorageKey)).toBeNull();
    });

    expect(showPopupSpy).toHaveBeenCalledWith(expect.anything(), AUTH_POPUP_TYPE);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
