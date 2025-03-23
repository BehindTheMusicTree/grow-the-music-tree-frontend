import PropTypes from "prop-types";
import { MdMoreVert } from "react-icons/md";

import { formatTime } from "../../../utils";
import LibTrackEditionPopupContentObject from "../../../models/popup-content-object/LibTrackEditionPopupContentObject";
import { usePopup } from "../../../contexts/popup/usePopup";
import { usePlayer } from "../../../contexts/player/usePlayer";
import { useTrackList } from "../../../contexts/track-list/useTrackList";
import LibTrackPositionPlayPause from "../../utils/LibTrackPositionPlayPause";

export default function TrackItem({ libTrack, position }) {
  const { showPopup } = usePopup();
  const { handlePlayPauseAction, playerLibTrackObject } = usePlayer();
  const { toTrackAtPosition } = useTrackList();

  const handleEditClick = (event) => {
    event.stopPropagation();
    const popupContentObject = new LibTrackEditionPopupContentObject(libTrack);
    showPopup(popupContentObject);
  };

  const handlePlayPauseClick = (event) => {
    event.stopPropagation();
    console.log("handlePlayPauseClick", { playerLibTrackObject, libTrack });
    if (playerLibTrackObject.libTrack.uuid == libTrack.uuid) {
      handlePlayPauseAction(event);
    } else {
      toTrackAtPosition(position);
    }
  };

  return (
    <div className="track-item flex h-14 text-gray-400 hover:bg-gray-900 group">
      <LibTrackPositionPlayPause position={position} uuid={libTrack.uuid} handlePlayPauseClick={handlePlayPauseClick} />
      <div className="title-artist-container flex flex-col items-start justify-center w-1/2">
        <div className="title text-lg font-bold tnbvmm ext-gray-300 text-overflow">{libTrack.title}</div>
        {libTrack.artist ? <div className="artist text-base text-overflow">{libTrack.artist.name} </div> : ""}
      </div>
      <div className="album-name items-start justify-center w-1/3 ml-2 text-overflow ">
        {libTrack.album ? libTrack.album.name : ""}
      </div>
      <div className="genre-name-container flex items-center justify-end w-1/6">
        {libTrack.genre ? (
          <div className="genre-name font-bold p-1 border border-gray-400 text-xs text-overflow">
            {libTrack.genre.name}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="duration flex text-base w-16 items-center justify-center">
        {formatTime(libTrack.file.durationInSec)}
      </div>
      <div
        className="edit flex text-base w-6 items-center justify-center mr-2 cursor-pointer"
        onClick={handleEditClick}
      >
        <MdMoreVert size={20} />
      </div>
    </div>
  );
}

TrackItem.propTypes = {
  libTrack: PropTypes.object,
  position: PropTypes.number,
};
