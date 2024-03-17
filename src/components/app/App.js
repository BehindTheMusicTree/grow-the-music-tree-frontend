import React, { useState } from 'react';
import Body from '../body/Body'
import Banner from '../banner/Banner'
import { Howler } from 'howler';
import Player from '../player/Player';

Howler.html5PoolSize = 100;
Howler.autoUnlock = true;

function App() {

  const [searchSubmitted, setSearchSubmitted] = useState('')
  const [playingLibraryTrack, setPlayingLibraryTrack] = useState(null);

  return (
    <div>
      <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
      <Body setPlayingLibraryTrack={setPlayingLibraryTrack}/>
      <Player playingLibraryTrack={playingLibraryTrack} setPlayingLibraryTrack={setPlayingLibraryTrack}/>
    </div>
  );
}

export default App;
