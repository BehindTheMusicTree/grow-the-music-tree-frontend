"use client";

import { FaRegClock } from "react-icons/fa";

import { formatTime } from "@utils/formatting";
import Rating from "@components/features/Rating";
import UploadButtons from "@components/features/UploadButtons";
import UploadedTrackPositionPlayPause from "@components/features/UploadedTrackPositionPlayPause";
import { usePlayer } from "@contexts/PlayerContext";
import { usePopup } from "@contexts/PopupContext";
import { useTrackList } from "@contexts/TrackListContext";
import { useListUploadedTracks } from "@hooks/useUploadedTrack";
import TrackUploadPopup from "@components/ui/popup/child/TrackUploadPopup";

export default function UploadedLibrary() {
  const { data: uploadedTracksResponse } = useListUploadedTracks();
  const uploadedTracks = uploadedTracksResponse?.results || [];
  const { playerUploadedTrackObject, handlePlayPauseAction } = usePlayer();
  const { showPopup, hidePopup } = usePopup();
  const { playNewTrackListFromUploadedTrackUuid } = useTrackList();

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      showPopup(
        <TrackUploadPopup
          files={Array.from(files)}
          genre={null}
          onComplete={() => {}}
          onClose={() => {
            hidePopup();
          }}
        />
      );
    }
    event.target.value = null;
  };

  const handlePlayPauseClick = (uploadedTrack) => {
    if (playerUploadedTrackObject && playerUploadedTrackObject.uploadedTrack.uuid === uploadedTrack.uuid) {
      handlePlayPauseAction();
    } else {
      playNewTrackListFromUploadedTrackUuid(uploadedTrack);
    }
  };

  return (
    <div className="uploaded-library">
      <UploadButtons onFileChange={handleFileChange} />
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="uploaded-library-item w-16 px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                style={{ minWidth: "64px", maxWidth: "64px" }}
              >
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
              <th
                className="uploaded-library-item w-16 px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                style={{ minWidth: "64px", maxWidth: "64px" }}
              >
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
            {uploadedTracks.map((uploadedTrack, index) => (
              <tr key={uploadedTrack.uuid} className="hover:bg-gray-50 group">
                <td
                  className="uploaded-library-item w-16 px-3 py-2 text-center"
                  style={{ minWidth: "64px", maxWidth: "64px" }}
                >
                  <UploadedTrackPositionPlayPause
                    position={index + 1}
                    uuid={uploadedTrack.uuid}
                    handlePlayPauseClick={() => handlePlayPauseClick(uploadedTrack)}
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
                <td
                  className="uploaded-library-item w-16 px-3 py-2 text-sm text-center"
                  style={{ minWidth: "64px", maxWidth: "64px" }}
                >
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
