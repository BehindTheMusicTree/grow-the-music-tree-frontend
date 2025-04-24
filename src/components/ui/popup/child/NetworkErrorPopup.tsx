"use client";

import { WifiOff, AlertTriangle } from "lucide-react";
import { BasePopupComponent, BasePopupProps } from "../BasePopup";

interface NetworkErrorPopupProps extends BasePopupProps {}

export default class NetworkErrorPopup extends BasePopupComponent<NetworkErrorPopupProps> {
  render(props: NetworkErrorPopupProps) {
    return this.renderBase({
      ...props,
      title: "Network Error",
      isDismissable: false,
      icon: AlertTriangle,
      children: (
        <div className="flex flex-col items-center space-y-6 py-4">
          <WifiOff className="h-16 w-16 text-gray-600" strokeWidth={1.5} />
          <p className="text-center text-gray-700">
            It seems that you are not connected to the internet. Please check your connection and try again.
          </p>
        </div>
      ),
    });
  }
}
