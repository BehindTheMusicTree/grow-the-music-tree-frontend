import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchArtist } from "@lib/artist";

vi.mock("@lib/grow-api-upstream-url", () => ({ getGrowApiUpstreamBaseUrl: () => "https://api.test/v1/" }));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("fetchArtist", () => {
  afterEach(() => vi.clearAllMocks());

  it.each(["foo", "..%2Fgenres", "../genres"])("treats a malformed uuid (%s) as not found without calling the API", async (uuid) => {
    await expect(fetchArtist(uuid)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null on 404 and throws on other errors", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    await expect(fetchArtist("11111111-1111-1111-1111-111111111111")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith("https://api.test/v1/artists/11111111-1111-1111-1111-111111111111/", {
      cache: "no-store",
    });

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
    await expect(fetchArtist("22222222-2222-2222-2222-222222222222")).rejects.toThrow("500");
  });
});
