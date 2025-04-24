"use client";

import { FaSpotify } from "react-icons/fa";
import { BasePopup, BasePopupProps } from "../BasePopup";
import Button from "@/components/ui/Button";
import { useSpotifyAuth } from "@/hooks/SpotifyAuthContext";

interface SpotifyAuthErrorPopupProps extends BasePopupProps {
  message: string;
  details?: string;
}

class SpotifyAuthErrorPopupBase extends BasePopup<SpotifyAuthErrorPopupProps> {
  render(props: SpotifyAuthErrorPopupProps) {
    return this.renderBase({
      ...props,
      title: "Authentication Failed",
      className: `max-w-md ${props.className || ""}`,
      children: (
        <div className="flex flex-col items-center space-y-8 py-4">
          <FaSpotify className="text-[#1DB954] text-7xl" />
          <div className="space-y-3 text-center">
            <p className="text-xl font-medium text-gray-800">{props.message}</p>
            {props.details && (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">{props.details}</p>
            )}
          </div>
          <Button
            onClick={props.onClose}
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

export default function SpotifyAuthErrorPopup(props: SpotifyAuthErrorPopupProps) {
  const { handleSpotifyAuth } = useSpotifyAuth();
  const popup = new SpotifyAuthErrorPopupBase();

  return popup.render({
    ...props,
    onClose: handleSpotifyAuth,
  });
}
