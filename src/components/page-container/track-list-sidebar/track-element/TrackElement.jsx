import PropTypes from 'prop-types';
import { formatTime } from '../../../../utils';
import { MdMoreVert } from 'react-icons/md';

export default function TrackElement({playlistTrackRelationObject, setEditingTrack}) {

    const handleEditClick = (event) => {
        event.stopPropagation();
        setEditingTrack(playlistTrackRelationObject.libraryTrack);
    }

    return (
        <div className="TrackElement flex flex-row h-9 pt-2 pb-2 text-gray-400">
            <div className="TrackPosition flex items-center justify-center text-lg w-15">
                {playlistTrackRelationObject.position}
            </div>
            <div className="TitleArtistContainer flex flex-col justify-center items-start w-75">
                <div className="Title text-lg font-bold text-gray-300 h-5">{playlistTrackRelationObject.libraryTrack.title}</div>
                {playlistTrackRelationObject.libraryTrack.artist ? 
                    (<div className="Artist text-base">{playlistTrackRelationObject.libraryTrack.artist.name} </div>) : ''}
            </div>
            <div className="AlbumGenreContainer flex flex-col items-end justify-center w-full ml-2 text-xs">
                <div className="AlbumName mb-1">{playlistTrackRelationObject.libraryTrack.album ? 
                    playlistTrackRelationObject.libraryTrack.album.name : ''}</div>
                <div className="GenreNameContainer font-bold py-0.5 border border-gray-400">
                    {playlistTrackRelationObject.libraryTrack.genre 
                    ? playlistTrackRelationObject.libraryTrack.genre.name : ''}
                </div>
            </div>
            <div className="Duration flex text-base w-20 items-center justify-center">
                {formatTime(playlistTrackRelationObject.libraryTrack.duration)}
            </div>
            <div className="Edit flex text-base w-7.5 items-center justify-center mr-2.5" onClick={handleEditClick}>
                <MdMoreVert size={20}/>
            </div>
        </div>
    );
}

TrackElement.propTypes = {
    playlistTrackRelationObject: PropTypes.object,
    setEditingTrack: PropTypes.func.isRequired,
};
