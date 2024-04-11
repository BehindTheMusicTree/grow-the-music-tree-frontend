import styles from './ContentArea.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import TrackListSidebar from './track-list-sidebar/TrackListSidebar';
import {CONTENT_AREA_TYPES} from '../../constants';
import GenresView from './genres-view/GenresView';
import LibTrackEdition from './lib-track-edition/LibTrackEdition';

export default function ContentArea ({
    contentAreaTypeWithObject,
    setContentAreaTypeWithObject,
    isTrackListSidebarVisible, 
    selectPlaylistUuidToPlay, 
    playState, 
    playingPlaylistUuidWithLoadingState, 
    playlistPlayObject}) {

  return (
    <div className={styles.ContentArea}>
      {contentAreaTypeWithObject.type === CONTENT_AREA_TYPES.GENRES ? (
        <GenresView 
          selectPlaylistUuidToPlay={selectPlaylistUuidToPlay} 
          playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithLoadingState} 
          playState={playState} 
        />
      ) : (
        <LibTrackEdition libTrack={contentAreaTypeWithObject.contentObject}/>
      )}
      {isTrackListSidebarVisible ? (
        <div className={styles.RightSidebarContainer}>
          <TrackListSidebar playlistPlayObject={playlistPlayObject} setContentAreaTypeWithObject={setContentAreaTypeWithObject}/>
        </div>
        ) : null}
    </div>
  );
}

ContentArea.propTypes = {
  contentAreaTypeWithObject: PropTypes.object.isRequired,
  setContentAreaTypeWithObject: PropTypes.func.isRequired,
  isTrackListSidebarVisible: PropTypes.bool.isRequired,
  selectPlaylistUuidToPlay: PropTypes.func.isRequired,
  playState: PropTypes.string.isRequired,
  playingPlaylistUuidWithLoadingState: PropTypes.object,
  playlistPlayObject: PropTypes.object
};