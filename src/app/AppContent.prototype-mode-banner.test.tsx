"use client";

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import AppContent from "./AppContent";
import { PopupProvider } from "@behindthemusictree/app-kit/popup";
import { ConnectivityErrorProvider } from "@behindthemusictree/app-kit/transport";

const pathnameRef = { current: "/reference-genre-tree" };

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

function renderAppContent() {
  return render(
    <PopupProvider>
      <ConnectivityErrorProvider>
        <AppContent>
          <div>main</div>
        </AppContent>
      </ConnectivityErrorProvider>
    </PopupProvider>,
  );
}

describe("AppContent prototype-mode banner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the banner under /prototype/reference-genre-tree", () => {
    pathnameRef.current = "/prototype/reference-genre-tree";

    act(() => {
      renderAppContent();
    });

    expect(screen.getByRole("status")).toHaveTextContent("prototype demo tree");
  });

  it("does not show the banner under /reference-genre-tree", () => {
    pathnameRef.current = "/reference-genre-tree";

    act(() => {
      renderAppContent();
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
