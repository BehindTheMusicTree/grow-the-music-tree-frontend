import styles from './Player.module.scss'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import ReactHowler from 'react-howler';
import Button from '../button/Button';
import ApiService from '../../service/apiService'

const Player = ({playingLibraryTrack, setPlayingLibraryTrack}) => {
  const LIBRARY_TRACK_SAMPLE_UUID = `joy8KSUE3L57QzUdH7LZNL`

  const [mustLoadStream, setIsLoadingStream] = useState(false);
  const [blobUrl, setBlobUrl] = useState();
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    setPlaying(true);
  }

  const handlePause = () => {
    setPlaying(false);
  }

  const handleLoadError = (id, err) => {
    console.log(`Error loading track of blob url ${blobUrl}: ${err}`);
  }

  const getLibraryTrack = async () => {
    const libraryTrackUuid = LIBRARY_TRACK_SAMPLE_UUID
    const libraryTrack = await ApiService.retrieveLibraryTrack(libraryTrackUuid)
    setPlayingLibraryTrack(libraryTrack)
  }

  const getLibraryTrackBlobUrl = async () => {
    const blobUrl = await ApiService.getLibraryTrackAudio(playingLibraryTrack.relativeUrl)
    setBlobUrl(blobUrl);
  }

  useEffect(() => {
    if (!mustLoadStream) {
      setIsLoadingStream(true);
    }
  }, []);

  useEffect(() => {
    if (mustLoadStream) {
      setIsLoadingStream(false);
      getLibraryTrack();
    }
  }, [mustLoadStream]);

  useEffect(() => {
    if (playingLibraryTrack) {
      getLibraryTrackBlobUrl();
    }
  }, [playingLibraryTrack])

  return (
    <div className={styles.Player}>
      {blobUrl ?  (
        <>
          <ReactHowler
            src={[blobUrl]}
            html5={true}
            playing={playing}
            format={[playingLibraryTrack.fileExtension.replace('.', '')]}
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
  playingLibraryTrack: PropTypes.object,
  setPlayingLibraryTrack: PropTypes.func.isRequired
};

export default Player