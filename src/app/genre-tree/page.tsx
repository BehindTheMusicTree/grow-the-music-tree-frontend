"use client";

import { useState } from "react";
import { GenreGettingAssignedNewParentProvider } from "@contexts/GenreGettingAssignedNewParentContext";
import { useListGenrePlaylists } from "@hooks/useGenrePlaylist";
import { RECT_BASE_DIMENSIONS as GENRE_PLAYLIST_TREE_RECT_DIMENSIONS } from "./tree/tree-constants";
import { useGenreCreation } from "@hooks/useGenreCreation";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import GenrePlaylistsTree from "./tree/GenrePlaylistsTree";
import { GenreCreationValues } from "@schemas/genre/form";
import { GenrePlaylistSimple } from "@schemas/genre-playlist";

export default function GenreTree() {
  const { data: genrePlaylists, isLoading } = useListGenrePlaylists();
  const { create } = useGenreCreation();
  const [showPopup, setShowPopup] = useState(false);
  const [parentUuid, setParentUuid] = useState<string | undefined>();

  const handleSubmit = async (values: GenreCreationValues) => {
    await create({ ...values, parentUuid });
    setShowPopup(false);
  };

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
            setParentUuid(undefined);
            setShowPopup(true);
          }}
        >
          +
        </div>
        <div className="flex flex-col text-gray-800">
          {isLoading ? (
            <p>Loading data...</p>
          ) : genrePlaylists?.results ? (
            Object.entries(genrePlaylists.results).map(([uuid, genrePlaylistsTree]) => {
              return (
                <GenrePlaylistsTree
                  key={`${uuid}`}
                  genrePlaylistsTree={genrePlaylistsTree}
                  handleGenreAddAction={(parentUuid: string) => {
                    setParentUuid(parentUuid);
                    setShowPopup(true);
                  }}
                />
              );
            })
          ) : (
            <p>No data found.</p>
          )}
        </div>
        {showPopup && <GenreCreationPopup onClose={() => setShowPopup(false)} onSubmit={handleSubmit} />}
      </div>
    </GenreGettingAssignedNewParentProvider>
  );
}
