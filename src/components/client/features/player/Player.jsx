"use client";

import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faListUl } from "@fortawesome/free-solid-svg-icons";
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from "react-icons/fa";

import { PLAY_STATES } from "@lib/utils/constants";
import { usePlayer } from "@contexts/PlayerContext";
import { useTrackList } from "@contexts/TrackListContext";
import { useTrackListSidebarVisibility } from "@contexts/TrackListSidebarVisibilityContext";

import albumCover from "@assets/images/album-cover-default.png";
import Button from "@components/client/ui/Button";

import TrackProgress from "./TrackProgress/TrackProgress";

export default function Player() {
  const SEEK_THRESHOLD_AFTER_WHICH_TO_SKIP = 2;

  const { setIsTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const {
    playerUploadedTrackObject,
    handlePlayPauseAction,
    playState,
    setPlayState,
    setStopProgressAnimationSignal,
    setResetSeekSignal,
  } = usePlayer();

  const { toNextTrack, toPreviousTrack } = useTrackList();

  const [seek, setSeek] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const handleTrackListIconClick = () => {
    setIsTrackListSidebarVisible((b) => !b);
  };

  const handleVolumeChange = (event) => {
    setVolume(Number(event.target.value));
  };

  const handleTrackEnd = () => {
    if (playerUploadedTrackObject?.hasNext) {
      toNextTrack();
    } else {
      setPlayState(PLAY_STATES.STOPPED);
    }
  };

  const handleForwardClick = () => {
    setStopProgressAnimationSignal(1);
    toNextTrack();
  };

  const handleBackwardClick = () => {
    if (!playerUploadedTrackObject?.hasPrevious || seek > SEEK_THRESHOLD_AFTER_WHICH_TO_SKIP) {
      setStopProgressAnimationSignal(1);
      setResetSeekSignal(1);
    } else {
      toPreviousTrack();
    }
  };

  useEffect(() => {
    if (playerUploadedTrackObject) {
      setResetSeekSignal(1);
    }
  }, [playerUploadedTrackObject, setResetSeekSignal]);

  return (
    <div className="w-full h-player fixed bottom-0 flex justify-between p-2 bg-black text-white text-sm">
      <div className="flex-1 flex items-center justify-center">
        <img className="flex-none w-16 h-16 overflow-hidden mr-5" src={albumCover} alt="Album Cover" />
        <div className="flex-1 flex flex-col items-start justify-center w-full">
          <div>{playerUploadedTrackObject?.uploadedTrack?.title}</div>
          <div>{playerUploadedTrackObject?.uploadedTrack?.artist?.name}</div>
        </div>
      </div>
      <div className="flex-2 flex flex-col justify-center items-center">
        <div className="flex flex-row items-center justify-center w-full">
          <Button
            className={`player-control-button ${
              playState === PLAY_STATES.LOADING ? "player-control-button-disabled" : ""
            }`}
            onClick={playState === PLAY_STATES.LOADING ? null : handleBackwardClick}
            disabled={playState === PLAY_STATES.LOADING}
          >
            <FaStepBackward />
          </Button>
          <Button
            className={`player-control-button text-1.5xl py-4 mx-1
            ${playState !== PLAY_STATES.PLAYING ? "pl-play-l-offset pr-play-r-offset" : "px-4"}
            ${playState === PLAY_STATES.LOADING ? "player-control-button-disabled" : ""}`}
            onClick={playState === PLAY_STATES.LOADING ? null : handlePlayPauseAction}
          >
            <div className="text-1.5xl">{playState === PLAY_STATES.PLAYING ? <FaPause /> : <FaPlay />}</div>
          </Button>
          <Button
            className={
              playState !== PLAY_STATES.LOADING
                ? playerUploadedTrackObject?.hasNext
                  ? "player-control-button"
                  : "player-control-button-disabled"
                : "player-control-button-disabled"
            }
            onClick={playState === PLAY_STATES.LOADING ? null : handleForwardClick}
          >
            <FaStepForward />
          </Button>
        </div>
        <TrackProgress volume={volume} handleTrackEnd={handleTrackEnd} seek={seek} setSeek={setSeek} />
      </div>
      <div className="flex-1 w-full pl-10 flex items-center justify-center">
        <div className="w-4 h-4 mr-1 transform hover:scale-120 cursor-pointer">
          <FontAwesomeIcon icon={faListUl} onClick={handleTrackListIconClick} />
        </div>
        <div className="flex items-center justify-center w-full">
          <FontAwesomeIcon icon={faVolumeUp} className="w-5 h-5 mr-2" />
          <input
            className="w-24 mr-2"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
}

Player.propTypes = {};
