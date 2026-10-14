import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import ArtistTracks from "./ArtistTracks";

const fetchMock = vi.fn();
const playNewTrackListMock = vi.fn();

vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api/grow-proxy" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  PaginatedResponseSchema: () => null,
  useFetchWrapper: () => ({ fetch: fetchMock }),
  useQueryWithParse: ({ queryKey, queryFn }: { queryKey: unknown[]; queryFn: () => Promise<unknown> }) =>
    useQuery({ queryKey, queryFn }),
}));
vi.mock("@behindthemusictree/app-kit/player", () => ({ usePlayer: () => ({ playerTrackObject: null }) }));
vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  RecordingDetailedSchema: null,
  libraryEndpoints: { reference: { recordings: { list: () => "library/recordings/" } } },
  recordingUnplayableReason: (recording: { youtubeVideo: unknown }) => (recording.youtubeVideo ? null : "No video"),
  useTrackList: () => ({ playNewTrackList: playNewTrackListMock }),
  TrackItem: ({ track, position }: { track: { title: string }; position: number }) => (
    <button type="button">
      {position}. {track.title}
    </button>
  ),
}));

const ARTIST = { uuid: "11111111-1111-1111-1111-111111111111", name: "Band" };
const recording = (uuid: string, title: string, youtubeVideo: unknown = { id: "yt" }) => ({ uuid, title, youtubeVideo });

function renderTracks() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ArtistTracks artist={ARTIST} />
    </QueryClientProvider>,
  );
}

describe("ArtistTracks", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("fetches the artist's recordings page by page", async () => {
    fetchMock.mockImplementation((_endpoint, _fromBackend, _auth, _options, { page }) =>
      Promise.resolve({ results: [recording(`r${page}`, `Song ${page}`)], page, pageSize: 1, totalPages: 2 }),
    );
    renderTracks();

    expect(await screen.findByRole("button", { name: "1. Song 1" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("library/recordings/", true, false, undefined, {
      artist: ARTIST.uuid,
      ordering: "title",
      page: 1,
    });

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(await screen.findByRole("button", { name: "2. Song 2" })).toBeInTheDocument();
  });

  it("plays all playable tracks, or the clicked one, as an artist list", async () => {
    fetchMock.mockResolvedValue({
      results: [recording("r1", "No Video", null), recording("r2", "Good"), recording("r3", "Also Good")],
      page: 1,
      pageSize: 100,
      totalPages: 1,
    });
    renderTracks();

    fireEvent.click(await screen.findByRole("button", { name: "Play all" }));
    const playable = [expect.objectContaining({ uuid: "r2" }), expect.objectContaining({ uuid: "r3" })];
    const origin = { type: "artist", uuid: ARTIST.uuid, name: ARTIST.name };
    expect(playNewTrackListMock).toHaveBeenLastCalledWith(playable, "r2", origin, "reference");

    fireEvent.click(screen.getByRole("button", { name: "3. Also Good" }));
    expect(playNewTrackListMock).toHaveBeenLastCalledWith(playable, "r3", origin, "reference");
  });
});
