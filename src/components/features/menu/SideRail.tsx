"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Info, Network } from "lucide-react";
import { RegionGlobeIcon } from "./RegionGlobeIcon";
import logo from "@assets/images/logos/tree.png";
import { APP_NAME } from "@lib/constants/app";
import { ABOUT_HREF, GENEALOGY_HREF, REGION_MAP_HREF } from "@lib/constants/routes";
import { cn } from "@lib/utils";
import { iconPillClassName } from "./iconPillClassName";

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
      className={cn(iconPillClassName, "h-[calc(var(--layout-header-h)/2)] w-[calc(var(--layout-header-h)/2)]")}
      aria-label="About"
      aria-pressed={isOpen}
    >
      <Info className="h-4 w-4" aria-hidden />
    </Link>
  );
}

export default function SideRail() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isGenealogy = pathname === GENEALOGY_HREF;
  const isRegionMap = pathname === REGION_MAP_HREF;

  return (
    <nav
      aria-label="Main navigation"
      // Bottom bar below md (thumb reach, full-width content); the env() inset keeps it clear of the home indicator.
      className="relative z-50 flex shrink-0 flex-row items-center justify-around gap-2 bg-black/70 px-1 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur md:flex-col md:justify-start md:bg-transparent md:pb-1 md:backdrop-blur-none"
    >
      <Link
        href="/"
        prefetch={false}
        className={iconPillClassName}
        aria-label={`${APP_NAME} home`}
        aria-current={isHome ? "page" : undefined}
      >
        <Image src={logo} alt="" width={40} height={40} className={cn("h-auto w-7 shrink-0", isHome && "brightness-0")} aria-hidden priority />
      </Link>
      <Link
        href={REGION_MAP_HREF}
        prefetch={false}
        className={iconPillClassName}
        aria-label="Region map"
        aria-current={isRegionMap ? "page" : undefined}
      >
        <RegionGlobeIcon className="h-5 w-5" />
      </Link>
      <Link
        href={GENEALOGY_HREF}
        prefetch={false}
        className={iconPillClassName}
        aria-label="Genealogy"
        aria-current={isGenealogy ? "page" : undefined}
      >
        <Network className="h-5 w-5" aria-hidden />
      </Link>
      {/* Pinned to the rail's bottom-left corner on desktop. */}
      <div className="flex md:mt-auto">
        <Suspense fallback={null}>
          <AboutButton />
        </Suspense>
      </div>
    </nav>
  );
}
