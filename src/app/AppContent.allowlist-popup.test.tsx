"use client";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useEffect } from "react";
import AppContent from "./AppContent";
import { PopupProvider } from "@behindthemusictree/app-kit/popup";
import { ConnectivityErrorProvider, useConnectivityError, ErrorCode, BackendError } from "@behindthemusictree/app-kit/transport";

const pathnameRef = { current: "/about" };
const allowlistError = new BackendError(ErrorCode.BACKEND_SPOTIFY_USER_NOT_IN_ALLOWLIST);

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@behindthemusictree/app-kit/player", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/player")>();
  return { ...actual, usePlayer: () => ({ playerTrackObject: null }) };
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

function SetConnectivityError() {
  const { setConnectivityError } = useConnectivityError();
  useEffect(() => {
    setConnectivityError(allowlistError);
  }, [setConnectivityError]);
  return null;
}

function renderAppContent() {
  act(() => {
    render(
      <PopupProvider>
        <ConnectivityErrorProvider>
          <SetConnectivityError />
          <AppContent>
            <div>main</div>
          </AppContent>
        </ConnectivityErrorProvider>
      </PopupProvider>,
    );
  });
}

describe("AppContent allowlist popup when navigating to a page where Spotify auth is not required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not show the popup when the route does not require Spotify", () => {
    pathnameRef.current = "/about";

    renderAppContent();

    expect(screen.queryByText("Authentication Failed")).not.toBeInTheDocument();
  });

  it("shows the popup when the route requires Spotify", () => {
    pathnameRef.current = "/me-spotify-library";

    renderAppContent();

    expect(screen.getByText("Authentication Failed")).toBeInTheDocument();
  });
});
