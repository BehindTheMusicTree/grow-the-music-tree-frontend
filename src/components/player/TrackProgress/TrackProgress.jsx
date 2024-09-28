import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import raf from "raf";
import ReactHowler from "react-howler";

import { usePlayer } from "../../../contexts/player/usePlayer";
import { PLAY_STATES } from "../../../utils/constants";
import { formatTime } from "../../../utils";

export default function TrackProgress({ volume, handleTrackEnd, seek, setSeek }) {
  const {
    playerLibTrackObject,
    stopProgressAnimationSignal,
    setStopProgressAnimationSignal,
    resetSeekSignal,
    setResetSeekSignal,
    playState,
    setPlayState,
  } = usePlayer();
  const [isSeeking, setIsSeeking] = useState(false);

  const playerRef = useRef(null);
  let rafIdRef = useRef(null);
  let previousSeekRef = useRef(null);

  const PROGRESS_SEEK_MAX_WHEN_NO_PLAYER = 1;

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

    console.error(`Error loading track of url ${playerLibTrackObject.blobUrl}: ${errorCode} - ${errorMessage}`);
  };

  const handleSeekingChange = (event) => {
    console.log("Seeking change: ", event.target.value);
    setSeek(parseFloat(event.target.value));
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleLeaveSeeking = (event) => {
    if (isSeeking) {
      previousSeekRef.current = null;
      console.log("Seeking leave: ", event.target.value);
      setSeek(parseFloat(event.target.value));
      setIsSeeking(false);
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

  const renderSeekPosition = () => {
    if (playerRef.current) {
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
    }
  };

  useEffect(() => {
    console.log("playState: ", playState);
    if (playState === PLAY_STATES.PLAYING) {
      if (isSeeking) {
        cancelRaf();
      } else if (seek >= Math.floor(playerLibTrackObject.durationInSec)) {
        handleTrackEnd();
      } else {
        console.log("renderSeekPosition", seek);
        playerRef.current.seek(seek);
        renderSeekPosition();
      }
    } else if (playState === PLAY_STATES.PAUSED && !isSeeking) {
      cancelRaf();
    } else if (playState === PLAY_STATES.STOPPED && !isSeeking && seek > 0) {
      setPlayState(PLAY_STATES.PAUSED);
    }
  }, [isSeeking, playState]);

  useEffect(() => {
    if (stopProgressAnimationSignal) {
      console.log("Stop progress animation signal");
      cancelRaf();
      setStopProgressAnimationSignal(0);
    }
  }, [stopProgressAnimationSignal]);

  useEffect(() => {
    console.log("Reset seek signal: ", resetSeekSignal);
    if (resetSeekSignal) {
      previousSeekRef.current = 0;
      setSeek(0);
      setResetSeekSignal(0);
    }
  }, [resetSeekSignal]);

  useEffect(() => {
    console.log("Seek: ", seek);
    if (seek === 0) {
      if (playState === PLAY_STATES.LOADING) {
        setPlayState(PLAY_STATES.PLAYING);
      } else if (playState === PLAY_STATES.PAUSED) {
        playerRef.current.seek(0);
        setPlayState(PLAY_STATES.STOPPED);
      } else if (playState === PLAY_STATES.PLAYING) {
        playerRef.current.seek(0);
        renderSeekPosition();
      }
    }
  }, [seek]);

  return (
    <div className="flex flex justify-center items-center w-full">
      {playState !== PLAY_STATES.LOADING ? (
        <ReactHowler
          ref={playerRef}
          src={[playerLibTrackObject.blobUrl]}
          html5={true}
          playing={playState === PLAY_STATES.PLAYING}
          format={[playerLibTrackObject.libraryTrack.file.extension.replace(".", "")]}
          onLoadError={handleLoadError}
          onEnd={handleTrackEnd}
          volume={volume}
        />
      ) : null}
      <div className="w-14 text-right">{formatTime(seek)}</div>
      <input
        className="progress-bar ml-2.5 mr-2.5 w-full"
        type="range"
        min="0"
        max={playerRef ? Math.floor(playerLibTrackObject.libraryTrack.durationInSec) : PROGRESS_SEEK_MAX_WHEN_NO_PLAYER}
        value={playerRef ? seek : PROGRESS_SEEK_MAX_WHEN_NO_PLAYER}
        onChange={handleSeekingChange}
        onMouseDown={handleSeekMouseDown}
        onMouseUp={handleLeaveSeeking}
        onMouseLeave={handleLeaveSeeking} // because mouseup doesn't fire if mouse leaves the element
      />
      <div className="w-14 text-left">
        {formatTime(playerRef.current ? playerLibTrackObject.libraryTrack.durationInSec : 0)}
      </div>
    </div>
  );
}

TrackProgress.propTypes = {
  volume: PropTypes.number.isRequired,
  handleTrackEnd: PropTypes.func.isRequired,
  seek: PropTypes.number.isRequired,
  setSeek: PropTypes.func.isRequired,
};
