import styles from './TrackListSidebar.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import TrackElement from './track-element/TrackElement';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function TrackListSidebar({playlistPlayObject, setContentAreaTypeWithObject}) {
    return (
        <div className={styles.TrackListSidebar}>
            <div className={styles.Header}>
                <div className={styles.Name}>{playlistPlayObject.contentObject.name}</div>
                <div className={styles.Info}>
                    {"• " + capitalizeFirstLetter(playlistPlayObject.contentObject.type) + " playlist • "}
                    {playlistPlayObject.contentObject.libraryTracksCount + " tracks •"}
                </div>
            </div>
            <div>
                <ul>
                    {playlistPlayObject.contentObject.libraryTracks.map((playlistTrackRelation, index) => (
                        <li key={index}>
                            <TrackElement playlistTrackRelationObject={playlistTrackRelation} setContentAreaTypeWithObject={setContentAreaTypeWithObject}/>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

TrackListSidebar.propTypes = {
    playlistPlayObject: PropTypes.object,
    setContentAreaTypeWithObject: PropTypes.func.isRequired,
};
