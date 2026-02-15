"use client";

import { FaSpotify } from "react-icons/fa";
import { BasePopup, BasePopupProps } from "../BasePopup";
import { UserPlus } from "lucide-react";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
const mailtoSubject = encodeURIComponent("Request to be added to Spotify allowlist");
const mailtoBody = encodeURIComponent(
  "Please add my Spotify account to the app allowlist.\n\nSpotify display name:\nSpotify email:",
);

type SpotifyAllowlistPopupProps = Omit<
  BasePopupProps,
  "title" | "children" | "icon" | "isDismissable"
> & {
  backendMessage: string;
  onClose: () => void;
};

// @ts-expect-error: omitted props are set internally by the popup
export default class SpotifyAllowlistPopup extends BasePopup<SpotifyAllowlistPopupProps> {
  render() {
    const { backendMessage, onClose, ...rest } = this.props;
    return this.renderBase({
      ...rest,
      title: "Spotify account not in allowlist",
      type: "warning",
      isDismissable: true,
      icon: UserPlus,
      onClose,
      showOkButton: true,
      okButtonText: "Back",
      onOk: onClose,
      children: (
        <div className="flex flex-col items-center space-y-6 py-4">
          <FaSpotify className="text-[#1DB954] text-6xl" />
          <div className="space-y-3 text-center">
            {backendMessage && (
              <p className="text-base text-gray-800">{backendMessage}</p>
            )}
            <p className="text-sm text-gray-600">
              The app is in testing mode. To sign in, your Spotify account must be
              added by the app owner. Please send an email with your{" "}
              <strong>Spotify display name</strong> and{" "}
              <strong>Spotify email address</strong> so we can add you to the
              allowlist.
            </p>
          </div>
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}?subject=${mailtoSubject}&body=${mailtoBody}`}
              className="flex items-center justify-center gap-2 w-full max-w-xs px-4 py-2 rounded font-medium bg-[#1DB954] text-white hover:bg-[#1DB954]/90 transition-colors duration-200"
            >
              <FaSpotify className="text-lg" />
              Email to request access
            </a>
          )}
        </div>
      ),
    });
  }
}
