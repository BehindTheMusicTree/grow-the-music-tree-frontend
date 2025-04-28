"use client";

import { formatTime } from "@lib/utils/formatting";
import Rating from "@components/features/Rating";
import { Button } from "@components/ui/Button";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { UploadedTrackUpdateValues } from "@domain/uploaded-track/form";
import { UploadedTrackDetailed } from "@domain/uploaded-track/response";

type UploadedTrackEditionPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  uploadedTrack: UploadedTrackDetailed;
  formValues: UploadedTrackUpdateValues;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose?: () => void;
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class UploadedTrackEditionPopup extends BasePopup<UploadedTrackEditionPopupProps> {
  render() {
    const { uploadedTrack, formValues, onFormChange, onSubmit, onClose, ...rest } = this.props;
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
                  value={formValues.title ?? ""}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artists</label>
                <div className="space-y-2">
                  {formValues.artistsNames?.map((artist, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        name={`artistsNames.${index}`}
                        value={artist ?? ""}
                        onChange={onFormChange}
                        className="flex-1 px-3 py-2 border rounded-md"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const newArtists = [...(formValues.artistsNames ?? [])];
                          newArtists.splice(index, 1);
                          onFormChange({
                            target: { name: "artistsNames", value: newArtists },
                          } as unknown as React.ChangeEvent<HTMLInputElement>);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const newArtists = [...(formValues.artistsNames ?? []), ""];
                      onFormChange({
                        target: { name: "artistsNames", value: newArtists },
                      } as unknown as React.ChangeEvent<HTMLInputElement>);
                    }}
                  >
                    Add Artist
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <input
                  type="text"
                  name="genreName"
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
                  {new Date(uploadedTrack.createdOn).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Album</label>
                <input
                  type="text"
                  name="albumName"
                  value={formValues.albumName ?? ""}
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
      ),
    });
  }
}
