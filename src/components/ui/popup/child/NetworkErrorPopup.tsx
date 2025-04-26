"use client";

import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { BasePopup, BasePopupProps } from "../BasePopup";

type NetworkErrorPopupProps = Omit<BasePopupProps, "title" | "children"> & {
  title: string;
  children: ReactNode;
};

export default class NetworkErrorPopup extends BasePopup<NetworkErrorPopupProps> {
  render() {
    return this.renderBase({
      ...this.props,
      title: "Network Error",
      isDismissable: false,
      icon: AlertTriangle,
      children: (
        <div className="flex flex-col items-center space-y-6 py-4">
          <AlertTriangle className="h-16 w-16 text-gray-600" strokeWidth={1.5} />
          <p className="text-center text-gray-700">
            It seems that you are not connected to the internet. Please check your connection and try again.
          </p>
        </div>
      ),
    });
  }
}
