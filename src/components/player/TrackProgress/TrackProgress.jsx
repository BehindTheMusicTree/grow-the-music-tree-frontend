import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import raf from 'raf';
import ReactHowler from 'react-howler';
import { PLAY_STATES } from '../../../constants';
import { formatTime } from '../../../utils';

export default function TrackProgress ({ 
    playState, 
    setPlayState, 
    shouldResetPlayerSeek, 
    setshouldResetPlayerSeek,
    playerTrackObject,
    volume,
    handleTrackEnd,
    seek,
    setSeek}) {

  const [isSeeking, setIsSeeking] = useState(false);

  const playerRef = useRef(null);
  let rafIdRef = useRef(null);
  let previousSeekRef = useRef(null);

  const handleLoadError = (id, err) => {
    console.error(`Error loading track of blob url ${playerTrackObject.blobUrl}: ${err}`);
  }

  const handleSeekingChange = (event) => {
    setSeek(parseFloat(event.target.value));
  }

  const handleSeekMouseDown = () => {
    setIsSeeking(true)
  }

  const handleLeaveSeeking = (event) => {
    if (isSeeking) {
      previousSeekRef.current = null;
      setSeek(parseFloat(event.target.value));
      setIsSeeking(false);
    }
  }

  const renderSeekPos = () => {
    const currentSeek = playerRef.current.seek();
    if (previousSeekRef.current != undefined) {
      const deltaSeek =  currentSeek -  previousSeekRef.current;
      setSeek(seek => seek + deltaSeek)
    }

    previousSeekRef.current = currentSeek
    if (playState === PLAY_STATES.PLAYING && !isSeeking) {
        rafIdRef.current = raf(() => {
          renderSeekPos();
      });
    }
  }

  const cancelRaf = () => {
    raf.cancel(rafIdRef.current);
  }

  useEffect(() => {
    return () => {
      cancelRaf();
    }
  }, [])

  useEffect(() => {
    if (playState === PLAY_STATES.PLAYING) {
      if (isSeeking) {
        cancelRaf();
      } else if (seek >= Math.floor(playerTrackObject.duration)) {
        handleTrackEnd()
      } else {
        playerRef.current.seek(seek);
        renderSeekPos();
      }
    } else if (playState === PLAY_STATES.STOPPED && !isSeeking) {
      setPlayState(PLAY_STATES.PAUSED);
    }
  }, [isSeeking])

  useEffect(() => {
    if (shouldResetPlayerSeek) {
      previousSeekRef.current = null;
      setSeek(0);
      playerRef.current.seek(0);
      setshouldResetPlayerSeek(false);
    }
  }, [shouldResetPlayerSeek])

  return (
    <div className="flex flex-row justify-center items-center w-full">
        <ReactHowler
          ref={playerRef}
          src={[playerTrackObject.blobUrl]}
          html5={true}
          playing={playState === PLAY_STATES.PLAYING}
          format={[playerTrackObject.file.extension.replace('.', '')]}
          onLoadError={handleLoadError}
          onEnd={handleTrackEnd}
          volume={volume}/>
      <div className="w-10">
        {formatTime(seek)}
      </div>
      {playerRef.current ? 
        <input
          className="progress-bar flex-grow-0 flex-shrink-0 w-4/5 ml-2.5 mr-2.5"
          type="range"
          min="0"
          max={Math.floor(playerRef.current.duration())}
          value={seek}
          onChange={handleSeekingChange}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleLeaveSeeking}
          onMouseLeave={handleLeaveSeeking} // because mouseup doesn't fire if mouse leaves the element
        /> 
        : null}
      <div className="w-10">
        {formatTime(playerRef.current ? playerRef.current.duration() : 0)}
      </div>
    </div>
  )
}

TrackProgress.propTypes = {
    playState: PropTypes.string.isRequired,
    setPlayState: PropTypes.func.isRequired,
    shouldResetPlayerSeek: PropTypes.bool.isRequired,
    setshouldResetPlayerSeek: PropTypes.func.isRequired,
    playerTrackObject: PropTypes.object.isRequired,
    volume: PropTypes.number.isRequired,
    handleTrackEnd: PropTypes.func.isRequired,
    seek: PropTypes.number.isRequired,
    setSeek: PropTypes.func.isRequired};