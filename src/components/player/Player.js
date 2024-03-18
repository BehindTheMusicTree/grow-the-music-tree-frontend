import styles from './Player.module.scss'
import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import ReactHowler from 'react-howler';
import raf from 'raf';
import Button from '../button/Button';
import ApiService from '../../service/apiService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'

const Player = ({playingLibTrackObject}) => {
  const PlayStates = {
    PLAYING: 'PLAYING',
    NOT_PLAYING: 'NOT_PLAYING',
    STOPPED: 'STOPPED'
  };

  const [libTrackBlobUrl, setLibTrackBlobUrl] = useState();
  const [seek, setSeek] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playState, setPlayState] = useState(PlayStates.NOT_PLAYING);

  const mustGetLibTrackBlobUrl = useRef(false);
  const isTrackLoading = useRef(false);
  const playerRef = useRef(null);
  let rafId = useRef(null);

  const handleLoadError = (id, err) => {
    console.log(`Error loading track of blob url ${libTrackBlobUrl}: ${err}`);
  }
  
  const handlePause = () => {
    if (playState !== PlayStates.STOPPED) {
        setPlayState(PlayStates.NOT_PLAYING);
    }
  }
  
  const handlePlay = () => {
    if (playState !== PlayStates.STOPPED) {
      setPlayState(PlayStates.PLAYING);
    }
  }

  const handlePlayerOnEnd = () => {
    console.log('handlePlayerOnEnd')
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
    if (playingLibTrackObject && !isTrackLoading.current) {
      isTrackLoading.current = true;
      mustGetLibTrackBlobUrl.current = true;
    }
  }, [playingLibTrackObject, isTrackLoading.current])

  useEffect(() => {
    const getLibraryTrackBlobUrl = async () => {
      const blobUrl = await ApiService.getLibraryTrackAudio(playingLibTrackObject.relativeUrl)
      setLibTrackBlobUrl(blobUrl);
    }

    if (mustGetLibTrackBlobUrl.current) {
      mustGetLibTrackBlobUrl.current = false;
      getLibraryTrackBlobUrl();
    }
  }, [mustGetLibTrackBlobUrl.current])

  useEffect(() => {
    if (libTrackBlobUrl) {
      setSeek(0);
      setPlayState(PlayStates.PLAYING);
      isTrackLoading.current = false;
    }
  }, [libTrackBlobUrl])

  useEffect(() => {
    if (playState.PLAYING) {
      if (playerRef.current) {
        renderSeekPos();
      }
    }
    else if (rafId.current) {
      raf.cancel(rafId.current);
    }
  }, [playState, playerRef.current])

  useEffect(() => {
    if (isSeeking) {
      raf.cancel(rafId.current);
    }
    else if (rafId.current) {
        renderSeekPos();
    }
  }, [isSeeking])

  return (
    <div className={styles.PlayerContainer}>
      <div className={styles.TrackInfo}>
        <div className={styles.TrackTitle}>
          {playingLibTrackObject ? playingLibTrackObject.title : ''}
        </div>
        <div className={styles.ArtistName}>
          {playingLibTrackObject ? (playingLibTrackObject.artist ? playingLibTrackObject.artist.name : '')  : ''}
        </div>
      </div>
      <div className={styles.Controls1}>
        <div className={styles.PlayPause}>
          <>
            <ReactHowler
              ref={playerRef}
              src={[libTrackBlobUrl ? libTrackBlobUrl : '']}
              html5={true}
              playing={playState === PlayStates.PLAYING}
              format={[playingLibTrackObject.fileExtension.replace('.', '')]}
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
                  max={playingLibTrackObject ? playingLibTrackObject.duration.toFixed(2) : 0}
                  step='.01'
                  value={seek}
                  onChange={handleSeekingChange}
                  onMouseDown={handleSeekMouseDown}
                  onMouseUp={handleSeekMouseUp}
                />
              </span>
            </div>
          <div className={styles.TimeEnd}>
            {playingLibTrackObject ? formatTime(playingLibTrackObject.duration) : '00:00'}
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
  playingLibTrackObject: PropTypes.object,
};

export default Player