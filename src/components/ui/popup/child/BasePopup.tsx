"use client";

import { useState, useEffect, ReactNode, ElementType } from "react";
import { createPortal } from "react-dom";
import Popup from "@components/ui/popup/Popup";
import { PopupTitle } from "@components/ui/popup/PopupTitle";

type PopupType = "default" | "success" | "error" | "warning" | "info";

interface BasePopupProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  type?: PopupType;
  icon?: ElementType;
  isDismissable?: boolean;
}

export function BasePopup({
  title,
  children,
  isOpen,
  onClose,
  type = "default",
  icon,
  isDismissable = true,
}: BasePopupProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getPopupClasses = () => {
    const baseClasses = "bg-white rounded-lg p-4";
    const typeClasses: Record<PopupType, string> = {
      default: "w-full max-w-lg",
      success: "w-full max-w-lg",
      error: "w-full max-w-lg",
      warning: "w-full max-w-lg",
      info: "w-full max-w-lg",
    };
    return `${baseClasses} ${typeClasses[type]}`;
  };

  // Popup content to be rendered
  const popupContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div className={getPopupClasses()} onClick={(e) => e.stopPropagation()}>
        <PopupTitle title={title} onClose={onClose} isDismissable={isDismissable} icon={icon} />
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );

  // Only create portal once component is mounted on the client
  if (!isMounted) {
    return null; // Return null during SSR
  }

  // Once mounted (client-side only), create the portal
  return createPortal(popupContent, document.body);
}
