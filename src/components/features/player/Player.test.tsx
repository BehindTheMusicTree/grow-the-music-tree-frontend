import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import Player from "./Player";
import { PlayerPanelProvider } from "@contexts/PlayerPanelProvider";

const usePlayerMock = vi.fn();
const trackEventMock = vi.hoisted(() => vi.fn());

vi.mock("@behindthemusictree/app-kit/player", () => ({
  usePlayer: () => usePlayerMock(),
}));
vi.mock("@behindthemusictree/app-kit-ui/genre-tree", () => ({
  PlayerPanel: ({
    isVisible,
    expanded,
    onExpandedChange,
  }: {
    isVisible: boolean;
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
  }) => (
    <button
      data-testid="player-panel"
      className={isVisible ? "" : "hidden"}
      aria-expanded={expanded}
      onClick={() => onExpandedChange(!expanded)}
    />
  ),
}));
vi.mock("@lib/analytics", () => ({ trackEvent: trackEventMock }));

const renderPlayer = () => (
  <PlayerPanelProvider>
    <Player />
  </PlayerPanelProvider>
);

describe("Player", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("tracks a play event when a track becomes active", () => {
    usePlayerMock.mockReturnValue({ playerTrackObject: { track: { id: "a" } } });
    render(renderPlayer());
    expect(trackEventMock).toHaveBeenCalledWith("track_play");
  });

  it("does not track without an active track", () => {
    usePlayerMock.mockReturnValue({ playerTrackObject: null });
    render(renderPlayer());
    expect(trackEventMock).not.toHaveBeenCalled();
  });

  it("passes the expanded state through to the panel and updates it on toggle", () => {
    usePlayerMock.mockReturnValue({ playerTrackObject: { track: { id: "a" } } });
    render(renderPlayer());
    const panel = screen.getByTestId("player-panel");
    expect(panel).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(panel);
    expect(panel).toHaveAttribute("aria-expanded", "true");
  });
});
