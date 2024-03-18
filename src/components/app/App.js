import React, { useState, useRef } from 'react';
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

  const isPlayingLibTrackLoadingRef = useRef(false);

  const setPlayingLibTrack = async (playingLibTrackObject) => {
    isPlayingLibTrackLoadingRef.current = true;
    const playingLibTrackBlobUrl = await ApiService.getLoadAudioAndGetLibTrackBlobUrl(playingLibTrackObject.relativeUrl)
    setPlayingLibTrackObjectWithBlobUrl({...playingLibTrackObject, blobUrl: playingLibTrackBlobUrl});
    isPlayingLibTrackLoadingRef.current = false;
  };

  return (
    <div>
      <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
      <Body setPlayingLibTrack={setPlayingLibTrack}/>
      {playingLibTrackObjectWithBlobUrl ? <Player libTrackObjectWithBlobUrl={playingLibTrackObjectWithBlobUrl}/> : null}
    </div>
  );
}

export default App;
