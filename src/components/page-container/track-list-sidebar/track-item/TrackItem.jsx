import PropTypes from "prop-types";
import { MdMoreVert } from "react-icons/md";

import { usePopup } from "../../../../contexts/usePopup.jsx";
import { formatTime } from "../../../../utils";
import LibTrackEditionPopupContentObject from "../../../../models/popup-content-object/LibTrackEditionPopupContentObject.js";

export default function TrackItem({ playlistTrackRelationObject, handleUpdatedLibTrack }) {
  const { showPopup } = usePopup();

  const handleEditClick = (event) => {
    event.stopPropagation();
    const popupContentObject = new LibTrackEditionPopupContentObject(
      playlistTrackRelationObject.libraryTrack,
      handleUpdatedLibTrack
    );
    showPopup(popupContentObject);
  };

  return (
    <div className="track-item flex h-15 pt-2 text-gray-400">
      <div className="track-position flex items-center justify-center text-lg w-16">
        {playlistTrackRelationObject.position}
      </div>
      <div className="title-artist-container flex flex-col items-start w-1/2">
        <div className="title text-lg font-bold text-gray-300 text-overflow">
          {playlistTrackRelationObject.libraryTrack.title}
        </div>
        {playlistTrackRelationObject.libraryTrack.artist ? (
          <div className="artist text-base text-overflow">{playlistTrackRelationObject.libraryTrack.artist.name} </div>
        ) : (
          ""
        )}
      </div>
      <div className="album-genre-container flex flex-col items-end justify-center w-1/2 ml-2 text-xs">
        <div className="album-name mb-1 text-overflow">
          {playlistTrackRelationObject.libraryTrack.album ? playlistTrackRelationObject.libraryTrack.album.name : ""}
        </div>
        {playlistTrackRelationObject.libraryTrack.genre ? (
          <div className="genre-name-container font-bold p-1 border border-gray-400 text-overflow">
            {playlistTrackRelationObject.libraryTrack.genre.name}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="duration flex text-base w-16 items-center justify-center">
        {formatTime(playlistTrackRelationObject.libraryTrack.duration)}
      </div>
      <div className="edit flex text-base w-6 items-center justify-center mr-2" onClick={handleEditClick}>
        <MdMoreVert size={20} />
      </div>
    </div>
  );
}

TrackItem.propTypes = {
  playlistTrackRelationObject: PropTypes.object,
  handleUpdatedLibTrack: PropTypes.func.isRequired,
};
