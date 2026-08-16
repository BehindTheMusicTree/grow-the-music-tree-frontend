"use client";

import { AlertTriangle } from "lucide-react";
import { BasePopup, BasePopupProps } from "@behindthemusictree/app-kit/popup";
import { BANNER_HEIGHT } from "@lib/constants/layout";

type NetworkErrorPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable">;

export default function NetworkErrorPopup(props: NetworkErrorPopupProps) {
  return (
    <BasePopup
      {...props}
      title="Network Error"
      topOffset={BANNER_HEIGHT}
      isDismissable={false}
      icon={AlertTriangle}
      children={
        <div className="flex flex-col items-center space-y-6 py-4">
          <AlertTriangle className="h-16 w-16 text-gray-600" strokeWidth={1.5} />
          <p className="text-center text-gray-700">
            It seems that you are not connected to the internet. Please check your connection and try again.
          </p>
        </div>
      }
    />
  );
}
