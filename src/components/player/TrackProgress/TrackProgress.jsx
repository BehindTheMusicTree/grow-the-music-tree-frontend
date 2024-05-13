import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import raf from "raf";
import ReactHowler from "react-howler";

import { usePlayerTrackObject } from "../../../contexts/player-track-object/usePlayerTrackObject.jsx";
import { usePlayState } from "../../../contexts/play-state/usePlayState.jsx";
import { PLAY_STATES } from "../../../constants";
import { formatTime } from "../../../utils";

export default function TrackProgress({
  shouldResetPlayerSeek,
  setshouldResetPlayerSeek,
  volume,
  handleTrackEnd,
  seek,
  setSeek,
}) {
  const { playerTrackObject } = usePlayerTrackObject();
  const { playState, setPlayState } = usePlayState();
  const [isSeeking, setIsSeeking] = useState(false);

  const playerRef = useRef(null);
  let rafIdRef = useRef(null);
  let previousSeekRef = useRef(null);

  const handleLoadError = (id, errorCode) => {
    let errorMessage = "";

    switch (errorCode) {
      case 1:
        errorMessage =
          "The fetching process for the media resource was aborted by the user agent at the user's request.";
        break;
      case 2:
        errorMessage =
          "A network error of some description caused the user agent to stop fetching the media resource, after the resource was established to be usable.";
        break;
      case 3:
        errorMessage =
          "An error of some description occurred while decoding the media resource, after the resource was established to be usable.";
        break;
      case 4:
        errorMessage =
          "The media resource indicated by the src attribute or assigned media provider object was not suitable.";
        break;
      default:
        errorMessage = "An unknown error occurred.";
    }

    console.error(`Error loading track of url ${playerTrackObject.blobUrl}: ${errorCode} - ${errorMessage}`);
  };

  const handleSeekingChange = (event) => {
    setSeek(parseFloat(event.target.value));
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleLeaveSeeking = (event) => {
    if (isSeeking) {
      previousSeekRef.current = null;
      setSeek(parseFloat(event.target.value));
      setIsSeeking(false);
    }
  };

  const renderSeekPosition = () => {
    const currentSeek = playerRef.current.seek();
    if (previousSeekRef.current != undefined) {
      const deltaSeek = currentSeek - previousSeekRef.current;
      setSeek((seek) => seek + deltaSeek);
    }

    previousSeekRef.current = currentSeek;
    if (playState === PLAY_STATES.PLAYING && !isSeeking) {
      rafIdRef.current = raf(() => {
        renderSeekPosition();
      });
    }
  };

  const cancelRaf = () => {
    raf.cancel(rafIdRef.current);
  };

  useEffect(() => {
    return () => {
      cancelRaf();
    };
  }, []);

  useEffect(() => {
    if (playState === PLAY_STATES.PLAYING) {
      if (isSeeking) {
        cancelRaf();
      } else if (seek >= Math.floor(playerTrackObject.duration)) {
        handleTrackEnd();
      } else {
        playerRef.current.seek(seek);
        renderSeekPosition();
      }
    } else if (playState === PLAY_STATES.STOPPED && !isSeeking) {
      setPlayState(PLAY_STATES.PAUSED);
    }
  }, [isSeeking, playState]);

  useEffect(() => {
    if (shouldResetPlayerSeek) {
      previousSeekRef.current = null;
      setSeek(0);
      playerRef.current.seek(0);
      setshouldResetPlayerSeek(false);
    }
  }, [shouldResetPlayerSeek]);

  return (
    <div className="flex flex justify-center items-center w-full">
      <ReactHowler
        ref={playerRef}
        src={[playerTrackObject.blobUrl]}
        html5={true}
        playing={playState === PLAY_STATES.PLAYING}
        format={[playerTrackObject.file.extension.replace(".", "")]}
        onLoadError={handleLoadError}
        onEnd={handleTrackEnd}
        volume={volume}
      />
      <div className="w-14 text-right">{formatTime(seek)}</div>
      {playerRef.current ? (
        <input
          className="progress-bar ml-2.5 mr-2.5 w-full"
          type="range"
          min="0"
          max={Math.floor(playerRef.current.duration())}
          value={seek}
          onChange={handleSeekingChange}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleLeaveSeeking}
          onMouseLeave={handleLeaveSeeking} // because mouseup doesn't fire if mouse leaves the element
        />
      ) : null}
      <div className="w-14 text-left">{formatTime(playerRef.current ? playerRef.current.duration() : 0)}</div>
    </div>
  );
}

TrackProgress.propTypes = {
  shouldResetPlayerSeek: PropTypes.bool.isRequired,
  setshouldResetPlayerSeek: PropTypes.func.isRequired,
  volume: PropTypes.number.isRequired,
  handleTrackEnd: PropTypes.func.isRequired,
  seek: PropTypes.number.isRequired,
  setSeek: PropTypes.func.isRequired,
};
