"use client";

import { useCallback, useEffect, useRef } from "react";

import { usePopup } from "@behindthemusictree/app-kit/popup";
import {
  useCreateGenre,
  useUpdateGenre,
  GenreTreeView,
  CriteriaMinimum,
  YoutubeTrackDetailedSchema,
  makeCriteriaPlaylistDetailedSchema,
} from "@behindthemusictree/app-kit/genre-tree";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import GenreRenamePopup from "@components/ui/popup/child/GenreRenamePopup";
import Page from "@components/ui/Page";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

interface GenreTreePageProps {
  getBackendBaseUrl: () => string;
  title: string;
  readOnly: boolean;
}

export default function GenreTreePage({ getBackendBaseUrl, title, readOnly }: GenreTreePageProps) {
  const { viewMode } = useGenreTreeViewMode();
  const { mutate: createGenre, formErrors } = useCreateGenre("reference", getBackendBaseUrl);
  const { renameGenre, formErrors: renameFormErrors } = useUpdateGenre("reference", getBackendBaseUrl);
  const { showPopup, hidePopup } = usePopup();

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
        viewMode={viewMode}
        readOnly={readOnly}
      />
    </Page>
  );
}
