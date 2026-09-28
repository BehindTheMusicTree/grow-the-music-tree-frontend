import { useEffect } from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppHeader from "./AppHeader";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

function CanShowPopCore({ value }: { value: boolean }) {
  const { setCanShowPopCore } = useGenreTreeViewMode();
  useEffect(() => setCanShowPopCore(value), [value, setCanShowPopCore]);
  return null;
}

function renderHeader(canShowPopCore: boolean) {
  render(
    <GenreTreeViewModeProvider>
      <CanShowPopCore value={canShowPopCore} />
      <AppHeader />
    </GenreTreeViewModeProvider>,
  );
}

describe("AppHeader view toggle", () => {
  afterEach(() => {
    cleanup();
  });

  it("switches between outline and wheel views", () => {
    renderHeader(true);

    fireEvent.click(screen.getByRole("button", { name: /show outline view/i }));
    fireEvent.click(screen.getByRole("button", { name: /show wheel view/i }));

    expect(screen.getByRole("button", { name: /show outline view/i })).toBeInTheDocument();
  });

  it("hides the toggle when the pop-core root is missing", () => {
    renderHeader(false);

    expect(screen.queryByRole("button", { name: /show outline view/i })).not.toBeInTheDocument();
  });
});
