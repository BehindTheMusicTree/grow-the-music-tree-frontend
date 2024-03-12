import React, { useState, useEffect } from 'react'
import ReactHowler from 'react-howler';
import Button from '../button/Button';
import ApiService from '../../service/apiService'
import PropTypes from 'prop-types';

const Player = ({isLoggedIn}) => {
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [stream, setStream] = useState({ url: '', format: ''});
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !isLoadingStream) {
      setIsLoadingStream(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoadingStream) {
      setIsLoadingStream(false);
      ApiService.getAudio((url, format) => { 
        console.log('setStream', url, format);
        setStream({ url, format });
      });
    }
  }, [isLoadingStream]);


  const handlePlay = () => {
    setPlaying(true);
  }

  const handlePause = () => {
    setPlaying(false);
  }

  const handleLoadError = (id, err) => {
    console.log(`Error loading track of url ${stream.url}: ${err}`);
  }

  return (
    <div>
      {stream.url ?  (
        <>
          <ReactHowler
            src={[stream.url]}
            html5={true}
            playing={playing}
            onLoad={() => console.log('loaded')}
            format={[stream.format]}
            onLoadError={handleLoadError}
          />
          <Button onClick={handlePlay}>Play</Button>
          <Button onClick={handlePause}>Pause</Button>
        </>
      ) : (
        <p>Loading audio stream...</p>
      )}
    </div>
  )
}

Player.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
}

export default Player