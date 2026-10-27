import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AboutContent from "@components/features/about/AboutContent";

vi.mock("@components/features/menu/OrgSocialLinks", () => ({ default: () => null }));
vi.mock("@components/features/about/AboutTheMusicTreeLockup", () => ({ AboutTheMusicTreeLockup: () => null }));

describe("AboutContent", () => {
  afterEach(cleanup);

  it("calls onClose from the TheMusicTree button", () => {
    const onClose = vi.fn();
    render(<AboutContent onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "TheMusicTree" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("presents the tagline and the roadmap", () => {
    render(<AboutContent onClose={vi.fn()} />);
    expect(screen.getByText("The map of the world's music.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What's next" })).toBeInTheDocument();
  });

  it("does not promise features that do not exist yet outside the roadmap", () => {
    render(<AboutContent onClose={vi.fn()} />);
    expect(screen.queryByText(/sign in with Google to see your library/i)).not.toBeInTheDocument();
  });

  it("links the API repository", () => {
    render(<AboutContent onClose={vi.fn()} />);
    expect(screen.getByRole("link", { name: "API" })).toHaveAttribute(
      "href",
      "https://github.com/BehindTheMusicTree/grow-the-music-tree-api",
    );
  });

  it("credits Wikidata as the source of the genre tree", () => {
    render(<AboutContent onClose={vi.fn()} />);
    expect(screen.getByRole("link", { name: "Wikidata" })).toHaveAttribute("href", "https://www.wikidata.org");
  });

  it("keeps a link to the admin area", () => {
    render(<AboutContent onClose={vi.fn()} />);
    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/admin");
  });
});
