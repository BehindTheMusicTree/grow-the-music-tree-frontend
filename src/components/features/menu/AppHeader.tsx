"use client";

import Image from "next/image";
import Link from "next/link";
import { Info } from "lucide-react";
import { TheMusicTreeMarkLink } from "@behindthemusictree/brand/components";
import logo from "@assets/images/logos/tree.png";
import { APP_NAME } from "@lib/constants/app";
import { getAudiometaUrl } from "@lib/site-urls";
import { MenuGroup } from "./MenuGroup";
import { PATHS as ROUTE_PATHS } from "@lib/constants/routes";

const SHOW_AUDIOMETA_MENU_ITEM = false;

const menuGroup = [
  ...(SHOW_AUDIOMETA_MENU_ITEM
    ? [
        {
          href: getAudiometaUrl(),
          label: "Audiometa",
          icon: (
            <Image
              src="/assets/audiometa-icon.png"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0"
              aria-hidden
            />
          ),
          external: true,
        },
      ]
    : []),
];

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className }: AppHeaderProps) {
  return (
    <div className={`fixed top-3 left-3 z-50 flex items-center gap-2 ${className ?? ""}`}>
      <Link
        href={ROUTE_PATHS.PROTOTYPE_REFERENCE_GENRE_TREE}
        prefetch={false}
        className="flex shrink-0 items-center gap-2 rounded-full bg-black/70 py-1.5 pl-1.5 pr-4 shadow-lg backdrop-blur xl:gap-3"
        aria-label={`${APP_NAME} home`}
      >
        <div className="shrink-0">
          <Image src={logo} alt="" width={40} height={40} className="h-auto w-9" aria-hidden />
        </div>
        <h1 className="hidden truncate text-lg font-bold text-gray-100 xl:block xl:text-xl">{APP_NAME}</h1>
      </Link>
      <Link
        href={ROUTE_PATHS.ABOUT}
        prefetch={false}
        className="flex shrink-0 items-center justify-center rounded-full bg-black/70 p-2 text-gray-100 shadow-lg backdrop-blur transition-colors duration-200 hover:text-white"
        aria-label="About"
      >
        <Info className="h-5 w-5" aria-hidden />
      </Link>
      {menuGroup.length > 0 && (
        <nav
          aria-label="Main navigation"
          className="min-w-0 max-w-xs overflow-x-auto rounded-full bg-black/70 px-2 py-1.5 shadow-lg backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <MenuGroup items={menuGroup} layout="horizontal" />
        </nav>
      )}
      <div className="fixed top-3 right-3 flex shrink-0 items-center justify-center rounded-full bg-white/90 p-2 shadow-lg backdrop-blur">
        <TheMusicTreeMarkLink imageStyle={{ height: 20, width: "auto" }} />
      </div>
    </div>
  );
}
