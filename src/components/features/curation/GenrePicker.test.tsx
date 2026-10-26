import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GenrePicker from "./GenrePicker";

const fetchMock = vi.fn();

vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: fetchMock }),
  useQueryWithParse: () => ({ data: undefined, isFetching: false }),
}));

const genre = (n: number) => ({ uuid: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`, name: `Genre ${n}`, wikidataId: `Q${n}` });
const page = (page: number, totalPages: number, names: number[]) => ({ results: names.map(genre), page, totalPages });

const renderPicker = (onChange = vi.fn()) => {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <GenrePicker label="Main parent" value="" defaultText="" onChange={onChange} />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByRole("combobox", { name: "Main parent" }), { target: { value: "genre" } });
};

describe("GenrePicker", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });
  afterEach(cleanup);

  it("appends the next page when 'Plus de résultats…' is pressed", async () => {
    fetchMock.mockResolvedValueOnce(page(1, 2, [1, 2])).mockResolvedValueOnce(page(2, 2, [3]));
    renderPicker();

    expect(await screen.findAllByRole("option")).toHaveLength(2);
    fireEvent.mouseDown(screen.getByRole("button", { name: "Plus de résultats…" }));

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));
    expect(fetchMock).toHaveBeenLastCalledWith("genres/", true, false, {}, { name: "genre", pageSize: 10, page: 2 });
    expect(screen.queryByRole("button", { name: "Plus de résultats…" })).not.toBeInTheDocument();
  });

  it("hides the button when there is a single page", async () => {
    fetchMock.mockResolvedValueOnce(page(1, 1, [1, 2]));
    renderPicker();

    expect(await screen.findAllByRole("option")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Plus de résultats…" })).not.toBeInTheDocument();
  });

  it("loads the next page when ArrowDown is pressed on the last option", async () => {
    fetchMock.mockResolvedValueOnce(page(1, 2, [1, 2])).mockResolvedValueOnce(page(2, 2, [3]));
    renderPicker();
    await screen.findAllByRole("option");
    const input = screen.getByRole("combobox", { name: "Main parent" });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));
  });
});
