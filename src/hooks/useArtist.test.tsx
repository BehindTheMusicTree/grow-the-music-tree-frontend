import { describe, it, expect, vi, afterEach } from "vitest";
import type { ReactNode } from "react";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppError, ErrorCode } from "@behindthemusictree/app-kit/transport";
import { useArtist } from "./useArtist";

const fetchMock = vi.fn();

vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/transport")>();
  return { ...actual, useFetchWrapper: () => ({ fetch: fetchMock }) };
});

const UUID = "11111111-1111-1111-1111-111111111111";
const artist = {
  uuid: UUID,
  name: "Band",
  musicbrainzArtistId: null,
  type: null,
  country: null,
  beginYear: null,
  endYear: null,
  ended: false,
  links: [],
  members: [],
  memberOf: [],
  albums: [],
  tracksCount: 0,
  image: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Band.jpg/500px-Band.jpg",
    pageUrl: "https://commons.wikimedia.org/wiki/File:Band.jpg",
    author: null,
    license: "CC BY 2.0",
    licenseUrl: "http://creativecommons.org/licenses/by/2.0",
  },
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useArtist", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("is idle without an artist", () => {
    const { result } = renderHook(() => useArtist(null), { wrapper });

    expect(result.current).toEqual({ status: "idle" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a malformed uuid as not found without fetching", () => {
    const { result } = renderHook(() => useArtist("../songs"), { wrapper });

    expect(result.current).toEqual({ status: "not-found" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a 404 as not found, once, outside the global error flow", async () => {
    fetchMock.mockRejectedValue(new AppError(ErrorCode.BACKEND_NOT_FOUND));
    const { result } = renderHook(() => useArtist(UUID), { wrapper });

    await waitFor(() => expect(result.current).toEqual({ status: "not-found" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`artists/${UUID}/`, true, false, undefined, undefined, false, true);
  });

  it.each([
    ["with", artist],
    ["without", { ...artist, image: null }],
  ])("parses an artist %s an image", async (_, payload) => {
    fetchMock.mockResolvedValue(payload);
    const { result } = renderHook(() => useArtist(UUID), { wrapper });

    await waitFor(() => expect(result.current).toEqual({ status: "success", artist: payload }));
  });
});
