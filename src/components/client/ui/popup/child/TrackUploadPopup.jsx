"use client";

import { BasePopup } from "./BasePopup";
import { FaSpinner } from "react-icons/fa";
import { MdError, MdCheckCircle } from "react-icons/md";
import PropTypes from "prop-types";

export function TrackUploadPopup({ onClose, files, genreUuid, isPosting, error, success, className = "" }) {
  return (
    <BasePopup title="Upload Track" onClose={onClose} className={`max-w-md ${className}`}>
      <div className="flex flex-col items-center justify-center p-4">
        {error && (
          <>
            <MdError className="text-red-500 text-4xl mb-2" />
            <p className="text-red-500 text-center">{error}</p>
          </>
        )}

        {success && (
          <>
            <MdCheckCircle className="text-green-500 text-4xl mb-2" />
            <p className="text-green-500 text-center">Track uploaded successfully!</p>
          </>
        )}

        {isPosting && (
          <>
            <FaSpinner className="text-[#1DB954] text-4xl mb-2 animate-spin" />
            <p className="text-[#1DB954] text-center">Uploading track...</p>
          </>
        )}
      </div>
    </BasePopup>
  );
}

TrackUploadPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  files: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  genreUuid: PropTypes.string.isRequired,
  isPosting: PropTypes.bool.isRequired,
  error: PropTypes.string,
  success: PropTypes.bool.isRequired,
  className: PropTypes.string,
};
