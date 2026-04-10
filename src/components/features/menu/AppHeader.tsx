"use client";

import Image from "next/image";
import Link from "next/link";
import { PiGraphLight } from "react-icons/pi";
import { FaCloudUploadAlt, FaList } from "react-icons/fa";
import logo from "@assets/images/logos/tree.png";
import { APP_NAME } from "@lib/constants/app";
import { TheMusicTreeByline } from "@behindthemusictree/assets/components";
import { MenuGroup } from "./MenuGroup";
import {
  PATHS as ROUTE_PATHS,
  AUTH_CONFIG as ROUTE_AUTH_CONFIG,
  PATHS_EXCLUDED_FROM_HEADER_NAV as ROUTE_PATHS_EXCLUDED_FROM_HEADER_NAV,
} from "@lib/constants/routes";

const AUDIOMETA_URL = process.env.NEXT_PUBLIC_AUDIOMETA_URL ?? "";

const MENU_ICONS: Record<string, React.ReactNode> = {
  [ROUTE_PATHS.ME_GENRE_TREE]: <PiGraphLight className="text-xl" />,
  [ROUTE_PATHS.ME_GENRE_PLAYLISTS]: <FaList className="text-xl" />,
  [ROUTE_PATHS.ME_UPLOADED_LIBRARY]: <FaCloudUploadAlt className="text-xl" />,
};

const menuGroup = [
  ...ROUTE_AUTH_CONFIG.filter(({ path }) => !ROUTE_PATHS_EXCLUDED_FROM_HEADER_NAV.has(path)).map((route) => ({
    href: route.path,
    label: route.label,
    icon: MENU_ICONS[route.path],
    authRequired: route.authRequired,
  })),
  ...(AUDIOMETA_URL
    ? [
        {
          href: AUDIOMETA_URL,
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
          authRequired: false as const,
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
    <header
      className={`fixed top-0 z-50 flex h-banner w-full shrink-0 items-stretch border-b border-zinc-800 bg-black text-gray-100 ${className ?? ""}`}
    >
      <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2 py-2 pl-3 pr-14 sm:pr-16">
        <Link
          href={ROUTE_PATHS.REFERENCE_GENRE_TREE}
          prefetch={false}
          className="flex shrink-0 items-center gap-2 xl:gap-3"
          aria-label={`${APP_NAME} home`}
        >
          <div className="shrink-0">
            <Image src={logo} alt="" width={40} height={40} className="h-auto w-10" aria-hidden />
          </div>
          <h1 className="hidden truncate text-lg font-bold text-gray-100 xl:block xl:text-xl">{APP_NAME}</h1>
        </Link>
        <nav
          aria-label="Main navigation"
          className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <MenuGroup items={menuGroup} layout="horizontal" />
        </nav>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <span className="pointer-events-auto inline-flex rounded-full border border-zinc-200 bg-white shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50">
          <TheMusicTreeByline imageStyle={{ height: 48, width: "auto" }} />
        </span>
      </div>
    </header>
  );
}
