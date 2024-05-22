import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { PLAY_STATES } from "../../constants";
import ApiService from "../../utils/service/apiService";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [playerLibTrackObject, setPlayerLibTrackObject] = useState();
  const [resetPlayerSeekSignal, setResetPlayerSeekSignal] = useState(0);
  const [playState, setPlayState] = useState(PLAY_STATES.STOPPED);

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
      setResetPlayerSeekSignal(1);
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
    <PlayerContext.Provider
      value={{
        libTrackObject: playerLibTrackObject,
        setlibTrackObject: setPlayerLibTrackObject,
        playState,
        setPlayState,
        handlePlayPauseAction,
        resetSeekSignal: resetPlayerSeekSignal,
        setResetPlayerSeekSignal: setResetPlayerSeekSignal,
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
