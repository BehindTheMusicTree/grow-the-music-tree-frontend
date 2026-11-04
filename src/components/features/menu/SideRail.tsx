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
import { iconPillClassName } from "./iconPillClassName";
import { UserMenu } from "./UserMenu";

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

export default function SideRail() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isGenealogy = pathname === GENEALOGY_HREF;
  const isRegionMap = pathname === REGION_MAP_HREF;

  return (
    <nav
      aria-label="Main navigation"
      className="relative z-50 flex shrink-0 flex-col items-center gap-2 px-1 py-1"
    >
      <Link
        href="/"
        prefetch={false}
        className={iconPillClassName}
        aria-label={`${APP_NAME} home`}
        aria-current={isHome ? "page" : undefined}
      >
        <Image src={logo} alt="" width={40} height={40} className="h-auto w-7 shrink-0" aria-hidden priority />
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
      <Suspense fallback={null}>
        <AboutButton />
      </Suspense>
      <UserMenu />
    </nav>
  );
}
