import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CurationHistoryPage from "./page";

const authMock = vi.fn();
const fetchHistoryMock = vi.fn();

vi.mock("@lib/auth", () => ({ auth: () => authMock() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@lib/curation", () => ({
  fetchCurationLists: async () => [{ name: "main_parent" }],
  fetchCurationHistory: (...args: unknown[]) => fetchHistoryMock(...args),
}));
vi.mock("@components/features/curation/CurationBanner", () => ({ default: () => null }));
vi.mock("@components/features/curation/CurationHistory", () => ({ default: () => null }));

const props = (searchParams: Record<string, string>) => ({ searchParams: Promise.resolve(searchParams) });

describe("CurationHistoryPage", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: {} });
    fetchHistoryMock.mockResolvedValue({ overallTotal: 120, page: 2, totalPages: 3, results: [] });
  });

  it("redirects to /admin when not signed in", async () => {
    authMock.mockResolvedValue(null);
    await expect(CurationHistoryPage(props({}))).rejects.toThrow("NEXT_REDIRECT /admin");
    expect(fetchHistoryMock).not.toHaveBeenCalled();
  });

  it.each([{ list: "nope" }, { entry: "not-a-uuid" }, { item_id: "rock" }])("is not found for %o", async (params) => {
    await expect(CurationHistoryPage(props(params))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchHistoryMock).not.toHaveBeenCalled();
  });

  it("keeps the filter across pages", async () => {
    render(await CurationHistoryPage(props({ list: "main_parent", page: "2" })));

    expect(fetchHistoryMock).toHaveBeenCalledWith(
      { list: "main_parent", entry: undefined, itemId: undefined },
      { page: 2, pageSize: 50 },
    );
    expect(screen.getByRole("link", { name: "Précédent" })).toHaveAttribute(
      "href",
      "/admin/curation/history?list=main_parent",
    );
    expect(screen.getByRole("link", { name: "Suivant" })).toHaveAttribute(
      "href",
      "/admin/curation/history?list=main_parent&page=3",
    );
  });

  it("goes back to the first page past the last one", async () => {
    fetchHistoryMock.mockResolvedValue(null);
    await expect(CurationHistoryPage(props({ item_id: "Q1", page: "9" }))).rejects.toThrow(
      "NEXT_REDIRECT /admin/curation/history?item_id=Q1",
    );
  });
});
