"use client";

import PropTypes from "prop-types";
import { formatTime } from "@utils/formatting";
import Rating from "@components/client/features/Rating";
import Button from "@components/client/ui/Button";
import { BasePopup } from "./BasePopup";

export default function UploadedTrackEditionPopup({
  onClose,
  track,
  formValues,
  onFormChange,
  onSubmit,
  className = "",
}) {
  return (
    <BasePopup title="Edit Track" onClose={onClose} className={`max-w-2xl ${className}`}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formValues.title}
                onChange={onFormChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
              <input
                type="text"
                name="artistName"
                value={formValues.artistName}
                onChange={onFormChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <input
                type="text"
                name="genreName"
                value={formValues.genreName}
                onChange={onFormChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md">{formatTime(track.file.durationInSec)}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Added on</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md">{new Date(track.createdOn).toLocaleDateString()}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Album</label>
              <input
                type="text"
                name="albumName"
                value={formValues.albumName}
                onChange={onFormChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <Rating rating={formValues.rating} handleChange={onFormChange} />
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          <div>Filename: {track.file.filename}</div>
          <div>Size: {track.file.sizeInMo} Mo</div>
          <div>Bitrate: {track.file.bitrateInKbps} kbps</div>
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </form>
    </BasePopup>
  );
}

UploadedTrackEditionPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  track: PropTypes.object.isRequired,
  formValues: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  className: PropTypes.string,
};
