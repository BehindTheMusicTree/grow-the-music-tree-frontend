import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import RegionDetailPanel from "./RegionDetailPanel";

const index = RegionMapIndexSchema.parse(fixture);
const france = index.regions.find((region) => region.id === "Q142") as Region;
let lookup: { data: { uuid: string } | null | undefined; isError: boolean } = { data: undefined, isError: false };

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useGenreByWikidataId: () => lookup,
}));

vi.mock("@behindthemusictree/app-kit-ui/genre-tree", () => ({
  GenreDetailPanel: ({ genreUuid, onZoomIn }: { genreUuid: string; onZoomIn?: () => void }) => (
    <section aria-label={`Genre ${genreUuid}`}>
      {onZoomIn && (
        <button type="button" onClick={onZoomIn}>
          Zoom in
        </button>
      )}
    </section>
  ),
}));

const props = { genreUuid: null, onSelectGenre: vi.fn(), onFocus: vi.fn(), onClose: vi.fn() };
const withOverview = (id: string | null): Region => ({ ...france, overviewItemId: id, drillable: true });

afterEach(() => {
  cleanup();
  lookup = { data: undefined, isError: false };
});

describe("RegionDetailPanel", () => {
  it("shows the overview genre of the region and focuses on request", () => {
    lookup = { data: { uuid: "11111111-1111-4111-8111-111111111111" }, isError: false };
    const region = withOverview("Q672134");
    render(<RegionDetailPanel {...props} region={region} />);

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(screen.getByRole("region", { name: /Genre 11111111/ })).toBeTruthy();
    expect(props.onFocus).toHaveBeenCalledWith(region);
  });

  it("reports an overview genre the API does not know", () => {
    lookup = { data: null, isError: false };
    render(<RegionDetailPanel {...props} region={withOverview("Q672134")} />);

    expect(screen.getByRole("alert").textContent).toContain("could not be loaded");
  });

  it("falls back to the region facts when it has no overview", () => {
    render(<RegionDetailPanel {...props} region={withOverview(null)} />);

    expect(screen.getByText(france.name)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: `Focus on ${france.name}` }));
    expect(props.onFocus).toHaveBeenCalled();
  });
});
