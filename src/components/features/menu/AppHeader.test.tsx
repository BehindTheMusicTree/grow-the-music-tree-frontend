import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AppHeader from "./AppHeader";

let searchParams = new URLSearchParams();
let pathname = "/";

vi.mock("./UserMenu", () => ({ UserMenu: () => null }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api", getAudiometaUrl: () => "" }));

function renderHeader() {
  render(<AppHeader />);
}

describe("AppHeader", () => {
  afterEach(() => {
    cleanup();
    searchParams = new URLSearchParams();
    pathname = "/";
  });

  it.each(["/", "/map", "/genealogy"])("keeps Map before Genealogy on %s", (route) => {
    pathname = route;
    renderHeader();

    const links = screen.getAllByRole("link");
    const map = screen.getByRole("link", { name: "Region map" });
    const genealogy = screen.getByRole("link", { name: "Genealogy" });
    expect(links.indexOf(map)).toBeLessThan(links.indexOf(genealogy));
    expect(map).toHaveAttribute("href", "/map");
    if (route === "/map") {
      expect(map).toHaveAttribute("aria-current", "page");
      expect(genealogy).not.toHaveAttribute("aria-current");
    } else {
      expect(map).not.toHaveAttribute("aria-current");
    }
  });

  it("links the About button to /?about", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/?about");
  });

  it("links to the genealogy page", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: "Genealogy" })).toHaveAttribute("href", "/genealogy");
  });

  it("shows only the icon on the Genealogy link away from the genealogy page", () => {
    renderHeader();

    const link = screen.getByRole("link", { name: "Genealogy" });
    expect(link).toHaveTextContent(/^$/);
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("keeps the Genealogy link icon-only and marks it current on the genealogy page", () => {
    pathname = "/genealogy";
    renderHeader();

    const link = screen.getByRole("link", { name: "Genealogy" });
    expect(link).toHaveTextContent(/^$/);
    expect(link).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: "GrowTheMusicTree" })).toBeInTheDocument();
  });

  it("keeps other params when opening About", () => {
    searchParams = new URLSearchParams("zoom=rock");
    renderHeader();

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/?zoom=rock&about");
  });

  it("toggles About closed, keeping other params, when it is open", () => {
    searchParams = new URLSearchParams("about&zoom=rock");
    renderHeader();

    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/?zoom=rock");
    expect(link).toHaveAttribute("aria-pressed", "true");
  });
});
