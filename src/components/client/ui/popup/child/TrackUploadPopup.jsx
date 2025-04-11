"use client";

import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { MdError } from "react-icons/md";
import { useGenrePlaylists } from "@contexts/GenrePlaylistContext";

export default function TrackUploadPopup({ content, onClose }) {
  const { setRefreshGenrePlaylistsSignal } = useGenrePlaylists();
  const [requestErrors, setRequestErrors] = useState();
  const isPostingRef = useRef(false);

  useEffect(() => {
    async function uploadTracks(files, genreUuid) {
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("genre_uuid", genreUuid);

        const response = await fetch("/api/uploaded-tracks", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }

        setRefreshGenrePlaylistsSignal(1);
        onClose();
      } catch (error) {
        setRequestErrors(error.message);
      }
      isPostingRef.current = false;
    }

    if (content && !isPostingRef.current) {
      isPostingRef.current = true;
      uploadTracks(content.files, content.genreUuid);
    }
  }, [content, setRefreshGenrePlaylistsSignal, onClose]);

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
