"use client";

import { FaSpotify } from "react-icons/fa";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { Button } from "@components/ui/Button";
import { User } from "lucide-react";

// Only allow message, details, and onClose as custom props
type SpotifyAuthErrorPopupProps = Omit<
  BasePopupProps,
  "title" | "children" | "icon" | "isDismissable" | "contentClassName"
> & {
  message: string;
  details?: string;
  onClose: () => void;
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class SpotifyAuthErrorPopup extends BasePopup<SpotifyAuthErrorPopupProps> {
  render() {
    const { message, details, onClose, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Authentication Failed",
      isDismissable: true,
      icon: User,
      children: (
        <div className="flex flex-col items-center space-y-8 py-4">
          <FaSpotify className="text-[#1DB954] text-7xl" />
          <div className="space-y-3 text-center">
            <p className="text-xl font-medium text-gray-800">{message}</p>
            {details && (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">{details}</p>
            )}
          </div>
          <Button
            onClick={onClose}
            className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white w-full max-w-xs transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            <FaSpotify className="mr-2 text-lg" />
            Try Again
          </Button>
        </div>
      ),
    });
  }
}
