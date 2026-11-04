import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ViewModeToggle } from "./ViewModeToggle";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

function CurrentMode() {
  const { viewMode } = useGenreTreeViewMode();
  return <output>{viewMode}</output>;
}

describe("ViewModeToggle", () => {
  afterEach(cleanup);

  it("switches between the wheel and outline views", () => {
    render(
      <GenreTreeViewModeProvider>
        <ViewModeToggle />
        <CurrentMode />
      </GenreTreeViewModeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show outline view" }));
    expect(screen.getByRole("status")).toHaveTextContent("outline");

    fireEvent.click(screen.getByRole("button", { name: "Show wheel view" }));
    expect(screen.getByRole("status")).toHaveTextContent("pop-core");
  });
});
