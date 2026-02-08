"use client";

import React from "react";
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
  const { data: uploadedTracksResponse } = useListUploadedTracks("me");
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
        />,
      );
    }
    event.target.value = null;
  };

  const handlePlayPauseClick = (uploadedTrack) => {
    if (playerUploadedTrackObject && playerUploadedTrackObject.uploadedTrack.uuid === uploadedTrack.uuid) {
      handlePlayPauseAction();
    } else {
      playNewTrackListFromUploadedTrackUuid(uploadedTrack, "me");
    }
  };

  return (
    <div className="uploaded-library">
      <UploadButtons onFileChange={handleFileChange} />
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
        <table className="w-full divide-y divide-gray-300" style={{ tableLayout: "fixed" }}>
          <thead className="bg-gray-100">
            <tr>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                style={{ width: "8%" }}
              >
                #
              </th>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                style={{ width: "35%" }}
              >
                Title
              </th>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                style={{ width: "15%" }}
              >
                Artist
              </th>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell"
                style={{ width: "15%" }}
              >
                Album
              </th>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell"
                style={{ width: "10%" }}
              >
                Genre
              </th>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell"
                style={{ width: "8%" }}
              >
                Rating
              </th>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell"
                style={{ width: "8%" }}
              >
                <div className="flex justify-center items-center">
                  <FaRegClock />
                </div>
              </th>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell"
                style={{ width: "6%" }}
              >
                Format
              </th>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden xl:table-cell"
                style={{ width: "8%" }}
              >
                Bitrate
              </th>
              <th
                className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden xl:table-cell"
                style={{ width: "6%" }}
              >
                Plays
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uploadedTracks.map((uploadedTrack, index) => (
              <tr key={uploadedTrack.uuid} className="hover:bg-gray-50 group">
                <td className="uploaded-library-item px-2 sm:px-3 py-2 text-center" style={{ width: "8%" }}>
                  <UploadedTrackPositionPlayPause
                    position={index + 1}
                    uuid={uploadedTrack.uuid}
                    handlePlayPauseClick={() => handlePlayPauseClick(uploadedTrack)}
                  />
                </td>
                <td className="uploaded-library-item px-2 sm:px-3 py-2 text-sm truncate" style={{ width: "35%" }}>
                  <div className="truncate" title={uploadedTrack.title}>
                    {uploadedTrack.title}
                  </div>
                  <div className="text-xs text-gray-500 sm:hidden">
                    {uploadedTrack.artist ? uploadedTrack.artist.name : ""}
                    {uploadedTrack.album && ` • ${uploadedTrack.album.name}`}
                  </div>
                </td>
                <td
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-sm truncate hidden sm:table-cell"
                  style={{ width: "15%" }}
                >
                  <div className="truncate" title={uploadedTrack.artist ? uploadedTrack.artist.name : ""}>
                    {uploadedTrack.artist ? uploadedTrack.artist.name : ""}
                  </div>
                </td>
                <td
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-sm truncate hidden md:table-cell"
                  style={{ width: "15%" }}
                >
                  <div className="truncate" title={uploadedTrack.album ? uploadedTrack.album.name : ""}>
                    {uploadedTrack.album ? uploadedTrack.album.name : ""}
                  </div>
                </td>
                <td
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-sm truncate hidden lg:table-cell"
                  style={{ width: "10%" }}
                >
                  <div className="truncate" title={uploadedTrack.genre ? uploadedTrack.genre.name : ""}>
                    {uploadedTrack.genre ? uploadedTrack.genre.name : ""}
                  </div>
                </td>
                <td
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-center hidden sm:table-cell"
                  style={{ width: "8%" }}
                >
                  <Rating
                    rating={uploadedTrack.rating}
                    handleChange={() => {
                      return;
                    }}
                  />
                </td>
                <td className="uploaded-library-item px-2 sm:px-3 py-2 text-sm text-center" style={{ width: "8%" }}>
                  {formatTime(uploadedTrack.file.durationInSec)}
                </td>
                <td
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-sm text-center hidden lg:table-cell"
                  style={{ width: "6%" }}
                >
                  {uploadedTrack.file.extension.replace(".", "")}
                </td>
                <td
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-sm text-center hidden xl:table-cell"
                  style={{ width: "8%" }}
                >
                  {uploadedTrack.file.bitrateInKbps} kbps
                </td>
                <td
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-sm text-center hidden xl:table-cell"
                  style={{ width: "6%" }}
                >
                  {uploadedTrack.playCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
