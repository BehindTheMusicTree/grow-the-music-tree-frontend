import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import RegionDetailPanel from "./RegionDetailPanel";

const index = RegionMapIndexSchema.parse(fixture);
const france = index.regions.find((region) => region.id === "Q142") as Region;
let lookup: { data: { uuid: string } | null | undefined; isError: boolean } = { data: undefined, isError: false };
const lookedUp = vi.fn();

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useGenreByWikidataId: (wikidataId: string | null) => {
    lookedUp(wikidataId);
    return lookup;
  },
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
const withOverview = (id: string | null, inherited: string | null = null): Region => ({
  ...france,
  overviewItemId: id,
  inheritedOverviewItemId: inherited,
  drillable: true,
});

afterEach(() => {
  cleanup();
  lookup = { data: undefined, isError: false };
  vi.clearAllMocks();
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

  it("prefers the region's own overview over an inherited one", () => {
    render(<RegionDetailPanel {...props} region={withOverview("Q672134", "Q1")} />);

    expect(lookedUp).toHaveBeenLastCalledWith("Q672134");
  });

  it("shows the inherited overview genre when the region has none of its own, and focuses on request", () => {
    lookup = { data: { uuid: "22222222-2222-4222-8222-222222222222" }, isError: false };
    const region = withOverview(null, "Q672134");
    render(<RegionDetailPanel {...props} region={region} />);

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(lookedUp).toHaveBeenLastCalledWith("Q672134");
    expect(screen.getByRole("region", { name: /Genre 22222222/ })).toBeTruthy();
    expect(props.onFocus).toHaveBeenCalledWith(region);
  });

  it("shows a picked genre over the inherited overview", () => {
    lookup = { data: { uuid: "22222222-2222-4222-8222-222222222222" }, isError: false };
    render(
      <RegionDetailPanel
        {...props}
        genreUuid="33333333-3333-4333-8333-333333333333"
        region={withOverview(null, "Q672134")}
      />,
    );

    expect(screen.getByRole("region", { name: /Genre 33333333/ })).toBeTruthy();
    expect(screen.queryByRole("region", { name: /Genre 22222222/ })).toBeNull();
  });

  it("does not name an inherited overview after the region when it fails to load", () => {
    lookup = { data: null, isError: false };
    render(<RegionDetailPanel {...props} region={withOverview(null, "Q672134")} />);

    expect(screen.getByRole("alert").textContent).toBe(`The music genre covering ${france.name} could not be loaded.`);
  });

  it("falls back to the region facts when it has no overview", () => {
    render(<RegionDetailPanel {...props} region={withOverview(null)} />);

    expect(screen.getByText(france.name)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: `Focus on ${france.name}` }));
    expect(props.onFocus).toHaveBeenCalled();
  });
});
