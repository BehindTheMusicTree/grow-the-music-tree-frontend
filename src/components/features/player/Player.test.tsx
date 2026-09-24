import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Player from "./Player";

const usePlayerMock = vi.fn();
const toggleTrackListSidebarMock = vi.fn();
const isTrackListSidebarVisibleMock = vi.fn();

vi.mock("@behindthemusictree/app-kit/player", () => ({
  usePlayer: () => usePlayerMock(),
  PlayerVideoSurface: ({ className }: { className?: string }) => (
    <div data-testid="player-video-surface" className={className} />
  ),
}));

vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useTrackListSidebarVisibility: () => ({
    toggleTrackListSidebar: toggleTrackListSidebarMock,
    isTrackListSidebarVisible: isTrackListSidebarVisibleMock(),
  }),
  TrackListSidebar: ({ layout, className }: { layout?: string; className?: string }) => (
    <div data-testid="track-list-sidebar" data-layout={layout} className={className} />
  ),
}));

describe("Player", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("is hidden when there is no active track", () => {
    isTrackListSidebarVisibleMock.mockReturnValue(false);
    usePlayerMock.mockReturnValue({ playerTrackObject: null });

    const { container } = render(<Player />);

    expect(container.firstChild).toHaveClass("hidden");
  });

  it("shows the video surface and track-list toggle when a track is active", () => {
    isTrackListSidebarVisibleMock.mockReturnValue(false);
    usePlayerMock.mockReturnValue({ playerTrackObject: { loadError: undefined } });

    const { container } = render(<Player />);

    expect(container.firstChild).not.toHaveClass("hidden");
    expect(screen.getByTestId("player-video-surface")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show track list" })).toBeInTheDocument();
    expect(screen.queryByTestId("track-list-sidebar")).not.toBeInTheDocument();
  });

  it("shows the load error when the active track failed to load", () => {
    isTrackListSidebarVisibleMock.mockReturnValue(false);
    usePlayerMock.mockReturnValue({ playerTrackObject: { loadError: "Video unavailable" } });

    render(<Player />);

    expect(screen.getByText("Video unavailable")).toBeInTheDocument();
  });

  it("renders the track list sidebar inline when visible", () => {
    isTrackListSidebarVisibleMock.mockReturnValue(true);
    usePlayerMock.mockReturnValue({ playerTrackObject: { loadError: undefined } });

    render(<Player />);

    expect(screen.getByRole("button", { name: "Hide track list" })).toBeInTheDocument();
    const sidebar = screen.getByTestId("track-list-sidebar");
    expect(sidebar).toHaveAttribute("data-layout", "inline");
  });
});
