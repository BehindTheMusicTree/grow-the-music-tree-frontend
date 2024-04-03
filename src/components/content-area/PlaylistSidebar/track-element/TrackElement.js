// import styles from './PlaylistSidebar.module.css';
import React from 'react';
import PropTypes from 'prop-types';

export default function TrackElement({trackObject}) {
    return (
        <div>
            <div> {trackObject.artist ? trackObject.artist.name + ' - ' : ''}</div>
            <div>{trackObject.title}</div>
            <div>{trackObject.album ? trackObject.album.name : ''}</div>
        </div>
    );
}

TrackElement.propTypes = {
    trackObject: PropTypes.object
};
