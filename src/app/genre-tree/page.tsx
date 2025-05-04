"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { FaTree } from "react-icons/fa";
import { Plus } from "lucide-react";
import { IconTextButton } from "@components/ui/IconTextButton";

import { usePopup } from "@contexts/PopupContext";
import { useListFullGenrePlaylists } from "@hooks/useGenrePlaylist";
import { useCreateGenre, useLoadReferenceTreeGenre } from "@hooks/useGenre";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { getGenrePlaylistsGroupedByRoot } from "@lib/genre-playlist-helpers";
import GenrePlaylistTreePerRoot from "./tree/GenrePlaylistTreePerRoot";
import { CriteriaMinimum } from "@schemas/domain/criteria/response/minimum";
import { GenreTreeSkeleton } from "./tree/GenreTreeSkeleton";

export default function GenreTree() {
  const { data: genrePlaylists, isPending: isListingGenrePlaylists } = useListFullGenrePlaylists();
  const { mutate: createGenre, formErrors } = useCreateGenre();
  const { mutate: loadReferenceTreeGenre, isPending: isLoadingReferenceTreeGenre } = useLoadReferenceTreeGenre();

  const { showPopup, hidePopup } = usePopup();
  const [genrePlaylistGettingAssignedNewParent, setGenrePlaylistGettingAssignedNewParent] =
    useState<CriteriaPlaylistSimple | null>(null);

  const groupedGenrePlaylistsByRoot = useMemo(
    () =>
      genrePlaylists?.results ? getGenrePlaylistsGroupedByRoot(genrePlaylists.results as CriteriaPlaylistSimple[]) : {},
    [genrePlaylists?.results]
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
          formErrors={formErrors}
        />
      );
    },
    [formErrors, createGenre, hidePopup, showPopup]
  );

  // Use a ref to track if we've already shown the popup for the current errors
  const previousErrorsRef = useRef<typeof formErrors>([]);

  useEffect(() => {
    console.log("formErrors", formErrors);
    // Only show popup if errors exist AND we didn't have errors before (to prevent infinite loop)
    if (
      formErrors &&
      formErrors.length > 0 &&
      (previousErrorsRef.current.length === 0 ||
        JSON.stringify(previousErrorsRef.current) !== JSON.stringify(formErrors))
    ) {
      showCriteriaCreationPopup();
    }
    // Update our ref with current errors
    previousErrorsRef.current = formErrors || [];
  }, [formErrors, showCriteriaCreationPopup]);

  return (
    <div className="mt-4 flex flex-col h-screen">
      <div className="actions-container flex justify-start">
        <div className="flex justify-start">
          <IconTextButton
            icon={Plus}
            text="Add root"
            onClick={() => {
              showCriteriaCreationPopup();
            }}
          />
          <IconTextButton
            icon={FaTree}
            text="Load the reference tree genre"
            className="ml-2"
            onClick={() => {
              loadReferenceTreeGenre();
            }}
            disabled={isLoadingReferenceTreeGenre || isListingGenrePlaylists}
          />
        </div>
      </div>
      {isLoadingReferenceTreeGenre || isListingGenrePlaylists ? (
        <GenreTreeSkeleton />
      ) : (
        <>
          <div className="tree-container flex flex-col p-4 text-gray-800 w-full overflow-x-auto overflow-y-auto relative">
            {Object.entries(groupedGenrePlaylistsByRoot).map(([uuid, genrePlaylistTreePerRoot]) => {
              return (
                <div key={`${uuid}`} className="relative">
                  <div className="tree-root-name-container text-lg absolute top-0 left-0 -z-10 p-4">
                    <div className="text-9xl text-gray-500 font-bold mb-2 text-left">
                      {genrePlaylistTreePerRoot[0].root.name}
                    </div>
                  </div>
                  <GenrePlaylistTreePerRoot
                    genrePlaylistTreePerRoot={genrePlaylistTreePerRoot}
                    genrePlaylistGettingAssignedNewParent={genrePlaylistGettingAssignedNewParent}
                    setGenrePlaylistGettingAssignedNewParent={setGenrePlaylistGettingAssignedNewParent}
                    handleGenreCreationAction={showCriteriaCreationPopup}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
