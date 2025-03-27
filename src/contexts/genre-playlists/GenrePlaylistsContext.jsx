import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import GenreService from "../../utils/services/GenreService";
import BadRequestError from "../../utils/errors/BadRequestError";
import BadRequestPopupContentObject from "../../models/popup-content-object/BadRequestPopupContentObject";

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
    await GenreService.postGenre({
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
    await GenreService.putGenre(genreUuid, {
      parent: parentUuid,
    });
    setRefreshGenrePlaylistsSignal(1);
  };

  const renameGenre = async (genreUuid, newName, showPopupCallback) => {
    try {
      // Pass badRequestCatched=true to handle BadRequestError here instead of global handler
      await GenreService.putGenre(
        genreUuid,
        {
          name: newName,
        },
        true
      );
      setRefreshGenrePlaylistsSignal(1);
      return true;
    } catch (error) {
      if (error instanceof BadRequestError) {
        // Use the error directly from API, which already contains field error details
        const popupContentObject = new BadRequestPopupContentObject(error);

        // Use callback to show popup from the component
        if (showPopupCallback) {
          showPopupCallback(popupContentObject);
        }
        return false;
      }
      throw error; // Rethrow other errors for global handling
    }
  };

  const deleteGenre = async (genreUuid) => {
    await GenreService.deleteGenre(genreUuid);
    setRefreshGenrePlaylistsSignal(1);
  };

  return (
    <GenrePlaylistsContext.Provider
      value={{
        groupedGenrePlaylists,
        handleGenreAddAction,
        setRefreshGenrePlaylistsSignal,
        updateGenreParent,
        renameGenre,
        deleteGenre,
      }}
    >
      {children}
    </GenrePlaylistsContext.Provider>
  );
}

GenrePlaylistsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GenrePlaylistsProvider;
