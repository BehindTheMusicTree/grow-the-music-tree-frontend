import { describe, it, expect, vi } from "vitest";
import SongPage from "./page";

const permanentRedirectMock = vi.fn<(url: string) => never>(() => {
  throw new Error("NEXT_REDIRECT");
});

vi.mock("next/navigation", () => ({ permanentRedirect: (url: string) => permanentRedirectMock(url) }));

describe("SongPage", () => {
  it("redirects to the song panel on the genre tree", async () => {
    const uuid = "11111111-1111-4111-8111-111111111111";
    await expect(SongPage({ params: Promise.resolve({ uuid }) })).rejects.toThrow("NEXT_REDIRECT");
    expect(permanentRedirectMock).toHaveBeenCalledWith(`/?song=${uuid}`);
  });
});
