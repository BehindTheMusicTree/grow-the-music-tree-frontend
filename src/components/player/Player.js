import styles from './Player.module.scss'
import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import ReactHowler from 'react-howler';
import Button from '../button/Button';
import ApiService from '../../service/apiService'

const Player = ({playingLibraryTrack, setPlayingLibraryTrack}) => {
  const LIBRARY_TRACK_SAMPLE_UUID = `joy8KSUE3L57QzUdH7LZNL`

  const [mustLoadStream, setIsLoadingStream] = useState(false);
  const [blobUrl, setBlobUrl] = useState();
  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);

  const seekInterval = useRef(null);
  const playerRef = useRef(null);

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
  
  const updateSeek = () => {
    if (playerRef.current) {
      const newSeek = playerRef.current.seek();
      setSeek(newSeek);
    }
  }
  
  const handlePause = () => {
    setPlaying(false);
    clearInterval(seekInterval);
  }
  
  const handlePlay = () => {
    setPlaying(true);
    seekInterval.current = setInterval(() => {
      updateSeek();
    }, 1000);
  }
  
  const handleSeekingChange = (newSeek) => {
    if (playerRef.current) {
      playerRef.current.seek(newSeek);
    }
  }
  
  useEffect(() => {
    // Créez l'intervalle lorsque le composant est monté
    seekInterval.current = setInterval(() => {
      if (playing) {
        updateSeek();
      }
    }, 1000);
  
    // Nettoyez l'intervalle lorsque le composant est démonté
    return () => {
      clearInterval(seekInterval);
    };
  }, []);

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
      <div className={styles.PlayerButtons}>
        {blobUrl ?  (
          <>
            <ReactHowler
              ref={playerRef}
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
      <div className={styles.PlayerSeek}>
          <label>
            Seek:
            <span className='slider-container'>
              <input
                type='range'
                min='0'
                max={playingLibraryTrack ? playingLibraryTrack.duration.toFixed(2) : 0}
                step='.01'
                value={seek}
                onChange={handleSeekingChange}
                // onMouseDown={handleMouseDownSeek}
                // onMouseUp={handleMouseUpSeek}
              />
            </span>
          </label>
        </div>
    </div>
  )
}

Player.propTypes = {
  playingLibraryTrack: PropTypes.object,
  setPlayingLibraryTrack: PropTypes.func.isRequired
};

export default Player