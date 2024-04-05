import styles from './ContentArea.module.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ApiService from '../../service/apiService';
import TreeGraph from './tree-graph/TreeGraph';
import TrackListSidebar from './track-list-sidebar/TrackListSidebar';
import { GENRE_TREE_RECT_DIMENSIONS } from '../../constants';

export default function ContentArea ({
    isTrackListSidebarVisible, 
    selectPlaylistUuidToPlay, 
    playState, 
    playingPlaylistUuidWithLoadingState, 
    playlistPlayObject}) {
  const [groupedGenres, setGroupedGenres] = useState(null);
  const areGenreLoadingRef = useRef(false);

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
    if (!areGenreLoadingRef.current) {
      areGenreLoadingRef.current = true;
      const genres = await ApiService.getGenres();
      setGroupedGenres(getGenresGroupedByRoot(genres));
    }
  }, []);

  useEffect(() => {
    const fetchAndSetGenres = async () => {
      const genres = await ApiService.getGenres();
      setGroupedGenres(getGenresGroupedByRoot(genres));
    }
    
    if (!areGenreLoadingRef.current) {
      areGenreLoadingRef.current = true;
      fetchAndSetGenres();
    }
  }, [fetchGenresIfNotLoading]);

  useEffect(() => {
    areGenreLoadingRef.current = false;
  }, [groupedGenres]);

  return (
    <div className={styles.ContentArea}>
      <div className={styles.GenreArea}> 
        <h1>Genre Tree</h1>
        <div className={styles.GenreRectangle} style={{
            width: GENRE_TREE_RECT_DIMENSIONS.WIDTH + 'px',
            height: GENRE_TREE_RECT_DIMENSIONS.HEIGHT + 'px',
            border: '1px solid black'
        }}>+</div>
        <div className={styles.GenreTreeContainer}>
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
  isTrackListSidebarVisible: PropTypes.bool.isRequired,
  selectPlaylistUuidToPlay: PropTypes.func.isRequired,
  playState: PropTypes.string.isRequired,
  playingPlaylistUuidWithLoadingState: PropTypes.object,
  playlistPlayObject: PropTypes.object
};