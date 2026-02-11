"use client";

import { PiGraphLight } from "react-icons/pi";
import { FaSpotify, FaCloudUploadAlt, FaUser, FaList } from "react-icons/fa";
import { MenuGroup } from "./MenuGroup";
import { MENU_WIDTH, PRIVATE_MENU_ITEM_BG_COLOR } from "@lib/constants/layout";

const menuGroup = [
  {
    href: "/reference-genre-tree",
    label: "Reference Genre Tree",
    icon: <PiGraphLight className="text-xl" />,
    authRequired: false,
  },
  {
    href: "/me-genre-tree",
    label: "My Genre Tree",
    icon: <PiGraphLight className="text-xl" />,
    authRequired: true,
  },
  {
    href: "/me-genre-playlists",
    label: "My Genre Playlists",
    icon: <FaList className="text-xl" />,
    authRequired: true,
  },
  {
    href: "/me-uploaded-library",
    label: "My Uploaded Library",
    icon: <FaCloudUploadAlt className="text-xl" />,
    authRequired: true,
  },
  {
    href: "/me-spotify-library",
    label: "My Spotify Library",
    icon: <FaSpotify className="text-xl" />,
    authRequired: true,
  },
  {
    href: "/account",
    label: "Account",
    icon: <FaUser className="text-xl" />,
    authRequired: true,
  },
];

export default function Menu({ className }: { className?: string }) {
  return (
    <nav
      className={`menu bg-black flex flex-col justify-start items-start m-0 p-0 h-full shrink-0 ${className}`}
      style={{
        width: MENU_WIDTH,
        minWidth: MENU_WIDTH,
        maxWidth: MENU_WIDTH,
        ["--private-menu-item-bg" as string]: PRIVATE_MENU_ITEM_BG_COLOR,
      }}
    >
      <MenuGroup items={menuGroup} />
    </nav>
  );
}
