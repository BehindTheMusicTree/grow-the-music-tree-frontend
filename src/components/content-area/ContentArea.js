import styles from './ContentArea.module.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ApiService from '../../service/apiService';
import TreeGraph from './tree-graph/TreeGraph';
import TrackListSidebar from './track-list-sidebar/TrackListSidebar';

export default function ContentArea (
  {isTrackListSidebarVisible, selectPlaylistUuidToPlay, playState, playingPlaylistUuidWithLoadingState, playlistPlayObject}) {
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
    <div className={styles.ContentArea}>
      <div className={styles.GenreTreeContainer}>
        <h1>Genre Tree</h1>
        {groupedGenres ? Object.entries(groupedGenres).map(([uuid, genreTree]) => {
          return (
            <TreeGraph 
              key={`${uuid}`} 
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
      {isTrackListSidebarVisible ? (
        <div className={styles.RightSidebarContainer}>
          <TrackListSidebar playlistPlayObject={playlistPlayObject}/>
        </div>
        ) : null}
    </div>
  );
}

ContentArea.propTypes = {
  isTrackListSidebarVisible: PropTypes.string.isRequired,
  selectPlaylistUuidToPlay: PropTypes.func.isRequired,
  playState: PropTypes.string.isRequired,
  playingPlaylistUuidWithLoadingState: PropTypes.object,
  playlistPlayObject: PropTypes.object
};