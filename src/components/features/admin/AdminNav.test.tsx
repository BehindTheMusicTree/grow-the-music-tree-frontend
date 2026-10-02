import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminNav from "./AdminNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/curation/main_parent" }));

describe("AdminNav", () => {
  it("marks the section of the current page", () => {
    render(<AdminNav />);

    expect(screen.getByRole("link", { name: "Curation" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Genre review" })).not.toHaveAttribute("aria-current");
  });
});
