import { describe, expect, it } from "vitest";
import { extractYoutubeId } from "@utils/youtubeId";

describe("extractYoutubeId", () => {
  it.each([
    ["dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=3", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=x", "dQw4w9WgXcQ"],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["  https://music.youtube.com/watch?v=dQw4w9WgXcQ ", "dQw4w9WgXcQ"],
  ])("extracts from %s", (input, expected) => {
    expect(extractYoutubeId(input)).toBe(expected);
  });

  it.each(["", "short", "https://example.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/watch", "not a url at all"])(
    "returns null for %j",
    (input) => {
      expect(extractYoutubeId(input)).toBeNull();
    },
  );
});
