import { createContext, useState } from "react";
import PropTypes from "prop-types";

import { PLAY_STATES } from "../../utils/constants";
import { TrackService } from "../../utils/services";

export const PlayerContext = createContext();

function PlayerProvider({ children }) {
  const [playerUploadedTrackObject, setPlayerUploadedTrackObject] = useState();
  const [stopProgressAnimationSignal, setStopProgressAnimationSignal] = useState(0);
  const [resetSeekSignal, setResetSeekSignal] = useState(0);
  const [playState, setPlayState] = useState(PLAY_STATES.STOPPED);

  const setUploadedTrackToPlay = async (uploadedTrack, hasNext, hasPrevious) => {
    const playingUploadedTrackBlobUrl = await TrackService.loadAudioAndGetUploadedTrackBlobUrl(
      uploadedTrack.relativeUrl
    );
    setPlayerUploadedTrackObject({
      uploadedTrack: uploadedTrack,
      blobUrl: playingUploadedTrackBlobUrl,
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
        playerUploadedTrackObject,
        setPlayerUploadedTrackObject,
        playState,
        setPlayState,
        handlePlayPauseAction,
        resetSeekSignal,
        setResetSeekSignal,
        stopProgressAnimationSignal,
        setStopProgressAnimationSignal,
        setUploadedTrackToPlay,
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
