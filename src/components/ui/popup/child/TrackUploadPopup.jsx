"use client";

import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { MdError } from "react-icons/md";
import { useGenrePlaylist } from "@contexts/GenrePlaylistContext";

export default function TrackUploadPopup({ files, genreUuid, requestErrors, onClose }) {
  const { setRefreshGenrePlaylistsSignal, uploadTracks } = useGenrePlaylist();
  const isPostingRef = useRef(false);

  useEffect(() => {
    async function handleUpload() {
      if (files && !isPostingRef.current) {
        isPostingRef.current = true;
        try {
          const response = await uploadTracks(files, genreUuid);
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Upload failed");
          }
          setRefreshGenrePlaylistsSignal(1);
          onClose();
        } finally {
          isPostingRef.current = false;
        }
      }
    }
    handleUpload();
  }, [files, genreUuid, setRefreshGenrePlaylistsSignal, onClose, uploadTracks]);

  return (
    <div>
      {requestErrors ? (
        <div>
          <div className="flex items-center">
            <MdError size={20} color="red" />
            <h3 className="ml-1">An error occurred</h3>
          </div>
          <div className="mt-2 text-red-500">{requestErrors}</div>
        </div>
      ) : (
        <h3>Uploading...</h3>
      )}
    </div>
  );
}

TrackUploadPopup.propTypes = {
  content: PropTypes.shape({
    files: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
    genreUuid: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
