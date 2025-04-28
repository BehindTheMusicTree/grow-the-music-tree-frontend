"use client";

import { useCallback, useEffect, useRef } from "react";

import { GenreGettingAssignedNewParentProvider } from "@contexts/GenreGettingAssignedNewParentContext";
import { useListGenrePlaylists } from "@hooks/useGenrePlaylist";
import { RECT_BASE_DIMENSIONS as GENRE_PLAYLIST_TREE_RECT_DIMENSIONS } from "./tree/tree-constants";
import { useCreateGenre } from "@hooks/useGenre";
import { usePopup } from "@contexts/PopupContext";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import GenrePlaylistTree from "./tree/GenrePlaylistTree";
import { CriteriaCreationValues } from "@domain/criteria/forms/creation";

export default function GenreTree() {
  const { data: genrePlaylists, isLoading } = useListGenrePlaylists();
  const { mutate: createGenre, isPending: isCreatingGenre, formErrors } = useCreateGenre();
  const { showPopup, hidePopup } = usePopup();

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
    <GenreGettingAssignedNewParentProvider>
      <div className="mt-2 flex flex-col">
        <div
          className="mt-5 flex justify-center items-center text-center hover:bg-gray-400 hover:text-gray-800 cursor-pointer"
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
        <div className="flex flex-col text-gray-800">
          {isLoading ? (
            <p>Loading data...</p>
          ) : genrePlaylists?.results ? (
            Object.entries(genrePlaylists.results).map(([uuid, genrePlaylistTree]) => {
              // Wrap in array to match expected props type
              return <GenrePlaylistTree key={`${uuid}`} genrePlaylistTree={[genrePlaylistTree]} />;
            })
          ) : (
            <p>No data found.</p>
          )}
        </div>
      </div>
    </GenreGettingAssignedNewParentProvider>
  );
}
