import React from 'react'
import Body from '../body/Body'
import Banner from '../banner/Banner'
import { Howler } from 'howler';
import Player from '../player/Player';

Howler.html5PoolSize = 100;
Howler.autoUnlock = true;

function App() {

  const [searchSubmitted, setSearchSubmitted] = React.useState('')

  return (
    <div>
      <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
      <Body />
      <div>
          <section>
            <h1>Simple Player</h1>
            <p className='subheading'>Only play/pause button</p>
            <Player/>
          </section>
      </div>
    </div>
  );
}

export default App;
