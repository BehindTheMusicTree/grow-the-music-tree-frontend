import styles from './Player.module.scss'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import Button from '../button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { FaPlay, FaPause } from 'react-icons/fa';
import TrackProgress from './TrackProgress/TrackProgress';
import { PlayStates } from '../../constants';
import albumCover from '../../assets/images/album-cover-default.png';

const Player = ({libTrackObjectWithBlobUrl}) => {

  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playState, setPlayState] = useState(PlayStates.PAUSED);
  const [shouldResetSeek, setShouldResetSeek] = useState(false);
  
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

  useEffect(() => {
    setShouldResetSeek(true);
    setPlayState(PlayStates.PLAYING);
  }, [libTrackObjectWithBlobUrl])

  return (
    <div className={styles.PlayerContainer}>
      <div className={styles.PlayerLeft}>
        <img className={styles.AlbumCover} src={albumCover} alt="Album Cover" />
        <div className={styles.TrackInfo}>
          <div className={styles.TrackTitle}>
            {libTrackObjectWithBlobUrl ? libTrackObjectWithBlobUrl.title : ''}
          </div>
          <div className={styles.ArtistName}>
            {libTrackObjectWithBlobUrl ? (libTrackObjectWithBlobUrl.artist ? libTrackObjectWithBlobUrl.artist.name : '')  : ''}
          </div>
        </div>
      </div>
      <div className={styles.Controls1}>
        <Button 
          className={playState === PlayStates.PLAYING ? styles.PauseButton : styles.PlayButton} 
          onClick={handlePlayPause}>{playState === PlayStates.PLAYING ? <FaPause /> : <FaPlay />}
        </Button>
        <TrackProgress 
          playState={playState} 
          setPlayState={setPlayState} 
          shouldResetSeek={shouldResetSeek} 
          setShouldResetSeek={setShouldResetSeek}
          isSeeking={isSeeking}
          setIsSeeking={setIsSeeking}
          libTrackObjectWithBlobUrl={libTrackObjectWithBlobUrl}
          volume={volume}/>
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
  libTrackObjectWithBlobUrl: PropTypes.object
};

export default Player