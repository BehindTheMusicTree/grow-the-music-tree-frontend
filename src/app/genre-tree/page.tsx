"use client";

import { GenreGettingAssignedNewParentProvider } from "@contexts/GenreGettingAssignedNewParentContext";
import { useListGenrePlaylists } from "@hooks/useGenrePlaylist";
import { RECT_BASE_DIMENSIONS as GENRE_PLAYLIST_TREE_RECT_DIMENSIONS } from "./tree/tree-constants";
import { useCreateGenre } from "@hooks/useGenre";
import { usePopup } from "@contexts/PopupContext";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import GenrePlaylistTree from "./tree/GenrePlaylistTree";
import { GenreCreationValues } from "@schemas/domain/genre/form";

export default function GenreTree() {
  const { data: genrePlaylists, isLoading } = useListGenrePlaylists();
  const { mutate: createGenre, isPending: isCreatingGenre, formErrors } = useCreateGenre();
  const { showPopup } = usePopup();

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
            showPopup(
              <GenreCreationPopup
                onSubmit={(values: GenreCreationValues) => {
                  createGenre(values);
                }}
              />
            );
          }}
        >
          +
        </div>
        <div className="flex flex-col text-gray-800">
          {isLoading ? (
            <p>Loading data...</p>
          ) : genrePlaylists?.results ? (
            Object.entries(genrePlaylists.results).map(([uuid, genrePlaylistTree]) => {
              return <GenrePlaylistTree key={`${uuid}`} genrePlaylistTree={genrePlaylistTree} />;
            })
          ) : (
            <p>No data found.</p>
          )}
        </div>
      </div>
    </GenreGettingAssignedNewParentProvider>
  );
}
