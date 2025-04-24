"use client";

import { FaTimes } from "react-icons/fa";

interface PopupContent {
  message: string;
  debugCode?: string;
  onClose?: () => void;
}

interface PopupProps {
  type: string;
  content: PopupContent;
  onClose: () => void;
}

export default function Popup({ type, content, onClose }: PopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {type === "authRequired" && "Authentication Required"}
            {type === "networkError" && "Network Error"}
            {type === "internalError" && "Internal Error"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>
        <p className="text-gray-300 mb-4">{content.message}</p>
        {content.debugCode && <p className="text-gray-500 text-sm">Debug Code: {content.debugCode}</p>}
        <div className="mt-6 flex justify-end">
          <button
            onClick={content.onClose || onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
