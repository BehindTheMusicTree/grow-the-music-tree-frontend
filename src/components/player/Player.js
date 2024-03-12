import React, { useState, useEffect } from 'react'
import ReactHowler from 'react-howler';
import Button from '../button/Button';
import ApiService from '../../service/apiService'
import PropTypes from 'prop-types';

const Player = ({isLoggedIn}) => {
  const LIBRARY_TRACK_SAMPLE_UUID = `Ly7Ru2ugWX3Xr4vazS5kqX`

  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [blobUrl, setBlobUrl] = useState();
  const [playing, setPlaying] = useState(false);
  const [libraryTrack, setLibraryTrack] = useState();
    
  const retrieveLibraryTrack = async (libraryTrackUuid) => {
      await ApiService.retrieveLibraryTrack(libraryTrackUuid, (data) => {
        setLibraryTrack(data);
      });
  };

  const handlePlay = () => {
    setPlaying(true);
  }

  const handlePause = () => {
    setPlaying(false);
  }

  const handleLoadError = (id, err) => {
    console.log(`Error loading track of blob url ${blobUrl}: ${err}`);
  }

  const loadStream = () => {
    const libraryTrackUuid = LIBRARY_TRACK_SAMPLE_UUID
    retrieveLibraryTrack(libraryTrackUuid);
  }

  useEffect(() => {
    if (isLoggedIn && !isLoadingStream) {
      setIsLoadingStream(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoadingStream) {
      setIsLoadingStream(false);
      loadStream();
    }
  }, [isLoadingStream]);

  useEffect(() => {
    if (libraryTrack) {
      ApiService.getLibraryTrackAudio(libraryTrack.relative_url, (blobUrl) => { 
        setBlobUrl(blobUrl);
      });
    }
  }, [libraryTrack])

  return (
    <div>
      {blobUrl ?  (
        <>
          <ReactHowler
            src={[blobUrl]}
            html5={true}
            playing={playing}
            onLoad={() => console.log('loaded')}
            format={[libraryTrack.extension]}
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