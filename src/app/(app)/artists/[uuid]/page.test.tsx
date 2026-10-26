import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ArtistPage, { generateMetadata } from "./page";

const fetchArtistMock = vi.fn();
const notFoundMock = vi.fn<() => never>(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@lib/artist", () => ({ fetchArtist: (uuid: string) => fetchArtistMock(uuid) }));
vi.mock("next/navigation", () => ({ notFound: () => notFoundMock() }));
vi.mock("@components/features/artist/ArtistSongs", () => ({ default: () => <p>Tracks list</p> }));

const UUID = "11111111-1111-1111-1111-111111111111";
const params = Promise.resolve({ uuid: UUID });

const artist = {
  uuid: UUID,
  name: "Band",
  musicbrainzArtistId: "22222222-2222-2222-2222-222222222222",
  type: "group",
  country: "GB",
  beginYear: 1994,
  endYear: null,
  ended: false,
  links: [{ kind: "spotify", url: "https://open.spotify.com/artist/x" }],
  members: [],
  memberOf: [],
  albums: [],
  tracksCount: 3,
};

describe("ArtistPage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the artist", async () => {
    fetchArtistMock.mockResolvedValue(artist);
    render(await ArtistPage({ params }));

    expect(fetchArtistMock).toHaveBeenCalledWith(UUID);
    expect(screen.getByRole("heading", { level: 1, name: "Band" })).toBeInTheDocument();
    expect(screen.getByText("Group · United Kingdom · 1994–present")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Spotify" })).toHaveAttribute("href", artist.links[0].url);
    expect(screen.getByRole("link", { name: "MusicBrainz" })).toHaveAttribute(
      "href",
      `https://musicbrainz.org/artist/${artist.musicbrainzArtistId}`,
    );
    expect(screen.getByText("Tracks list")).toBeInTheDocument();
  });

  it("404s on an unknown artist", async () => {
    fetchArtistMock.mockResolvedValue(null);

    await expect(ArtistPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(generateMetadata({ params })).resolves.toEqual({ title: "Artist not found" });
  });

  it("titles the page with the artist name", async () => {
    fetchArtistMock.mockResolvedValue(artist);
    await expect(generateMetadata({ params })).resolves.toEqual({ title: "Band" });
  });
});
