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
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistPlayingLibTrackNumber, setSelectedPlaylistPlayingLibTrackNumber] = useState(0);

  const [playState, setPlayState] = useState(PlayStates.PLAYING);
  const [shouldResetSeek, setShouldResetSeek] = useState(false);

  const setSelectedPlaylistUuid = async (uuid) => {
    setSelectedPlaylist(await ApiService.retrievePlaylist(uuid))
  }

  const setNextTrack = () => {
    setShouldResetSeek(true);
    setSelectedPlaylistPlayingLibTrackNumber(prev => prev + 1);
  }

  useEffect(() => {
    const setPlayingLibTrack = async (playingLibTrackObject) => {
      const playingLibTrackBlobUrl = await ApiService.getLoadAudioAndGetLibTrackBlobUrl(playingLibTrackObject.relativeUrl)
      setPlayerTrackObject({
        ...playingLibTrackObject, 
        blobUrl: playingLibTrackBlobUrl,
        hasNext: selectedPlaylist.libraryTracks.length > selectedPlaylistPlayingLibTrackNumber + 1
      });
    };

    if (selectedPlaylist && selectedPlaylist.libraryTracks.length > selectedPlaylistPlayingLibTrackNumber) {
      setPlayingLibTrack(selectedPlaylist.libraryTracks[selectedPlaylistPlayingLibTrackNumber]);
    }
  }, [selectedPlaylist, selectedPlaylistPlayingLibTrackNumber]);

  return (
    <div>
      <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
      <Body setSelectedPlaylistUuid={setSelectedPlaylistUuid}/>
      {selectedPlaylist ? 
        (selectedPlaylist.libraryTracks.length > selectedPlaylistPlayingLibTrackNumber + 1 ?
          (selectedPlaylist.libraryTracks[selectedPlaylistPlayingLibTrackNumber + 1].artist ? 
            selectedPlaylist.libraryTracks[selectedPlaylistPlayingLibTrackNumber + 1].artist.name + ' - ' 
            : null)
          + selectedPlaylist.libraryTracks[selectedPlaylistPlayingLibTrackNumber + 1].title
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
        /> 
      : null}
    </div>
  );
}