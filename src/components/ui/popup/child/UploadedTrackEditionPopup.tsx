"use client";

import { formatTime } from "@utils/formatting";
import Rating from "@/components/features/Rating";
import Button from "@/components/ui/Button";
import { BasePopup, BasePopupProps } from "../BasePopup";

interface UploadedTrackEditionPopupProps extends BasePopupProps {
  track: {
    file: {
      durationInSec: number;
      filename: string;
      sizeInMo: number;
      bitrateInKbps: number;
    };
    createdOn: string;
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
}

export default class UploadedTrackEditionPopup extends BasePopup<UploadedTrackEditionPopupProps> {
  render(props: UploadedTrackEditionPopupProps) {
    return this.renderBase({
      ...props,
      title: "Edit Track",
      className: `max-w-2xl ${props.className || ""}`,
      children: (
        <form onSubmit={props.onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={props.formValues.title}
                  onChange={props.onFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                <input
                  type="text"
                  name="artistName"
                  value={props.formValues.artistName}
                  onChange={props.onFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <input
                  type="text"
                  name="genreName"
                  value={props.formValues.genreName}
                  onChange={props.onFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">{formatTime(props.track.file.durationInSec)}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Added on</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {new Date(props.track.createdOn).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Album</label>
                <input
                  type="text"
                  name="albumName"
                  value={props.formValues.albumName}
                  onChange={props.onFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <Rating rating={props.formValues.rating} handleChange={props.onFormChange} />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-500">
            <div>Filename: {props.track.file.filename}</div>
            <div>Size: {props.track.file.sizeInMo} Mo</div>
            <div>Bitrate: {props.track.file.bitrateInKbps} kbps</div>
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={props.onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      ),
    });
  }
}
