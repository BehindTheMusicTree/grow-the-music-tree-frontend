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
    if (playerLibTrackObject && playerLibTrackObject.libTrack.uuid == libTrackUuid) {
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
      <div className="flex mb-4">
        <button className="action-round-button" onClick={handleFileUploadAction}>
          <FaFileUpload size={32} />
        </button>
        <button className="action-round-button ml-2" onClick={handleDirectoryUploadAction}>
          <FaFolderOpen size={32} />
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                #
              </th>
              <th className="library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Artist
              </th>
              <th className="library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Album
              </th>
              <th className="library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Genre
              </th>
              <th className="library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Rating
              </th>
              <th className="library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="flex justify-center items-center">
                  <FaRegClock />
                </div>
              </th>
              <th className="library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Format
              </th>
              <th className="library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Bitrate
              </th>
              <th className="library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Plays
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {libTracks?.map((libTrack, index) => (
              <tr key={libTrack.uuid} className="hover:bg-gray-50 group">
                <td className="library-item w-10 px-3 py-2 text-center">
                  <LibTrackPositionPlayPause
                    position={index + 1}
                    uuid={libTrack.uuid}
                    handlePlayPauseClick={() => handlePlayPauseClick(libTrack.uuid)}
                  />
                </td>
                <td className="library-item w-full px-3 py-2 text-sm truncate">{libTrack.title}</td>
                <td className="library-item w-32 px-3 py-2 text-sm truncate">
                  {libTrack.artist ? libTrack.artist.name : ""}
                </td>
                <td className="library-item w-32 px-3 py-2 text-sm truncate">
                  {libTrack.album ? libTrack.album.name : ""}
                </td>
                <td className="library-item w-32 px-3 py-2 text-sm truncate">
                  {libTrack.genre ? libTrack.genre.name : ""}
                </td>
                <td className="library-item w-24 px-3 py-2 text-center">
                  <Rating
                    rating={libTrack.rating}
                    handleChange={() => {
                      return;
                    }}
                  />
                </td>
                <td className="library-item w-20 px-3 py-2 text-sm text-center">
                  {formatTime(libTrack.file.durationInSec)}
                </td>
                <td className="library-item w-16 px-3 py-2 text-sm text-center">
                  {libTrack.file.extension.replace(".", "")}
                </td>
                <td className="library-item w-20 px-3 py-2 text-sm text-center">{libTrack.file.bitrateInKbps} kbps</td>
                <td className="library-item w-16 px-3 py-2 text-sm text-center">{libTrack.playCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
