import { describe, it, expect, vi } from "vitest";
import ArtistPage from "./page";

const permanentRedirectMock = vi.fn<(url: string) => never>(() => {
  throw new Error("NEXT_REDIRECT");
});

vi.mock("next/navigation", () => ({ permanentRedirect: (url: string) => permanentRedirectMock(url) }));

describe("ArtistPage", () => {
  it("redirects to the artist panel on the genre tree", async () => {
    const uuid = "11111111-1111-1111-1111-111111111111";
    await expect(ArtistPage({ params: Promise.resolve({ uuid }) })).rejects.toThrow("NEXT_REDIRECT");
    expect(permanentRedirectMock).toHaveBeenCalledWith(`/?artist=${uuid}`);
  });
});
