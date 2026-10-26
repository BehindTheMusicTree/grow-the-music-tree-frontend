import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { genreQueryKeys, libraryQueryKeys } from "@behindthemusictree/app-kit/genre-tree";
import { useAliasGenre } from "@hooks/curation/useAliasGenre";
import { useAssignRecordingGenre } from "@hooks/curation/useAssignRecordingGenre";
import { useEssentialTracks } from "@hooks/curation/useEssentialTracks";
import { useExcludeGenre } from "@hooks/curation/useExcludeGenre";
import { useSecondaryParent, secondaryParentsKey } from "@hooks/curation/useSecondaryParent";
import { useUpdateGenreName } from "@hooks/curation/useUpdateGenreName";
import { useUpdateGenreSummary } from "@hooks/curation/useUpdateGenreSummary";
import { useUpdateRecordingVideo } from "@hooks/curation/useUpdateRecordingVideo";

const fetchMock = vi.fn();
const toastSuccess = vi.fn();

vi.mock("sonner", () => ({ toast: { success: (...args: unknown[]) => toastSuccess(...args), error: vi.fn() } }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: fetchMock }),
  useValidatedMutation: (options: Parameters<typeof useMutation>[0]) => useMutation(options),
}));

function setup<T>(useHook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, ...renderHook(useHook, { wrapper }) };
}

async function run<T extends { mutate: (input: never) => void }>(hook: { current: T }, input: unknown) {
  act(() => hook.current.mutate(input as never));
  await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
  return toastSuccess.mock.calls.at(-1) as [string, { action?: { onClick: () => void } }];
}

describe("curation hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockResolvedValue({ uuid: "g1", previous: [{ uuid: "r1", genre: "old", undoable: true }] });
  });

  it("aliases a genre", async () => {
    const { result } = setup(useAliasGenre);
    const [message] = await run(result, { uuid: "g1", target: "g2" });
    expect(message).toBe("Genre merged into its alias target");
    expect(fetchMock.mock.calls[0][0]).toBe("genres/g1/alias-of/");
  });

  it("excludes a genre", async () => {
    const { result } = setup(useExcludeGenre);
    const [message] = await run(result, { uuid: "g1", category: "theme" });
    expect(message).toBe("Genre excluded");
  });

  it.each([
    [true, "Also under P", "POST"],
    [false, "Removed from P", "DELETE"],
  ])("secondary parent add=%s", async (add, expected, method) => {
    const { result, queryClient } = setup(useSecondaryParent);
    queryClient.setQueryData(secondaryParentsKey("g1"), [{ uuid: "p0", name: "Q" }]);
    const [message, options] = await run(result, { uuid: "g1", parent: { uuid: "p", name: "P" }, add });
    expect(message).toBe(expected);
    expect(fetchMock.mock.calls[0][3]).toEqual({ method });
    act(() => options.action?.onClick());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][3]).toEqual({ method: add ? "DELETE" : "POST" });
  });

  it("updates the summary optimistically and undoes it", async () => {
    const { result, queryClient } = setup(useUpdateGenreSummary);
    queryClient.setQueryData(genreQueryKeys.reference.overview("g1"), { summary: "old" });
    const [message, options] = await run(result, { uuid: "g1", summary: "new", previous: "old" });
    expect(message).toBe("Summary saved");
    act(() => options.action?.onClick());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][3].body)).toEqual({ summary: "old" });
  });

  it("updates essential tracks optimistically and undoes them", async () => {
    const { result, queryClient } = setup(useEssentialTracks);
    queryClient.setQueryData(genreQueryKeys.reference.overview("g1"), { essentialTracks: [] });
    const track = { uuid: "t1", title: "T" };
    const [message, options] = await run(result, { uuid: "g1", tracks: [track], previous: [] });
    expect(message).toBe("Essential songs updated");
    act(() => options.action?.onClick());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][3].body)).toEqual({ essentialTracks: [] });
  });

  it.each([
    [1, "1 song moved"],
    [2, "2 songs moved"],
  ])("assigns %s recording(s) and undoes the move", async (count, expected) => {
    const { result, queryClient } = setup(() => useAssignRecordingGenre("moved"));
    const prefix = libraryQueryKeys.reference.recordings.all[0];
    queryClient.setQueryData([prefix, "/api", "genre", "old"], { pages: [{ tracks: [{ uuid: "r1" }], total: 2 }] });
    queryClient.setQueryData([prefix, "/api", "genre", "g2"], { pages: [{ tracks: [{ uuid: "r1" }], total: 2 }] });
    const recordings = Array.from({ length: count }, (_, index) => `r${index + 1}`);
    const [message, options] = await run(result, { recordings, genre: "g2" });
    expect(message).toBe(expected);
    act(() => options.action?.onClick());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][3].body)).toEqual({ recordings, genre: "old" });
  });

  it("offers no undo when moved recordings came from several genres", async () => {
    fetchMock.mockResolvedValue({
      previous: [
        { uuid: "r1", genre: "a", undoable: true },
        { uuid: "r2", genre: "b", undoable: true },
      ],
    });
    const { result } = setup(() => useAssignRecordingGenre("moved"));
    const [, options] = await run(result, { recordings: ["r1", "r2"], genre: "g2" });
    expect(options.action).toBeUndefined();
  });

  it("offers no undo when a previous genre cannot be restored", async () => {
    fetchMock.mockResolvedValue({ previous: [{ uuid: "r1", genre: "old", undoable: false }] });
    const { result } = setup(() => useAssignRecordingGenre("moved"));
    const [, options] = await run(result, { recordings: ["r1"], genre: "g2" });
    expect(options.action).toBeUndefined();
  });

  it("removes unlinked recordings from every genre list but leaves moves to invalidation", async () => {
    const prefix = libraryQueryKeys.reference.recordings.all[0];
    const key = [prefix, "/api", "genre", "old"];
    fetchMock.mockImplementation(() => new Promise(() => undefined));

    const unlink = setup(() => useAssignRecordingGenre("unlinked"));
    unlink.queryClient.setQueryData(key, { pages: [{ tracks: [{ uuid: "r1" }, { uuid: "r2" }], total: 2 }] });
    act(() => unlink.result.current.mutate({ recordings: ["r1"], genre: null }));
    await waitFor(() =>
      expect(unlink.queryClient.getQueryData(key)).toEqual({ pages: [{ tracks: [{ uuid: "r2" }], total: 1 }] }),
    );

    const move = setup(() => useAssignRecordingGenre("moved"));
    const original = { pages: [{ tracks: [{ uuid: "r1" }], total: 1 }] };
    move.queryClient.setQueryData(key, original);
    act(() => move.result.current.mutate({ recordings: ["r1"], genre: "g2" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(move.queryClient.getQueryData(key)).toBe(original);
  });

  it("renames a genre optimistically and undoes the name", async () => {
    fetchMock.mockResolvedValue({ uuid: "g1" });
    const { result, queryClient } = setup(useUpdateGenreName);
    queryClient.setQueryData(genreQueryKeys.reference.overview("g1"), { name: "Folk" });
    const [message, options] = await run(result, { uuid: "g1", name: "Folk rock", previous: "Folk" });
    expect(message).toBe("Renamed to Folk rock");
    act(() => options.action?.onClick());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][3].body)).toEqual({ name: "Folk" });
  });

  it("updates a recording video and undoes it", async () => {
    const { result, queryClient } = setup(useUpdateRecordingVideo);
    const prefix = libraryQueryKeys.reference.recordings.all[0];
    queryClient.setQueryData([prefix, "/api", "genre", "g1"], { pages: [{ tracks: [{ uuid: "r1" }, { uuid: "r2" }], total: 2 }] });
    const video = { youtubeVideoId: "abc", youtubeUnplayableReason: null };
    const previous = { youtubeVideoId: null, youtubeUnplayableReason: null };
    const [message, options] = await run(result, { uuid: "r1", video, previous });
    expect(message).toBe("Video updated");
    const cached = queryClient.getQueryData([prefix, "/api", "genre", "g1"]) as { pages: { tracks: { uuid: string; youtubeVideoId?: string }[] }[] };
    expect(cached.pages[0].tracks[0].youtubeVideoId).toBe("abc");
    expect(cached.pages[0].tracks[1].youtubeVideoId).toBeUndefined();
    act(() => options.action?.onClick());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][3].body)).toEqual(previous);
  });
});
