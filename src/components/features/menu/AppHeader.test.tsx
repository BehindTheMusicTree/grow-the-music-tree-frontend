import { useEffect } from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppHeader from "./AppHeader";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

let searchParams = new URLSearchParams();
let pathname = "/";

vi.mock("./UserMenu", () => ({ UserMenu: () => null }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api", getAudiometaUrl: () => "" }));

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
    searchParams = new URLSearchParams();
    pathname = "/";
  });

  it("links the About button to /?about", () => {
    renderHeader(true);

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/?about");
  });

  it("links to the genealogy page", () => {
    renderHeader(true);

    expect(screen.getByRole("link", { name: "Genealogy" })).toHaveAttribute("href", "/genealogy");
  });

  it("shows only the icon on the Genealogy link away from the genealogy page", () => {
    renderHeader(true);

    const link = screen.getByRole("link", { name: "Genealogy" });
    expect(link).toHaveTextContent("");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("shows the Genealogy label and keeps the brand heading for assistive tech on the genealogy page", () => {
    pathname = "/genealogy";
    renderHeader(true);

    const link = screen.getByRole("link", { name: "Genealogy" });
    expect(link).toHaveTextContent("Genealogy");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: "GrowTheMusicTree" })).toHaveClass("sr-only");
  });

  it("keeps other params when opening About", () => {
    searchParams = new URLSearchParams("zoom=rock");
    renderHeader(true);

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/?zoom=rock&about");
  });

  it("toggles About closed, keeping other params, when it is open", () => {
    searchParams = new URLSearchParams("about&zoom=rock");
    renderHeader(true);

    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/?zoom=rock");
    expect(link).toHaveAttribute("aria-pressed", "true");
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
