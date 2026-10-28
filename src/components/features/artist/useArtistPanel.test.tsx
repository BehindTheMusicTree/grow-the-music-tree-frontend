import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { useArtistPanel } from "./useArtistPanel";

type ArtistResult = { status: string; artist?: unknown };
const useArtistMock = vi.fn<(uuid: string | null) => ArtistResult>();

vi.mock("@hooks/useArtist", () => ({ useArtist: (uuid: string | null) => useArtistMock(uuid) }));
vi.mock("./ArtistSongs", () => ({ default: () => <p>Songs list</p> }));

const UUID = "11111111-1111-1111-1111-111111111111";
const artist = {
  uuid: UUID,
  name: "Band",
  musicbrainzArtistId: "22222222-2222-2222-2222-222222222222",
  type: "group",
  country: "GB",
  beginYear: 1994,
  endYear: null,
  ended: false,
  links: [],
  members: [],
  memberOf: [],
  albums: [{ uuid: "a1", name: "First", year: "1995", primaryType: "album", secondaryTypes: [] }],
  tracksCount: 3,
};

function Harness({ uuid }: { uuid: string | null }) {
  const panel = useArtistPanel({ uuid, expanded: false, onExpandedChange: vi.fn(), collapsed: false, onClose: vi.fn() });
  if (!panel) return <p>No panel</p>;
  return (
    <section aria-label={panel.title}>
      {panel.content}
      {"extraContent" in panel && <aside aria-label="Extra">{panel.extraContent}</aside>}
    </section>
  );
}

describe("useArtistPanel", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    document.title = "";
  });

  it("returns no panel without an artist", () => {
    useArtistMock.mockReturnValue({ status: "idle" });
    render(<Harness uuid={null} />);

    expect(screen.getByText("No panel")).toBeInTheDocument();
  });

  it("shows a placeholder while loading", () => {
    useArtistMock.mockReturnValue({ status: "loading" });
    render(<Harness uuid={UUID} />);

    expect(screen.getByRole("region", { name: "Artist" })).toBeInTheDocument();
  });

  it("says the artist does not exist", () => {
    useArtistMock.mockReturnValue({ status: "not-found" });
    render(<Harness uuid="nope" />);

    expect(screen.getByRole("region", { name: "Artist not found" })).toHaveTextContent("This artist does not exist.");
  });

  it("shows the artist with the discography as extra content and sets the document title", () => {
    useArtistMock.mockReturnValue({ status: "success", artist });
    render(<Harness uuid={UUID} />);

    const region = screen.getByRole("region", { name: "Band" });
    expect(region).toHaveTextContent("Group · United Kingdom · 1994–present");
    expect(region).toHaveTextContent("Songs list");
    expect(screen.getByRole("complementary", { name: "Extra" })).toHaveTextContent("First");
    expect(document.title).toBe("Band");
  });
});
