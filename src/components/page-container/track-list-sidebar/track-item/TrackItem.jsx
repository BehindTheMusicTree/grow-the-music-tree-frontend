import PropTypes from "prop-types";
import { MdMoreVert } from "react-icons/md";
import { FaPlay, FaPause } from "react-icons/fa";

import { usePopup } from "../../../../contexts/popup/usePopup.jsx";
import { usePlayerTrackObject } from "../../../../contexts/player-lib-track-object/usePlayerLibTrackObject.jsx";
import { useTrackList } from "../../../../contexts/track-list/useTrackList";
import { formatTime } from "../../../../utils";
import LibTrackEditionPopupContentObject from "../../../../models/popup-content-object/LibTrackEditionPopupContentObject.js";
import { PLAY_STATES } from "../../../../constants.js";

export default function TrackItem({ playlistLibTrackRelationObject }) {
  const { showPopup } = usePopup();
  const { handlePlayPauseAction, playerLibTrackObject, playState } = usePlayerTrackObject();
  const { toTrackAtPosition } = useTrackList();

  const handleEditClick = (event) => {
    event.stopPropagation();
    const popupContentObject = new LibTrackEditionPopupContentObject(playlistLibTrackRelationObject.libraryTrack);
    showPopup(popupContentObject);
  };

  const handlePlayPauseClick = (event) => {
    event.stopPropagation();
    if (playerLibTrackObject.libraryTrack.uuid == playlistLibTrackRelationObject.libraryTrack.uuid) {
      handlePlayPauseAction(event);
    } else {
      toTrackAtPosition(playlistLibTrackRelationObject.position);
    }
  };

  return (
    <div className="track-item flex h-14 text-gray-400 hover:bg-gray-900 group">
      <div
        className="track-position-play-pause flex items-center justify-center text-lg w-16"
        onClick={handlePlayPauseClick}
      >
        <div className="group-hover:hidden">
          {playerLibTrackObject.libraryTrack.uuid == playlistLibTrackRelationObject.libraryTrack.uuid ? (
            <div className="flex space-x-1 items-end">
              <div
                className={`w-playingbar bg-green-500 h-3 origin-bottom ${
                  playState === PLAY_STATES.PLAYING ? "animate-scale-pulse" : ""
                }`}
              ></div>
              <div
                className={`w-playingbar bg-green-500 h-4 origin-bottom ${
                  playState === PLAY_STATES.PLAYING ? "animate-scale-pulse delay-200" : ""
                }`}
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className={`w-playingbar bg-green-500 h-3 origin-bottom ${
                  playState === PLAY_STATES.PLAYING ? "animate-scale-pulse delay-400" : ""
                }`}
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
          ) : (
            playlistLibTrackRelationObject.position
          )}
        </div>
        <div className="hidden group-hover:flex items-center justify-center">
          {playerLibTrackObject.libraryTrack.uuid == playlistLibTrackRelationObject.libraryTrack.uuid &&
          playState == PLAY_STATES.PLAYING ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
        </div>
      </div>
      <div className="title-artist-container flex flex-col items-start justify-center w-1/2 text-overflow">
        <div className="title text-lg font-bold tnbvmm ext-gray-300 text-overflow">
          {playlistLibTrackRelationObject.libraryTrack.title}
        </div>
        {playlistLibTrackRelationObject.libraryTrack.artist ? (
          <div className="artist text-base text-overflow">
            {playlistLibTrackRelationObject.libraryTrack.artist.name}{" "}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="album-name items-start justify-center w-1/3 ml-2 text-overflow ">
        {playlistLibTrackRelationObject.libraryTrack.album
          ? playlistLibTrackRelationObject.libraryTrack.album.name
          : ""}
      </div>
      <div className="genre-name-container flex items-center justify-end w-1/6">
        {playlistLibTrackRelationObject.libraryTrack.genre ? (
          <div className="genre-name font-bold p-1 border border-gray-400 text-xs text-overflow">
            {playlistLibTrackRelationObject.libraryTrack.genre.name}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="duration flex text-base w-16 items-center justify-center">
        {formatTime(playlistLibTrackRelationObject.libraryTrack.duration)}
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
  playlistLibTrackRelationObject: PropTypes.object,
};
