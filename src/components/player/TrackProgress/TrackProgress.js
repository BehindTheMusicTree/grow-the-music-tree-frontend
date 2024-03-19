import styles from './TrackProgress.module.scss'
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import raf from 'raf';
import ReactHowler from 'react-howler';
import { PlayStates } from '../../../constants';
  
const formatTime = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (minutes < 10) { minutes = "0" + minutes; }
    if (secs < 10) { secs = "0" + secs; }
    return `${minutes}:${secs}`;
}

const TrackProgress = ({ 
    playState, 
    setPlayState, 
    shouldResetSeek, 
    setShouldResetSeek, 
    isSeeking, 
    setIsSeeking, 
    libTrackObjectWithBlobUrl,
    volume }) => {

  const [seek, setSeek] = useState(0);

  const playerRef = useRef(null);
  let rafIdRef = useRef(null);

  const handlePlayerOnEnd = () => {
    setPlayState(PlayStates.STOPPED);
  }

  const handleLoadError = (id, err) => {
    console.log(`Error loading track of blob url ${libTrackObjectWithBlobUrl.blobUrl}: ${err}`);
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

  useEffect(() => {
    if (shouldResetSeek) {
      setSeek(0);
      setShouldResetSeek(false);
    }
  }, [shouldResetSeek])

  return (
    <div className={styles.TrackProgress}>
        <ReactHowler
        ref={playerRef}
        src={[libTrackObjectWithBlobUrl.blobUrl]}
        html5={true}
        playing={playState === PlayStates.PLAYING}
        format={[libTrackObjectWithBlobUrl.fileExtension.replace('.', '')]}
        onLoadError={handleLoadError}
        onEnd={handlePlayerOnEnd}
        volume={volume}
        />
      <div className={styles.CurrentTime}>
        {formatTime(seek)}
      </div>
      <input
        className={styles.ProgressBar}
        type="range"
        min="0"
        max={playerRef.current ? playerRef.current.duration() : 0}
        value={seek}
        onChange={handleSeekingChange}
        onMouseDown={handleSeekMouseDown}
        onMouseUp={handleSeekMouseUp}
      />
      <div className={styles.TotalTime}>
        {formatTime(playerRef.current ? playerRef.current.duration() : 0)}
      </div>
    </div>
  )
}

TrackProgress.propTypes = {
    playState: PropTypes.string,
    setPlayState: PropTypes.func,
    isSeeking: PropTypes.bool,
    setIsSeeking: PropTypes.func,
    shouldResetSeek: PropTypes.bool,
    setShouldResetSeek: PropTypes.func,
    libTrackObjectWithBlobUrl: PropTypes.object,
    volume: PropTypes.number};

export default TrackProgress;