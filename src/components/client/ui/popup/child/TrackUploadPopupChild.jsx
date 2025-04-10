import { useState, useEffect } from "react";
import { useUploadedTracks } from "@contexts/UploadedTrackContext";
import { FaSpinner } from "react-icons/fa";
import PropTypes from "prop-types";
import { MdError, MdCheckCircle } from "react-icons/md";
import BadRequestError from "@utils/errors/BadRequestError";

export default function TrackUploadPopupChild({ popupContentObject }) {
  const { postUploadedTrack, setRefreshUploadedTracksSignal } = useUploadedTracks();
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isPosting) {
      const uploadTrack = async () => {
        try {
          await postUploadedTrack(popupContentObject.files[0], popupContentObject.genreUuid);
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

      uploadTrack();
    }
  }, [
    isPosting,
    popupContentObject.files,
    popupContentObject.genreUuid,
    postUploadedTrack,
    setRefreshUploadedTracksSignal,
  ]);

  useEffect(() => {
    if (popupContentObject.files && popupContentObject.files.length > 0) {
      setIsPosting(true);
    }
  }, [popupContentObject.files]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <MdError className="text-red-500 text-4xl mb-2" />
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <MdCheckCircle className="text-green-500 text-4xl mb-2" />
        <p className="text-green-500 text-center">Track uploaded successfully!</p>
      </div>
    );
  }

  if (isPosting) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <FaSpinner className="text-[#1DB954] text-4xl mb-2 animate-spin" />
        <p className="text-[#1DB954] text-center">Uploading track...</p>
      </div>
    );
  }

  return null;
}

TrackUploadPopupChild.propTypes = {
  popupContentObject: PropTypes.shape({
    files: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
    genreUuid: PropTypes.string.isRequired,
  }).isRequired,
};
