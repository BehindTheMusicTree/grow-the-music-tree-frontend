"use client";

import { useState, useEffect } from "react";
import { useUploadedTracks } from "@contexts/UploadedTrackContext";
import { TrackUploadPopup } from "@components/ui/popup/TrackUploadPopup";
import BadRequestError from "@utils/errors/BadRequestError";

export function useTrackUpload() {
  const { postUploadedTrack, setRefreshUploadedTracksSignal } = useUploadedTracks();
  const [show, setShow] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState([]);
  const [genreUuid, setGenreUuid] = useState(null);

  const uploadTrack = async () => {
    if (!files.length || !genreUuid) return;

    setIsPosting(true);
    try {
      await postUploadedTrack(files[0], genreUuid);
      setSuccess(true);
      setRefreshUploadedTracksSignal((prev) => !prev);
    } catch (error) {
      if (error instanceof BadRequestError) {
        setError(error.message);
      } else {
        setError("An error occurred while uploading the track");
      }
    } finally {
      setIsPosting(false);
    }
  };

  const showUploadPopup = (files, genreUuid) => {
    setFiles(files);
    setGenreUuid(genreUuid);
    setShow(true);
    setError(null);
    setSuccess(false);
  };

  const TrackUploadComponent = () => {
    if (!show) return null;

    return (
      <TrackUploadPopup
        onClose={() => setShow(false)}
        files={files}
        genreUuid={genreUuid}
        isPosting={isPosting}
        error={error}
        success={success}
      />
    );
  };

  return {
    showUploadPopup,
    TrackUploadComponent,
  };
}
