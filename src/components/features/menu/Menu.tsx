"use client";

import { PiGraphLight } from "react-icons/pi";
import { FaSpotify, FaCloudUploadAlt, FaUser, FaList } from "react-icons/fa";
import { MenuGroup } from "./MenuGroup";
import {
  MENU_WIDTH,
  PRIVATE_MENU_ITEM_BG_COLOR,
  SPOTIFY_MENU_ITEM_BG_COLOR,
} from "@lib/constants/layout";
import { ROUTE_AUTH_CONFIG } from "@lib/constants/routes";

const MENU_ICONS: Record<string, React.ReactNode> = {
  "/reference-genre-tree": <PiGraphLight className="text-xl" />,
  "/me-genre-tree": <PiGraphLight className="text-xl" />,
  "/me-genre-playlists": <FaList className="text-xl" />,
  "/me-uploaded-library": <FaCloudUploadAlt className="text-xl" />,
  "/me-spotify-library": <FaSpotify className="text-xl" />,
  "/account": <FaUser className="text-xl" />,
};

const menuGroup = ROUTE_AUTH_CONFIG.map((route) => ({
  href: route.path,
  label: route.label,
  icon: MENU_ICONS[route.path],
  authRequired: route.authRequired,
}));

export default function Menu({ className }: { className?: string }) {
  return (
    <nav
      className={`menu bg-black flex flex-col justify-start items-start m-0 p-0 h-full shrink-0 ${className}`}
      style={{
        width: MENU_WIDTH,
        minWidth: MENU_WIDTH,
        maxWidth: MENU_WIDTH,
        ["--private-menu-item-bg" as string]: PRIVATE_MENU_ITEM_BG_COLOR,
        ["--spotify-menu-item-bg" as string]: SPOTIFY_MENU_ITEM_BG_COLOR,
      }}
    >
      <MenuGroup items={menuGroup} />
    </nav>
  );
}
