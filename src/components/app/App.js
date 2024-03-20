import React, { useState, useEffect } from 'react';
import Body from '../body/Body'
import Banner from '../banner/Banner'
import { Howler } from 'howler';
import Player from '../player/Player';
import ApiService from '../../service/apiService';

Howler.html5PoolSize = 100;
Howler.autoUnlock = true;

function App() {

  const [searchSubmitted, setSearchSubmitted] = useState('')
  const [playingLibTrackObjectWithBlobUrl, setPlayingLibTrackObjectWithBlobUrl] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistPlayingLibTrackNumber, setSelectedPlaylistPlayingLibTrackNumber] = useState(0);

  const setSelectedPlaylistUuid = async (uuid) => {
    setSelectedPlaylist(await ApiService.retrievePlaylist(uuid))
  }

  useEffect(() => {
    const setPlayingLibTrack = async (playingLibTrackObject) => {
      const playingLibTrackBlobUrl = await ApiService.getLoadAudioAndGetLibTrackBlobUrl(playingLibTrackObject.relativeUrl)
      setPlayingLibTrackObjectWithBlobUrl({...playingLibTrackObject, blobUrl: playingLibTrackBlobUrl});
    };

    if (selectedPlaylist && selectedPlaylist.libraryTracks.length > 0) {
      setPlayingLibTrack(selectedPlaylist.libraryTracks[selectedPlaylistPlayingLibTrackNumber]);
    }
    setSelectedPlaylistPlayingLibTrackNumber(0);
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
      {playingLibTrackObjectWithBlobUrl ? <Player libTrackObjectWithBlobUrl={playingLibTrackObjectWithBlobUrl}/> : null}
    </div>
  );
}

export default App;
