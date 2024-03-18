import styles from './Player.module.scss'
import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import ReactHowler from 'react-howler';
import raf from 'raf';
import Button from '../button/Button';
import ApiService from '../../service/apiService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'

const Player = ({playingLibraryTrack, setPlayingLibraryTrack}) => {
  const LIBRARY_TRACK_SAMPLE_UUID = `joy8KSUE3L57QzUdH7LZNL`

  const [mustLoadStream, setIsLoadingStream] = useState(false);
  const [blobUrl, setBlobUrl] = useState();
  const [seek, setSeek] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playing, setPlaying] = useState(false);

  const playerRef = useRef(null);
  let rafId = useRef(null);

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
  }
  
  const handlePlay = () => {
    setPlaying(true);
  }

  const handlePlayerOnEnd = () => {
    setPlaying(false)
  }
  
  const handleSeekingChange = (event) => {
    setSeek(parseFloat(event.target.value));
  }

  const handleSeekMouseDown = () => {
    setIsSeeking(true)
  }

  const handleSeekMouseUp = (event) => {
    setIsSeeking(false);
    playerRef.current.seek(event.target.value);
  }

  const renderSeekPos = () => {
    if (!isSeeking) {
      setSeek(playerRef.current.seek())
    }
    if (playing) {
      rafId.current = raf(renderSeekPos);
    }
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
  }, []);

  useEffect(() => {
    if (mustLoadStream) {
      setIsLoadingStream(false);
      getLibraryTrack();
    }
  }, [mustLoadStream]);

  useEffect(() => {
    if (playingLibraryTrack) {
      setSeek(0);
      getLibraryTrackBlobUrl();
    }
  }, [playingLibraryTrack])

  useEffect(() => {
    if (playing) {
      renderSeekPos();
    }
    else {
      raf.cancel(rafId.current);
    }
  }, [playing])

  useEffect(() => {
    if (isSeeking) {
      raf.cancel(rafId.current);
    }
    else {
      if (rafId.current) {
        renderSeekPos();
      }
    }
  }, [isSeeking])

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
                onEnd={handlePlayerOnEnd}
                volume={volume}
              />
              <Button onClick={handlePlay}>Play</Button>
              <Button onClick={handlePause}>Pause</Button>
              <div>
                seek {seek}
              </div>
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
                  onChange={handleSeekingChange}
                  onMouseDown={handleSeekMouseDown}
                  onMouseUp={handleSeekMouseUp}
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