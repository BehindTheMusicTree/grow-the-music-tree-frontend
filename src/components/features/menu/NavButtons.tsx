"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { useNightMode } from "@contexts/NightModeProvider";
import { RegionGlobeIcon } from "./RegionGlobeIcon";
import logo from "@assets/images/logos/tree.png";
import { APP_NAME } from "@lib/constants/app";
import { ABOUT_HREF, REGION_MAP_HREF } from "@lib/constants/routes";
import { viewSwitchHref } from "@lib/searchHrefs";
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
      className={cn(iconPillClassName, "h-[calc(var(--layout-header-h)*0.8)] w-[calc(var(--layout-header-h)*0.8)]")}
      aria-label="About"
      aria-pressed={isOpen}
    >
      <Info className="h-full w-full" viewBox="1 1 22 22" aria-hidden />
    </Link>
  );
}

function ViewLink({ target, isCurrent, label, children }: { target: "/" | typeof REGION_MAP_HREF; isCurrent: boolean; label: string; children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const carriesGenre = pathname === "/" || pathname === REGION_MAP_HREF;
  const href = carriesGenre ? viewSwitchHref(target, searchParams) : target;

  return (
    <Link href={href} prefetch={false} className={iconPillClassName} aria-label={label} aria-current={isCurrent ? "page" : undefined}>
      {children}
    </Link>
  );
}

function ViewLinkFallback({ target, isCurrent, label, children }: { target: "/" | typeof REGION_MAP_HREF; isCurrent: boolean; label: string; children: ReactNode }) {
  return (
    <Link href={target} prefetch={false} className={iconPillClassName} aria-label={label} aria-current={isCurrent ? "page" : undefined}>
      {children}
    </Link>
  );
}

function SwitchLink(props: { target: "/" | typeof REGION_MAP_HREF; isCurrent: boolean; label: string; children: ReactNode }) {
  return (
    <Suspense fallback={<ViewLinkFallback {...props} />}>
      <ViewLink {...props} />
    </Suspense>
  );
}

export default function NavButtons() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isRegionMap = pathname === REGION_MAP_HREF;
  const { nightMode, toggleNightMode } = useNightMode();

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "absolute bottom-1 left-1 z-50 flex flex-row items-center gap-2 transition-[left] duration-200 motion-reduce:transition-none",
        // Sits right of an open left detail panel; :has() reads the panel's own state, which lives in each page.
        // Class names must stay literal so Tailwind's scanner can see them.
        "group-has-[[data-detail-panel][data-side=left]:not([data-collapsed=true])]:md:left-[calc(var(--layout-detail-panel-w)+0.25rem)]",
        "group-has-[[data-detail-panel][data-side=left][data-sheet=true]:not([data-collapsed=true])]:max-md:bottom-[calc(var(--layout-sheet-peek)+0.25rem)]",
        "group-has-[[data-detail-panel][data-sheet=true]_[aria-label='Resize_panel'][aria-expanded=true]]:max-md:hidden",
      )}
    >
      <SwitchLink target="/" isCurrent={isHome} label={`${APP_NAME} home`}>
        <Image src={logo} alt="" width={48} height={48} className={cn("h-full w-full shrink-0 object-contain", isHome && "brightness-0")} aria-hidden priority />
      </SwitchLink>
      {isRegionMap ? (
        <button
          type="button"
          className={iconPillClassName}
          aria-label="Region map"
          aria-current="page"
          aria-pressed={nightMode}
          title={nightMode ? "Disable night mode" : "Enable night mode"}
          onClick={toggleNightMode}
        >
          <RegionGlobeIcon className="h-full w-full" nightMode={nightMode} />
        </button>
      ) : (
        <SwitchLink target={REGION_MAP_HREF} isCurrent={false} label="Region map">
          <RegionGlobeIcon className="h-full w-full" nightMode={nightMode} />
        </SwitchLink>
      )}
      <Suspense fallback={null}>
        <AboutButton />
      </Suspense>
    </nav>
  );
}
