import { describe, expect, it } from "vitest";
import { RecordingDetailed } from "@behindthemusictree/app-kit/genre-tree";

import { toPlayerTrack } from "@lib/player-track";

const recording = {
  uuid: "recording-1",
  youtubeVideo: { id: "abc123", unplayableReason: null },
  title: "Song",
  artists: [{ name: "Artist" }],
} as unknown as RecordingDetailed;

describe("toPlayerTrack", () => {
  it("maps a playable recording with a null unplayableReason", () => {
    expect(toPlayerTrack(recording)).toEqual({
      id: "recording-1",
      kind: "youtube",
      youtubeVideoId: "abc123",
      title: "Song",
      artists: [{ name: "Artist" }],
      unplayableReason: null,
    });
  });

  it("carries the video's unplayableReason over so the player skips the track", () => {
    expect(
      toPlayerTrack({ ...recording, youtubeVideo: { id: "abc123", unplayableReason: "not_embeddable" } })
        .unplayableReason,
    ).toBe("not_embeddable");
  });

  it("throws on a recording without a YouTube video", () => {
    expect(() => toPlayerTrack({ ...recording, youtubeVideo: null })).toThrow(
      "Recording recording-1 has no YouTube video",
    );
  });
});
