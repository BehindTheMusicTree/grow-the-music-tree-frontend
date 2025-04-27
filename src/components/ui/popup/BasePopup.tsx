"use client";

import { createPortal } from "react-dom";
import { Component, ReactNode } from "react";
import { PopupTitle } from "@components/ui/popup/PopupTitle";
import { LucideIcon } from "lucide-react";

export interface BasePopupProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  type?: "default" | "success" | "error" | "warning" | "info" | "spotify";
  icon?: LucideIcon;
  isDismissable?: boolean;
  className?: string;
  contentClassName?: string;
}

export class BasePopup<P extends BasePopupProps = BasePopupProps, S = object> extends Component<P, S> {
  renderBase(props: BasePopupProps) {
    const { title, children, onClose, type = "default", icon, isDismissable = true, className } = props;
    const baseClasses = "bg-white rounded-lg";
    const typeClasses: Record<string, string> = {
      default: "w-full max-w-lg",
      success: "w-full max-w-lg",
      error: "w-full max-w-lg",
      warning: "w-full max-w-lg",
      info: "w-full max-w-lg",
      spotify: "w-full max-w-md",
    };
    const popupComponent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        <div className={`${baseClasses} ${typeClasses[type]} ${className || ""}`} onClick={(e) => e.stopPropagation()}>
          <PopupTitle title={title} onClose={onClose ?? (() => {})} isDismissable={isDismissable} icon={icon} />
          <div className={`popup-content py-4 -m-4 mb-4 rounded-b-lg ${type === "spotify" ? "bg-green-500" : ""}`}>
            {children}
          </div>
        </div>
      </div>
    );
    return createPortal(popupComponent, document.body);
  }
}
