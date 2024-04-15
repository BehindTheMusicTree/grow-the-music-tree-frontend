import styles from './TrackListSidebar.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import TrackElement from './track-element/TrackElement';
import { capitalizeFirstLetter } from '../../../../utils';

export default function TrackListSidebar({playlistPlayObject, setEditingTrack}) {
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
                    {playlistPlayObject.contentObject.libraryTracks.map((playlistTrackRelation) => (
                        <li key={playlistTrackRelation.libraryTrack.uuid}>
                            <TrackElement 
                                playlistTrackRelationObject={playlistTrackRelation} 
                                setEditingTrack={setEditingTrack}/>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

TrackListSidebar.propTypes = {
    playlistPlayObject: PropTypes.object,
    setEditingTrack: PropTypes.func.isRequired,
};
