import { useState, useEffect } from 'react'
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp, faListUl } from '@fortawesome/free-solid-svg-icons'
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';

import { PLAY_STATES } from '../../constants.js';

import albumCover from '../../assets/images/album-cover-default.png';
import Button from '../button/Button.jsx';

import TrackProgress from './TrackProgress/TrackProgress.jsx';

export default function Player ({
    playerTrackObject, 
    playState, 
    setPlayState, 
    shouldResetPlayerSeek, 
    setshouldResetPlayerSeek, 
    setNextTrack, 
    setPreviousTrack, 
    setIsTrackListSidebarVisible}) {
  const SEEK_THRESHOLD_AFTER_WHICH_TO_SKIP = 2;

  const [seek, setSeek] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const handlePlaylistIconClick = () => {
    setIsTrackListSidebarVisible(b => !b);
  }
  
  const handlePlayPause = () => {
    if (playState === PLAY_STATES.STOPPED) {
      setshouldResetPlayerSeek(true);
      setPlayState(PLAY_STATES.PLAYING);
    }
    else if (playState === PLAY_STATES.PLAYING) {
      setPlayState(PLAY_STATES.PAUSED);
    }
    else {
      setPlayState(PLAY_STATES.PLAYING);
    }
  }

  const handleVolumeChange = (event) => {
    setVolume(Number(event.target.value));
  };

  const handleTrackEnd = () => {
    if (playerTrackObject.hasNext) {
      setNextTrack();
    }
    else {
      setPlayState(PLAY_STATES.STOPPED);
    }
  }

  const handleForwardClick = () => {
    setNextTrack();
  }

  const handleBackwardClick = () => {
    if (!playerTrackObject.hasPrevious || seek > SEEK_THRESHOLD_AFTER_WHICH_TO_SKIP) {
      setshouldResetPlayerSeek(true);
    }
    else {
      setPreviousTrack(prev => prev - 1);
    }
  }

  useEffect(() => {
    setshouldResetPlayerSeek(true);
  }, [playerTrackObject])

  return (
    <div className="w-full fixed left-0 bottom-0 flex justify-between p-2 bg-black text-white text-sm">
      <div className="flex-1 flex items-center justify-center">
        <img className="flex-none w-16 h-16 overflow-hidden mr-5" src={albumCover} alt="Album Cover" />
        <div className="flex-1 flex flex-col items-start justify-center w-full">
          <div>
            {playerTrackObject ? playerTrackObject.title : ''}
          </div>
          <div>
            {playerTrackObject ? (playerTrackObject.artist ? playerTrackObject.artist.name : '')  : ''}
          </div>
        </div>
      </div>
      <div className="flex-2 flex flex-col justify-center items-center">
        <div className="flex flex-row items-center justify-center w-full">
          <Button className="player-control-button"            
            onClick={handleBackwardClick}>
              <FaStepBackward />
          </Button>
          <Button className={`player-control-button text-1.5xl py-4 
            ${playState !== PLAY_STATES.PLAYING ? 'pl-play-l-offset pr-play-r-offset' : 'px-4'}`} 
            onClick={handlePlayPause}>
            <div className="text-1.5xl">
              {playState === PLAY_STATES.PLAYING ? <FaPause /> : <FaPlay />}
            </div>
          </Button>
          <Button className="player-control-button"
            onClick={handleForwardClick}
            disabled={!playerTrackObject.hasNext}>
              <FaStepForward />
          </Button>
        </div>
        <TrackProgress 
          playState={playState} 
          setPlayState={setPlayState} 
          shouldResetPlayerSeek={shouldResetPlayerSeek} 
          setshouldResetPlayerSeek={setshouldResetPlayerSeek}
          playerTrackObject={playerTrackObject}
          volume={volume}
          handleTrackEnd={handleTrackEnd}
          seek={seek}
          setSeek={setSeek}/>
      </div>
      <div className="flex-1 w-full pl-10 flex items-center justify-center">
        <div className="w-4 h-4 mr-1 transform hover:scale-120 cursor-pointer">
          <FontAwesomeIcon icon={faListUl} onClick={handlePlaylistIconClick}/>
        </div>
        <div className="flex items-center justify-center w-full">
          <FontAwesomeIcon icon={faVolumeUp} className="w-5 h-5 mr-2"/>
          <input className="w-24 mr-2"
            type='range' 
            min='0' 
            max='1' 
            step='.01' 
            value={volume} 
            onChange={handleVolumeChange} 
          />
        </div>
      </div>
    </div>
  )
}

Player.propTypes = {
  playerTrackObject: PropTypes.object,
  playState: PropTypes.string.isRequired,
  setPlayState: PropTypes.func.isRequired,
  shouldResetPlayerSeek: PropTypes.bool.isRequired,
  setshouldResetPlayerSeek: PropTypes.func.isRequired,
  setNextTrack: PropTypes.func.isRequired,
  setPreviousTrack: PropTypes.func.isRequired,
  setIsTrackListSidebarVisible: PropTypes.func.isRequired
};