import styles from './Player.module.scss'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import Button from '../button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { FaPlay, FaPause, FaForward } from 'react-icons/fa';
import TrackProgress from './TrackProgress/TrackProgress';
import { PlayStates } from '../../constants';
import albumCover from '../../assets/images/album-cover-default.png';

const Player = ({playerTrackObject, playState, setPlayState, shouldResetSeek, setShouldResetSeek, setNextTrack}) => {

  const [volume, setVolume] = useState(0.5);
  
  const handlePlayPause = () => {
    if (playState === PlayStates.STOPPED) {
      setShouldResetSeek(true);
      console.log('set playing1');
      setPlayState(PlayStates.PLAYING);
    }
    else if (playState === PlayStates.PLAYING) {
      setPlayState(PlayStates.PAUSED);
    }
    else {
      console.log('set playing2');
      setPlayState(PlayStates.PLAYING);
    }
  }

  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
  };

  const handleTrackEnd = () => {
    console.log('Track end1');
    if (playerTrackObject.hasNext) {
      console.log('has next');
      setNextTrack();
    }
    else {
      console.log('hasnt next');
      setPlayState(PlayStates.STOPPED);
    }
  }

  const handleNextClick = () => {
    console.log('Next click');
    setNextTrack();
  }

  useEffect(() => {
    setShouldResetSeek(true);
  }, [playerTrackObject])

  useEffect(() => {
    console.log('Render player');

    return () => {
      console.log('Unmount player');
    }
  }, [])

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
        <Button 
          className={playState === PlayStates.PLAYING ? styles.PauseButton : styles.PlayButton} onClick={handlePlayPause}>
            {playState === PlayStates.PLAYING ? <FaPause /> : <FaPlay />}
        </Button>
        <Button
          className={styles.NextButton}
          onClick={handleNextClick}
          disabled={!playerTrackObject.hasNext}>
            <FaForward />
        </Button>
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

export default Player