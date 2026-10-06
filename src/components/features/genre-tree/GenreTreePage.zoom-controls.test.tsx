import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEffect } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import Providers from "@app/providers";
import GenreTreePage from "./GenreTreePage";
import { GenreTreeViewModeProvider, useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";
import type { GenreTreeViewMode } from "@behindthemusictree/app-kit/genre-tree";

vi.mock("@hooks/useIsAdmin", () => ({ useIsAdmin: () => false }));

vi.mock("@lib/site-urls", () => ({
  getGrowBackendBaseUrl: () => "/api/grow-proxy",
}));

const POP_UUID = "00000000-0000-4000-8000-000000000001";
const DANCE_POP_UUID = "00000000-0000-4000-8000-000000000002";

function makeGenrePlaylist(uuid: string, name: string, parent: { uuid: string; name: string } | null) {
  return {
    uuid,
    name,
    parent,
    root: parent ?? { uuid, name },
    tracksCount: 1,
    isUnacceptedRoot: false,
    criteria: { uuid: uuid.replace(/.$/, "f"), name },
    createdOn: "2026-01-01T00:00:00.000Z",
    updatedOn: null,
  };
}

const genrePlaylists = [
  makeGenrePlaylist(POP_UUID, "Mainstream Pop", null),
  makeGenrePlaylist(DANCE_POP_UUID, "Dance Pop", { uuid: POP_UUID, name: "Mainstream Pop" }),
];

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

function ForceViewMode({ viewMode }: { viewMode: GenreTreeViewMode }) {
  const { setViewMode } = useGenreTreeViewMode();
  useEffect(() => {
    setViewMode(viewMode);
  }, [setViewMode, viewMode]);
  return null;
}

function renderGenreTreePage(viewMode: GenreTreeViewMode) {
  return render(
    <Providers>
      <GenreTreeViewModeProvider>
        <ForceViewMode viewMode={viewMode} />
        <GenreTreePage />
      </GenreTreeViewModeProvider>
    </Providers>,
  );
}

describe("GenreTreePage zoom controls", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("genre-playlists")) {
          return jsonResponse(genrePlaylists);
        }
        return jsonResponse({});
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("floats the pop-core zoom controls in the bottom-right wrapper, out of the actions row", async () => {
    renderGenreTreePage("pop-core");

    // The lazily imported wheel can take over findBy*'s 1 s default to mount when the full suite runs in parallel.
    for (const name of ["Zoom in", "Zoom out", "Fit to frame"]) {
      const button = await screen.findByRole("button", { name }, { timeout: 5000 });
      expect(button.closest(".gtv-wheel-floating-controls")).not.toBeNull();
      expect(button.closest(".actions-container")).toBeNull();
    }
  });

  it("renders no zoom controls in the outline view", async () => {
    renderGenreTreePage("outline");

    expect(await screen.findByText("Mainstream Pop")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zoom in" })).not.toBeInTheDocument();
  });
});
