"use client";

import { useState, useEffect, useCallback } from "react";
import { MdError, MdCheckCircle, MdUpload, MdClose } from "react-icons/md";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { useUploadTrack } from "@hooks/useUploadedTrack";
import { UploadedTrackCreationValues } from "@schemas/domain/uploaded-track/form/creation";

type UploadStatus = "pending" | "uploading" | "success" | "error";

type TrackUploadItem = {
  id: string;
  file: File;
  genre: string | null;
  status: UploadStatus;
  progress: number;
  error?: Error | null;
  uploadedTrack?: unknown;
};

type TrackUploadPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  files: File[];
  genre?: string | null;
  onComplete?: (uploadedTracks: unknown[]) => void;
  onClose?: () => void;
};

// Functional component that handles the upload logic
function TrackUploadContent({
  files,
  genre,
  onComplete,
  onClose,
}: Pick<TrackUploadPopupProps, "files" | "genre" | "onComplete" | "onClose">) {
  const [uploadItems, setUploadItems] = useState<TrackUploadItem[]>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [allComplete, setAllComplete] = useState(false);

  const { mutate: uploadTrack } = useUploadTrack();

  // Initialize upload items when files change
  useEffect(() => {
    const items: TrackUploadItem[] = files.map((file, index) => ({
      id: `upload-${index}-${file.name}`,
      file,
      genre: genre ?? null,
      status: "pending" as UploadStatus,
      progress: 0,
    }));
    setUploadItems(items);
    setCurrentUploadIndex(0);
    setAllComplete(false);
  }, [files, genre]);

  const startNextUpload = useCallback(() => {
    if (currentUploadIndex >= uploadItems.length) {
      setAllComplete(true);
      const successfulUploads = uploadItems
        .filter((item) => item.status === "success" && item.uploadedTrack)
        .map((item) => item.uploadedTrack);

      if (onComplete && successfulUploads.length > 0) {
        onComplete(successfulUploads);
      }
      return;
    }

    const currentItem = uploadItems[currentUploadIndex];
    if (currentItem.status !== "pending") {
      setCurrentUploadIndex((prev) => prev + 1);
      return;
    }

    setIsUploading(true);

    // Update status to uploading
    setUploadItems((prev) =>
      prev.map((item, index) => (index === currentUploadIndex ? { ...item, status: "uploading", progress: 0 } : item))
    );

    // Create upload data
    const uploadData: UploadedTrackCreationValues = {
      file: currentItem.file,
      genre: currentItem.genre,
    };

    // Simulate progress updates (since we don't have real progress from the API)
    const progressInterval = setInterval(() => {
      setUploadItems((prev) =>
        prev.map((item, index) =>
          index === currentUploadIndex && item.status === "uploading"
            ? { ...item, progress: Math.min(item.progress + Math.random() * 20, 90) }
            : item
        )
      );
    }, 200);

    // Perform upload
    uploadTrack(uploadData, {
      onSuccess: (data) => {
        clearInterval(progressInterval);
        setUploadItems((prev) =>
          prev.map((item, index) =>
            index === currentUploadIndex ? { ...item, status: "success", progress: 100, uploadedTrack: data } : item
          )
        );
        setIsUploading(false);
        setCurrentUploadIndex((prev) => prev + 1);
      },
      onError: (error) => {
        clearInterval(progressInterval);
        setUploadItems((prev) =>
          prev.map((item, index) => (index === currentUploadIndex ? { ...item, status: "error", error } : item))
        );
        setIsUploading(false);
        setCurrentUploadIndex((prev) => prev + 1);
      },
    });
  }, [uploadItems, currentUploadIndex, uploadTrack, onComplete]);

  // Start upload process
  useEffect(() => {
    if (uploadItems.length > 0 && !isUploading && currentUploadIndex < uploadItems.length) {
      startNextUpload();
    }
  }, [uploadItems, currentUploadIndex, isUploading, startNextUpload]);

  // Check if all uploads are complete
  useEffect(() => {
    if (uploadItems.length > 0 && currentUploadIndex >= uploadItems.length && !isUploading) {
      setAllComplete(true);
      const successfulTracks = uploadItems
        .filter((item) => item.status === "success" && item.uploadedTrack)
        .map((item) => item.uploadedTrack);
      onComplete?.(successfulTracks);
    }
  }, [uploadItems, currentUploadIndex, isUploading, onComplete]);

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case "success":
        return <MdCheckCircle className="text-green-500" size={20} />;
      case "error":
        return <MdError className="text-red-500" size={20} />;
      case "uploading":
        return <MdUpload className="text-blue-500 animate-pulse" size={20} />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case "success":
        return "Uploaded";
      case "error":
        return "Failed";
      case "uploading":
        return "Uploading...";
      default:
        return "Pending";
    }
  };

  const successfulCount = uploadItems.filter((item) => item.status === "success").length;
  const errorCount = uploadItems.filter((item) => item.status === "error").length;

  return (
    <div className="space-y-4">
      {uploadItems.map((item) => (
        <div key={item.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {getStatusIcon(item.status)}
              <div>
                <div className="font-medium text-sm truncate max-w-xs" title={item.file.name}>
                  {item.file.name}
                </div>
                <div className="text-xs text-gray-500">{(item.file.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">{getStatusText(item.status)}</div>
          </div>

          {item.status === "uploading" && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}

          {item.status === "error" && item.error && (
            <div className="text-red-500 text-sm mt-2">{item.error.message}</div>
          )}
        </div>
      ))}

      {allComplete && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {successfulCount} successful, {errorCount} failed
          </div>
        </div>
      )}
    </div>
  );
}

// Class component wrapper that extends BasePopup
// @ts-expect-error: omitted props are set internally by the popup
export default class TrackUploadPopup extends BasePopup<TrackUploadPopupProps> {
  render() {
    const { files, genre, onComplete, onClose, ...rest } = this.props;

    const successfulCount = 0; // This will be calculated in the content component
    const totalCount = files.length;

    return this.renderBase({
      ...rest,
      title: `Upload Tracks (${successfulCount}/${totalCount})`,
      isDismissable: true,
      showOkButton: true,
      okButtonText: "OK",
      onOk: onClose,
      children: <TrackUploadContent files={files} genre={genre} onComplete={onComplete} onClose={onClose} />,
    });
  }
}
