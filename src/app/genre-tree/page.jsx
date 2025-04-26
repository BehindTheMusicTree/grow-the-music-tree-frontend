"use client";

import { GenreGettingAssignedNewParentProvider } from "@contexts/GenreGettingAssignedNewParentContext";
import { useListGenrePlaylists } from "@hooks/useGenrePlaylist";
import { RECT_BASE_DIMENSIONS as GENRE_PLAYLIST_TREE_RECT_DIMENSIONS } from "./tree/tree-constants";
import { useGenreCreation } from "@hooks/useGenreCreation";
import GenrePlaylistsTree from "./tree/GenrePlaylistsTree";

export default function GenreTree() {
  const { groupedGenrePlaylists, loading } = useListGenrePlaylists();
  const { showCreationPopup, GenreCreationComponent } = useGenreCreation();

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
          onClick={() => showCreationPopup()}
        >
          +
        </div>
        <div className="flex flex-col text-gray-800">
          {loading ? (
            <p>Loading data...</p>
          ) : groupedGenrePlaylists ? (
            Object.entries(groupedGenrePlaylists).map(([uuid, genrePlaylistsTree]) => {
              return (
                <GenrePlaylistsTree
                  key={`${uuid}`}
                  genrePlaylistsTree={genrePlaylistsTree}
                  handleGenreAddAction={() => showCreationPopup()}
                />
              );
            })
          ) : (
            <p>No data found.</p>
          )}
        </div>
        <GenreCreationComponent />
      </div>
    </GenreGettingAssignedNewParentProvider>
  );
}
