"use client";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import GoogleOAuthCallbackPage from "./page";
import { ErrorCode, BackendError } from "@behindthemusictree/app-kit/transport";
import { GOOGLE_EXCHANGE_CONFIG } from "@behindthemusictree/app-kit/auth";
import { AUTH_POPUP_TYPE } from "@behindthemusictree/app-kit/popup";

const mockReplace = vi.fn();
const showPopupSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@behindthemusictree/app-kit/popup", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/popup")>();
  return {
    ...actual,
    usePopup: () => ({ showPopup: showPopupSpy, hidePopup: vi.fn() }),
  };
});

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({
    authToBackendFromGoogleCode: vi.fn().mockRejectedValue(
      new BackendError(ErrorCode.BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED, "Code invalid"),
    ),
    handleGoogleOAuth: vi.fn(),
  }),
}));

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({
    authToBackendFromSpotifyCode: vi.fn(),
    handleSpotifyOAuth: vi.fn(),
  }),
}));

describe("GoogleOAuthCallbackPage when API returns code invalid or expired", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        pathname: "/auth/google/callback",
        search: "?code=test-auth-code",
        href: "http://localhost/auth/google/callback?code=test-auth-code",
      },
      writable: true,
    });
  });

  it("clears stored redirect URL and shows auth popup", async () => {
    localStorage.setItem(GOOGLE_EXCHANGE_CONFIG.redirectStorageKey, "http://localhost/after-auth");
    expect(localStorage.getItem(GOOGLE_EXCHANGE_CONFIG.redirectStorageKey)).toBe(
      "http://localhost/after-auth",
    );

    render(<GoogleOAuthCallbackPage />);

    await waitFor(() => {
      expect(localStorage.getItem(GOOGLE_EXCHANGE_CONFIG.redirectStorageKey)).toBeNull();
    });

    expect(showPopupSpy).toHaveBeenCalledWith(expect.anything(), AUTH_POPUP_TYPE);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
