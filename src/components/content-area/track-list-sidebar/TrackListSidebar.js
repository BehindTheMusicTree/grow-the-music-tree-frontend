import styles from './TrackListSidebar.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import TrackElement from './track-element/TrackElement';

export default function TrackListSidebar({playlistPlayObject}) {
    return (
        <div className={styles.TrackListSidebar}>
            <ul>
                {playlistPlayObject.contentObject.libraryTracks.map((track, index) => (
                    <li key={index}>
                        <TrackElement trackObject={track} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

TrackListSidebar.propTypes = {
    playlistPlayObject: PropTypes.object
};
