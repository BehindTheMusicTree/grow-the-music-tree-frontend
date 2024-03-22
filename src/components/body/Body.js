import styles from './Body.module.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ApiService from '../../service/apiService';
import TreeGraph from './TreeGraph/TreeGraph';

export default function Body ({selectPlaylistUuidToPlay, playState, playingPlaylistUuidWithLoadingState}) {
  const [groupedGenres, setGroupedGenres] = useState(null);
  const areGenreLoading = useRef(false);

  const postGenreAndRefresh = async (genreDataToPost) => {
    await ApiService.postGenre(genreDataToPost);
    fetchGenresIfNotLoading();
  };

  const getGenresGroupedByRoot = (genres) => {
    const groupedGenres = {}
    genres.forEach(genre => {
      const rootUuid = genre.root.uuid
      if (!groupedGenres[rootUuid]) {
        groupedGenres[rootUuid] = [];
      }
      groupedGenres[rootUuid].push(genre);
    });
    
    return groupedGenres
  };

  const fetchGenresIfNotLoading = useCallback(async () => {
    if (!areGenreLoading.current) {
      areGenreLoading.current = true;
      const genres = await ApiService.getGenres();
      setGroupedGenres(getGenresGroupedByRoot(genres));
    }
  }, []);

  useEffect(() => {
    const fetchAndSetGenres = async () => {
      const genres = await ApiService.getGenres();
      setGroupedGenres(getGenresGroupedByRoot(genres));
    }
    
    if (!areGenreLoading.current) {
      areGenreLoading.current = true;
      fetchAndSetGenres();
    }
  }, [fetchGenresIfNotLoading]);

  useEffect(() => {
    areGenreLoading.current = false;
  }, [groupedGenres]);

  return (
    <div id={styles.Body}>
      <div id={styles.GenreTreeContainer}>
        <h1>Genre Tree</h1>
        {groupedGenres ? Object.entries(groupedGenres).map(([uuid, genreTree]) => {
          const key = `${uuid}`;
          return (
            <TreeGraph 
              key={key} 
              genres={genreTree} 
              postGenreAndRefresh={postGenreAndRefresh} 
              selectPlaylistUuidToPlay={selectPlaylistUuidToPlay}
              playState={playState}
              playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithLoadingState}/>
          );
        }) : (
          <p>Loading data.</p>
        )}
      </div>
    </div>
  );
}

Body.propTypes = {
  selectPlaylistUuidToPlay: PropTypes.func.isRequired,
  playState: PropTypes.string.isRequired,
  playingPlaylistUuidWithLoadingState: PropTypes.object
};