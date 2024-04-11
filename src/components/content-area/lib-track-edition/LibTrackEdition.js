// import styles from './LibTrackEdition.module.scss'
import React from 'react';
import PropTypes from 'prop-types';

export default function LibTrackEdition ({ libTrack }) {
  return (
    <div>
      {libTrack.title}
    </div>
  );
}

LibTrackEdition.propTypes = {
  libTrack: PropTypes.object.isRequired,
};