import { describe, it, expect, vi, beforeEach } from "vitest";
import CurationListPage from "./page";

const authMock = vi.fn();
const redirectMock = vi.fn<(url: string) => never>(() => {
  throw new Error("NEXT_REDIRECT");
});
const notFoundMock = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
const fetchListsMock = vi.fn();
const fetchEntriesMock = vi.fn();

vi.mock("@lib/auth", () => ({ auth: () => authMock() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirectMock(url), notFound: () => notFoundMock() }));
vi.mock("@lib/curation", () => ({
  fetchCurationStatus: async () => ({ appliedExportOn: null, pendingCount: 0 }),
  fetchCurationLists: () => fetchListsMock(),
  fetchCurationEntries: (...args: unknown[]) => fetchEntriesMock(...args),
}));

const props = (list: string) => ({ params: Promise.resolve({ list }), searchParams: Promise.resolve({}) });

describe("CurationListPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([null, { error: "RefreshTokenError" }])("redirects to /admin when not signed in (%o)", async (session) => {
    authMock.mockResolvedValue(session);

    await expect(CurationListPage(props("main_parent"))).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
    expect(fetchListsMock).not.toHaveBeenCalled();
  });

  it("404s on a list the registry doesn't have", async () => {
    authMock.mockResolvedValue({ user: {} });
    fetchListsMock.mockResolvedValue([{ name: "main_parent", keyColumns: [], columns: [], description: "", count: 0 }]);

    await expect(CurationListPage(props("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchEntriesMock).not.toHaveBeenCalled();
  });

  it("goes back to page 1 when the requested page is past the last one", async () => {
    authMock.mockResolvedValue({ user: {} });
    fetchListsMock.mockResolvedValue([{ name: "main_parent", keyColumns: [], columns: [], description: "", count: 0 }]);
    fetchEntriesMock.mockResolvedValue(null);

    await expect(
      CurationListPage({
        params: Promise.resolve({ list: "main_parent" }),
        searchParams: Promise.resolve({ page: "8" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(fetchEntriesMock).toHaveBeenCalledWith("main_parent", { page: 8, q: "", ordering: "key" });
    expect(redirectMock).toHaveBeenCalledWith("/admin/curation/main_parent");
  });

  it("keeps search, ordering and QID display when going back to page 1", async () => {
    authMock.mockResolvedValue({ user: {} });
    fetchListsMock.mockResolvedValue([{ name: "main_parent", keyColumns: [], columns: [], description: "", count: 0 }]);
    fetchEntriesMock.mockResolvedValue(null);

    await expect(
      CurationListPage({
        params: Promise.resolve({ list: "main_parent" }),
        searchParams: Promise.resolve({ page: "8", q: " rock ", ordering: "-updated_on", qid: "1" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(fetchEntriesMock).toHaveBeenCalledWith("main_parent", { page: 8, q: "rock", ordering: "-updated_on" });
    expect(redirectMock).toHaveBeenCalledWith("/admin/curation/main_parent?q=rock&ordering=-updated_on&qid=1");
  });
});
