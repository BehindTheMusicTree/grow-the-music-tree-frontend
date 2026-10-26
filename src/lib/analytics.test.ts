import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@lib/analytics";

describe("trackEvent", () => {
  afterEach(() => {
    delete window.umami;
  });

  it("does nothing when the Umami script is not loaded", () => {
    expect(() => trackEvent("genre_select")).not.toThrow();
  });

  it("forwards the event name and data to Umami", () => {
    const track = vi.fn();
    window.umami = { track };
    trackEvent("track_play", { source: "genre" });
    expect(track).toHaveBeenCalledWith("track_play", { source: "genre" });
  });
});
