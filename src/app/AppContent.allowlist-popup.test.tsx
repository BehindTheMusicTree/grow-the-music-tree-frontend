"use client";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import AppContent from "./AppContent";
import { ErrorCode, BackendError } from "@behindthemusictree/app-kit/transport";

const pathnameRef = { current: "/about" };
const hidePopupSpy = vi.fn();
const clearConnectivityErrorSpy = vi.fn();
const allowlistError = new BackendError(ErrorCode.BACKEND_SPOTIFY_USER_NOT_IN_ALLOWLIST);

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@behindthemusictree/app-kit/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/transport")>();
  return {
    ...actual,
    useConnectivityError: () => ({
      connectivityError: allowlistError,
      setConnectivityError: vi.fn(),
      clearConnectivityError: clearConnectivityErrorSpy,
    }),
    ConnectivityErrorProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

vi.mock("@behindthemusictree/app-kit/popup", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/popup")>();
  return {
    ...actual,
    usePopup: () => ({
      showPopup: vi.fn(),
      hidePopup: hidePopupSpy,
      activePopup: null,
    }),
  };
});

vi.mock("@behindthemusictree/app-kit/player", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/player")>();
  return {
    ...actual,
    usePlayer: () => ({ playerTrackObject: null }),
  };
});

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return {
    ...actual,
    useTrackListSidebarVisibility: () => ({ isTrackListSidebarVisible: false }),
    TrackListSidebar: () => null,
  };
});

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({ handleSpotifyOAuth: vi.fn() }),
}));

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({ handleGoogleOAuth: vi.fn() }),
}));

vi.mock("@lib/sentry", () => ({ initSentry: vi.fn() }));

vi.mock("@components/features/menu/AppHeader", () => ({ default: () => null }));
vi.mock("@components/features/player/Player", () => ({ default: () => null }));
vi.mock("@components/features/player/AutoAdvance", () => ({ default: () => null }));
vi.mock("@components/auth/AuthCallbackHandler", () => ({ default: () => null }));

describe("AppContent allowlist popup when navigating to a page where Spotify auth is not required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls hidePopup and clearConnectivityError when route does not require Spotify and error is allowlist", () => {
    pathnameRef.current = "/about";

    render(
      <AppContent>
        <div>main</div>
      </AppContent>,
    );

    expect(hidePopupSpy).toHaveBeenCalled();
    expect(clearConnectivityErrorSpy).toHaveBeenCalled();
  });

  it("does not call hidePopup or clearConnectivityError when route requires Spotify and error is allowlist", () => {
    pathnameRef.current = "/me-spotify-library";

    render(
      <AppContent>
        <div>main</div>
      </AppContent>,
    );

    expect(hidePopupSpy).not.toHaveBeenCalled();
    expect(clearConnectivityErrorSpy).not.toHaveBeenCalled();
  });
});
