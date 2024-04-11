import styles from './App.module.scss';
import React, { useState, useEffect } from 'react';
import ContentArea from '../content-area/ContentArea'
import Banner from '../banner/Banner'
import { Howler } from 'howler';
import Player from '../player/Player';
import ApiService from '../../service/apiService';
import { PLAY_STATES } from '../../constants';
import {CONTENT_AREA_TYPES} from '../../constants';

Howler.html5PoolSize = 100;
Howler.autoUnlock = true;

export default function App() {

  const [searchSubmitted, setSearchSubmitted] = useState('')
  const [playerTrackObject, setPlayerTrackObject] = useState(null);
  const [playingPlaylistUuidWithPlayState, setPlayingPlaylistUuidWithLoadingState] = useState(null);
  const [playlistPlayObject, setPlaylistPlayObject] = useState(null);
  const [playingPlaylistLibTrackNumber, setPlayingPlaylistLibTrackNumber] = useState(0);
  const [contentAreaTypeWithObject, setContentAreaTypeWithObject] = useState({
    type: CONTENT_AREA_TYPES.GENRES,
    contentObject: null
  });

  const [isTrackListSidebarVisible, setIsTrackListSidebarVisible] = useState(false);

  const [playState, setPlayState] = useState(PLAY_STATES.PLAYING);
  const [shouldResetSeek, setShouldResetSeek] = useState(false);

  const selectPlaylistUuidToPlay = async (uuid) => {
    setPlayingPlaylistUuidWithLoadingState({uuid: uuid, isLoading: true});
    setPlaylistPlayObject(await ApiService.postPlay(uuid))
  }

  const setPreviousTrack = () => {
    setShouldResetSeek(true);
    setPlayingPlaylistLibTrackNumber(prev => prev - 1);
  }

  const setNextTrack = () => {
    setShouldResetSeek(true);
    setPlayingPlaylistLibTrackNumber(prev => prev + 1);
  }

  useEffect(() => {
    const setPlayingLibTrack = async (playingLibTrackObject) => {
      const playingLibTrackBlobUrl = await ApiService.loadAudioAndGetLibTrackBlobUrl(playingLibTrackObject.libraryTrack.relativeUrl)
      setPlayerTrackObject({
        ...playingLibTrackObject.libraryTrack, 
        blobUrl: playingLibTrackBlobUrl,
        hasNext: playlistPlayObject.contentObject.libraryTracks.length > playingPlaylistLibTrackNumber + 1,
        hasPrevious: playingPlaylistLibTrackNumber > 0
      });
    };

    if (playingPlaylistUuidWithPlayState && playingPlaylistUuidWithPlayState.isLoading) {
      setPlayingPlaylistLibTrackNumber(0);
    }

    if (playlistPlayObject && playlistPlayObject.contentObject.libraryTracks.length > playingPlaylistLibTrackNumber) {
      setPlayingLibTrack(playlistPlayObject.contentObject.libraryTracks[playingPlaylistLibTrackNumber]);
    }
  }, [playlistPlayObject, playingPlaylistLibTrackNumber]);

  useEffect(() => {
    if (playerTrackObject) {
      if (playingPlaylistUuidWithPlayState.isLoading) {
        setPlayingPlaylistUuidWithLoadingState({...playingPlaylistUuidWithPlayState,  isLoading: false});
        setPlayState(PLAY_STATES.PLAYING);
      }
    }
  }, [playerTrackObject]);

  return (
    <div className={styles.App}>
      <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
      <div className={styles.Body}>
        <ContentArea 
          contentAreaTypeWithObject={contentAreaTypeWithObject}
          setContentAreaTypeWithObject={setContentAreaTypeWithObject}
          isTrackListSidebarVisible={isTrackListSidebarVisible}
          selectPlaylistUuidToPlay={selectPlaylistUuidToPlay} 
          playState={playState} 
          playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithPlayState}
          playlistPlayObject={playlistPlayObject}/>
        {playerTrackObject ? 
          <Player 
            playerTrackObject={playerTrackObject}
            playState={playState}
            setPlayState={setPlayState}
            shouldResetSeek={shouldResetSeek} 
            setShouldResetSeek={setShouldResetSeek}
            setNextTrack={setNextTrack}
            setPreviousTrack={setPreviousTrack}
            setIsTrackListSidebarVisible={setIsTrackListSidebarVisible}
          /> 
        : null}
        </div>
    </div>
  );
}