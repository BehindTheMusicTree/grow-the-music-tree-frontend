"use client";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useEffect } from "react";
import AppContent from "./AppContent";
import { PopupProvider } from "@behindthemusictree/app-kit/popup";
import { ConnectivityErrorProvider, useConnectivityError, AuthRequired, ErrorCode } from "@behindthemusictree/app-kit/transport";

const pathnameRef = { current: "/reference-genre-tree" };
const authRequiredError = new AuthRequired(ErrorCode.BACKEND_UNAUTHORIZED);

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

vi.mock("@lib/sentry", () => ({ initSentry: vi.fn() }));

vi.mock("@components/features/menu/AppHeader", () => ({ default: () => null }));
vi.mock("@components/features/player/Player", () => ({ default: () => null }));
vi.mock("@components/features/player/AutoAdvance", () => ({ default: () => null }));

function SetConnectivityError() {
  const { setConnectivityError } = useConnectivityError();
  useEffect(() => {
    setConnectivityError(authRequiredError);
  }, [setConnectivityError]);
  return null;
}

describe("AppContent surfaces an AuthRequired error on a route that doesn't require auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an error popup instead of silently dropping it", () => {
    pathnameRef.current = "/reference-genre-tree";

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

    expect(screen.getByText("Internal Error")).toBeInTheDocument();
  });
});
