"use client";

import { useState } from "react";
import { PiGraphLight } from "react-icons/pi";
import { FaSpotify, FaCloudUploadAlt, FaUser, FaList, FaInfoCircle } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MenuGroup } from "./MenuGroup";
import { useMediaQuery } from "@hooks/useMediaQuery";
import {
  MENU_WIDTH,
  MENU_WIDTH_COLLAPSED,
  MENU_COLLAPSE_BREAKPOINT_PX,
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
  "/about": <FaInfoCircle className="text-xl" />,
};

const menuGroup = ROUTE_AUTH_CONFIG.map((route) => ({
  href: route.path,
  label: route.label,
  icon: MENU_ICONS[route.path],
  authRequired: route.authRequired,
}));

const smallScreenQuery = `(max-width: ${MENU_COLLAPSE_BREAKPOINT_PX - 1}px)`;

export default function Menu({ className }: { className?: string }) {
  const isSmallScreen = useMediaQuery(smallScreenQuery);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const collapsed = isSmallScreen && isCollapsed;
  const width = collapsed ? MENU_WIDTH_COLLAPSED : MENU_WIDTH;

  return (
    <nav
      className={`menu bg-black flex flex-col justify-start items-stretch m-0 p-0 h-full shrink-0 ${className}`}
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        ["--private-menu-item-bg" as string]: PRIVATE_MENU_ITEM_BG_COLOR,
        ["--spotify-menu-item-bg" as string]: SPOTIFY_MENU_ITEM_BG_COLOR,
      }}
    >
      {isSmallScreen && (
        <button
          type="button"
          onClick={() => setIsCollapsed((c) => !c)}
          className="flex items-center justify-center w-full py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-6 h-6" />
          )}
        </button>
      )}
      <MenuGroup items={menuGroup} collapsed={collapsed} />
    </nav>
  );
}
