import styles from './Player.module.scss'
import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import ReactHowler from 'react-howler';
import raf from 'raf';
import Button from '../button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { FaPlay, FaPause } from 'react-icons/fa';


const Player = ({libTrackObjectWithBlobUrl}) => {
  const PlayStates = {
    PLAYING: 'PLAYING',
    PAUSED: 'NOT_PLAYING',
    STOPPED: 'STOPPED'
  };

  const [seek, setSeek] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playState, setPlayState] = useState(PlayStates.PAUSED);

  const playerRef = useRef(null);
  let rafIdRef = useRef(null);

  const handleLoadError = (id, err) => {
    console.log(`Error loading track of blob url ${libTrackObjectWithBlobUrl.blobUrl}: ${err}`);
  }
  
  const handlePlayPause = () => {
    if (playState === PlayStates.STOPPED) {
      setSeek(0);
      setPlayState(PlayStates.PLAYING);
    }
    else if (playState === PlayStates.PLAYING) {
      setPlayState(PlayStates.PAUSED);
    }
    else {
      setPlayState(PlayStates.PLAYING);
    }
  }

  const handlePlayerOnEnd = () => {
    setPlayState(PlayStates.STOPPED);
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
    if (playState) {
      rafIdRef.current = raf(renderSeekPos);
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
    setSeek(0);
    setPlayState(PlayStates.PLAYING);
  }, [libTrackObjectWithBlobUrl])

  useEffect(() => {
    if (playState === PlayStates.PLAYING) {
      if (playerRef.current) {
        renderSeekPos();
      }
    }
    else if (rafIdRef.current) {
      raf.cancel(rafIdRef.current);
    }
  }, [playState])

  useEffect(() => {
    if (playState === PlayStates.PLAYING) {
      if (isSeeking) {
        raf.cancel(rafIdRef.current);
      }
      else if (rafIdRef.current) {
        renderSeekPos();
      }
    }
    else if (playState === PlayStates.STOPPED) {
      setPlayState(PlayStates.PAUSED);
    }
  }, [isSeeking])

  return (
    <div className={styles.PlayerContainer}>
      <div className={styles.TrackInfo}>
        <div className={styles.TrackTitle}>
          {libTrackObjectWithBlobUrl ? libTrackObjectWithBlobUrl.title : ''}
        </div>
        <div className={styles.ArtistName}>
          {libTrackObjectWithBlobUrl ? (libTrackObjectWithBlobUrl.artist ? libTrackObjectWithBlobUrl.artist.name : '')  : ''}
        </div>
      </div>
      <div className={styles.Controls1}>
        <div className={styles.PlayPause}>
          <>
            <ReactHowler
              ref={playerRef}
              src={[libTrackObjectWithBlobUrl.blobUrl ? libTrackObjectWithBlobUrl.blobUrl : '']}
              html5={true}
              playing={playState === PlayStates.PLAYING}
              format={[libTrackObjectWithBlobUrl.fileExtension.replace('.', '')]}
              onLoadError={handleLoadError}
              onEnd={handlePlayerOnEnd}
              volume={volume}
            />
              <Button onClick={handlePlayPause}>{playState === PlayStates.PLAYING ? <FaPause /> : <FaPlay />}</Button>            <div>
              seek {seek}
            </div>
          </>
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
                  max={libTrackObjectWithBlobUrl ? libTrackObjectWithBlobUrl.duration.toFixed(2) : 0}
                  step='.01'
                  value={seek}
                  onChange={handleSeekingChange}
                  onMouseDown={handleSeekMouseDown}
                  onMouseUp={handleSeekMouseUp}
                />
              </span>
            </div>
          <div className={styles.TimeEnd}>
            {libTrackObjectWithBlobUrl ? formatTime(libTrackObjectWithBlobUrl.duration) : '00:00'}
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
  libTrackObjectWithBlobUrl: PropTypes.object
};

export default Player