import { createContext, useState } from "react";
import PropTypes from "prop-types";

import { PLAY_STATES } from "../../utils/constants";
import { TrackService } from "../../utils/services";
import useSpotifyAuth from "../../hooks/useSpotifyAuth";
import UnauthorizedRequestError from "../../utils/errors/UnauthorizedRequestError";

export const PlayerContext = createContext();

function PlayerProvider({ children }) {
  const [playerUploadedTrackObject, setPlayerUploadedTrackObject] = useState();
  const [stopProgressAnimationSignal, setStopProgressAnimationSignal] = useState(0);
  const [resetSeekSignal, setResetSeekSignal] = useState(0);
  const [playState, setPlayState] = useState(PLAY_STATES.STOPPED);
  const [error, setError] = useState(null);
  const { checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();

  const setUploadedTrackToPlay = async (uploadedTrack, hasNext, hasPrevious) => {
    try {
      // Check for valid Spotify token before API call
      if (!checkTokenAndShowAuthIfNeeded(true)) {
        setError("Authentication required");
        return false;
      }

      const playingUploadedTrackBlobUrl = await TrackService.loadAudioAndGetUploadedTrackBlobUrl(
        uploadedTrack.relativeUrl
      );

      setPlayerUploadedTrackObject({
        uploadedTrack: uploadedTrack,
        blobUrl: playingUploadedTrackBlobUrl,
        hasNext: hasNext,
        hasPrevious: hasPrevious,
      });

      setError(null);
      return true;
    } catch (error) {
      console.error("Error loading track audio:", error);

      // Handle authentication errors
      if (error instanceof UnauthorizedRequestError) {
        setError("Authentication required");
        checkTokenAndShowAuthIfNeeded(true); // Force showing the auth popup
        return false;
      }

      setError("Failed to load track audio");
      return false;
    }
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
        error, // Include error state in context value
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
