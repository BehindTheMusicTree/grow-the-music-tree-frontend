import { useState, useRef, useCallback, useEffect } from "react";

import { GENRE_TREE_RECT_DIMENSIONS } from "../../../constants";
import ApiService from "../../../utils/service/apiService";
import { useRefreshGenresSignal } from "../../../contexts/refresh-genres-signal/useRefreshGenresSignal.jsx";

import GenreTree from "./genre-tree/GenreTree";

export default function GenresPage() {
  const { refreshGenresSignal } = useRefreshGenresSignal();
  const [groupedGenrePlaylists, setGroupedGenrePlaylists] = useState(null);
  const areGenreLoadingRef = useRef(false);

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

  const postGenreAndRefresh = async (genreDataToPost) => {
    await ApiService.postGenre(genreDataToPost);
    fetchGenresIfNotLoading();
  };
  const postLibTracksAndRefresh = async (file, genreUuid) => {
    await ApiService.postLibTracks(file, genreUuid);
    fetchGenresIfNotLoading();
  };

  const fetchGenresIfNotLoading = useCallback(async () => {
    if (!areGenreLoadingRef.current) {
      areGenreLoadingRef.current = true;
      const genres = await ApiService.getGenrePlaylists();
      setGroupedGenrePlaylists(getGenrePlaylistsGroupedByRoot(genres));
    }
  }, []);

  const handleGenreAddClick = (event, parentUuid) => {
    event.stopPropagation();
    const name = prompt("New genre name:");
    if (!name) {
      return;
    }
    postGenreAndRefresh({
      name: name,
      parent: parentUuid,
    });
  };

  useEffect(() => {
    fetchGenresIfNotLoading();
  }, [refreshGenresSignal]);

  useEffect(() => {
    const fetchAndSetGenres = async () => {
      const genres = await ApiService.getGenres();
      setGroupedGenrePlaylists(getGenrePlaylistsGroupedByRoot(genres));
    };

    if (!areGenreLoadingRef.current) {
      areGenreLoadingRef.current = true;
      fetchAndSetGenres();
    }
  }, [fetchGenresIfNotLoading]);

  useEffect(() => {
    areGenreLoadingRef.current = false;
  }, [groupedGenrePlaylists]);

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
            return (
              <GenreTree
                key={`${uuid}`}
                genres={genreTree}
                handleGenreAddClick={handleGenreAddClick}
                postLibTracksAndRefresh={postLibTracksAndRefresh}
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
