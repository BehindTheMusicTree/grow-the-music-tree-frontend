import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import NavButtons from "./NavButtons";
import { NightModeProvider } from "@contexts/NightModeProvider";

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
  render(
    <NightModeProvider>
      <NavButtons />
    </NightModeProvider>,
  );
}

describe("NavButtons", () => {
  afterEach(() => {
    cleanup();
    searchParams = new URLSearchParams();
    pathname = "/";
  });

  it("lists tree, map and about from top to bottom, icon-only", () => {
    renderHeader();

    const names = screen.getAllByRole("link").map((link) => link.getAttribute("aria-label"));
    expect(names).toEqual(["GrowTheMusicTree home", "Region map", "About"]);
    screen.getAllByRole("link").forEach((link) => expect(link).toHaveTextContent(/^$/));
    expect(screen.getByRole("link", { name: "GrowTheMusicTree home" })).toHaveAttribute("href", "/");
  });

  it("leaves night mode to the map's own controls", () => {
    pathname = "/map";
    renderHeader();

    expect(screen.queryByRole("button", { name: "Night mode" })).not.toBeInTheDocument();
  });

  it("links the About button to /?about", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/?about");
  });

  it("no longer offers a Genealogy link", () => {
    renderHeader();

    expect(screen.queryByRole("link", { name: "Genealogy" })).not.toBeInTheDocument();
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

  it("carries the genre to the map and back, dropping view-specific params", () => {
    searchParams = new URLSearchParams("genre=abc&zoom=rock&region=Q1");
    renderHeader();

    expect(screen.getByRole("link", { name: "Region map" })).toHaveAttribute("href", "/map?genre=abc");
    expect(screen.getByRole("link", { name: /home$/ })).toHaveAttribute("href", "/?genre=abc");
  });

  it("carries the artist and the song across views", () => {
    searchParams = new URLSearchParams("artist=a1&song=s1&zoom=rock");
    renderHeader();

    const mapHref = screen.getByRole("link", { name: "Region map" }).getAttribute("href");
    const homeHref = screen.getByRole("link", { name: /home$/ }).getAttribute("href");
    expect(mapHref).toContain("artist=a1");
    expect(mapHref).toContain("song=s1");
    expect(mapHref).not.toContain("zoom");
    expect(homeHref).toContain("artist=a1");
    expect(homeHref).toContain("song=s1");
  });

  it("keeps the links bare without a genre", () => {
    searchParams = new URLSearchParams("zoom=rock");
    renderHeader();

    expect(screen.getByRole("link", { name: "Region map" })).toHaveAttribute("href", "/map");
  });

  it("does not carry the genre from other pages", () => {
    pathname = "/genealogy";
    searchParams = new URLSearchParams("genre=abc");
    renderHeader();

    expect(screen.getByRole("link", { name: "Region map" })).toHaveAttribute("href", "/map");
  });

  it("keeps the panel-aware offset classes literal so Tailwind generates them", () => {
    renderHeader();

    const classes = screen.getByRole("navigation", { name: "Main navigation" }).className;
    expect(classes).toContain("md:left-[calc(var(--layout-detail-panel-w)+0.25rem)]");
    expect(classes).toContain("[data-sheet=true]:not([data-collapsed=true])]:max-md:bottom-[calc(var(--layout-sheet-peek)+0.25rem)]");
    expect(classes).toContain("max-md:hidden");
  });
});
