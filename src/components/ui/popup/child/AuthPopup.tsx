"use client";

import { User } from "lucide-react";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { Button } from "@components/ui/Button";
import { FaSpotify } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import React from "react";

type AuthPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  handleSpotifyOAuth: (redirectAfterAuthPath?: string) => void;
  handleGoogleOAuth?: (redirectAfterAuthPath?: string) => void;
  redirectAfterAuthPath?: string;
  spotifyOnly?: boolean;
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class AuthPopup extends BasePopup<AuthPopupProps> {
  render() {
    const { handleSpotifyOAuth, handleGoogleOAuth, redirectAfterAuthPath, spotifyOnly, ...rest } = this.props;
    const showGoogle = !spotifyOnly && handleGoogleOAuth;
    return this.renderBase({
      ...rest,
      title: spotifyOnly ? "Connect with Spotify" : "Sign in",
      isDismissable: false,
      icon: User,
      type: "auth",
      children: (
        <div className="flex flex-col items-center space-y-7">
          <div className="px-2 text-center">
            <p className="text-lg font-medium leading-relaxed text-white">
              {spotifyOnly ? (
                <>
                  <b>My Spotify Library</b> requires Spotify to access your saved tracks and playlists.
                </>
              ) : (
                <>
                  <b>Music Tree</b> requires sign-in to browse your library and explore new horizons
                </>
              )}
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-3">
            <Button
              onClick={() => handleSpotifyOAuth(redirectAfterAuthPath)}
              className="relative mb-2 w-fit transform bg-green-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-green-700 hover:shadow-xl"
            >
              <div className="flex items-center justify-center">
                <FaSpotify className="absolute left-6 text-3xl" />
                <p className="w-full pl-14 pr-8 text-center text-lg font-medium">Sign in with Spotify</p>
              </div>
            </Button>
            {showGoogle && (
              <Button
                variant="outline"
                onClick={() => handleGoogleOAuth!(redirectAfterAuthPath)}
                className="relative w-fit transform border-white bg-white px-8 py-3 text-black shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-xl"
              >
                <div className="flex items-center justify-center">
                  <FcGoogle className="absolute left-6 text-2xl" />
                  <p className="w-full pl-14 pr-8 text-center text-lg font-medium text-black">Sign in with Google</p>
                </div>
              </Button>
            )}
          </div>
        </div>
      ),
    });
  }
}
