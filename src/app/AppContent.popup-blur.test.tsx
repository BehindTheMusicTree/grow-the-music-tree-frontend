"use client";

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { useEffect } from "react";
import AppContent from "./AppContent";
import { PopupProvider } from "@behindthemusictree/app-kit/popup";
import { ConnectivityErrorProvider, useConnectivityError, NetworkError, ErrorCode } from "@behindthemusictree/app-kit/transport";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@behindthemusictree/app-kit/player", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/player")>();
  return { ...actual, usePlayer: () => ({ playerTrackObject: null }) };
});

vi.mock("@lib/sentry", () => ({ initSentry: vi.fn() }));

vi.mock("@components/features/menu/NavButtons", () => ({ default: () => <nav aria-label="Nav buttons" /> }));
vi.mock("@components/features/menu/UserMenu", () => ({ UserMenu: () => null }));
vi.mock("@components/features/player/Player", () => ({ default: () => null }));

function RaiseNetworkError({ enabled }: { enabled: boolean }) {
  const { setConnectivityError } = useConnectivityError();
  useEffect(() => {
    if (enabled) setConnectivityError(new NetworkError(ErrorCode.NETWORK_FAILED_TO_FETCH));
  }, [enabled, setConnectivityError]);
  return null;
}

function renderAppContent(withPopup: boolean) {
  act(() => {
    render(
      <PopupProvider>
        <ConnectivityErrorProvider>
          <RaiseNetworkError enabled={withPopup} />
          <AppContent>
            <main>main</main>
          </AppContent>
        </ConnectivityErrorProvider>
      </PopupProvider>,
    );
  });
}

describe("AppContent popup backdrop", () => {
  afterEach(() => {
    cleanup();
  });

  it("blurs the nav buttons and the page behind an open popup and makes them inert", () => {
    renderAppContent(true);

    expect(screen.getByText("Network Error")).toBeInTheDocument();
    const row = screen.getByRole("navigation", { name: "Nav buttons" }).parentElement;
    expect(row).toHaveClass("blur-sm", "pointer-events-none");
    expect(row).toContainElement(screen.getByRole("main"));
  });

  it("leaves the nav buttons sharp when no popup is open", () => {
    renderAppContent(false);

    expect(screen.getByRole("navigation", { name: "Nav buttons" }).parentElement).not.toHaveClass("blur-sm");
  });
});
