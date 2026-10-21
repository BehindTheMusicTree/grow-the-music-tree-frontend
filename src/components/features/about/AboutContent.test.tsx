import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AboutContent from "@components/features/about/AboutContent";

vi.mock("@components/features/menu/OrgSocialLinks", () => ({ default: () => null }));
vi.mock("@components/features/about/AboutTheMusicTreeLockup", () => ({ AboutTheMusicTreeLockup: () => null }));

describe("AboutContent", () => {
  afterEach(cleanup);

  it("presents TheMusicTree and the roadmap", () => {
    render(<AboutContent />);
    expect(screen.getByRole("heading", { level: 1, name: "TheMusicTree" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What's next" })).toBeInTheDocument();
  });

  it("does not promise features that do not exist yet outside the roadmap", () => {
    render(<AboutContent />);
    expect(screen.queryByText(/sign in with Google to see your library/i)).not.toBeInTheDocument();
  });

  it("links the API repository", () => {
    render(<AboutContent />);
    expect(screen.getByRole("link", { name: "API" })).toHaveAttribute(
      "href",
      "https://github.com/BehindTheMusicTree/grow-the-music-tree-api",
    );
  });

  it("credits Wikidata as the source of the genre tree", () => {
    render(<AboutContent />);
    expect(screen.getByRole("link", { name: "Wikidata" })).toHaveAttribute("href", "https://www.wikidata.org");
  });

  it("keeps a link to the admin area", () => {
    render(<AboutContent />);
    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/admin");
  });
});
