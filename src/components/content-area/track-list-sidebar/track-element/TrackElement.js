import styles from './TrackElement.module.scss';
import React from 'react';
import PropTypes from 'prop-types';

export default function TrackElement({playlistTrackRelationObject}) {
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
        </div>
    );
}

TrackElement.propTypes = {
    playlistTrackRelationObject: PropTypes.object
};
