"use client";

import { FaSpotify } from "react-icons/fa";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { Button } from "@components/ui/Button";
import { User } from "lucide-react";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import {
  getSpotifyAllowlistContactEmail,
  getSpotifyAllowlistMailtoHref,
} from "@app-types/app-errors/app-error-messages";

// Only allow message, details, onClose, and errorCode as custom props
type SpotifyAuthErrorPopupProps = Omit<BasePopupProps, "title" | "children" | "icon" | "isDismissable"> & {
  message: string;
  details?: string;
  onClose: () => void;
  errorCode?: ErrorCode;
};

// @ts-expect-error: ommitted props are set internally by the popup
export default class SpotifyAuthErrorPopup extends BasePopup<SpotifyAuthErrorPopupProps> {
  render() {
    const { message, details, onClose, errorCode, ...rest } = this.props;
    const contactEmail = getSpotifyAllowlistContactEmail();
    const requestAccessHref = getSpotifyAllowlistMailtoHref();

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
            <div className="space-y-2 text-center">
              <p className="text-base text-gray-700">
                The Spotify app is in development mode, so only allowlisted accounts can connect.
              </p>
              {requestAccessHref && contactEmail ? (
                <p className="text-base text-gray-700">
                  Request access by emailing your{" "}
                  <a
                    href={requestAccessHref}
                    className="text-[#1DB954] font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-1 rounded"
                  >
                    Spotify full name and Spotify email address
                  </a>{" "}
                  to{" "}
                  <a
                    href={requestAccessHref}
                    className="text-[#1DB954] font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-1 rounded"
                  >
                    {contactEmail}
                  </a>
                  .
                </p>
              ) : (
                <p className="text-base text-gray-700">To request access, contact the app owner.</p>
              )}
            </div>
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
