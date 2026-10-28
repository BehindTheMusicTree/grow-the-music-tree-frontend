"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CircleDot, Info, List, Network } from "lucide-react";
import { TheMusicTreeMarkLink } from "@behindthemusictree/brand/components";
import logo from "@assets/images/logos/tree.png";
import { APP_NAME } from "@lib/constants/app";
import { getAudiometaUrl } from "@lib/site-urls";
import { MenuGroup } from "./MenuGroup";
import { ABOUT_HREF, GENEALOGY_HREF } from "@lib/constants/routes";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

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
      className="flex shrink-0 items-center justify-center rounded-full bg-black/70 p-2 text-gray-100 shadow-lg backdrop-blur transition-colors duration-200 hover:text-white"
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
  const { viewMode, setViewMode, canShowPopCore } = useGenreTreeViewMode();
  const isOutline = viewMode === "outline";
  const isGenealogy = pathname === GENEALOGY_HREF;

  return (
    <div className={`fixed top-gutter right-gutter z-50 flex h-header w-right-column items-center justify-end gap-2 ${className ?? ""}`}>
      <Link
        href="/"
        prefetch={false}
        className={`flex shrink-0 items-center gap-2 rounded-full bg-black/70 py-1.5 pl-1.5 pr-1.5 shadow-lg backdrop-blur xl:min-w-0 ${isGenealogy ? "" : "xl:pr-3"}`}
        aria-label={`${APP_NAME} home`}
      >
        <div className="flex h-9 flex-wrap items-center gap-x-2 overflow-hidden xl:min-w-0">
          <Image src={logo} alt="" width={40} height={40} className="h-auto w-9 shrink-0" aria-hidden priority />
          <h1
            className={`whitespace-nowrap text-base font-bold text-gray-100 ${isGenealogy ? "sr-only" : "hidden xl:block"}`}
          >
            {APP_NAME}
          </h1>
        </div>
      </Link>
      {menuGroup.length > 0 && (
        <nav
          aria-label="Main navigation"
          className="min-w-0 max-w-xs overflow-x-auto rounded-full bg-black/70 px-2 py-1.5 shadow-lg backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <MenuGroup items={menuGroup} layout="horizontal" />
        </nav>
      )}
      {pathname === "/" && canShowPopCore && (
        <button
          type="button"
          onClick={() => setViewMode(isOutline ? "pop-core" : "outline")}
          className="flex shrink-0 items-center justify-center rounded-full bg-black/70 p-2 text-gray-100 shadow-lg backdrop-blur transition-colors duration-200 hover:text-white"
          aria-label={isOutline ? "Show wheel view" : "Show outline view"}
        >
          {isOutline ? <CircleDot className="h-5 w-5" aria-hidden /> : <List className="h-5 w-5" aria-hidden />}
        </button>
      )}
      <Link
        href={GENEALOGY_HREF}
        prefetch={false}
        className={`flex shrink-0 items-center justify-center rounded-full bg-black/70 p-2 text-gray-100 shadow-lg backdrop-blur transition-colors duration-200 hover:text-white ${isGenealogy ? "xl:gap-2 xl:pr-3" : ""}`}
        aria-label="Genealogy"
        aria-current={isGenealogy ? "page" : undefined}
      >
        <Network className="h-5 w-5" aria-hidden />
        {isGenealogy && <span className="hidden text-base font-bold xl:inline">Genealogy</span>}
      </Link>
      <Suspense fallback={null}>
        <AboutButton />
      </Suspense>
      <div className="flex shrink-0 items-center justify-center rounded-full bg-white/90 p-2 shadow-lg backdrop-blur">
        <TheMusicTreeMarkLink imageStyle={{ height: 20, width: "auto" }} />
      </div>
    </div>
  );
}
