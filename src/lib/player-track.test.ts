import { describe, expect, it } from "vitest";
import { SongDetailed } from "@behindthemusictree/app-kit/genre-tree";

import { toPlayerTrack } from "@lib/player-track";

const song = {
  uuid: "song-1",
  youtubeVideo: { id: "abc123", unplayableReason: null },
  title: "Song",
  artists: [{ uuid: "artist-1", name: "Artist" }],
} as unknown as SongDetailed;

describe("toPlayerTrack", () => {
  it("maps a playable song with a null unplayableReason", () => {
    expect(toPlayerTrack(song)).toEqual({
      id: "song-1",
      kind: "youtube",
      youtubeVideoId: "abc123",
      title: "Song",
      artists: [{ uuid: "artist-1", name: "Artist" }],
      unplayableReason: null,
    });
  });

  it("carries the video's unplayableReason over so the player skips the track", () => {
    expect(
      toPlayerTrack({ ...song, youtubeVideo: { id: "abc123", unplayableReason: "not_embeddable" } })
        .unplayableReason,
    ).toBe("not_embeddable");
  });

  it("throws on a song without a YouTube video", () => {
    expect(() => toPlayerTrack({ ...song, youtubeVideo: null })).toThrow(
      "Song song-1 has no YouTube video",
    );
  });
});
