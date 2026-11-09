import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderArtistLink } from "./renderArtistLink";
import { renderSongLink } from "@components/features/song/renderSongLink";

let pathname = "/";
let search = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => search,
}));

afterEach(() => {
  cleanup();
  pathname = "/";
  search = new URLSearchParams();
});

describe("entity links", () => {
  it("go to the entity pages outside the map", () => {
    render(<>{renderArtistLink({ uuid: "a1", name: "Kassav" })}{renderSongLink({ uuid: "s1", title: "Zouk la" })}</>);
    expect(screen.getByRole("link", { name: "Kassav" })).toHaveAttribute("href", "/?artist=a1");
    expect(screen.getByRole("link", { name: "Zouk la" })).toHaveAttribute("href", "/?song=s1");
  });

  it("open in the map's own panel on the map, keeping its camera", () => {
    pathname = "/map";
    search = new URLSearchParams("at=2,46,5&genre=g1");
    render(<>{renderArtistLink({ uuid: "a1", name: "Kassav" })}{renderSongLink({ uuid: "s1", title: "Zouk la" })}</>);
    expect(screen.getByRole("link", { name: "Kassav" })).toHaveAttribute("href", "/map?at=2%2C46%2C5&artist=a1");
    expect(screen.getByRole("link", { name: "Zouk la" })).toHaveAttribute("href", "/map?at=2%2C46%2C5&song=s1");
  });

  it("leaves a special-purpose artist unlinked", () => {
    render(<>{renderArtistLink({ uuid: "a1", name: "Various Artists", isSpecialPurpose: true })}</>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Various Artists")).toBeInTheDocument();
  });
});
