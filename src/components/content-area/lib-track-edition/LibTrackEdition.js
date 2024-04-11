import styles from './LibTrackEdition.module.scss'
import React from 'react';
import PropTypes from 'prop-types';
import { formatTime } from '../../../utils';

export default function LibTrackEdition ({ libTrack }) {
  return (
    <div className={styles.trackEdition}>
      <h2 className={styles.title}>Edit Track</h2>
      <form className={styles.form}>
        <div className={styles.column}>
          <label className={styles.label}>
            <span>Title:</span>
            <input className={styles.input} type="text" defaultValue={libTrack.title} />
          </label>
          <label className={styles.label}>
            <span>Artist:</span>
            <input className={styles.input} type="text" defaultValue={libTrack.artist} />
          </label>
          <label className={styles.label}>
            <span>Genre:</span>
            <input className={styles.input} type="text" defaultValue={libTrack.genre.name} />
          </label>
        </div>
        <div className={styles.column}>
          <label className={styles.label}>
            <span>Duration:</span>
            <div className={styles.readOnlyInput}>{formatTime(libTrack.duration)}</div>
          </label>
          <label className={styles.label}>
            <span>Album:</span>
            <input className={styles.input} type="text" defaultValue={libTrack.album} />
          </label>
        </div>
        <button className={styles.button} type="submit">Save</button>
      </form>
    </div>
  );
}

LibTrackEdition.propTypes = {
  libTrack: PropTypes.object.isRequired
};