import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp, faListUl } from "@fortawesome/free-solid-svg-icons";
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from "react-icons/fa";

import { PLAY_STATES } from "../../constants";
import { usePlayer as usePlayer } from "../../contexts/player/usePlayer";
import { useTrackList } from "../../contexts/track-list/useTrackList";
import { useTrackListSidebarVisibility } from "../../contexts/track-list-sidebar-visibility/useTrackListSidebarVisibility";

import albumCover from "../../assets/images/album-cover-default.png";
import Button from "../utils/Button";

import TrackProgress from "./TrackProgress/TrackProgress";

export default function Player() {
  const SEEK_THRESHOLD_AFTER_WHICH_TO_SKIP = 2;

  const { setIsTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const { playerLibTrackObject, handlePlayPauseAction, playState, setPlayState, setResetPlayerSeekSignal } =
    usePlayer();

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
    if (playerLibTrackObject.hasNext) {
      toNextTrack();
    } else {
      setPlayState(PLAY_STATES.STOPPED);
      setResetPlayerSeekSignal(1);
    }
  };

  const handleForwardClick = () => {
    toNextTrack();
  };

  const handleBackwardClick = () => {
    if (!playerLibTrackObject.hasPrevious || seek > SEEK_THRESHOLD_AFTER_WHICH_TO_SKIP) {
      setResetPlayerSeekSignal(1);
    } else {
      toPreviousTrack();
    }
  };

  useEffect(() => {
    setResetPlayerSeekSignal(1);
  }, [playerLibTrackObject]);

  return (
    <div className="w-full h-player fixed bottom-0 flex justify-between p-2 bg-black text-white text-sm">
      <div className="flex-1 flex items-center justify-center">
        <img className="flex-none w-16 h-16 overflow-hidden mr-5" src={albumCover} alt="Album Cover" />
        <div className="flex-1 flex flex-col items-start justify-center w-full">
          <div>{playerLibTrackObject?.libraryTrack.title}</div>
          <div>{playerLibTrackObject?.libraryTrack.artist?.name}</div>
        </div>
      </div>
      <div className="flex-2 flex flex-col justify-center items-center">
        <div className="flex flex-row items-center justify-center w-full">
          <Button className="player-control-button" onClick={handleBackwardClick}>
            <FaStepBackward />
          </Button>
          <Button
            className={`player-control-button text-1.5xl py-4 mx-1
            ${playState !== PLAY_STATES.PLAYING ? "pl-play-l-offset pr-play-r-offset" : "px-4"}`}
            onClick={handlePlayPauseAction}
          >
            <div className="text-1.5xl">{playState === PLAY_STATES.PLAYING ? <FaPause /> : <FaPlay />}</div>
          </Button>
          <Button
            className={playerLibTrackObject.hasNext ? "player-control-button" : "player-control-button-disabled"}
            onClick={handleForwardClick}
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
