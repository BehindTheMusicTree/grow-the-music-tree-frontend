import { describe, expect, it } from "vitest";
import { YoutubeTrackDetailed } from "@behindthemusictree/app-kit/genre-tree";

import { toPlayerTrack } from "@lib/player-track";

const track = {
  uuid: "track-1",
  youtubeVideoId: "abc123",
  title: "Song",
  artists: [{ name: "Artist" }],
  youtubeUnplayableReason: null,
} as unknown as YoutubeTrackDetailed;

describe("toPlayerTrack", () => {
  it("maps a playable track with a null unplayableReason", () => {
    expect(toPlayerTrack(track)).toEqual({
      id: "track-1",
      kind: "youtube",
      youtubeVideoId: "abc123",
      title: "Song",
      artists: [{ name: "Artist" }],
      unplayableReason: null,
    });
  });

  it("carries youtubeUnplayableReason over so the player skips the track", () => {
    expect(toPlayerTrack({ ...track, youtubeUnplayableReason: "not_embeddable" }).unplayableReason).toBe(
      "not_embeddable",
    );
  });
});
