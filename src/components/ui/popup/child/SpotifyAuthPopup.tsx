"use client";

import { FaSpotify } from "react-icons/fa";
import { BasePopup } from "../BasePopup";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { Button } from "@/components/ui/button";

export default function SpotifyAuthPopup() {
  const { handleSpotifyAuth } = useSpotifyAuth();

  return (
    <BasePopup title="Connect to Spotify" isDismissable={false}>
      <div className="flex flex-col items-center space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-lg text-white font-medium">
            Music Tree requires Spotify authentication to browse your library and explore new horizons
          </p>
        </div>
        <Button
          onClick={handleSpotifyAuth}
          className="bg-black hover:bg-black/80 px-8 py-4 text-white w-fit transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl relative"
        >
          <div className="flex items-center">
            <FaSpotify className="text-4xl absolute left-8" />
            <p className="text-xl w-full text-center pl-16 pr-12">Sign in</p>
          </div>
        </Button>
      </div>
    </BasePopup>
  );
}
