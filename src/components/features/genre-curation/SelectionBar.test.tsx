import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { TrackBase } from "@behindthemusictree/app-kit/genre-tree";
import { GenreCurationProvider } from "./GenreCurationProvider";
import SongCheckbox from "./SongCheckbox";
import SelectionBar from "./SelectionBar";

vi.mock("@behindthemusictree/app-kit/popup", () => ({
  usePopup: () => ({ showPopup: vi.fn(), hidePopup: vi.fn() }),
}));
vi.mock("./LinkSongsDialog", () => ({ default: () => null }));
vi.mock("./SongPopups", () => ({ MoveSongsPopup: () => null, UnlinkSongsPopup: () => null }));

const tracks = ["A", "B", "C", "D"].map((title) => ({ uuid: title, title }) as unknown as TrackBase);

function renderBar() {
  render(
    <GenreCurationProvider>
      {tracks.map((track, index) => (
        <SongCheckbox key={track.uuid} song={track} index={index} />
      ))}
      <SelectionBar />
    </GenreCurationProvider>,
  );
}

describe("SelectionBar", () => {
  afterEach(cleanup);

  it("selects a range with shift+click", () => {
    renderBar();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select A" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select C" }), { shiftKey: true });

    expect(screen.getByRole("status")).toHaveTextContent("3 selected");
    expect(screen.getByRole("checkbox", { name: "Select B" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Select D" })).not.toBeChecked();
  });

  it("clears the selection", () => {
    renderBar();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select A" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
