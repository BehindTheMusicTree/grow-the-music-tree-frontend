"use client";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import AppContent from "./AppContent";
import { AuthRequired, ErrorCode } from "@behindthemusictree/app-kit/transport";

const pathnameRef = { current: "/reference-genre-tree" };
const showPopupSpy = vi.fn();
const authRequiredError = new AuthRequired(ErrorCode.BACKEND_UNAUTHORIZED);

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@behindthemusictree/app-kit/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/transport")>();
  return {
    ...actual,
    useConnectivityError: () => ({
      connectivityError: authRequiredError,
      setConnectivityError: vi.fn(),
      clearConnectivityError: vi.fn(),
    }),
    ConnectivityErrorProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

vi.mock("@behindthemusictree/app-kit/popup", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/popup")>();
  return {
    ...actual,
    usePopup: () => ({
      showPopup: showPopupSpy,
      hidePopup: vi.fn(),
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

describe("AppContent surfaces an AuthRequired error on a route that doesn't require auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an error popup instead of silently dropping it", () => {
    pathnameRef.current = "/reference-genre-tree";

    render(
      <AppContent>
        <div>main</div>
      </AppContent>,
    );

    expect(showPopupSpy).toHaveBeenCalled();
  });
});
