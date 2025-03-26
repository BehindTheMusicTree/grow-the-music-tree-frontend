import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import ApiService from "../../utils//ApiService";
import { GenreService } from "../../utils/services";

export const GenrePlaylistsContext = createContext();

function GenrePlaylistsProvider({ children }) {
  const [groupedGenrePlaylists, setGroupedGenrePlaylists] = useState();
  const [refreshGenrePlaylistsSignal, setRefreshGenrePlaylistsSignal] = useState(1);

  const areGenrePlaylistsFetchingRef = { current: false };

  const handleGenreAddAction = async (event, parentUuid) => {
    event.stopPropagation();
    const name = prompt("New genre name:");
    if (!name) {
      return;
    }
    await ApiService.postGenre({
      name: name,
      parent: parentUuid,
    });
    setRefreshGenrePlaylistsSignal(1);
  };

  useEffect(() => {
    const fetchGenrePlaylists = async () => {
      const genrePlaylists = await GenreService.getGenrePlaylists();
      setGroupedGenrePlaylists(getGenrePlaylistsGroupedByRoot(genrePlaylists));
    };

    if (refreshGenrePlaylistsSignal == 1 && !areGenrePlaylistsFetchingRef.current) {
      areGenrePlaylistsFetchingRef.current = true;
      fetchGenrePlaylists();
      areGenrePlaylistsFetchingRef.current = false;
      setRefreshGenrePlaylistsSignal(0);
    }
  }, [refreshGenrePlaylistsSignal]);

  const getGenrePlaylistsGroupedByRoot = (genrePlaylists) => {
    const groupedGenrePlaylists = {};
    genrePlaylists.forEach((genrePlaylist) => {
      const rootUuid = genrePlaylist.root.uuid;
      if (!groupedGenrePlaylists[rootUuid]) {
        groupedGenrePlaylists[rootUuid] = [];
      }
      groupedGenrePlaylists[rootUuid].push(genrePlaylist);
    });

    return groupedGenrePlaylists;
  };

  const updateGenreParent = async (genreUuid, parentUuid) => {
    await ApiService.putGenre(genreUuid, {
      parent: parentUuid,
    });
    setRefreshGenrePlaylistsSignal(1);
  };

  return (
    <GenrePlaylistsContext.Provider
      value={{ groupedGenrePlaylists, handleGenreAddAction, setRefreshGenrePlaylistsSignal, updateGenreParent }}
    >
      {children}
    </GenrePlaylistsContext.Provider>
  );
}

GenrePlaylistsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GenrePlaylistsProvider;
