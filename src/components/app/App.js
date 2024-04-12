import styles from './App.module.scss';
import React, { useState, useEffect, useRef } from 'react';
import { Howler } from 'howler';
import Banner from './banner/Banner'
import ContentArea from './content-area/ContentArea'
import Player from './player/Player';
import LibTrackEdition from './popup/lib-track-edition/LibTrackEdition';
import ApiService from '../../service/apiService';
import { PLAY_STATES } from '../../constants';
import {CONTENT_AREA_TYPES} from '../../constants';

Howler.autoUnlock = true;

export default function App() {

  const [searchSubmitted, setSearchSubmitted] = useState('')
  const [playerTrackObject, setPlayerTrackObject] = useState(null);
  const [playingPlaylistUuidWithPlayState, setPlayingPlaylistUuidWithLoadingState] = useState(null);
  const [playlistPlayObject, setPlaylistPlayObject] = useState(null);
  const [playingPlaylistLibTrackNumber, setPlayingPlaylistLibTrackNumber] = useState(0);
  const [editingTrack, setEditingTrack] = useState(null);
  const [isTrackListSidebarVisible, setIsTrackListSidebarVisible] = useState(false);
  const [playState, setPlayState] = useState(PLAY_STATES.PLAYING);
  const [shouldResetSeek, setShouldResetSeek] = useState(false);
  const [refreshGenresSignal, setRefreshGenresSignal] = useState(0);

  const contentAreaTypeWithObject = useRef({
    type: CONTENT_AREA_TYPES.GENRES,
    contentObject: null
  })

  const handleUpdatedLibTrack = async (updatedLibTrack) => {
    setPlaylistPlayObject(currentState => {
      const newState = { ...currentState };
      newState.contentObject.libraryTracks = newState.contentObject.libraryTracks.map(playlistTrackRelation => 
        playlistTrackRelation.libraryTrack.uuid === updatedLibTrack.uuid ? {...playlistTrackRelation, libraryTrack: updatedLibTrack} : playlistTrackRelation
      );
      return newState;
    })
    setRefreshGenresSignal(oldSignal => oldSignal + 1);
  }

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
          setEditingTrack={setEditingTrack}
          contentAreaTypeWithObject={contentAreaTypeWithObject}
          isTrackListSidebarVisible={isTrackListSidebarVisible}
          selectPlaylistUuidToPlay={selectPlaylistUuidToPlay} 
          playState={playState} 
          playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithPlayState}
          playlistPlayObject={playlistPlayObject}
          refreshGenresSignal={refreshGenresSignal}/>
        {playerTrackObject &&
          <Player 
            playerTrackObject={playerTrackObject}
            playState={playState}
            setPlayState={setPlayState}
            shouldResetSeek={shouldResetSeek} 
            setShouldResetSeek={setShouldResetSeek}
            setNextTrack={setNextTrack}
            setPreviousTrack={setPreviousTrack}
            setIsTrackListSidebarVisible={setIsTrackListSidebarVisible}
          />}
        {editingTrack && 
          <LibTrackEdition 
            libTrack={editingTrack}
            onClose={() => setEditingTrack(null)}
            handleUpdatedLibTrack={handleUpdatedLibTrack} />
        }
        </div>
    </div>
  );
}