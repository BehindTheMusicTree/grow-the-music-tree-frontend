import { usePlayerTrackObject } from "../../contexts/player-lib-track-object/usePlayerLibTrackObject";
import { PLAY_STATES } from "../../constants.js";

import PropTypes from "prop-types";

export default function LibTrackPosition({ position, uuid }) {
  const { playerLibTrackObject, playState } = usePlayerTrackObject();

  return (
    <div>
      {playerLibTrackObject && playerLibTrackObject.libraryTrack.uuid == uuid ? (
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
  );
}

LibTrackPosition.propTypes = {
  position: PropTypes.number.isRequired,
  uuid: PropTypes.string.isRequired,
};
