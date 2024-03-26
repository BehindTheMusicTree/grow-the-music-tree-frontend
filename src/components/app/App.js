import React, { useState, useEffect } from 'react';
import Body from '../body/Body'
import Banner from '../banner/Banner'
import { Howler } from 'howler';
import Player from '../player/Player';
import ApiService from '../../service/apiService';
import { PlayStates } from '../../constants';

Howler.html5PoolSize = 100;
Howler.autoUnlock = true;

export default function App() {

  const [searchSubmitted, setSearchSubmitted] = useState('')
  const [playerTrackObject, setPlayerTrackObject] = useState(null);
  const [playingPlaylistUuidWithPlayState, setPlayingPlaylistUuidWithLoadingState] = useState(null);
  const [playingPlaylistObject, setPlayingPlaylistObject] = useState(null);
  const [playingPlaylistLibTrackNumber, setPlayingPlaylistLibTrackNumber] = useState(0);

  const [playState, setPlayState] = useState(PlayStates.PLAYING);
  const [shouldResetSeek, setShouldResetSeek] = useState(false);

  const selectPlaylistUuidToPlay = async (uuid) => {
    setPlayingPlaylistUuidWithLoadingState({uuid: uuid, isLoading: true});
    setPlayingPlaylistObject(await ApiService.retrievePlaylist(uuid))
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
      const playingLibTrackBlobUrl = await ApiService.getLoadAudioAndGetLibTrackBlobUrl(playingLibTrackObject.relativeUrl)
      setPlayerTrackObject({
        ...playingLibTrackObject, 
        blobUrl: playingLibTrackBlobUrl,
        hasNext: playingPlaylistObject.libraryTracks.length > playingPlaylistLibTrackNumber + 1,
        hasPrevious: playingPlaylistLibTrackNumber > 0
      });
    };

    if (playingPlaylistUuidWithPlayState && playingPlaylistUuidWithPlayState.isLoading) {
      setPlayingPlaylistLibTrackNumber(0);
    }

    if (playingPlaylistObject && playingPlaylistObject.libraryTracks.length > playingPlaylistLibTrackNumber) {
      setPlayingLibTrack(playingPlaylistObject.libraryTracks[playingPlaylistLibTrackNumber]);
    }
  }, [playingPlaylistObject, playingPlaylistLibTrackNumber]);

  useEffect(() => {
    if (playerTrackObject) {
      if (playingPlaylistUuidWithPlayState.isLoading) {
        setPlayingPlaylistUuidWithLoadingState({...playingPlaylistUuidWithPlayState,  isLoading: false});
        setPlayState(PlayStates.PLAYING);
      }
    }
  }, [playerTrackObject]);

  return (
    <div>
      <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
      <Body 
        selectPlaylistUuidToPlay={selectPlaylistUuidToPlay} 
        playState={playState} 
        playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithPlayState}/>
      {playingPlaylistObject ? 
        (playingPlaylistObject.libraryTracks.length > playingPlaylistLibTrackNumber + 1 ?
          (playingPlaylistObject.libraryTracks[playingPlaylistLibTrackNumber + 1].artist ? 
            playingPlaylistObject.libraryTracks[playingPlaylistLibTrackNumber + 1].artist.name + ' - ' 
            : null)
          + playingPlaylistObject.libraryTracks[playingPlaylistLibTrackNumber + 1].title
          : null)
      : null}
      {playerTrackObject ? 
        <Player 
          playerTrackObject={playerTrackObject}
          playState={playState}
          setPlayState={setPlayState}
          shouldResetSeek={shouldResetSeek} 
          setShouldResetSeek={setShouldResetSeek}
          setNextTrack={setNextTrack}
          setPreviousTrack={setPreviousTrack}
        /> 
      : null}
    </div>
  );
}