import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import CurationPage from "./page";

const authMock = vi.fn();
const redirectMock = vi.fn(() => {
  throw new Error("NEXT_REDIRECT");
});
const fetchListsMock = vi.fn();

vi.mock("@lib/auth", () => ({ auth: () => authMock() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirectMock(url) }));
vi.mock("@lib/curation", () => ({ fetchCurationLists: () => fetchListsMock() }));

const list = (name: string, count: number) => ({ name, keyColumns: [], columns: [], description: "", count });

describe("CurationPage", () => {
  it.each([null, { error: "RefreshTokenError" }])("redirects to /admin when not signed in (%o)", async (session) => {
    authMock.mockResolvedValue(session);

    await expect(CurationPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
    expect(fetchListsMock).not.toHaveBeenCalled();
  });

  it("groups lists under titled sections with counts, unknown lists last", async () => {
    authMock.mockResolvedValue({ user: {} });
    fetchListsMock.mockResolvedValue([list("brand_new", 3), list("main_parent", 118)]);

    render(await CurationPage());

    const headings = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(headings).toEqual(["Parenté", "Non classées"]);
    const mainParent = screen.getByRole("link", { name: /parent principal imposé/i });
    expect(mainParent).toHaveAttribute("href", "/admin/curation/main_parent");
    expect(within(mainParent).getByText("118")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /brand_new/ })).toHaveAttribute("href", "/admin/curation/brand_new");
  });
});
