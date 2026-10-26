import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import ArtistSearch from "./ArtistSearch";

const pushMock = vi.fn();
const queryMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useQueryWithParse: (options: { enabled: boolean; queryKey: string[] }) => queryMock(options),
}));

const UUID = "00000000-0000-4000-8000-000000000001";
const artist = {
  uuid: UUID,
  name: "Björk",
  disambiguation: "Icelandic singer",
  type: "person",
  country: "IS",
  beginYear: 1977,
  endYear: null,
  matchedAlias: "Bjork Gudmundsdottir",
  recordingCount: 120,
};

const type = (value: string) => {
  fireEvent.change(screen.getByRole("combobox", { name: "Search artists" }), { target: { value } });
  act(() => {
    vi.advanceTimersByTime(250);
  });
};

describe("ArtistSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pushMock.mockReset();
    queryMock.mockReset();
    queryMock.mockReturnValue({ data: [artist], isFetching: false, isError: false });
    render(<ArtistSearch />);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("does not query under two characters", () => {
    type("b");

    expect(queryMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("queries the debounced text only", () => {
    fireEvent.change(screen.getByRole("combobox", { name: "Search artists" }), { target: { value: "bjork" } });

    expect(queryMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false, queryKey: ["artistSearch", ""] }));
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(queryMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: true, queryKey: ["artistSearch", "bjork"] }));
  });

  it("shows the disambiguation and the alias that matched", () => {
    type("bjork");

    expect(screen.getByRole("option", { name: /Björk/ })).toHaveTextContent("Icelandic singer");
    expect(screen.getByRole("option")).toHaveTextContent("also known as Bjork Gudmundsdottir");
  });

  it("opens the artist page on Enter", () => {
    type("bjork");
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Search artists" }), { key: "Enter" });

    expect(pushMock).toHaveBeenCalledWith(`/artists/${UUID}`);
  });

  it("opens the artist page on click", () => {
    type("bjork");
    fireEvent.mouseDown(screen.getByRole("option"));

    expect(pushMock).toHaveBeenCalledWith(`/artists/${UUID}`);
  });

  it("closes the list on Escape", () => {
    type("bjork");
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Search artists" }), { key: "Escape" });

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("announces when nothing matches", () => {
    queryMock.mockReturnValue({ data: [], isFetching: false, isError: false });
    type("zzzz");

    expect(screen.getByRole("status")).toHaveTextContent("No artists found");
  });
});
