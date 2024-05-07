import PropTypes from "prop-types";
import { formatTime } from "../../../../utils";
import { MdMoreVert } from "react-icons/md";

export default function TrackItem({ playlistTrackRelationObject, setEditingTrack }) {
  const handleEditClick = (event) => {
    event.stopPropagation();
    setEditingTrack(playlistTrackRelationObject.libraryTrack);
  };

  return (
    <div className="TrackItem flex h-15 pt-2 text-gray-400">
      <div className="TrackPosition flex items-center justify-center text-lg w-16">
        {playlistTrackRelationObject.position}
      </div>
      <div className="TitleArtistContainer flex flex-col items-start w-1/2">
        <div className="Title text-lg font-bold text-gray-300 text-overflow">
          {playlistTrackRelationObject.libraryTrack.title}
        </div>
        {playlistTrackRelationObject.libraryTrack.artist ? (
          <div className="Artist text-base text-overflow">{playlistTrackRelationObject.libraryTrack.artist.name} </div>
        ) : (
          ""
        )}
      </div>
      <div className="AlbumGenreContainer flex flex-col items-end justify-center w-1/2 ml-2 text-xs">
        <div className="AlbumName mb-1 text-overflow">
          {playlistTrackRelationObject.libraryTrack.album ? playlistTrackRelationObject.libraryTrack.album.name : ""}
        </div>
        {playlistTrackRelationObject.libraryTrack.genre ? (
          <div className="GenreNameContainer font-bold p-1 border border-gray-400 text-overflow">
            {playlistTrackRelationObject.libraryTrack.genre.name}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="Duration flex text-base w-16 items-center justify-center">
        {formatTime(playlistTrackRelationObject.libraryTrack.duration)}
      </div>
      <div className="Edit flex text-base w-6 items-center justify-center mr-2" onClick={handleEditClick}>
        <MdMoreVert size={20} />
      </div>
    </div>
  );
}

TrackItem.propTypes = {
  playlistTrackRelationObject: PropTypes.object,
  setEditingTrack: PropTypes.func.isRequired,
};
