import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "./GenreTreeViewModeProvider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/reference-genre-tree",
}));

function Probe() {
  const { viewMode, setViewMode, resolvedViewMode, setResolvedViewMode } = useGenreTreeViewMode();
  return (
    <div>
      <span data-testid="view-mode">{viewMode}</span>
      <span data-testid="resolved-view-mode">{resolvedViewMode}</span>
      <button onClick={() => setViewMode("pop-core")}>set pop-core</button>
      <button onClick={() => setViewMode("stacked")}>set stacked</button>
      <button onClick={() => setResolvedViewMode("stacked")}>override resolved to stacked</button>
    </div>
  );
}

describe("GenreTreeViewModeProvider", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps resolvedViewMode following viewMode on toggle when no override is active", () => {
    render(
      <GenreTreeViewModeProvider>
        <Probe />
      </GenreTreeViewModeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set pop-core" }));

    expect(screen.getByTestId("view-mode")).toHaveTextContent("pop-core");
    expect(screen.getByTestId("resolved-view-mode")).toHaveTextContent("pop-core");
  });

  it("leaves resolvedViewMode alone when an override is active (resolvedViewMode !== viewMode)", () => {
    render(
      <GenreTreeViewModeProvider>
        <Probe />
      </GenreTreeViewModeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set pop-core" }));
    fireEvent.click(screen.getByRole("button", { name: "override resolved to stacked" }));

    expect(screen.getByTestId("view-mode")).toHaveTextContent("pop-core");
    expect(screen.getByTestId("resolved-view-mode")).toHaveTextContent("stacked");

    fireEvent.click(screen.getByRole("button", { name: "set pop-core" }));

    expect(screen.getByTestId("resolved-view-mode")).toHaveTextContent("stacked");
  });
});
