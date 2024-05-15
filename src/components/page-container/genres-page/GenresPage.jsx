import { GENRE_TREE_RECT_DIMENSIONS } from "../../../constants";
import ApiService from "../../../utils/service/apiService";
import { useGenrePlaylists } from "../../../contexts/genre-playlists/useGenrePlaylists";

import GenreTree from "./genre-tree/GenreTree";

export default function GenresPage() {
  const { groupedGenrePlaylists, setRefreshGenrePlaylists } = useGenrePlaylists();

  const handleGenreAddClick = async (event, parentUuid) => {
    event.stopPropagation();
    const name = prompt("New genre name:");
    if (!name) {
      return;
    }
    await ApiService.postGenre({
      name: name,
      parent: parentUuid,
    });
    setRefreshGenrePlaylists(1);
  };

  return (
    <div className="mt-5 flex flex-col">
      <h1>Genre Tree</h1>
      <div
        className="mt-5 flex justify-center items-center text-center hover:bg-gray-400 hover:text-gray-800 cursor-pointer"
        style={{
          width: GENRE_TREE_RECT_DIMENSIONS.WIDTH + "px",
          height: GENRE_TREE_RECT_DIMENSIONS.HEIGHT + "px",
          border: "1px solid black",
        }}
        onClick={handleGenreAddClick}
      >
        +
      </div>
      <div className="flex flex-col text-gray-800">
        {groupedGenrePlaylists ? (
          Object.entries(groupedGenrePlaylists).map(([uuid, genreTree]) => {
            return <GenreTree key={`${uuid}`} genres={genreTree} handleGenreAddClick={handleGenreAddClick} />;
          })
        ) : (
          <p>Loading data.</p>
        )}
      </div>
    </div>
  );
}
