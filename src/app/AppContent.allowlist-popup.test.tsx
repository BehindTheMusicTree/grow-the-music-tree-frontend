"use client";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import AppContent from "./AppContent";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { BackendError } from "@app-types/app-errors/app-error";

const pathnameRef = { current: "/about" };
const hidePopupSpy = vi.fn();
const clearConnectivityErrorSpy = vi.fn();
const allowlistError = new BackendError(ErrorCode.BACKEND_SPOTIFY_USER_NOT_IN_ALLOWLIST);

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@contexts/ConnectivityErrorContext", () => ({
  useConnectivityError: () => ({
    connectivityError: allowlistError,
    setConnectivityError: vi.fn(),
    clearConnectivityError: clearConnectivityErrorSpy,
  }),
  ConnectivityErrorProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@contexts/PopupContext", () => ({
  usePopup: () => ({
    showPopup: vi.fn(),
    hidePopup: hidePopupSpy,
    activePopup: null,
  }),
  AUTH_POPUP_TYPE: "auth",
}));

vi.mock("@contexts/PlayerContext", () => ({
  usePlayer: () => ({ playerUploadedTrackObject: null }),
}));

vi.mock("@contexts/TrackListSidebarVisibilityContext", () => ({
  useTrackListSidebarVisibility: () => ({ isTrackListSidebarVisible: false }),
}));

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({ handleSpotifyOAuth: vi.fn() }),
}));

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({ handleGoogleOAuth: vi.fn() }),
}));

vi.mock("@lib/sentry", () => ({ initSentry: vi.fn() }));

vi.mock("@components/features/banner/Banner", () => ({ default: () => null }));
vi.mock("@components/features/menu/Menu", () => ({ default: () => null }));
vi.mock("@components/features/player/Player", () => ({ default: () => null }));
vi.mock("@components/features/player/AutoAdvance", () => ({ default: () => null }));
vi.mock("@components/features/track-list-sidebar/TrackListSidebar", () => ({ default: () => null }));
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
