import PropTypes from "prop-types";
import { FaPlay, FaPause } from "react-icons/fa";

import { usePlayer } from "@contexts/PlayerContext";
import { PLAY_STATES } from "../../app/lib/utils/constants";

export default function UploadedTrackPositionPlayPause({ position, uuid, handlePlayPauseClick }) {
  const { playerUploadedTrackObject, playState } = usePlayer();

  return (
    <div
      className="track-position-play-pause flex items-center justify-center text-lg w-16 cursor-pointer"
      onClick={handlePlayPauseClick}
    >
      <div className="group-hover:hidden">
        <div>
          {playerUploadedTrackObject &&
          playerUploadedTrackObject.uploadedTrack.uuid === uuid &&
          playState !== PLAY_STATES.STOPPED ? (
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
        {playerUploadedTrackObject &&
        playerUploadedTrackObject.uploadedTrack.uuid === uuid &&
        playState === PLAY_STATES.PLAYING ? (
          <FaPause />
        ) : (
          <FaPlay />
        )}
      </div>
    </div>
  );
}

UploadedTrackPositionPlayPause.propTypes = {
  position: PropTypes.number.isRequired,
  uuid: PropTypes.string.isRequired,
  handlePlayPauseClick: PropTypes.func.isRequired,
};
