"use client";

import PropTypes from "prop-types";
import { MdMoreVert } from "react-icons/md";

import { formatTime } from "@/lib/utils/formatting";
import { usePopup } from "@/contexts/PopupContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useTrackList } from "@/contexts/TrackListContext";
import UploadedTrackPositionPlayPause from "@/components/features/UploadedTrackPositionPlayPause";

export default function TrackItem({ uploadedTrack, position }) {
  const { showPopup } = usePopup();
  const { handlePlayPauseAction, playerUploadedTrackObject } = usePlayer();
  const { toTrackAtPosition } = useTrackList();

  const handleEditClick = (event) => {
    event.stopPropagation();
    showPopup("trackEdition", uploadedTrack);
  };

  const handlePlayPauseClick = (event) => {
    event.stopPropagation();
    if (playerUploadedTrackObject.uploadedTrack.uuid == uploadedTrack.uuid) {
      handlePlayPauseAction(event);
    } else {
      toTrackAtPosition(position);
    }
  };

  return (
    <div className="track-item flex h-14 text-gray-400 hover:bg-gray-900 group">
      <UploadedTrackPositionPlayPause
        position={position}
        uuid={uploadedTrack.uuid}
        handlePlayPauseClick={handlePlayPauseClick}
      />
      <div className="title-artist-container flex flex-col items-start justify-center w-1/2">
        <div className="title text-lg font-bold tnbvmm ext-gray-300 text-overflow">{uploadedTrack.title}</div>
        {uploadedTrack.artist ? <div className="artist text-base text-overflow">{uploadedTrack.artist.name} </div> : ""}
      </div>
      <div className="album-name items-start justify-center w-1/3 ml-2 text-overflow ">
        {uploadedTrack.album ? uploadedTrack.album.name : ""}
      </div>
      <div className="genre-name-container flex items-center justify-end w-1/6">
        {uploadedTrack.genre ? (
          <div className="genre-name font-bold p-1 border border-gray-400 text-xs text-overflow">
            {uploadedTrack.genre.name}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="duration flex text-base w-16 items-center justify-center">
        {formatTime(uploadedTrack.file.durationInSec)}
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
  uploadedTrack: PropTypes.object,
  position: PropTypes.number,
};
