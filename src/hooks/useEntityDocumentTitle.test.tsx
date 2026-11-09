import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { APP_NAME } from "@lib/constants/app";
import { useEntityDocumentTitle } from "./useEntityDocumentTitle";

let artist: { status: string; artist?: { name: string } } = { status: "idle" };
let song: { status: string; song?: { title: string; artists?: { name: string }[] } } = { status: "idle" };

vi.mock("@behindthemusictree/app-kit/genre-tree", () => ({
  useArtist: () => artist,
  useSong: () => song,
}));

const settle = () => act(async () => {});

describe("useEntityDocumentTitle", () => {
  beforeEach(() => {
    document.title = APP_NAME;
    artist = { status: "success", artist: { name: "Radiohead" } };
    song = { status: "idle" };
  });

  afterEach(cleanup);

  it("titles the tab after the artist", () => {
    renderHook(() => useEntityDocumentTitle("a1", null));
    expect(document.title).toBe("Radiohead");
  });

  it("re-applies the title when Next overwrites it", async () => {
    renderHook(() => useEntityDocumentTitle("a1", null));
    document.title = APP_NAME;
    await settle();
    expect(document.title).toBe("Radiohead");
  });

  it("restores the app name on unmount", () => {
    const { unmount } = renderHook(() => useEntityDocumentTitle("a1", null));
    unmount();
    expect(document.title).toBe(APP_NAME);
  });

  it("lets the song win over the artist without looping", async () => {
    song = { status: "success", song: { title: "Creep", artists: [{ name: "Radiohead" }] } };
    renderHook(() => useEntityDocumentTitle("a1", "s1"));
    await settle();
    expect(document.title).toBe("Creep — Radiohead");
  });
});
