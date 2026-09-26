import { describe, it, expect, vi } from "vitest";
import GenreReviewPage from "./page";

const authMock = vi.fn();
const redirectMock = vi.fn(() => {
  throw new Error("NEXT_REDIRECT");
});
const fetchConflictsMock = vi.fn();

vi.mock("@lib/auth", () => ({ auth: () => authMock() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirectMock(url) }));
vi.mock("@lib/genre-name-conflicts", () => ({ fetchGenreNameConflicts: () => fetchConflictsMock() }));

describe("GenreReviewPage", () => {
  it.each([null, { error: "RefreshTokenError" }])("redirects to /admin when not signed in (%o)", async (session) => {
    authMock.mockResolvedValue(session);

    await expect(GenreReviewPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
    expect(fetchConflictsMock).not.toHaveBeenCalled();
  });
});
