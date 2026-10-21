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
  useTrackList: () => ({ playNewTrackListFromArtist: playNewTrackListMock }),
}));
vi.mock("@behindthemusictree/app-kit-ui/genre-tree", () => ({
  TrackItem: ({ track, position }: { track: { title: string }; position: number }) => (
    <div role="button" className="track-position-play-pause">
      {position}. {track.title}
    </div>
  ),
}));

const ARTIST = { uuid: "11111111-1111-1111-1111-111111111111", name: "Band" };
const recording = (uuid: string, title: string, youtubeVideo: unknown = { id: "yt" }) => ({
  uuid,
  title,
  youtubeVideo,
});

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

  it("plays the artist's full list in the current ordering, from the start or the clicked track", async () => {
    fetchMock.mockResolvedValue({
      results: [recording("r1", "No Video", null), recording("r2", "Good")],
      page: 1,
      pageSize: 100,
      totalPages: 1,
    });
    renderTracks();

    fireEvent.click(await screen.findByRole("button", { name: "Play all" }));
    expect(playNewTrackListMock).toHaveBeenLastCalledWith(ARTIST, "reference", {
      ordering: "title",
      startRecordingUuid: undefined,
    });

    fireEvent.click(screen.getByRole("button", { name: "Year" }));
    fireEvent.click(await screen.findByRole("button", { name: "2. Good" }));
    expect(playNewTrackListMock).toHaveBeenLastCalledWith(ARTIST, "reference", {
      ordering: "-albumYear",
      startRecordingUuid: "r2",
    });
    expect(fetchMock).toHaveBeenLastCalledWith("library/recordings/", true, false, undefined, {
      artist: ARTIST.uuid,
      ordering: "-albumYear",
      page: 1,
    });

    playNewTrackListMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "1. No Video" }));
    expect(playNewTrackListMock).not.toHaveBeenCalled();
  });
});
