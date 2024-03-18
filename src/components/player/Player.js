import styles from './Player.module.scss'
import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import ReactHowler from 'react-howler';
import raf from 'raf'
import Button from '../button/Button';
import ApiService from '../../service/apiService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'

const Player = ({playingLibraryTrack, setPlayingLibraryTrack}) => {
  const LIBRARY_TRACK_SAMPLE_UUID = `joy8KSUE3L57QzUdH7LZNL`

  const [mustLoadStream, setIsLoadingStream] = useState(false);
  const [blobUrl, setBlobUrl] = useState();
  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(0.5); // Initialise le volume à 0.5

  const seekInterval = useRef(null);
  const playerRef = useRef(null);
  let _raf = useRef(null);

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
  
  const handlePause = () => {
    setPlaying(false);
    clearInterval(seekInterval);
  }
  
  const handlePlay = () => {
    setPlaying(true);
    renderSeekPos()
  }

  const handleOnEnd = () => {
    setPlaying(false)
    clearRAF()
  }
  
  const handleSeekingChange = (event) => {
    if (playerRef.current && isSeeking) {
      setSeek(parseFloat(event.target.value))
    }
  }

  const handleMouseDownSeek = () => {
    console.log('handleMouseDownSeek')
    if (playing) {
      setIsSeeking(true)
    }
  }

  const handleMouseUpSeek = () => {
    console.log('handleMouseUpSeek')
    if (isSeeking) {
      setIsSeeking(false)
      playerRef.current.seek(seek)
    }
  }
  
  const renderSeekPos = () => {
    console.log('renderSeekPos')
    if (!isSeeking) {
      console.log('renderSeekPos - !isSeeking')
      setSeek(playerRef.current.seek())
    }
    if (playing) {
      _raf = raf(renderSeekPos)
    }
  }

  const clearRAF = () => {
    raf.cancel(_raf)
  }
  
  const formatTime = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (minutes < 10) { minutes = "0" + minutes; }
    if (secs < 10) { secs = "0" + secs; }
    return `${minutes}:${secs}`;
  }

  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
  };
  
  useEffect(() => {

    if (!mustLoadStream) {
      setIsLoadingStream(true);
    }
  
    return () => {
      clearInterval(seekInterval)
      clearRAF()
    };
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUpSeek);
  
    return () => {
      window.removeEventListener('mouseup', handleMouseUpSeek);
    };
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

  useEffect(() => {
    if (playing) {
      seekInterval.current = setInterval(() => {
        if (playerRef.current) {
          setSeek(playerRef.current.seek());
        }
      }, 1000);
    } else {
      clearInterval(seekInterval.current);
    }
  
    return () => {
      clearInterval(seekInterval.current);
    };
  }, [playing]);

  return (
    <div className={styles.PlayerContainer}>
      <div className={styles.TrackInfo}>
        <div className={styles.TrackTitle}>
          {playingLibraryTrack ? playingLibraryTrack.title : ''}
        </div>
        <div className={styles.ArtistName}>
          {playingLibraryTrack ? (playingLibraryTrack.artist ? playingLibraryTrack.artist.name : '')  : ''}
        </div>
      </div>
      <div className={styles.Controls1}>
        <div className={styles.PlayPause}>
          {blobUrl ?  (
            <>
              <ReactHowler
                ref={playerRef}
                src={[blobUrl]}
                html5={true}
                playing={playing}
                format={[playingLibraryTrack.fileExtension.replace('.', '')]}
                onLoadError={handleLoadError}
                onEnd={handleOnEnd}
                volume={volume}
              />
              <Button onClick={handlePlay}>Play</Button>
              <Button onClick={handlePause}>Pause</Button>
            </>
          ) : (
            <p>Loading audio stream...</p>
          )}
        </div>
        <div className={styles.Seek}>
          <div className={styles.TimeCurrent}>
            {formatTime(seek)}
          </div>
          <div className={styles.Progressbar}>
              <span className='slider-container'>
                <input
                  type='range'
                  min='0'
                  max={playingLibraryTrack ? playingLibraryTrack.duration.toFixed(2) : 0}
                  step='.01'
                  value={seek}
                  onInput={handleSeekingChange}
                  onMouseDown={handleMouseDownSeek}
                  onMouseUp={handleMouseUpSeek}
                />
              </span>
            </div>
          <div className={styles.TimeEnd}>
            {playingLibraryTrack ? formatTime(playingLibraryTrack.duration) : '00:00'}
          </div>
        </div>
      </div>
      <div className={styles.Controls2}>
        <div className={styles.Volume}>
          <FontAwesomeIcon icon={faVolumeUp} />
          <input 
            type='range' 
            min='0' 
            max='1' 
            step='.01' 
            value={volume} 
            onChange={handleVolumeChange} 
          />
        </div>
      </div>
    </div>
  )
}

Player.propTypes = {
  playingLibraryTrack: PropTypes.object,
  setPlayingLibraryTrack: PropTypes.func.isRequired
};

export default Player