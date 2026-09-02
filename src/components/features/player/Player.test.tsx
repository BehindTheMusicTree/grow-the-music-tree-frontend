import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Player from "./Player";

const usePlayerMock = vi.fn();
const toggleTrackListSidebarMock = vi.fn();

vi.mock("@behindthemusictree/app-kit/player", () => ({
  usePlayer: () => usePlayerMock(),
  PlayerVideoSurface: ({ className }: { className?: string }) => (
    <div data-testid="player-video-surface" className={className} />
  ),
}));

vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useTrackListSidebarVisibility: () => ({
    toggleTrackListSidebar: toggleTrackListSidebarMock,
    isTrackListSidebarVisible: false,
  }),
}));

describe("Player", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("is hidden when there is no active track", () => {
    usePlayerMock.mockReturnValue({ playerTrackObject: null });

    const { container } = render(<Player />);

    expect(container.firstChild).toHaveClass("hidden");
  });

  it("shows the video surface and track-list toggle when a track is active", () => {
    usePlayerMock.mockReturnValue({ playerTrackObject: { loadError: undefined } });

    const { container } = render(<Player />);

    expect(container.firstChild).not.toHaveClass("hidden");
    expect(screen.getByTestId("player-video-surface")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show track list" })).toBeInTheDocument();
  });

  it("shows the load error when the active track failed to load", () => {
    usePlayerMock.mockReturnValue({ playerTrackObject: { loadError: "Video unavailable" } });

    render(<Player />);

    expect(screen.getByText("Video unavailable")).toBeInTheDocument();
  });
});
