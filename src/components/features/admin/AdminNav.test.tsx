import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AdminNav from "./AdminNav";

let pathname = "/admin/curation/main_parent";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

describe("AdminNav", () => {
  afterEach(cleanup);

  it("marks the section of the current page", () => {
    render(<AdminNav />);

    expect(screen.getByRole("link", { name: "Curation" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Genre review" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Historique" })).not.toHaveAttribute("aria-current");
  });

  it("marks only the most specific section", () => {
    pathname = "/admin/curation/history";
    render(<AdminNav />);

    expect(screen.getAllByRole("link", { current: "page" }).map((link) => link.textContent)).toEqual(["Historique"]);
  });
});
