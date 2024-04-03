// import styles from './PlaylistSidebar.module.css';
import React from 'react';
import PropTypes from 'prop-types';
import TrackElement from './track-element/TrackElement';

export default function PlaylistSidebar({playlistPlayObject}) {
    return (
        <div>
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

PlaylistSidebar.propTypes = {
    playlistPlayObject: PropTypes.object
};
