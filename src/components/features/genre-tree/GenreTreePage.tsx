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
import { useIsAdmin } from "@hooks/useIsAdmin";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

// Reads viewMode from context (rather than receiving it as a prop) because next/dynamic's
// `loading` render prop isn't passed the wrapped component's own props — this renders before
// GenreTreeView ever mounts, so it must source the view mode independently.
//
// `ssr:false` on next/dynamic below only skips the wrapped component itself — Next.js still
// invokes this `loading` fallback on the server. GenreTreeWheelSkeleton (used by
// GenreTreeViewSkeleton for "wheel"/"pop-core") rounds its SVG coordinates well below float
// precision noise, so it renders byte-identically on server and client and can safely SSR.
function GenreTreeViewLoadingFallback() {
  const { viewMode } = useGenreTreeViewMode();

  return (
    <div className="mt-4 flex h-full flex-col">
      <div className="actions-container flex justify-start">
        <div className="flex justify-start" />
      </div>
      <GenreTreeViewSkeleton viewMode={viewMode} />
    </div>
  );
}

const GenreTreeView = dynamic(
  () => import("@behindthemusictree/app-kit/genre-tree").then((mod) => mod.GenreTreeView),
  { ssr: false, loading: () => <GenreTreeViewLoadingFallback /> },
);

export default function GenreTreePage() {
  const getBackendBaseUrl = getGrowBackendBaseUrl;
  const { viewMode, setCanShowPopCore } = useGenreTreeViewMode();
  const isAdmin = useIsAdmin();
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

  if (viewMode === "pop-core" && !isLoadingGenrePlaylists && !canShowPopCore) {
    throw new Error('Cannot show "pop-core" view: the loaded genre tree has no "Mainstream Pop" root');
  }

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
    <Page title="Genre Tree" visuallyHiddenTitle dataPage="genre-tree">
      <GenreTreeView
        scope="reference"
        handleGenreCreationAction={showCriteriaCreationPopup}
        handleGenreRenameAction={showGenreRenamePopup}
        getBackendBaseUrl={getBackendBaseUrl}
        criteriaPlaylistDetailedSchema={makeCriteriaPlaylistDetailedSchema(YoutubeTrackDetailedSchema)}
        viewMode={viewMode}
        readOnly={!isAdmin}
      />
    </Page>
  );
}
