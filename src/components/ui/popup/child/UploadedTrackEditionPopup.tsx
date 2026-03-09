"use client";

import { formatTime } from "@utils/formatting";
import Rating from "@components/features/Rating";
import { Button } from "@components/ui/Button";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { UploadedTrackUpdateValues } from "@schemas/domain/uploaded-track/form/update";
import { UploadedTrackDetailed } from "@schemas/domain/uploaded-track/response/detailed";

type UploadedTrackEditionPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  uploadedTrack: UploadedTrackDetailed;
  formValues: UploadedTrackUpdateValues;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose?: () => void;
};

export default function UploadedTrackEditionPopup({
  uploadedTrack,
  formValues,
  onFormChange,
  onSubmit,
  onClose,
  ...rest
}: UploadedTrackEditionPopupProps) {
  return (
    <BasePopup
      {...rest}
      title="Edit Track"
      isDismissable
      children={
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formValues.title ?? ""}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artists</label>
                <input
                  type="text"
                  name="artists_names"
                  value={formValues.artists_names ?? ""}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Separate multiple artists with commas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={formValues.genre ?? ""}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">{formatTime(uploadedTrack.file.durationInSec)}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Added on</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {new Date(uploadedTrack.createdOn).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Album</label>
                <input
                  type="text"
                  name="album_name"
                  value={formValues.album_name ?? ""}
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
            <div>Filename: {uploadedTrack.file.filename}</div>
            <div>Size: {uploadedTrack.file.sizeInMo} Mo</div>
            <div>Bitrate: {uploadedTrack.file.bitrateInKbps} kbps</div>
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save
            </Button>
          </div>
        </form>
      }
    />
  );
}
