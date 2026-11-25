import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import RegionDetailPanel from "./RegionDetailPanel";

const index = RegionMapIndexSchema.parse(fixture);
const france = index.regions.find((region) => region.id === "Q142") as Region;
let lookup: { data: { uuid: string; name?: string } | null | undefined; isError: boolean } = {
  data: undefined,
  isError: false,
};
const lookedUp = vi.fn();

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useGenreByWikidataId: (wikidataId: string | null) => {
    lookedUp(wikidataId);
    return wikidataId === null ? { data: undefined, isError: false } : lookup;
  },
}));

vi.mock("@behindthemusictree/app-kit-ui/genre-tree", () => ({
  GenreDetailPanel: ({
    genreUuid,
    onZoomIn,
    collapsed,
    edgeTab,
  }: {
    genreUuid: string;
    onZoomIn?: () => void;
    collapsed?: boolean;
    edgeTab?: { center?: { label: string; onClick: () => void } | null };
  }) => (
    <section aria-label={`Genre ${genreUuid}`} data-collapsed={collapsed ? "true" : undefined}>
      {edgeTab?.center && (
        <button type="button" onClick={edgeTab.center.onClick}>
          {edgeTab.center.label}
        </button>
      )}
      {onZoomIn && (
        <button type="button" onClick={onZoomIn}>
          Zoom in
        </button>
      )}
    </section>
  ),
}));

const props = {
  genreUuid: null,
  onSelectGenre: vi.fn(),
  onZoomTo: vi.fn(),
  onClose: vi.fn(),
  collapsed: false,
  onCollapsedChange: vi.fn(),
};
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
  it("shows the overview genre of the region without a focus button", () => {
    lookup = { data: { uuid: "11111111-1111-4111-8111-111111111111" }, isError: false };
    const region = withOverview("Q672134");
    render(<RegionDetailPanel {...props} region={region} />);

    expect(screen.getByRole("region", { name: /Genre 11111111/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Zoom|Focus/ })).toBeNull();
  });

  it("reports an overview genre the API does not know", () => {
    lookup = { data: null, isError: false };
    render(<RegionDetailPanel {...props} region={withOverview("Q672134")} />);

    expect(screen.getByRole("alert").textContent).toBe(`The music genre covering ${france.name} could not be loaded.`);
  });

  it("prefers the region's own overview over an inherited one", () => {
    render(<RegionDetailPanel {...props} region={withOverview("Q672134", "Q1")} />);

    expect(lookedUp).toHaveBeenLastCalledWith("Q672134");
  });

  it("shows the inherited overview genre when the region has none of its own", () => {
    lookup = { data: { uuid: "22222222-2222-4222-8222-222222222222" }, isError: false };
    const region = withOverview(null, "Q672134");
    render(<RegionDetailPanel {...props} region={region} />);

    expect(lookedUp).toHaveBeenLastCalledWith("Q672134");
    expect(screen.getByRole("region", { name: /Genre 22222222/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Zoom|Focus/ })).toBeNull();
  });

  it("does not name an inherited overview after the region when it fails to load", () => {
    lookup = { data: null, isError: false };
    render(<RegionDetailPanel {...props} region={withOverview(null, "Q672134")} />);

    expect(screen.getByRole("alert").textContent).toBe(`The music genre covering ${france.name} could not be loaded.`);
  });

  it("falls back to the region facts when it has no overview", () => {
    render(<RegionDetailPanel {...props} region={withOverview(null)} />);

    expect(screen.getByText(france.name)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: `Zoom to ${france.name}` }));
    expect(props.onZoomTo).toHaveBeenCalled();
  });

  it("opens retained genres for a missing boundary with no overview", () => {
    const uuid = "33333333-3333-4333-8333-333333333333";
    lookup = { data: { uuid, name: "Basque music" }, isError: false };
    const region: Region = {
      ...withOverview(null),
      boundaryStatus: "missing",
      bbox: null,
      mainBbox: null,
      centroid: null,
      genres: [{ itemId: "Q3121396", rule: "P495", relation: "regional" }],
    };
    render(<RegionDetailPanel {...props} region={region} />);
    fireEvent.click(screen.getByRole("button", { name: "Basque music" }));
    expect(props.onSelectGenre).toHaveBeenCalledWith(uuid);
    expect(screen.queryByRole("button", { name: /Zoom/ })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(`Boundary unavailable for ${region.name}`);
  });

  it("closes on Escape", () => {
    render(<RegionDetailPanel {...props} region={withOverview(null)} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(props.onClose).toHaveBeenCalled();
  });

  it("hides and shows through its edge tab", () => {
    const { rerender } = render(<RegionDetailPanel {...props} region={withOverview(null)} />);

    fireEvent.click(screen.getByRole("button", { name: "Hide panel" }));
    expect(props.onCollapsedChange).toHaveBeenCalledWith(true);

    rerender(<RegionDetailPanel {...props} collapsed region={withOverview(null)} />);
    fireEvent.click(screen.getByRole("button", { name: "Show panel", hidden: true }));
    expect(props.onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it("forwards its collapse state and edge tab to the genre panel", () => {
    lookup = { data: { uuid: "11111111-1111-4111-8111-111111111111" }, isError: false };
    render(<RegionDetailPanel {...props} collapsed region={withOverview("Q672134")} />);

    expect(screen.getByRole("region", { name: /Genre 11111111/ }).getAttribute("data-collapsed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Show panel" }));
    expect(props.onCollapsedChange).toHaveBeenCalledWith(false);
  });
});
