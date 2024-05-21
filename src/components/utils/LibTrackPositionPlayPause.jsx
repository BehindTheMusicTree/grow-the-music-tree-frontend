import PropTypes from "prop-types";
import { FaPlay, FaPause } from "react-icons/fa";

import { usePlayer } from "../../contexts/player/usePlayer.jsx";
import { PLAY_STATES } from "../../constants.js";
import { useEffect } from "react";

export default function LibTrackPositionPlayPause({ position, uuid, handlePlayPauseClick }) {
  const { libTrackObject, playState } = usePlayer();

  useEffect(() => {
    console.log("playState " + playState);
  }, [playState]);

  return (
    <div
      className="track-position-play-pause flex items-center justify-center text-lg w-16 cursor-pointer"
      onClick={handlePlayPauseClick}
    >
      <div className="group-hover:hidden">
        <div>
          {libTrackObject && libTrackObject.libraryTrack.uuid === uuid && playState !== PLAY_STATES.STOPPED ? (
            <div className="flex space-x-1 items-end">
              <div
                className={`w-playingbar bg-green-500 h-3 origin-bottom ${
                  playState === PLAY_STATES.PLAYING ? "animate-scale-pulse" : ""
                }`}
              ></div>
              <div
                className={`w-playingbar bg-green-500 h-4 origin-bottom ${
                  playState === PLAY_STATES.PLAYING ? "animate-scale-pulse delay-200" : ""
                }`}
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className={`w-playingbar bg-green-500 h-3 origin-bottom ${
                  playState === PLAY_STATES.PLAYING ? "animate-scale-pulse delay-400" : ""
                }`}
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
          ) : (
            position
          )}
        </div>
      </div>
      <div className="hidden group-hover:flex items-center justify-center">
        {libTrackObject && libTrackObject.libraryTrack.uuid === uuid && playState === PLAY_STATES.PLAYING ? (
          <FaPause />
        ) : (
          <FaPlay />
        )}
      </div>
    </div>
  );
}

LibTrackPositionPlayPause.propTypes = {
  position: PropTypes.number.isRequired,
  uuid: PropTypes.string.isRequired,
  handlePlayPauseClick: PropTypes.func.isRequired,
};
