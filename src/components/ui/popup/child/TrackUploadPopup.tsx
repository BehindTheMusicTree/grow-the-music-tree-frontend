"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MdError, MdCheckCircle, MdUpload } from "react-icons/md";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { useUploadTrack } from "@hooks/useUploadedTrack";
import { UploadedTrackCreationValues } from "@schemas/domain/uploaded-track/form/creation";
import { Scope } from "@app-types/Scope";

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
  scope: Scope;
  onComplete?: (uploadedTracks: unknown[]) => void;
  onClose?: () => void;
};

type TrackUploadContentProps = Pick<TrackUploadPopupProps, "files" | "genre" | "scope" | "onComplete" | "onClose"> & {
  onProgress?: (successfulCount: number, totalCount: number, isUploading?: boolean) => void;
};

// Functional component that handles the upload logic
function TrackUploadContent({
  files,
  genre,
  scope,
  onComplete,
  onClose: _onClose,
  onProgress,
}: TrackUploadContentProps) {
  const [uploadItems, setUploadItems] = useState<TrackUploadItem[]>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [allComplete, setAllComplete] = useState(false);

  const { mutateAsync: uploadTrackAsync } = useUploadTrack(scope);

  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const lastReportedRef = useRef<{ successful: number; total: number; isUploading: boolean } | null>(null);
  const lastFilesKeyRef = useRef<string | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const successfulCount = uploadItems.filter((item) => item.status === "success").length;
    const totalCount = uploadItems.length;
    const last = lastReportedRef.current;
    if (last?.successful === successfulCount && last?.total === totalCount && last?.isUploading === isUploading) return;
    lastReportedRef.current = { successful: successfulCount, total: totalCount, isUploading };
    onProgressRef.current?.(successfulCount, totalCount, isUploading);
  }, [uploadItems, isUploading]);

  useEffect(() => {
    const filesKey = `${files.length}-${files.map((f) => `${f.name}:${f.size}`).join("|")}-${genre ?? ""}`;
    if (lastFilesKeyRef.current === filesKey) return;
    lastFilesKeyRef.current = filesKey;

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
      prev.map((item, index) => (index === currentUploadIndex ? { ...item, status: "uploading", progress: 0 } : item)),
    );

    // Create upload data
    const uploadData: UploadedTrackCreationValues = {
      file: currentItem.file,
      genre: currentItem.genre,
    };

    const UPLOAD_RESPONSE_TIMEOUT_MS =
      Number(process.env.NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS) || 300_000;

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setUploadItems((prev) =>
        prev.map((item, index) =>
          index === currentUploadIndex && item.status === "uploading"
            ? { ...item, progress: Math.min(item.progress + Math.random() * 8, 99) }
            : item,
        ),
      );
    }, 800);

    const uploadingIndex = currentUploadIndex;

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Upload timed out. The server took too long to respond.")),
        UPLOAD_RESPONSE_TIMEOUT_MS,
      );
    });

    Promise.race([uploadTrackAsync(uploadData), timeoutPromise])
      .then((data) => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setUploadItems((prev) =>
          prev.map((item, index) =>
            index === uploadingIndex ? { ...item, status: "success", progress: 100, uploadedTrack: data } : item,
          ),
        );
        setIsUploading(false);
        setCurrentUploadIndex((prev) => prev + 1);
      })
      .catch((error) => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setUploadItems((prev) =>
          prev.map((item, index) => (index === uploadingIndex ? { ...item, status: "error", error } : item)),
        );
        setIsUploading(false);
        setCurrentUploadIndex((prev) => prev + 1);
      });
  }, [uploadItems, currentUploadIndex, uploadTrackAsync, onComplete]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  // Start upload process
  useEffect(() => {
    const shouldStart = uploadItems.length > 0 && !isUploading && currentUploadIndex < uploadItems.length;
    if (shouldStart) {
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
            <div className="text-red-500 text-sm mt-2">
              {item.error.name === "InvalidInputError"
                ? "Upload failed due to invalid file data. Please check your file and try again."
                : item.error.name === "ZodError"
                  ? "Upload failed due to a server error. Please try again later."
                  : item.error.message}
            </div>
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

type TrackUploadPopupState = {
  successfulCount: number;
  totalCount: number;
  isComplete: boolean;
  isUploading: boolean;
};

// Class component wrapper that extends BasePopup
// @ts-expect-error: omitted props are set internally by the popup
export default class TrackUploadPopup extends BasePopup<TrackUploadPopupProps, TrackUploadPopupState> {
  state: TrackUploadPopupState = { successfulCount: 0, totalCount: 0, isComplete: false, isUploading: false };

  handleProgress = (successfulCount: number, totalCount: number, isUploading?: boolean) => {
    const uploading = isUploading ?? false;
    this.setState((prev) => ({
      successfulCount,
      totalCount,
      isUploading: uploading,
      isComplete: uploading ? false : prev.isComplete,
    }));
  };

  handleComplete = (uploadedTracks: unknown[]) => {
    const { onComplete } = this.props;
    this.setState({ isComplete: true, isUploading: false });
    onComplete?.(uploadedTracks);
  };

  render() {
    const { files, genre, scope, onComplete: _onComplete, onClose, ...rest } = this.props;
    const { successfulCount, totalCount, isComplete, isUploading } = this.state;
    const displayTotal = totalCount > 0 ? totalCount : files.length;

    return this.renderBase({
      ...rest,
      title: `Upload Tracks (${successfulCount}/${displayTotal})`,
      isDismissable: true,
      showOkButton: true,
      okButtonText: "OK",
      okButtonDisabled: isUploading || !isComplete,
      onOk: onClose,
      children: (
        <TrackUploadContent
          files={files}
          genre={genre}
          scope={scope}
          onComplete={this.handleComplete}
          onClose={onClose}
          onProgress={this.handleProgress}
        />
      ),
    });
  }
}

