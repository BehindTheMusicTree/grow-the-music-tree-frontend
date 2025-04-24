"use client";

import { ReactNode } from "react";
import { PopupTitle } from "./PopupTitle";
import { LucideIcon } from "lucide-react";

export interface BasePopupProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  isDismissable?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export abstract class BasePopup<P extends BasePopupProps = BasePopupProps> {
  abstract render(props: P): ReactNode;

  protected renderBase(props: P) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`bg-white rounded-lg p-4 w-full max-w-lg ${props.className || ""}`}>
          <PopupTitle
            title={props.title}
            onClose={props.onClose}
            isDismissable={props.isDismissable}
            icon={props.icon}
          />
          <div className="pt-4">{props.children}</div>
        </div>
      </div>
    );
  }
}
