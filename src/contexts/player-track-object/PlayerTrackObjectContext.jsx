import { createContext, useState } from "react";
import PropTypes from "prop-types";

import { PLAY_STATES } from "../../constants.js";

export const PlayerTrackObjectContext = createContext();

export function PlayerTrackObjectProvider({ children }) {
  const [playerTrackObject, setPlayerTrackObject] = useState(null);
  const [resetPlayerSeekSignal, setResetPlayerSeekSignal] = useState(false);
  const [playState, setPlayState] = useState();

  const handlePlayPauseAction = () => {
    if (playState === PLAY_STATES.STOPPED) {
      setResetPlayerSeekSignal(true);
      setPlayState(PLAY_STATES.PLAYING);
    } else if (playState === PLAY_STATES.PLAYING) {
      setPlayState(PLAY_STATES.PAUSED);
    } else {
      setPlayState(PLAY_STATES.PLAYING);
    }
    console.log("handlePlayPauseAction " + playState);
  };

  return (
    <PlayerTrackObjectContext.Provider
      value={{
        playerTrackObject,
        setPlayerTrackObject,
        playState,
        setPlayState,
        handlePlayPauseAction,
        resetPlayerSeekSignal,
        setResetPlayerSeekSignal,
      }}
    >
      {children}
    </PlayerTrackObjectContext.Provider>
  );
}

PlayerTrackObjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
