import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { PLAY_STATES } from "../../constants.js";
import ApiService from "../../utils/service/apiService.js";

export const PlayerTrackObjectContext = createContext();

export function PlayerTrackObjectProvider({ children }) {
  const [playerLibTrackObject, setPlayerLibTrackObject] = useState(null);
  const [resetPlayerSeekSignal, setResetPlayerSeekSignal] = useState(false);
  const [playState, setPlayState] = useState();

  const setLibTrackToPlay = async (libTrack, hasNext, hasPrevious) => {
    const playingLibTrackBlobUrl = await ApiService.loadAudioAndGetLibTrackBlobUrl(libTrack.relativeUrl);
    setPlayState(PLAY_STATES.PLAYING);
    setPlayerLibTrackObject({
      libraryTrack: libTrack,
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

  useEffect(() => {
    if (playerLibTrackObject) {
      if (playState === PLAY_STATES.LOADING) {
        setPlayState(PLAY_STATES.PLAYING);
      }
    }
  }, [playerLibTrackObject]);

  return (
    <PlayerTrackObjectContext.Provider
      value={{
        playerLibTrackObject,
        setPlayerLibTrackObject,
        playState,
        setPlayState,
        handlePlayPauseAction,
        resetPlayerSeekSignal,
        setResetPlayerSeekSignal,
        setLibTrackToPlay,
      }}
    >
      {children}
    </PlayerTrackObjectContext.Provider>
  );
}

PlayerTrackObjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
