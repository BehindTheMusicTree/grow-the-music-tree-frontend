"use client";

import Image from "next/image";
import Link from "next/link";
import { PiGraphLight } from "react-icons/pi";
import { FaSpotify, FaCloudUploadAlt, FaUser, FaList, FaInfoCircle } from "react-icons/fa";
import logo from "@assets/images/logos/tree.png";
import { TheMusicTreeByline } from "@behindthemusictree/assets/components";
import { MenuGroup } from "./MenuGroup";
import { REFERENCE_GENRE_TREE_PATH, ROUTE_AUTH_CONFIG } from "@lib/constants/routes";
import { PRIVATE_MENU_ITEM_BG_COLOR, SPOTIFY_MENU_ITEM_BG_COLOR } from "@lib/constants/layout";

const AUDIOMETA_URL = process.env.NEXT_PUBLIC_AUDIOMETA_URL ?? "";

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

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className }: AppHeaderProps) {
  return (
    <header
      className={`fixed top-0 z-50 flex h-banner w-full shrink-0 items-stretch border-b border-zinc-800 bg-black text-gray-100 ${className ?? ""}`}
      style={{
        ["--private-menu-item-bg" as string]: PRIVATE_MENU_ITEM_BG_COLOR,
        ["--spotify-menu-item-bg" as string]: SPOTIFY_MENU_ITEM_BG_COLOR,
      }}
    >
      <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2 py-2 pl-3 pr-14 sm:pr-16">
        <Link
          href={REFERENCE_GENRE_TREE_PATH}
          prefetch={false}
          className="flex shrink-0 items-center gap-2 sm:gap-3"
          aria-label="GrowTheMusicTree home"
        >
          <div className="shrink-0">
            <Image src={logo} alt="" width={40} height={40} className="h-auto w-10" aria-hidden />
          </div>
          <h1 className="hidden truncate text-lg font-bold text-gray-100 sm:block sm:text-xl">
            GrowTheMusicTree
          </h1>
        </Link>
        <nav
          aria-label="Main navigation"
          className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <MenuGroup items={menuGroup} layout="horizontal" />
        </nav>
        {AUDIOMETA_URL ? (
          <div className="flex shrink-0 items-center">
            <a
              href={AUDIOMETA_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Audio Metadata (external)"
              className="flex max-w-[7rem] items-center gap-1.5 truncate rounded-sm px-1.5 py-1 text-gray-300 transition-colors duration-200 hover:bg-gray-800 hover:text-white sm:max-w-none sm:gap-2 sm:px-2"
            >
              <Image
                src="/assets/audiometa-icon.png"
                alt=""
                width={18}
                height={18}
                className="shrink-0"
                aria-hidden
              />
              <span className="hidden truncate text-sm sm:inline">Audio Metadata</span>
            </a>
          </div>
        ) : null}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <span className="pointer-events-auto inline-flex rounded-full border border-zinc-200 bg-white shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50">
          <TheMusicTreeByline imageStyle={{ height: 48, width: "auto" }} />
        </span>
      </div>
    </header>
  );
}
