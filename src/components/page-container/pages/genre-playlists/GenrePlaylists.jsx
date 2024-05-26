import { GENRE_PLAYLIST_TREE_RECT_DIMENSIONS } from "../../../../utils/constants";
import { useGenrePlaylists } from "../../../../contexts/genre-playlists/useGenrePlaylists";

import GenrePlaylistsTree from "./tree/GenrePlaylistTree";

export default function GenrePlaylists() {
  const { groupedGenrePlaylists, handleGenreAddAction } = useGenrePlaylists();

  return (
    <div className="mt-5 flex flex-col">
      <h1>Genre Tree</h1>
      <div
        className="mt-5 flex justify-center items-center text-center hover:bg-gray-400 hover:text-gray-800 cursor-pointer"
        style={{
          width: GENRE_PLAYLIST_TREE_RECT_DIMENSIONS.WIDTH + "px",
          height: GENRE_PLAYLIST_TREE_RECT_DIMENSIONS.HEIGHT + "px",
          border: "1px solid black",
        }}
        onClick={handleGenreAddAction}
      >
        +
      </div>
      <div className="flex flex-col text-gray-800">
        {groupedGenrePlaylists ? (
          Object.entries(groupedGenrePlaylists).map(([uuid, genrePlaylistsTree]) => {
            return (
              <GenrePlaylistsTree
                key={`${uuid}`}
                genrePlaylistsTree={genrePlaylistsTree}
                handleGenreAddAction={handleGenreAddAction}
              />
            );
          })
        ) : (
          <p>Loading data.</p>
        )}
      </div>
    </div>
  );
}
