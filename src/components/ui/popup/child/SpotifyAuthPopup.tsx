"use client";

import { FaSpotify } from "react-icons/fa";
import { BasePopup, BasePopupProps } from "../BasePopup";
import Button from "@/components/ui/Button";
import { useSpotifyAuth } from "@/contexts/SpotifyAuthContext";

interface SpotifyAuthPopupProps extends BasePopupProps {}

class SpotifyAuthPopupBase extends BasePopup<SpotifyAuthPopupProps> {
  render(props: SpotifyAuthPopupProps) {
    return this.renderBase({
      ...props,
      title: "Connect to Spotify",
      isDismissable: false,
      className: `max-w-md ${props.className || ""}`,
      children: (
        <div className="flex flex-col items-center space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-lg text-white font-medium">
              Music Tree requires Spotify authentication to browse your library and explore new horizons
            </p>
          </div>
          <Button
            onClick={props.onClose}
            className="bg-black hover:bg-black/80 px-8 py-4 text-white w-fit transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl relative"
          >
            <div className="flex items-center">
              <FaSpotify className="text-4xl absolute left-8" />
              <p className="text-xl w-full text-center pl-16 pr-12">Sign in</p>
            </div>
          </Button>
        </div>
      ),
    });
  }
}

export default function SpotifyAuthPopup(props: SpotifyAuthPopupProps) {
  const { handleSpotifyAuth } = useSpotifyAuth();
  const popup = new SpotifyAuthPopupBase();

  return popup.render({
    ...props,
    onClose: handleSpotifyAuth,
  });
}
