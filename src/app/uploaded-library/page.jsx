import { useRef } from "react";
import { FaFileUpload, FaFolderOpen } from "react-icons/fa";

import { formatTime } from "@lib/utils/formatting";
import { FaRegClock } from "react-icons/fa";
import Rating from "@/components/utils/Rating";
import UploadedTrackPositionPlayPause from "@/components/client/UploadedTrackPositionPlayPause";
import { usePlayer } from "@/contexts/PlayerContext";
import { usePopup } from "@/contexts/PopupContext";
import { useTrackList } from "@/contexts/TrackListContext";
import { useUploadedTracks } from "@/contexts/UploadedTrackContext";
import TrackUploadPopupContentObject from "@models/popup-content-object/TrackUploadPopupContentObject";

export default function UploadedLibrary() {
  const { uploadedTracks } = useUploadedTracks();
  const { playerUploadedTrackObject, handlePlayPauseAction } = usePlayer();
  const { showPopup } = usePopup();
  const { playNewTrackListFromUploadedTrackUuid } = useTrackList();

  const fileInputRef = useRef();
  const directoryInputRef = useRef();

  const handleFileUploadAction = () => {
    fileInputRef.current.click();
  };

  const handleDirectoryUploadAction = () => {
    directoryInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const popupContentObject = new TrackUploadPopupContentObject(Array.from(event.target.files), null);
    showPopup(popupContentObject);
    event.target.value = null;
  };

  const handlePlayPauseClick = (uploadedTrackUuid) => {
    if (playerUploadedTrackObject && playerUploadedTrackObject.uploadedTrack.uuid == uploadedTrackUuid) {
      handlePlayPauseAction();
    } else {
      playNewTrackListFromUploadedTrackUuid(uploadedTrackUuid);
    }
  };

  return (
    <div className="uploaded-library">
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
              <th className="uploaded-library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                #
              </th>
              <th className="uploaded-library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="uploaded-library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Artist
              </th>
              <th className="uploaded-library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Album
              </th>
              <th className="uploaded-library-item px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Genre
              </th>
              <th className="uploaded-library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Rating
              </th>
              <th className="uploaded-library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="flex justify-center items-center">
                  <FaRegClock />
                </div>
              </th>
              <th className="uploaded-library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Format
              </th>
              <th className="uploaded-library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Bitrate
              </th>
              <th className="uploaded-library-item px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Plays
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uploadedTracks?.map((uploadedTrack, index) => (
              <tr key={uploadedTrack.uuid} className="hover:bg-gray-50 group">
                <td className="uploaded-library-item w-10 px-3 py-2 text-center">
                  <UploadedTrackPositionPlayPause
                    position={index + 1}
                    uuid={uploadedTrack.uuid}
                    handlePlayPauseClick={() => handlePlayPauseClick(uploadedTrack.uuid)}
                  />
                </td>
                <td className="uploaded-library-item w-full px-3 py-2 text-sm truncate">{uploadedTrack.title}</td>
                <td className="uploaded-library-item w-32 px-3 py-2 text-sm truncate">
                  {uploadedTrack.artist ? uploadedTrack.artist.name : ""}
                </td>
                <td className="uploaded-library-item w-32 px-3 py-2 text-sm truncate">
                  {uploadedTrack.album ? uploadedTrack.album.name : ""}
                </td>
                <td className="uploaded-library-item w-32 px-3 py-2 text-sm truncate">
                  {uploadedTrack.genre ? uploadedTrack.genre.name : ""}
                </td>
                <td className="uploaded-library-item w-24 px-3 py-2 text-center">
                  <Rating
                    rating={uploadedTrack.rating}
                    handleChange={() => {
                      return;
                    }}
                  />
                </td>
                <td className="uploaded-library-item w-20 px-3 py-2 text-sm text-center">
                  {formatTime(uploadedTrack.file.durationInSec)}
                </td>
                <td className="uploaded-library-item w-16 px-3 py-2 text-sm text-center">
                  {uploadedTrack.file.extension.replace(".", "")}
                </td>
                <td className="uploaded-library-item w-20 px-3 py-2 text-sm text-center">
                  {uploadedTrack.file.bitrateInKbps} kbps
                </td>
                <td className="uploaded-library-item w-16 px-3 py-2 text-sm text-center">{uploadedTrack.playCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
