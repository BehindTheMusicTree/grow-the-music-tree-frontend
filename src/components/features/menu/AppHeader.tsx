"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Info, Network } from "lucide-react";
import { RegionGlobeIcon } from "./RegionGlobeIcon";
import logo from "@assets/images/logos/tree.png";
import { APP_NAME } from "@lib/constants/app";
import { getAudiometaUrl } from "@lib/site-urls";
import { MenuGroup } from "./MenuGroup";
import { ABOUT_HREF, GENEALOGY_HREF, REGION_MAP_HREF } from "@lib/constants/routes";
import { iconPillClassName } from "./iconPillClassName";
import { UserMenu } from "./UserMenu";

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

function AboutButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOpen = searchParams.has("about");
  const closedParams = new URLSearchParams(searchParams.toString());
  closedParams.delete("about");
  const closedQuery = closedParams.toString();
  const closedHref = closedQuery ? `${pathname}?${closedQuery}` : pathname;
  const openHref = pathname === "/" && closedQuery ? `/?${closedQuery}&about` : ABOUT_HREF;

  return (
    <Link
      href={isOpen ? closedHref : openHref}
      prefetch={false}
      className={iconPillClassName}
      aria-label="About"
      aria-pressed={isOpen}
    >
      <Info className="h-5 w-5" aria-hidden />
    </Link>
  );
}

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className }: AppHeaderProps) {
  const pathname = usePathname();
  const isGenealogy = pathname === GENEALOGY_HREF;
  const isRegionMap = pathname === REGION_MAP_HREF;
  const isLabelledPage = isRegionMap;

  return (
    <div
      className={`fixed top-gutter right-gutter z-50 flex h-header w-right-column max-md:left-gutter max-md:w-auto items-center justify-end gap-2 ${className ?? ""}`}
    >
      <Link
        href="/"
        prefetch={false}
        className="flex h-full shrink-0 items-center rounded-full bg-black/70 px-1.5 shadow-lg backdrop-blur"
        aria-label={`${APP_NAME} home`}
      >
        <div className="flex h-9 items-center">
          <Image src={logo} alt="" width={40} height={40} className="h-auto w-9 shrink-0" aria-hidden priority />
          <h1
            className={`grid overflow-hidden whitespace-nowrap text-base font-bold text-gray-100 transition-[grid-template-columns,opacity] duration-200 motion-reduce:transition-none ${isLabelledPage ? "grid-cols-[0fr] opacity-0" : "grid-cols-[0fr] opacity-0 xl:grid-cols-[1fr] xl:opacity-100"}`}
          >
            <span className="min-w-0 overflow-hidden"><span className="pl-2">{APP_NAME}</span></span>
          </h1>
        </div>
      </Link>
      {menuGroup.length > 0 && (
        <nav
          aria-label="Main navigation"
          className="flex h-full min-w-0 max-w-xs items-center overflow-x-auto rounded-full bg-black/70 px-2 shadow-lg backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <MenuGroup items={menuGroup} layout="horizontal" />
        </nav>
      )}
      <Link
        href={REGION_MAP_HREF}
        prefetch={false}
        className={`${iconPillClassName} px-3`}
        aria-label="Region map"
        aria-current={isRegionMap ? "page" : undefined}
      >
        <RegionGlobeIcon className="h-5 w-5" />
        <span aria-hidden className={`grid overflow-hidden whitespace-nowrap text-base font-bold transition-[grid-template-columns,opacity] duration-200 motion-reduce:transition-none ${isRegionMap ? "grid-cols-[0fr] opacity-0 xl:grid-cols-[1fr] xl:opacity-100" : "grid-cols-[0fr] opacity-0"}`}><span className="min-w-0 overflow-hidden"><span className="pl-2">Map</span></span></span>
      </Link>
      <Link
        href={GENEALOGY_HREF}
        prefetch={false}
        className={`${iconPillClassName} px-3`}
        aria-label="Genealogy"
        aria-current={isGenealogy ? "page" : undefined}
      >
        <Network className="h-5 w-5" aria-hidden />
      </Link>
      <Suspense fallback={null}>
        <AboutButton />
      </Suspense>
      <UserMenu />
    </div>
  );
}
