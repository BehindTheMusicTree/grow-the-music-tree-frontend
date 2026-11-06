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

vi.mock("@components/features/menu/SideRail", () => ({ default: () => <nav aria-label="Side rail" /> }));
vi.mock("@components/features/player/Player", () => ({ default: () => null }));
vi.mock("@components/features/player/AutoAdvance", () => ({ default: () => null }));

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
            <div>main</div>
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

  it("blurs the side rail and the page behind an open popup and makes them inert", () => {
    renderAppContent(true);

    expect(screen.getByText("Network Error")).toBeInTheDocument();
    const row = screen.getByRole("navigation", { name: "Side rail" }).parentElement;
    expect(row).toHaveClass("blur-sm", "pointer-events-none");
    expect(row).toContainElement(screen.getByRole("main"));
  });

  it("leaves the side rail sharp when no popup is open", () => {
    renderAppContent(false);

    expect(screen.getByRole("navigation", { name: "Side rail" }).parentElement).not.toHaveClass("blur-sm");
  });
});
