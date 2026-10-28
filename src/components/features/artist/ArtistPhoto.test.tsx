import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ArtistPhoto from "./ArtistPhoto";

const image = {
  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Band.jpg/500px-Band.jpg",
  pageUrl: "https://commons.wikimedia.org/wiki/File:Band.jpg",
  author: "Jane Doe",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
};

describe("ArtistPhoto", () => {
  afterEach(cleanup);

  it("shows the photo named after the artist", () => {
    render(<ArtistPhoto image={image} name="Band" />);

    // Vitest skips next.config's `images.unoptimized`, so src goes through the default loader here.
    const src = screen.getByRole("img", { name: "Band" }).getAttribute("src") ?? "";
    expect(decodeURIComponent(src)).toContain(image.url);
  });

  it("credits the author with a link to the Commons page in a new tab", () => {
    render(<ArtistPhoto image={image} name="Band" />);

    const author = screen.getByRole("link", { name: "Jane Doe" });
    expect(author).toHaveAttribute("href", image.pageUrl);
    expect(author).toHaveAttribute("target", "_blank");
    expect(author).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links the license when it has a URL", () => {
    render(<ArtistPhoto image={image} name="Band" />);

    expect(screen.getByRole("link", { name: "CC BY-SA 4.0" })).toHaveAttribute("href", image.licenseUrl);
  });

  it("shows the license as plain text without a URL", () => {
    render(<ArtistPhoto image={{ ...image, license: "Public domain", licenseUrl: null }} name="Band" />);

    expect(screen.queryByRole("link", { name: "Public domain" })).not.toBeInTheDocument();
    expect(screen.getByRole("figure")).toHaveTextContent("Public domain");
  });

  it("credits Wikimedia Commons without an author", () => {
    render(<ArtistPhoto image={{ ...image, author: null }} name="Band" />);

    expect(screen.getByRole("link", { name: "Wikimedia Commons" })).toHaveAttribute("href", image.pageUrl);
  });
});
