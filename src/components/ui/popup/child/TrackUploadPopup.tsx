"use client";

import { MdError } from "react-icons/md";
import { BasePopup, BasePopupProps } from "../BasePopup";

type TrackUploadPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  isUploadingTrack?: boolean;
  error?: Error | null;
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class TrackUploadPopup extends BasePopup<TrackUploadPopupProps> {
  render() {
    const { isUploadingTrack, error, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Upload Track",
      isDismissable: true,
      children: (
        <div>
          {error ? (
            <div>
              <div className="flex items-center">
                <MdError size={20} color="red" />
                <h3 className="ml-1">An error occurred</h3>
              </div>
              <div className="mt-2 text-red-500">{error.message}</div>
            </div>
          ) : (
            <div>{isUploadingTrack ? <h3>Uploading...</h3> : <h3>Uploaded</h3>}</div>
          )}
        </div>
      ),
    });
  }
}
