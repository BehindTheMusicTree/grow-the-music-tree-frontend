"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { FaTree } from "react-icons/fa";
import { Plus } from "lucide-react";
import { IconTextButton } from "@components/ui/IconTextButton";

import { usePopup } from "@contexts/PopupContext";
import { useListFullGenrePlaylists } from "@hooks/useGenrePlaylist";
import { useCreateGenre, useLoadReferenceTreeGenre } from "@hooks/useGenre";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { getGenrePlaylistsGroupedByRoot } from "@lib/genre-playlist-helpers";
import { CriteriaMinimum } from "@schemas/domain/criteria/response/minimum";

import { GenreTreeView } from "./GenreTreeView";

export default function GenreTree() {
  const { data: genrePlaylists, isPending: isListingGenrePlaylists } = useListFullGenrePlaylists("me");
  const { mutate: createGenre, formErrors } = useCreateGenre("me");
  const { mutate: loadReferenceTreeGenre, isPending: isLoadingReferenceTreeGenre } = useLoadReferenceTreeGenre("me");

  const { showPopup, hidePopup } = usePopup();

  const groupedGenrePlaylistsByRoot = useMemo(
    () =>
      genrePlaylists?.results ? getGenrePlaylistsGroupedByRoot(genrePlaylists.results as CriteriaPlaylistSimple[]) : {},
    [genrePlaylists?.results],
  );

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
    <GenreTreeView
      groupedGenrePlaylistsByRoot={groupedGenrePlaylistsByRoot}
      isLoading={isLoadingReferenceTreeGenre || isListingGenrePlaylists}
      handleGenreCreationAction={showCriteriaCreationPopup}
      actions={
        <>
          <IconTextButton icon={Plus} text="Add root" onClick={() => showCriteriaCreationPopup()} />
          <IconTextButton
            icon={FaTree}
            text="Load the reference tree genre"
            className="ml-2"
            onClick={() => loadReferenceTreeGenre()}
            disabled={isLoadingReferenceTreeGenre || isListingGenrePlaylists}
          />
        </>
      }
    />
  );
}
