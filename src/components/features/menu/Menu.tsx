"use client";

import { PiGraphLight } from "react-icons/pi";
import { FaSpotify, FaCloudUploadAlt, FaUser, FaList } from "react-icons/fa";
import { MenuGroup } from "./MenuGroup";
import { MENU_WIDTH } from "@lib/constants/layout";

const menuGroup = [
  {
    href: "/reference-genre-tree",
    label: "Reference Genre Tree",
    icon: <PiGraphLight className="text-xl" />,
  },
  {
    href: "/me-genre-tree",
    label: "My Genre Tree",
    icon: <PiGraphLight className="text-xl" />,
  },
  {
    href: "/me-genre-playlists",
    label: "My Genre Playlists",
    icon: <FaList className="text-xl" />,
  },
  {
    href: "/me-uploaded-library",
    label: "My Uploaded Library",
    icon: <FaCloudUploadAlt className="text-xl" />,
  },
  {
    href: "/me-spotify-library",
    label: "My Spotify Library",
    icon: <FaSpotify className="text-xl" />,
  },
  {
    href: "/account",
    label: "Account",
    icon: <FaUser className="text-xl" />,
  },
];

export default function Menu({ className }: { className?: string }) {
  return (
    <nav
      className={`menu bg-black flex flex-col justify-start items-start p-2 h-full ${className}`}
      style={{ width: MENU_WIDTH }}
    >
      <MenuGroup items={menuGroup} />
    </nav>
  );
}
