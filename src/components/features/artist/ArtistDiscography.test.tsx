import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within, fireEvent } from "@testing-library/react";
import ArtistDiscography from "./ArtistDiscography";

const album = (name: string, year: string | null, primaryType: string | null, secondaryTypes: string[] = []) => ({
  uuid: crypto.randomUUID(),
  name,
  year,
  primaryType,
  secondaryTypes,
});

describe("ArtistDiscography", () => {
  afterEach(cleanup);

  it("groups releases by type, secondary types first, sorted by year", () => {
    render(
      <ArtistDiscography
        albums={[
          album("Second", "2001", "album"),
          album("First", "1995", "album"),
          album("Live at Home", "1999", "album", ["live"]),
          album("Hits", "2005", "album", ["compilation"]),
          album("Tiny", "1996", "ep"),
          album("Hit Single", null, "single"),
        ]}
      />,
    );

    const group = (name: string) =>
      within(screen.getByRole("heading", { name }).parentElement!)
        .getAllByRole("listitem")
        .map((item) => item.textContent);

    expect(group("Albums")).toEqual(["1995First", "2001Second"]);
    expect(group("Live")).toEqual(["1999Live at Home"]);
    expect(group("Compilations")).toEqual(["2005Hits"]);
    expect(group("EPs")).toEqual(["1996Tiny"]);
    expect(group("Singles")).toEqual(["—Hit Single"]);
    expect(screen.queryByRole("heading", { name: "Other" })).not.toBeInTheDocument();
  });

  it("collapses the section from its title button", () => {
    render(<ArtistDiscography albums={[album("First", "1995", "album")]} />);

    const toggle = screen.getByRole("button", { name: "Discography", expanded: true });
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("heading", { name: "Albums" })).not.toBeInTheDocument();
  });
});
