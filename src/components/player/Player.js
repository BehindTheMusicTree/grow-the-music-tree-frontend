import styles from './Player.module.scss'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import Button from '../button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { FaPlay, FaPause, FaStepForward } from 'react-icons/fa';
import TrackProgress from './TrackProgress/TrackProgress';
import { PlayStates } from '../../constants';
import albumCover from '../../assets/images/album-cover-default.png';

export default function Player ({playerTrackObject, playState, setPlayState, shouldResetSeek, setShouldResetSeek, setNextTrack}) {

  const [volume, setVolume] = useState(0.5);
  
  const handlePlayPause = () => {
    if (playState === PlayStates.STOPPED) {
      setShouldResetSeek(true);
      setPlayState(PlayStates.PLAYING);
    }
    else if (playState === PlayStates.PLAYING) {
      setPlayState(PlayStates.PAUSED);
    }
    else {
      setPlayState(PlayStates.PLAYING);
    }
  }

  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
  };

  const handleTrackEnd = () => {
    if (playerTrackObject.hasNext) {
      setNextTrack();
    }
    else {
      setPlayState(PlayStates.STOPPED);
    }
  }

  const handleNextClick = () => {
    setNextTrack();
  }

  useEffect(() => {
    setShouldResetSeek(true);
  }, [playerTrackObject])

  return (
    <div className={styles.PlayerContainer}>
      <div className={styles.PlayerLeft}>
        <img className={styles.AlbumCover} src={albumCover} alt="Album Cover" />
        <div className={styles.TrackInfo}>
          <div className={styles.TrackTitle}>
            {playerTrackObject ? playerTrackObject.title : ''}
          </div>
          <div className={styles.ArtistName}>
            {playerTrackObject ? (playerTrackObject.artist ? playerTrackObject.artist.name : '')  : ''}
          </div>
        </div>
      </div>
      <div className={styles.Controls1}>
        <div className={styles.Buttons}>
          <Button 
            className={playState === PlayStates.PLAYING ? styles.PauseButtonContainer : styles.PlayButtonContainer} onClick={handlePlayPause}>
              {playState === PlayStates.PLAYING ? <FaPause /> : <FaPlay />}
          </Button>
          <Button
            className={styles.NextButtonContainer}            
            onClick={handleNextClick}
            disabled={!playerTrackObject.hasNext}>
              <FaStepForward />
          </Button>
        </div>
        <TrackProgress 
          playState={playState} 
          setPlayState={setPlayState} 
          shouldResetSeek={shouldResetSeek} 
          setShouldResetSeek={setShouldResetSeek}
          playerTrackObject={playerTrackObject}
          volume={volume}
          handleTrackEnd={handleTrackEnd}/>
      </div>
      <div className={styles.Controls2}>
        <div className={styles.Volume}>
          <FontAwesomeIcon icon={faVolumeUp} />
          <input 
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
  shouldResetSeek: PropTypes.bool.isRequired,
  setShouldResetSeek: PropTypes.func.isRequired,
  setNextTrack: PropTypes.func.isRequired
};