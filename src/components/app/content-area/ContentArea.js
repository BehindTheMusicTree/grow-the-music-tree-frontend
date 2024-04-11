import styles from './ContentArea.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import TrackListSidebar from './track-list-sidebar/TrackListSidebar';
import {CONTENT_AREA_TYPES} from '../../../constants';
import GenresView from './genres-view/GenresView';

export default function ContentArea ({
    setEditingTrack,
    contentAreaTypeWithObject,
    isTrackListSidebarVisible, 
    selectPlaylistUuidToPlay, 
    playState, 
    playingPlaylistUuidWithLoadingState, 
    playlistPlayObject}) {

  return (
    <div className={styles.ContentArea}>
      {contentAreaTypeWithObject.current.type === CONTENT_AREA_TYPES.GENRES ? (
        <GenresView 
          selectPlaylistUuidToPlay={selectPlaylistUuidToPlay} 
          playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithLoadingState} 
          playState={playState} 
        />
      ) : (
        <div>Unknown content area type</div>
      )}
      {isTrackListSidebarVisible ? (
        <div className={styles.RightSidebarContainer}>
          <TrackListSidebar playlistPlayObject={playlistPlayObject} setEditingTrack={setEditingTrack}/>
        </div>
        ) : null}
    </div>
  );
}

ContentArea.propTypes = {
  setEditingTrack: PropTypes.func.isRequired,
  contentAreaTypeWithObject: PropTypes.object.isRequired,
  isTrackListSidebarVisible: PropTypes.bool.isRequired,
  selectPlaylistUuidToPlay: PropTypes.func.isRequired,
  playState: PropTypes.string.isRequired,
  playingPlaylistUuidWithLoadingState: PropTypes.object,
  playlistPlayObject: PropTypes.object
};