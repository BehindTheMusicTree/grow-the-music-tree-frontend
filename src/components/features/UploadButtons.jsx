"use client";

import { useRef } from "react";
import { FaFileUpload, FaFolderOpen } from "react-icons/fa";

export default function UploadButtons({ onFileChange }) {
  const fileInputRef = useRef();
  const directoryInputRef = useRef();

  const handleFileUploadAction = () => {
    fileInputRef.current.click();
  };

  const handleDirectoryUploadAction = () => {
    directoryInputRef.current.click();
  };

  return (
    <div className="flex my-4">
      <div>
        <input type="file" ref={fileInputRef} style={{ display: "none" }} multiple onChange={onFileChange} />
        <button className="action-round-button" onClick={handleFileUploadAction}>
          <FaFileUpload size={32} />
        </button>
      </div>
      <div className="ml-2">
        <input
          type="file"
          ref={directoryInputRef}
          style={{ display: "none" }}
          multiple
          webkitdirectory=""
          onChange={onFileChange}
        />
        <button className="action-round-button" onClick={handleDirectoryUploadAction}>
          <FaFolderOpen size={32} />
        </button>
      </div>
    </div>
  );
}
