"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { FaTree } from "react-icons/fa";

import { usePopup } from "@contexts/PopupContext";
import { useListFullGenrePlaylists } from "@hooks/useGenrePlaylist";
import { useCreateGenre, useLoadReferenceTreeGenre } from "@hooks/useGenre";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import { CriteriaCreationValues } from "@domain/criteria/form/creation";
import { CriteriaPlaylistSimple } from "@domain/playlist/criteria-playlist/simple";
import { getGenrePlaylistsGroupedByRoot } from "@lib/genre-playlist-helpers";
import GenrePlaylistTree from "./tree/GenrePlaylistTree";
import { RECT_BASE_DIMENSIONS as GENRE_PLAYLIST_TREE_RECT_DIMENSIONS } from "./tree/tree-constants";

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

  const showCreationPopup = useCallback(() => {
    showPopup(
      <GenreCreationPopup
        onSubmit={(values: CriteriaCreationValues) => {
          createGenre(values);
          hidePopup();
        }}
        formErrors={formErrors}
      />
    );
  }, [formErrors, createGenre, hidePopup, showPopup]);

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
      showCreationPopup();
    }
    // Update our ref with current errors
    previousErrorsRef.current = formErrors || [];
  }, [formErrors, showCreationPopup]);

  return (
    <div className="mt-4 flex flex-col h-screen">
      <div className="flex justify-start">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
          onClick={() => {
            loadReferenceTreeGenre();
          }}
          disabled={isLoadingReferenceTreeGenre || isListingGenrePlaylists}
        >
          <FaTree className="w-5 h-5" />
          Load reference tree genre
        </button>
      </div>
      {isLoadingReferenceTreeGenre || isListingGenrePlaylists ? (
        <p>Loading...</p>
      ) : (
        <>
          <div
            className="mt-5 justify-center items-center text-center hover:bg-gray-400 hover:text-gray-800 cursor-pointer"
            style={{
              width: GENRE_PLAYLIST_TREE_RECT_DIMENSIONS.WIDTH + "px",
              height: GENRE_PLAYLIST_TREE_RECT_DIMENSIONS.HEIGHT + "px",
              border: "1px solid black",
            }}
            onClick={() => {
              showCreationPopup();
            }}
          >
            +
          </div>
          <div className="tree-container flex flex-col text-gray-800 w-full overflow-x-auto overflow-y-auto">
            {Object.entries(groupedGenrePlaylistsByRoot).map(([uuid, genrePlaylistTree]) => {
              // Wrap in array to match expected props type
              return (
                <GenrePlaylistTree
                  key={`${uuid}`}
                  genrePlaylistTree={genrePlaylistTree}
                  genrePlaylistGettingAssignedNewParent={genrePlaylistGettingAssignedNewParent}
                  setGenrePlaylistGettingAssignedNewParent={setGenrePlaylistGettingAssignedNewParent}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
