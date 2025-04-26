"use client";

import { formatTime } from "@lib/utils/formatting";
import Rating from "@components/features/Rating";
import { Button } from "@components/ui/Button";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { UploadedTrackDetailed } from "@schemas/uploaded-track/response";

// Only allow custom props
type UploadedTrackEditionPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  uploadedTrack: UploadedTrackDetailed
  };
  formValues: {
    title: string;
    artistName: string;
    genreName: string;
    albumName: string;
    rating: number;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose?: () => void;
};

// @ts-expect-error: title, children, icon, isDismissable are set internally by the popup
export default class UploadedTrackEditionPopup extends BasePopup<UploadedTrackEditionPopupProps> {
  render() {
    const { uploadedTrack: track, formValues, onFormChange, onSubmit, onClose, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Edit Track",
      isDismissable: true,
      children: (
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
            <Button type="submit" variant="default">
              Save
            </Button>
          </div>
        </form>
      ),
    });
  }
}
