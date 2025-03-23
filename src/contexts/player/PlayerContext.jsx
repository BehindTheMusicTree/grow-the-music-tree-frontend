import { createContext, useState } from "react";
import PropTypes from "prop-types";

import { PLAY_STATES } from "../../utils/constants";
import { TrackService } from "../../utils/services";

export const PlayerContext = createContext();

function PlayerProvider({ children }) {
  const [playerLibTrackObject, setPlayerLibTrackObject] = useState();
  const [stopProgressAnimationSignal, setStopProgressAnimationSignal] = useState(0);
  const [resetSeekSignal, setResetSeekSignal] = useState(0);
  const [playState, setPlayState] = useState(PLAY_STATES.STOPPED);

  const setLibTrackToPlay = async (libTrack, hasNext, hasPrevious) => {
    console.log("setLibTrackToPlay", { libTrack, hasNext, hasPrevious });
    const playingLibTrackBlobUrl = await TrackService.loadAudioAndGetLibTrackBlobUrl(libTrack.relativeUrl);
    setPlayerLibTrackObject({
      libTrack: libTrack,
      blobUrl: playingLibTrackBlobUrl,
      hasNext: hasNext,
      hasPrevious: hasPrevious,
    });
  };

  const handlePlayPauseAction = () => {
    if (playState === PLAY_STATES.STOPPED) {
      setPlayState(PLAY_STATES.PLAYING);
    } else if (playState === PLAY_STATES.PLAYING) {
      setPlayState(PLAY_STATES.PAUSED);
    } else {
      setPlayState(PLAY_STATES.PLAYING);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        playerLibTrackObject,
        setPlayerLibTrackObject,
        playState,
        setPlayState,
        handlePlayPauseAction,
        resetSeekSignal,
        setResetSeekSignal,
        stopProgressAnimationSignal,
        setStopProgressAnimationSignal,
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

export default PlayerProvider;
