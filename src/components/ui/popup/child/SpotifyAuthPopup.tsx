"use client";

import { User } from "lucide-react";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { Button } from "@components/ui/Button";
import { FaSpotify } from "react-icons/fa";
import React from "react";

type SpotifyAuthPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  handleSpotifyOAuth: (redirectAfterAuthPath?: string) => void;
  redirectAfterAuthPath?: string;
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class SpotifyAuthPopup extends BasePopup<SpotifyAuthPopupProps> {
  render() {
    const { handleSpotifyOAuth, redirectAfterAuthPath, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Connect with Spotify",
      isDismissable: false,
      icon: User,
      type: "spotify",
      children: (
        <div className="flex flex-col items-center space-y-7">
          <div className="text-center px-2">
            <p className="text-lg text-white font-medium leading-relaxed">
              <b>Music Tree</b> requires Spotify authentication to browse your library and explore new horizons
            </p>
          </div>
          <Button
            onClick={() => handleSpotifyOAuth(redirectAfterAuthPath)}
            className="bg-black hover:bg-black/80 px-8 py-3 text-white w-fit transform transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl relative mb-2"
          >
            <div className="flex items-center justify-center">
              <FaSpotify className="text-3xl absolute left-6" />
              <p className="text-lg w-full text-center pl-14 pr-8 font-medium">Sign in</p>
            </div>
          </Button>
        </div>
      ),
    });
  }
}
