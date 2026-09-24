import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "./GenreTreeViewModeProvider";

function Probe() {
  const { viewMode, setViewMode } = useGenreTreeViewMode();
  return (
    <div>
      <span data-testid="view-mode">{viewMode}</span>
      <button onClick={() => setViewMode("pop-core")}>set pop-core</button>
      <button onClick={() => setViewMode("stacked")}>set stacked</button>
    </div>
  );
}

describe("GenreTreeViewModeProvider", () => {
  afterEach(() => {
    cleanup();
  });

  it("defaults to pop-core", () => {
    render(
      <GenreTreeViewModeProvider>
        <Probe />
      </GenreTreeViewModeProvider>,
    );

    expect(screen.getByTestId("view-mode")).toHaveTextContent("pop-core");
  });

  it("updates viewMode on toggle", () => {
    render(
      <GenreTreeViewModeProvider>
        <Probe />
      </GenreTreeViewModeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set stacked" }));

    expect(screen.getByTestId("view-mode")).toHaveTextContent("stacked");

    fireEvent.click(screen.getByRole("button", { name: "set pop-core" }));

    expect(screen.getByTestId("view-mode")).toHaveTextContent("pop-core");
  });
});
