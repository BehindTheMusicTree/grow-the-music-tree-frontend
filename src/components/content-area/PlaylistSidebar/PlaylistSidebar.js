// import styles from './PlaylistSidebar.module.css';
import React from 'react';
import PropTypes from 'prop-types';

export default function PlaylistSidebar({playlistPlayObject}) {
    return (
        <div>
            <ul>
                {playlistPlayObject.contentObject.libraryTracks.map((track, index) => (
                    <li key={index}>
                        {track.title}
                    </li>
                ))}
            </ul>
        </div>
    );
}

PlaylistSidebar.propTypes = {
    playlistPlayObject: PropTypes.object
};
