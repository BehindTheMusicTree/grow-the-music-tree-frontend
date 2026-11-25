import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import GenrePicker from "./GenrePicker";

const searchMock = vi.fn();

vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: vi.fn() }),
  useQueryWithParse: () => ({ data: undefined, isFetching: false }),
}));
vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useGenreRemoteSearch: (...args: unknown[]) => searchMock(...args),
}));

const genre = (n: number, extra: Record<string, unknown> = {}) => ({
  uuid: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
  name: `Genre ${n}`,
  wikidataId: `Q${n}`,
  isUmbrella: false,
  ...extra,
});

const renderPicker = (props: { excludeUmbrellas?: boolean; onChange?: () => void } = {}) => {
  render(<GenrePicker label="Main parent" value="" defaultText="" onChange={props.onChange ?? vi.fn()} excludeUmbrellas={props.excludeUmbrellas} />);
  fireEvent.change(screen.getByRole("combobox", { name: "Main parent" }), { target: { value: "genre" } });
};

describe("GenrePicker", () => {
  beforeEach(() => {
    searchMock.mockReset();
    searchMock.mockReturnValue({ genres: [], isError: false, settled: true, pending: false });
  });
  afterEach(cleanup);

  it("searches the canonical tree with the typed text once the list is open", async () => {
    renderPicker();
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Main parent" }), { key: "ArrowDown" });

    await waitFor(() =>
      expect(searchMock).toHaveBeenLastCalledWith(expect.any(Function), "genre", { treeName: "canonical", limit: 25 }),
    );
  });

  it("does not search before the text is long enough", () => {
    render(<GenrePicker label="Main parent" value="" defaultText="" onChange={vi.fn()} />);

    expect(searchMock).toHaveBeenLastCalledWith(expect.any(Function), "", expect.anything());
  });

  it("lists the hits, leaving out genres without a Wikidata id", () => {
    searchMock.mockReturnValue({
      genres: [genre(1), genre(2, { wikidataId: null })],
      isError: false,
      settled: true,
      pending: false,
    });
    renderPicker();

    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("leaves out umbrellas when asked to", () => {
    searchMock.mockReturnValue({
      genres: [genre(1), genre(2, { isUmbrella: true })],
      isError: false,
      settled: true,
      pending: false,
    });
    renderPicker({ excludeUmbrellas: true });

    expect(screen.getAllByRole("option")).toHaveLength(1);
  });
});
