import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import LatestImportRuns from "./LatestImportRuns";

const NOW = Date.parse("2026-10-05T12:00:00Z");

describe("LatestImportRuns", () => {
  afterEach(cleanup);

  it("shows each kind's latest import with relative and absolute time, and never for a missing one", () => {
    render(
      <LatestImportRuns
        now={NOW}
        runs={{
          canonicalTree: {
            kind: "canonical_tree",
            importedOn: "2026-10-05T09:00:00Z",
            count: 1200,
            skippedCount: null,
          },
          regionalTree: { kind: "regional_tree", importedOn: "2026-10-03T12:00:00Z", count: 300, skippedCount: null },
          songs: { kind: "songs", importedOn: "2026-10-05T11:59:30Z", count: 50, skippedCount: 4 },
          unresolvedGenreTags: null,
        }}
      />,
    );

    const row = (name: string) => within(screen.getByRole("row", { name: new RegExp(`^${name}`) }));
    expect(row("Canonical tree").getByRole("cell", { name: /^3 hours ago/ })).toBeInTheDocument();
    expect(row("Canonical tree").getByText("5 Oct 2026, 11:00")).toHaveAttribute("datetime", "2026-10-05T09:00:00Z");
    expect(row("Regional tree").getByRole("cell", { name: /^2 days ago/ })).toBeInTheDocument();
    expect(row("Songs").getByRole("cell", { name: /^30 seconds ago/ })).toBeInTheDocument();
    expect(row("Songs").getByRole("cell", { name: "4" })).toBeInTheDocument();
    expect(row("Unresolved genre tags").getByRole("cell", { name: "never" })).toBeInTheDocument();
  });
});
