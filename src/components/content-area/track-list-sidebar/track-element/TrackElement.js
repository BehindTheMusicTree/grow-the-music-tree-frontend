import styles from './TrackElement.module.scss';
import React from 'react';
import PropTypes from 'prop-types';
import { formatTime } from '../../../../utils';
import { MdMoreVert } from 'react-icons/md';
import { CONTENT_AREA_TYPES } from '../../../../constants';

export default function TrackElement({playlistTrackRelationObject, setContentAreaTypeWithObject}) {

    const handleEditClick = (event) => {
        event.stopPropagation();
        setContentAreaTypeWithObject({
            type: CONTENT_AREA_TYPES.LIB_TRACK_EDITION,
            contentObject: playlistTrackRelationObject.libraryTrack
        
        });
    }

    return (
        <div className={styles.TrackElement}>
            <div className={styles.TrackPosition}>{playlistTrackRelationObject.position}</div>
            <div className={styles.TitleArtistContainer}>
                <div className={styles.Title}>{playlistTrackRelationObject.libraryTrack.title}</div>
                {playlistTrackRelationObject.artist ? 
                    (<div className={styles.Artist}>{playlistTrackRelationObject.libraryTrack.artist.name} </div>) : ''}
            </div>
            <div className={styles.AlbumGenreContainer}>
                <div className={styles.AlbumName}>{playlistTrackRelationObject.libraryTrack.album ? 
                    playlistTrackRelationObject.libraryTrack.album.name : ''}</div>
                <div className={styles.GenreName}>{playlistTrackRelationObject.libraryTrack.genre 
                    ? playlistTrackRelationObject.libraryTrack.genre.name : ''}</div>
            </div>
            <div className={styles.Duration}>{formatTime(playlistTrackRelationObject.libraryTrack.duration)}</div>
            <div className={styles.Edit} onClick={handleEditClick}><MdMoreVert size={20}/></div>
        </div>
    );
}

TrackElement.propTypes = {
    playlistTrackRelationObject: PropTypes.object,
    setContentAreaTypeWithObject: PropTypes.func.isRequired,
};
