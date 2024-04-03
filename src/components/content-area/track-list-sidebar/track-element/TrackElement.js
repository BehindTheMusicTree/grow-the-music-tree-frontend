import styles from './TrackElement.module.scss';
import React from 'react';
import PropTypes from 'prop-types';

export default function TrackElement({trackObject}) {
    return (
        <div className={styles.TrackElement}>
            <div className={styles.TitleArtistContainer}>
                <div className={styles.Title}>{trackObject.title}</div>
                {trackObject.artist ? (<div className={styles.Artist}>{trackObject.artist.name} </div>) : ''}
            </div>
            <div className={styles.AlbumName}>{trackObject.album ? trackObject.album.name : ''}</div>
        </div>
    );
}

TrackElement.propTypes = {
    trackObject: PropTypes.object
};
