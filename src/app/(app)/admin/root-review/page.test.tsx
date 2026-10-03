import { describe, it, expect, vi } from "vitest";
import RootReviewPage from "./page";

const authMock = vi.fn();
const redirectMock = vi.fn<(url: string) => never>(() => {
  throw new Error("NEXT_REDIRECT");
});
const fetchRootsMock = vi.fn();

vi.mock("@lib/auth", () => ({ auth: () => authMock() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirectMock(url) }));
vi.mock("@lib/genre-unaccepted-roots", () => ({ fetchUnacceptedRoots: () => fetchRootsMock() }));

describe("RootReviewPage", () => {
  it.each([null, { error: "RefreshTokenError" }])("redirects to /admin when not signed in (%o)", async (session) => {
    authMock.mockResolvedValue(session);

    await expect(RootReviewPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
    expect(fetchRootsMock).not.toHaveBeenCalled();
  });
});
