import React, { useEffect } from 'react'
import Body from '../body/Body'
import Banner from '../banner/Banner'
import config from '../../config/config'
import ApiService from '../../service/apiService'
import { Howler } from 'howler';
import OnlyPlayPauseButton from '../player/OnlyPlayPauseButton';

Howler.html5PoolSize = 100;
Howler.autoUnlock = true;

function App() {

  const [searchSubmitted, setSearchSubmitted] = React.useState('')
  const [shouldLogin, setShouldLogin] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  const authenticate = async () => {
    const credentials = { username: config.username, password: config.password };
    try {
      await ApiService.login(credentials)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Login error:', error.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn === false) {
      setShouldLogin(true);
    }
  }, [])

  useEffect(() => {
    if (shouldLogin) {
        setShouldLogin(false);
        authenticate();
    }
  }, [shouldLogin])

  useEffect(() => {
    if (isLoggedIn) {
      setShouldLogin(false);
    }
  }, [isLoggedIn])

  return (
    <div>
      <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
      <Body />
      <div>
          <section>
            <h1>Simple Player</h1>
            <p className='subheading'>Only play/pause button</p>
            <OnlyPlayPauseButton isLoggedIn={isLoggedIn}/>
          </section>
      </div>
    </div>
  );
}

export default App;
