// components/ui/popup/BasePopup.jsx
"use client";

import { createPortal } from "react-dom";
import { PopupTitle } from "../PopupTitle";

export function BasePopup({
  title,
  children,
  onClose,
  isDismissable = true,
  className = "",
  type = "default", // default | fullscreen | bottom-sheet | alert
}) {
  const getPopupClasses = () => {
    const baseClasses = "bg-white rounded-lg p-4";
    const typeClasses = {
      default: "w-full max-w-lg",
      fullscreen: "w-full h-full rounded-none",
      "bottom-sheet": "w-full max-w-lg fixed bottom-0 rounded-b-none",
      alert: "w-full max-w-md",
    };
    return `${baseClasses} ${typeClasses[type]} ${className}`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div className={getPopupClasses()} onClick={(e) => e.stopPropagation()}>
        <PopupTitle title={title} onClose={onClose} isDismissable={isDismissable} />
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
