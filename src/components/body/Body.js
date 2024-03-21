import styles from './Body.module.scss';
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ApiService from '../../service/apiService';
import TreeGraph from './TreeGraph/TreeGraph';

export default function Body ({selectPlaylistUuidToPlay, playState, playingPlaylistUuidWithLoadingState}) {
  const [groupedGenres, setGroupedGenres] = useState(null);
  const [mustFetchGenres, setMustFetchGenres] = useState(true);

  const isGenreFetchingRef = useRef(false);

  const postGenreAndRefresh = async (genreDataToPost) => {
    await ApiService.postGenre(genreDataToPost);
    setMustFetchGenres(true);
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

  useEffect(() => {
    const fetchGenres = async () => {
      return await ApiService.getGenres();
    }

    const fetchAndSetGenres = async () => {
      const genres = await fetchGenres();
      setGroupedGenres(getGenresGroupedByRoot(genres));
    }
    
    if (mustFetchGenres && !isGenreFetchingRef.current) {
      setMustFetchGenres(false);
      isGenreFetchingRef.current = true;
      fetchAndSetGenres();
      isGenreFetchingRef.current = false;
    }
  }, [mustFetchGenres]);

  return (
    <div id={styles.Body}>
      <div id={styles.GenreTreeContainer}>
        <h1>Genre Tree</h1>
        {groupedGenres ? Object.entries(groupedGenres).map(([uuid, genreTree]) => {
          const key = `${uuid}-${Date.now()}`;
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