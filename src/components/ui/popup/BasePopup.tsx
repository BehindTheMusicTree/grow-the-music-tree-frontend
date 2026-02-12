"use client";

import { createPortal } from "react-dom";
import { Component, ReactNode } from "react";
import { PopupTitle } from "@components/ui/popup/PopupTitle";
import { BANNER_HEIGHT, MENU_WIDTH } from "@lib/constants/layout";
import { PopupButtons } from "@components/ui/popup/PopupButtons";
import { Button } from "@components/ui/Button";
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
  // Button configuration
  showOkButton?: boolean;
  showCancelButton?: boolean;
  okButtonText?: string;
  okButtonDisabled?: boolean;
  cancelButtonText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  buttonAlignment?: "left" | "center" | "right";
}

export class BasePopup<P extends BasePopupProps = BasePopupProps, S = object> extends Component<P, S> {
  renderBase(props: BasePopupProps) {
    const {
      title,
      children,
      onClose,
      type = "default",
      icon,
      isDismissable = true,
      className,
      showOkButton = false,
      showCancelButton = false,
      okButtonText = "OK",
      cancelButtonText = "Cancel",
      onOk,
      okButtonDisabled = false,
      onCancel,
      buttonAlignment = "center",
    } = props;

    const baseClasses = "bg-white rounded-lg";
    const typeClasses: Record<string, string> = {
      default: "w-full max-w-lg",
      success: "w-full max-w-lg",
      error: "w-full max-w-lg",
      warning: "w-full max-w-lg",
      info: "w-full max-w-lg",
      spotify: "w-full max-w-md",
    };

    const renderButtons = () => {
      if (!showOkButton && !showCancelButton) return null;

      return (
        <div className="pt-4 border-t">
          <PopupButtons alignment={buttonAlignment}>
            {showCancelButton && (
              <Button onClick={onCancel || onClose || (() => {})} variant="secondary">
                {cancelButtonText}
              </Button>
            )}
            {showOkButton && (
              <Button onClick={onOk || onClose || (() => {})} disabled={okButtonDisabled}>
                {okButtonText}
              </Button>
            )}
          </PopupButtons>
        </div>
      );
    };

    const popupComponent = (
      <div
        className="fixed z-50 flex items-center justify-center bg-transparent"
        style={{
          top: BANNER_HEIGHT,
          left: MENU_WIDTH,
          right: 0,
          bottom: 0,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        <div className={`${baseClasses} ${typeClasses[type]} ${className || ""}`} onClick={(e) => e.stopPropagation()}>
          <PopupTitle title={title} onClose={onClose ?? (() => {})} isDismissable={isDismissable} icon={icon} />
          <div className={`popup-content p-4 rounded-b-lg ${type === "spotify" ? "bg-green-500" : ""}`}>
            {children}
            {renderButtons()}
          </div>
        </div>
      </div>
    );
    return createPortal(popupComponent, document.body);
  }
}
