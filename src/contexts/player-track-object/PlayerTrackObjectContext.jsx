import { createContext, useState } from "react";
import PropTypes from "prop-types";

import { PLAY_STATES } from "../../constants.js";
import ApiService from "../../utils/service/apiService";

export const PlayerTrackObjectContext = createContext();

export function PlayerTrackObjectProvider({ children }) {
  const [playerTrackObject, setPlayerTrackObject] = useState(null);
  const [resetPlayerSeekSignal, setResetPlayerSeekSignal] = useState(false);
  const [playState, setPlayState] = useState();

  const setPlayingTrack = async (playingTrackObject, hasNext, hasPrevious) => {
    const playingLibTrackBlobUrl = await ApiService.loadAudioAndGetLibTrackBlobUrl(
      playingTrackObject.libraryTrack.relativeUrl
    );
    setPlayState(PLAY_STATES.PLAYING);
    setPlayerTrackObject({
      ...playingTrackObject.libraryTrack,
      blobUrl: playingLibTrackBlobUrl,
      hasNext: hasNext,
      hasPrevious: hasPrevious,
    });
  };

  const handlePlayPauseAction = (event) => {
    event.stopPropagation();
    if (playState === PLAY_STATES.STOPPED) {
      setResetPlayerSeekSignal(true);
      setPlayState(PLAY_STATES.PLAYING);
    } else if (playState === PLAY_STATES.PLAYING) {
      setPlayState(PLAY_STATES.PAUSED);
    } else {
      setPlayState(PLAY_STATES.PLAYING);
    }
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
        setPlayingTrack,
      }}
    >
      {children}
    </PlayerTrackObjectContext.Provider>
  );
}

PlayerTrackObjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
