import { describe, it, expect, vi, beforeEach } from "vitest";
import ImportsPage from "./page";

const authMock = vi.fn();
const redirectMock = vi.fn<(url: string) => never>(() => {
  throw new Error("NEXT_REDIRECT");
});
const notFoundMock = vi.fn<() => never>(() => {
  throw new Error("NEXT_NOT_FOUND");
});
const fetchLatestMock = vi.fn();
const fetchRunsMock = vi.fn();

vi.mock("@lib/auth", () => ({ auth: () => authMock() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
  notFound: () => notFoundMock(),
}));
vi.mock("@lib/import-runs", () => ({
  fetchLatestImportRuns: () => fetchLatestMock(),
  fetchImportRuns: (...args: unknown[]) => fetchRunsMock(...args),
}));

const props = (params: { kind?: string; page?: string }) => ({ searchParams: Promise.resolve(params) });

describe("ImportsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([null, { error: "RefreshTokenError" }])("redirects to /admin when not signed in (%o)", async (session) => {
    authMock.mockResolvedValue(session);

    await expect(ImportsPage(props({}))).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
    expect(fetchLatestMock).not.toHaveBeenCalled();
  });

  it("404s on an unknown kind", async () => {
    authMock.mockResolvedValue({});

    await expect(ImportsPage(props({ kind: "nope" }))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchRunsMock).not.toHaveBeenCalled();
  });

  it("redirects to the first page past the last one", async () => {
    authMock.mockResolvedValue({});
    fetchRunsMock.mockResolvedValue(null);

    await expect(ImportsPage(props({ kind: "songs", page: "9" }))).rejects.toThrow("NEXT_REDIRECT");
    expect(fetchRunsMock).toHaveBeenCalledWith(9, "songs");
    expect(redirectMock).toHaveBeenCalledWith("/admin/imports?kind=songs");
  });
});
