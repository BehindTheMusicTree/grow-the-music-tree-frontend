import { useRef } from "react";
import { FaFileUpload, FaFolderOpen } from "react-icons/fa";

import { formatTime } from "../../../../utils";
import { FaRegClock } from "react-icons/fa";
import Rating from "../../../utils/Rating";
import LibTrackPositionPlayPause from "../../../utils/LibTrackPositionPlayPause";
import { usePlayer } from "../../../../contexts/player/usePlayer";
import { usePopup } from "../../../../contexts/popup/usePopup";
import { useTrackList } from "../../../../contexts/track-list/useTrackList";
import { useLibTracks } from "../../../../contexts/lib-tracks/useLibTracks";
import LibTrackUploadPopupContentObject from "../../../../models/popup-content-object/LibTrackUploadPopupContentObject";

export default function Library() {
  const { libTracks } = useLibTracks();
  const { playerLibTrackObject, handlePlayPauseAction } = usePlayer();
  const { showPopup } = usePopup();
  const { playNewTrackListFromLibTrackUuid } = useTrackList();

  const fileInputRef = useRef();
  const directoryInputRef = useRef();

  const handleFileUploadAction = () => {
    fileInputRef.current.click();
  };

  const handleDirectoryUploadAction = () => {
    directoryInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const popupContentObject = new LibTrackUploadPopupContentObject(Array.from(event.target.files), null);
    showPopup(popupContentObject);
    event.target.value = null;
  };

  const handlePlayPauseClick = (libTrackUuid) => {
    if (playerLibTrackObject && playerLibTrackObject.libraryTrack.uuid == libTrackUuid) {
      handlePlayPauseAction();
    } else {
      playNewTrackListFromLibTrackUuid(libTrackUuid);
    }
  };

  return (
    <div className="library">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} multiple onChange={handleFileChange} />
      <input
        type="file"
        ref={directoryInputRef}
        style={{ display: "none" }}
        multiple
        webkitdirectory=""
        onChange={handleFileChange}
      />
      <button className="action-round-button" onClick={handleFileUploadAction}>
        <FaFileUpload size={32} />
      </button>
      <button className="action-round-button ml-2" onClick={handleDirectoryUploadAction}>
        <FaFolderOpen size={32} />
      </button>
      <table className="table-auto w-full border-gray-500">
        <thead>
          <tr>
            <th className="library-item">#</th>
            <th className="library-item">Title</th>
            <th className="library-item">Artist</th>
            <th className="library-item">Album</th>
            <th className="library-item">Genre</th>
            <th className="library-item">Rating</th>
            <th className="library-item">
              <div className="flex justify-center items-center">
                <FaRegClock />
              </div>
            </th>
            <th className="library-item">Format</th>
            <th className="library-item">Bitrate</th>
            <th className="library-item">Plays</th>
          </tr>
        </thead>
        <tbody className="space-y-10">
          {libTracks?.map((libTrack, index) => (
            <tr key={libTrack.uuid} className="hover:bg-gray-300 group">
              <td className="library-item w-4 text-center pl-4 pr-1">
                <LibTrackPositionPlayPause
                  position={index + 1}
                  uuid={libTrack.uuid}
                  handlePlayPauseClick={() => handlePlayPauseClick(libTrack.uuid)}
                />
              </td>
              <td className="library-item max-w-64">{libTrack.title}</td>
              <td className="library-item">{libTrack.artist ? libTrack.artist.name : ""}</td>
              <td className="library-item">{libTrack.album ? libTrack.album.name : ""}</td>
              <td className="library-item">{libTrack.genre ? libTrack.genre.name : ""}</td>
              <td className="library-item text-center">
                <Rating
                  rating={libTrack.rating}
                  handleChange={() => {
                    return;
                  }}
                />
              </td>
              <td className="library-item">{formatTime(libTrack.duration)}</td>
              <td className="library-item text-center">{libTrack.file.extension.replace(".", "")}</td>
              <td className="library-item text-center">{libTrack.file.bitrateInKbps} kbps</td>
              <td className="library-item text-center">{libTrack.playCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
