import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { PLAY_STATES } from "../../constants.js";
import ApiService from "../../utils/service/apiService.js";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [libTrackObject, setLibTrackObject] = useState(null);
  const [resetSeekSignal, setResetSeekSignal] = useState(0);
  const [playState, setPlayState] = useState(PLAY_STATES.STOPPED);

  const setLibTrackToPlay = async (libTrack, hasNext, hasPrevious) => {
    const playingLibTrackBlobUrl = await ApiService.loadAudioAndGetLibTrackBlobUrl(libTrack.relativeUrl);
    setPlayState(PLAY_STATES.PLAYING);
    setLibTrackObject({
      libraryTrack: libTrack,
      blobUrl: playingLibTrackBlobUrl,
      hasNext: hasNext,
      hasPrevious: hasPrevious,
    });
  };

  const handlePlayPauseAction = (event) => {
    event.stopPropagation();
    if (playState === PLAY_STATES.STOPPED) {
      setResetSeekSignal(1);
      setPlayState(PLAY_STATES.PLAYING);
    } else if (playState === PLAY_STATES.PLAYING) {
      setPlayState(PLAY_STATES.PAUSED);
    } else {
      setPlayState(PLAY_STATES.PLAYING);
    }
  };

  useEffect(() => {
    if (libTrackObject) {
      if (playState === PLAY_STATES.LOADING) {
        setPlayState(PLAY_STATES.PLAYING);
      }
    }
  }, [libTrackObject]);

  return (
    <PlayerContext.Provider
      value={{
        libTrackObject,
        setlibTrackObject: setLibTrackObject,
        playState,
        setPlayState,
        handlePlayPauseAction,
        resetSeekSignal,
        setResetPlayerSeekSignal: setResetSeekSignal,
        setLibTrackToPlay,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

PlayerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
