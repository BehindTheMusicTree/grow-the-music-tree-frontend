import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import GenreDangerZone from "./GenreDangerZone";
import GenreNameEditor from "./GenreNameEditor";
import GenreParentsEditor from "./GenreParentsEditor";
import GenreSummaryEditor from "./GenreSummaryEditor";
import RecordingRowActions from "./RecordingRowActions";
import { MoveRecordingsPopup, UnlinkRecordingsPopup } from "./RecordingPopups";

const m = vi.hoisted(() => ({
  assign: vi.fn(),
  alias: vi.fn(),
  exclude: vi.fn(),
  del: vi.fn(),
  name: vi.fn(),
  parent: vi.fn(),
  secondary: vi.fn(),
  summary: vi.fn(),
  essential: vi.fn(),
  setGenre: vi.fn(),
  overview: { current: undefined as unknown },
  aliasPreview: { current: undefined as unknown },
  dialog: { current: null as ((close: () => void) => ReactNode) | null },
}));

vi.mock("./GenreCurationProvider", () => ({
  useGenreCuration: () => ({
    genre: { uuid: "g1", name: "Folk" },
    setGenre: m.setGenre,
    openDialog: (renderDialog: (close: () => void) => ReactNode) => {
      m.dialog.current = renderDialog;
    },
  }),
}));
vi.mock("@tanstack/react-query", () => ({ skipToken: Symbol("skip"), useQuery: () => ({ data: m.overview.current }) }));
vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  genreQueryKeys: { reference: { overview: (uuid: string) => ["overview", uuid] } },
  useDeleteGenre: () => ({ mutate: m.del, isPending: false, formErrors: [{ message: "nope" }] }),
}));
vi.mock("@behindthemusictree/app-kit/popup", () => ({
  BasePopup: ({ title, children, onOk, okButtonText, okButtonDisabled }: {
    title: string;
    children: ReactNode;
    onOk: () => void;
    okButtonText: string;
    okButtonDisabled?: boolean;
  }) => (
    <div role="dialog" aria-label={title}>
      {children}
      <button type="button" onClick={onOk} disabled={okButtonDisabled}>
        {okButtonText}
      </button>
    </div>
  ),
}));
vi.mock("@components/features/curation/GenrePicker", () => ({
  default: ({ label, onChange }: { label: string; onChange: (id: string, name: string | null, uuid: string | null) => void }) => (
    <button type="button" onClick={() => onChange("", "Target", "t1")}>
      {label}
    </button>
  ),
}));
vi.mock("@hooks/curation/useAssignRecordingGenre", () => ({ useAssignRecordingGenre: () => ({ mutate: m.assign, isPending: false }) }));
vi.mock("@hooks/curation/useAliasGenre", () => ({
  useAliasGenre: () => ({ mutate: m.alias, isPending: false }),
  useAliasPreview: () => ({ data: m.aliasPreview.current }),
}));
vi.mock("@hooks/curation/useExcludeGenre", () => ({ useExcludeGenre: () => ({ mutate: m.exclude, isPending: false }) }));
vi.mock("@hooks/curation/useEssentialTracks", () => ({ useEssentialTracks: () => ({ mutate: m.essential, isPending: false }) }));
vi.mock("@hooks/curation/useUpdateGenreName", () => ({ useUpdateGenreName: () => ({ mutate: m.name }) }));
vi.mock("@hooks/curation/useUpdateGenreParent", () => ({ useUpdateGenreParent: () => ({ mutate: m.parent }) }));
vi.mock("@hooks/curation/useUpdateGenreSummary", () => ({ useUpdateGenreSummary: () => ({ mutate: m.summary }) }));
vi.mock("@hooks/curation/useSecondaryParent", () => ({
  useSecondaryParent: () => ({ mutate: m.secondary }),
  useSecondaryParents: () => ({ data: [{ uuid: "s1", name: "Blues" }] }),
}));
vi.mock("./RecordingVideoDialog", () => ({ default: () => null }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api" }));

function openedDialog() {
  const close = vi.fn();
  render(<>{m.dialog.current?.(close)}</>);
  return close;
}

describe("genre curation actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.dialog.current = null;
    m.overview.current = undefined;
    m.aliasPreview.current = undefined;
  });
  afterEach(cleanup);

  it("moves recordings once a target is picked", () => {
    const onClose = vi.fn();
    const onDone = vi.fn();
    render(<MoveRecordingsPopup recordings={["r1", "r2"]} onClose={onClose} onDone={onDone} />);

    expect(screen.getByRole("button", { name: "Move" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Target genre" }));
    fireEvent.click(screen.getByRole("button", { name: "Move" }));

    const [input, options] = m.assign.mock.calls[0];
    expect(input).toEqual({ recordings: ["r1", "r2"], genre: "t1" });
    expect(onDone).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    options.onSuccess();
    expect(onDone).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("unlinks recordings", () => {
    const onClose = vi.fn();
    render(<UnlinkRecordingsPopup recordings={["r1"]} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Unlink" }));

    const [input, options] = m.assign.mock.calls[0];
    expect(input).toEqual({ recordings: ["r1"], genre: null });
    expect(onClose).not.toHaveBeenCalled();

    options.onSuccess();
    expect(onClose).toHaveBeenCalled();
  });

  it("merges a genre into its alias target after previewing", () => {
    m.aliasPreview.current = { recordings: 1, essentialTracks: 2, children: 3 };
    const onAliased = vi.fn();
    render(<GenreDangerZone genre={{ uuid: "g1", name: "Folk" }} onAliased={onAliased} />);
    fireEvent.click(screen.getByRole("button", { name: "Alias of…" }));
    const close = openedDialog();

    fireEvent.click(screen.getByRole("button", { name: "Target genre" }));
    fireEvent.click(screen.getByRole("button", { name: "Merge" }));

    const [input, options] = m.alias.mock.calls[0];
    expect(input).toEqual({ uuid: "g1", target: "t1" });
    expect(close).not.toHaveBeenCalled();

    options.onSuccess();
    expect(close).toHaveBeenCalled();
    expect(onAliased).toHaveBeenCalledWith("t1");
  });

  it("excludes a genre with the chosen category", () => {
    const onRemoved = vi.fn();
    render(<GenreDangerZone genre={{ uuid: "g1", name: "Folk" }} onRemoved={onRemoved} />);
    fireEvent.click(screen.getByRole("button", { name: "Exclude…" }));
    const close = openedDialog();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "duplicate" } });
    fireEvent.click(screen.getByRole("button", { name: "Exclude" }));

    const [input, options] = m.exclude.mock.calls[0];
    expect(input).toEqual({ uuid: "g1", category: "duplicate" });
    expect(onRemoved).not.toHaveBeenCalled();

    options.onSuccess();
    expect(close).toHaveBeenCalled();
    expect(onRemoved).toHaveBeenCalled();
  });

  it("deletes a genre and shows form errors", () => {
    const onRemoved = vi.fn();
    render(<GenreDangerZone genre={{ uuid: "g1", name: "Folk" }} onRemoved={onRemoved} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const close = openedDialog();

    expect(screen.getByRole("alert")).toHaveTextContent("nope");
    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[1]);

    const [input, options] = m.del.mock.calls[0];
    expect(input).toEqual({ uuid: "g1" });
    expect(onRemoved).not.toHaveBeenCalled();

    options.onSuccess();
    expect(close).toHaveBeenCalled();
    expect(onRemoved).toHaveBeenCalled();
  });

  it("renames on Enter and restores on Escape", () => {
    render(<GenreNameEditor genre={{ uuid: "g1", name: "Folk" }} />);
    const input = screen.getByRole("textbox", { name: "Genre name" });

    fireEvent.change(input, { target: { value: "Folk rock" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(m.name).toHaveBeenCalledWith({ uuid: "g1", name: "Folk rock", previous: "Folk" });

    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("Folk");
  });

  it("saves the summary on blur only when changed", () => {
    render(<GenreSummaryEditor overview={{ uuid: "g1", name: "Folk", summary: "old" } as never} />);
    const area = screen.getByRole("textbox", { name: "Genre summary" });

    fireEvent.blur(area);
    expect(m.summary).not.toHaveBeenCalled();

    fireEvent.change(area, { target: { value: "new" } });
    fireEvent.blur(area);
    expect(m.summary).toHaveBeenCalledWith({ uuid: "g1", summary: "new", previous: "old" });
    expect(m.setGenre).toHaveBeenCalledWith({ uuid: "g1", name: "Folk" });
  });

  it("edits main and secondary parents", () => {
    render(<GenreParentsEditor genre={{ uuid: "g1", parent: { uuid: "p1", name: "Roots" } }} />);

    fireEvent.click(screen.getByRole("button", { name: "Main parent" }));
    expect(m.parent).toHaveBeenCalledWith({
      uuid: "g1",
      parent: { uuid: "t1", name: "Target" },
      previous: { uuid: "p1", name: "Roots" },
    });

    fireEvent.click(screen.getByRole("button", { name: "+ Add secondary parent" }));
    expect(m.secondary).toHaveBeenCalledWith({ uuid: "g1", parent: { uuid: "t1", name: "Target" }, add: true });

    fireEvent.click(screen.getByRole("button", { name: "Remove secondary parent Blues" }));
    expect(m.secondary).toHaveBeenCalledWith({ uuid: "g1", parent: { uuid: "s1", name: "Blues" }, add: false });
  });

  it("toggles essential tracks, unlinks and opens dialogs from a row", () => {
    m.overview.current = { essentialTracks: [{ uuid: "r2", title: "Other" }] };
    const recording = { uuid: "r1", title: "Song", artists: [] } as never;
    render(<RecordingRowActions recording={recording} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark Song essential" }));
    expect(m.essential).toHaveBeenCalledWith({
      uuid: "g1",
      previous: [{ uuid: "r2", title: "Other" }],
      tracks: [{ uuid: "r2", title: "Other" }, { uuid: "r1", title: "Song", artists: [] }],
    });

    fireEvent.click(screen.getByRole("button", { name: "Unlink Song from this genre" }));
    expect(m.assign).not.toHaveBeenCalled();
    const close = openedDialog();
    fireEvent.click(screen.getByRole("button", { name: "Unlink" }));
    expect(m.assign.mock.calls[0][0]).toEqual({ recordings: ["r1"], genre: null });
    expect(close).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Move Song to another genre" }));
    expect(m.dialog.current).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Edit video of Song" }));
  });

  it("removes an already essential track", () => {
    m.overview.current = { essentialTracks: [{ uuid: "r1", title: "Song" }] };
    render(<RecordingRowActions recording={{ uuid: "r1", title: "Song", artists: [] } as never} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove Song from essential tracks" }));

    expect(m.essential).toHaveBeenCalledWith({ uuid: "g1", previous: [{ uuid: "r1", title: "Song" }], tracks: [] });
  });
});
