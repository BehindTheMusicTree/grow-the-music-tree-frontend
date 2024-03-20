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
    playerTrackObject,
    volume,
    handleTrackEnd}) => {

  const [seek, setSeek] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const playerRef = useRef(null);
  let rafIdRef = useRef(null);

  const handleLoadError = (id, err) => {
    console.log(`Error loading track of blob url ${playerTrackObject.blobUrl}: ${err}`);
  }

  const handleSeekingChange = (event) => {
    setSeek(parseFloat(event.target.value));
  }

  const handleSeekMouseDown = () => {
    console.log('Seek mouse down');
    setIsSeeking(true)
  }

  const handleLeaveSeeking = (event) => {
    console.log('Seek mouse up');
    if (isSeeking) {
      console.log('set not seeking');
      setIsSeeking(false);
      playerRef.current.seek(event.target.value);
    }
  }

  const renderSeekPos = () => {
    // console.log('Render seek pos');
    // console.log('isSeeking', isSeeking);
    if (!isSeeking) {
      setSeek(playerRef.current.seek())
    }

    if (playState === PlayStates.PLAYING && !rafIdRef.current) {
      console.log('raf');
      rafIdRef.current = raf(() => {
        rafIdRef.current = null;
        renderSeekPos();
      });
    }
  }

  const cancelRaf = () => {
    raf.cancel(rafIdRef.current);
    rafIdRef.current = null;
  }

  useEffect(() => {
    console.log('Render progressbar');
    // console.log('Render progressbar lib track', playerTrackObject.blobUrl);
    // console.log('Render progressbar lib track', playerTrackObject.title);
    // console.log('Render progressbar lib track', playerTrackObject.hasNext);
    // console.log('Render progressbar lib track', playState);
    // console.log('Render progressbar lib track', shouldResetSeek);

    return () => {
      console.log('Unmount progressbar');
      cancelRaf();
    }
  }, [])

  useEffect(() => {
    // console.log('playerTrackObject', playerTrackObject);
    // console.log('shouldResetSeek', shouldResetSeek);
    // console.log('playState', playState);
  }, [shouldResetSeek, playerTrackObject, playState])

  useEffect(() => {
    console.log('playState', playState);
    if (playState === PlayStates.PLAYING) {
      console.log('renderSeekPos1');
      renderSeekPos();
    }
    else {
      cancelRaf();
    }
  }, [playState])

  useEffect(() => {
    console.log('isSeeking', isSeeking);
    if (playState === PlayStates.PLAYING) {
      if (isSeeking) {
        console.log('Cancel raf');
        cancelRaf();
      }
      else if (seek === Math.floor(playerTrackObject.duration)) {
        handleTrackEnd()
      }
      else {
        console.log('renderSeekPos2');
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

  const handleTrackEnd2 = () => {
    console.log('Track end2');
    handleTrackEnd();
  }

  return (
    <div className={styles.TrackProgress}>
        <ReactHowler
        ref={playerRef}
        src={[playerTrackObject.blobUrl]}
        html5={true}
        playing={playState === PlayStates.PLAYING}
        format={[playerTrackObject.fileExtension.replace('.', '')]}
        onLoadError={handleLoadError}
        onEnd={handleTrackEnd2}
        volume={volume}
        />
      <div className={styles.CurrentTime}>
        {formatTime(seek)}
      </div>
      {playerRef.current ? <input
        className={styles.ProgressBar}
        type="range"
        min="0"
        max={Math.floor(playerRef.current.duration())}
        value={seek}
        onChange={handleSeekingChange}
        onMouseDown={handleSeekMouseDown}
        onMouseUp={handleLeaveSeeking}
        onMouseLeave={handleLeaveSeeking} // because mouseup doesn't fire if mouse leaves the element
      /> : null}
      <div className={styles.TotalTime}>
        {formatTime(playerRef.current ? playerRef.current.duration() : 0)}
      </div>
    </div>
  )
}

TrackProgress.propTypes = {
    playState: PropTypes.string,
    setPlayState: PropTypes.func,
    shouldResetSeek: PropTypes.bool,
    setShouldResetSeek: PropTypes.func,
    playerTrackObject: PropTypes.object,
    volume: PropTypes.number,
    handleTrackEnd: PropTypes.func};

export default TrackProgress;