"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";

import { usePopup } from "@behindthemusictree/app-kit/popup";
import {
  useCreateGenre,
  useUpdateGenre,
  useListFullGenrePlaylists,
  CriteriaMinimum,
  CriteriaPlaylistSimple,
  YoutubeTrackDetailedSchema,
  makeCriteriaPlaylistDetailedSchema,
  hasMainstreamPopRoot,
  GenreTreeViewSkeleton,
} from "@behindthemusictree/app-kit/genre-tree";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import GenreRenamePopup from "@components/ui/popup/child/GenreRenamePopup";
import Page from "@components/ui/Page";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

// Reads resolvedViewMode from context (rather than receiving it as a prop) because next/dynamic's
// `loading` render prop isn't passed the wrapped component's own props — this renders before
// GenreTreeView ever mounts, so it must source the view mode independently. Uses `resolvedViewMode`
// (not the raw `viewMode`) so it matches the skeleton shape GenreTreeView itself will show, since
// GenreTreePage can override "pop-core" to "stacked" while data is still loading.
//
// `ssr:false` on next/dynamic below only skips the wrapped component itself — Next.js still
// invokes this `loading` fallback on the server. GenreTreeWheelSkeleton (used by
// GenreTreeViewSkeleton for "wheel"/"pop-core") rounds its SVG coordinates well below float
// precision noise, so it renders byte-identically on server and client and can safely SSR.
function GenreTreeViewLoadingFallback() {
  const { resolvedViewMode } = useGenreTreeViewMode();

  return <GenreTreeViewSkeleton viewMode={resolvedViewMode} />;
}

const GenreTreeView = dynamic(
  () => import("@behindthemusictree/app-kit/genre-tree").then((mod) => mod.GenreTreeView),
  { ssr: false, loading: () => <GenreTreeViewLoadingFallback /> },
);

interface GenreTreePageProps {
  getBackendBaseUrl: () => string;
  title: string;
  readOnly: boolean;
}

export default function GenreTreePage({ getBackendBaseUrl, title, readOnly }: GenreTreePageProps) {
  const { viewMode, setCanShowPopCore, setResolvedViewMode } = useGenreTreeViewMode();
  const { mutate: createGenre, formErrors } = useCreateGenre("reference", getBackendBaseUrl);
  const { renameGenre, formErrors: renameFormErrors } = useUpdateGenre("reference", getBackendBaseUrl);
  const { showPopup, hidePopup } = usePopup();

  // Shares the react-query cache with GenreTreeView's internal fetch (same queryKey), so this
  // doesn't trigger an extra network request. Used only to compute whether the "pop-core" view
  // mode is available, so AppHeader can grey out its toggle button accordingly.
  const { data: genrePlaylists, isLoading: isLoadingGenrePlaylists } = useListFullGenrePlaylists(
    "reference",
    getBackendBaseUrl,
  );

  const canShowPopCore = useMemo(
    () =>
      hasMainstreamPopRoot(
        ((genrePlaylists?.results ?? []) as CriteriaPlaylistSimple[]).map((genrePlaylist) => ({
          id: genrePlaylist.uuid,
          parentId: genrePlaylist.parent?.uuid ?? null,
          name: genrePlaylist.name,
          itemCount: genrePlaylist.tracksCount,
        })),
      ),
    [genrePlaylists?.results],
  );

  useEffect(() => {
    setCanShowPopCore(canShowPopCore);
  }, [canShowPopCore, setCanShowPopCore]);

  // While the data is still loading, keep "pop-core" as-is so GenreTreeView shows its radial
  // wheel skeleton instead of the stacked/linear one; only fall back to "stacked" once we've
  // actually confirmed the loaded tree has no "Mainstream Pop" root.
  const effectiveViewMode =
    viewMode === "pop-core" && !canShowPopCore && !isLoadingGenrePlaylists ? "stacked" : viewMode;

  useEffect(() => {
    setResolvedViewMode(effectiveViewMode);
  }, [effectiveViewMode, setResolvedViewMode]);

  const showCriteriaCreationPopup = useCallback(
    (parent: CriteriaMinimum | null = null) => {
      showPopup(
        <GenreCreationPopup
          parent={parent}
          onSubmit={({ name, parent }: { name: string; parent?: string }) => {
            createGenre({ name, parent });
            hidePopup();
          }}
          onClose={hidePopup}
          formErrors={formErrors}
        />,
      );
    },
    [formErrors, createGenre, hidePopup, showPopup],
  );

  const showGenreRenamePopup = useCallback(
    (genre: CriteriaMinimum) => {
      showPopup(
        <GenreRenamePopup
          genre={genre}
          onSubmit={({ name }: { name: string }) => {
            renameGenre(genre.uuid, name);
            hidePopup();
          }}
          onClose={hidePopup}
          formErrors={renameFormErrors}
        />,
      );
    },
    [renameFormErrors, renameGenre, hidePopup, showPopup],
  );

  const previousErrorsRef = useRef<typeof formErrors>([]);

  useEffect(() => {
    if (
      formErrors &&
      formErrors.length > 0 &&
      (previousErrorsRef.current.length === 0 ||
        JSON.stringify(previousErrorsRef.current) !== JSON.stringify(formErrors))
    ) {
      showCriteriaCreationPopup();
    }
    previousErrorsRef.current = formErrors || [];
  }, [formErrors, showCriteriaCreationPopup]);

  return (
    <Page title={title} visuallyHiddenTitle dataPage={readOnly ? "prototype-reference-genre-tree" : "reference-genre-tree"}>
      <GenreTreeView
        scope="reference"
        handleGenreCreationAction={showCriteriaCreationPopup}
        handleGenreRenameAction={showGenreRenamePopup}
        getBackendBaseUrl={getBackendBaseUrl}
        criteriaPlaylistDetailedSchema={makeCriteriaPlaylistDetailedSchema(YoutubeTrackDetailedSchema)}
        viewMode={effectiveViewMode}
        readOnly={readOnly}
      />
    </Page>
  );
}
