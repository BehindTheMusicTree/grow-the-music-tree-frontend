import { GenreGettingAssignedNewParentProvider } from "@contexts/genre-getting-assigned-new-parent/GenreGettingAssignedNewParentContext";
import { RECT_BASE_DIMENSIONS as GENRE_PLAYLIST_TREE_RECT_DIMENSIONS } from "./tree/tree-constants";
import GenrePlaylistsTree from "./tree/GenrePlaylistTree";
import { useGenrePlaylists } from "@contexts/GenrePlaylistContext";

export default function GenrePlaylists() {
  const { groupedGenrePlaylists, handleGenreAddAction } = useGenrePlaylists();

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
    </GenreGettingAssignedNewParentProvider>
  );
}
