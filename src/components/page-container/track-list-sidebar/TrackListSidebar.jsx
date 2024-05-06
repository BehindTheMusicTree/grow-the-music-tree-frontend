import PropTypes from 'prop-types';
import TrackElement from './track-element/TrackElement';
import { capitalizeFirstLetter } from '../../../utils';

export default function TrackListSidebar({playlistPlayObject, setEditingTrack}) {
    return (
        <div>
            <div className="Header flex flex-row px-4 py-2">
                <div className="Name flex flex-col justify-center items-center text-gray-300 text-xl font-bold pr-5">
                    {playlistPlayObject.contentObject.name}
                </div>
                <div className="Info flex flex-col justify-center items-center text-gray-400 text-sm pt-1">
                    {"• " + capitalizeFirstLetter(playlistPlayObject.contentObject.type) + " playlist • "}
                    {playlistPlayObject.contentObject.libraryTracksCount + " tracks •"}
                </div>
            </div>
            <div>
                <ul className="list-none p-0 m-0">
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
