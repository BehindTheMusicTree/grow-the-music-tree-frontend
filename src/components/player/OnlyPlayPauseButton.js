import React, { useState, useEffect } from 'react'
import ReactHowler from 'react-howler';
import Button from '../button/Button';
import ApiService from '../../service/apiService'

const OnlyPlayPauseButton = (isLoggedIn) => {
  const [stream, setStream] = useState({ url: '', format: ''});
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      ApiService.getAudio((url, format) => { 
        setStream({ url, format });
      });
    }
  }, [isLoggedIn]);


  const handlePlay = () => {
    setPlaying(true);
  }

  const handlePause = () => {
    setPlaying(false);
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
            onLoadError={(id, err) => console.log('load error ', err)}
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

export default OnlyPlayPauseButton