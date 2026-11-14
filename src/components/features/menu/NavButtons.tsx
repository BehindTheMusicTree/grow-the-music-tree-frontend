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

const navItemClassName =
  "flex h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-caption text-gray-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 max-md:data-[active=true]:bg-white/10 max-md:data-[active=true]:text-white md:h-[var(--layout-header-h)] md:w-[var(--layout-header-h)] md:flex-none md:gap-0 md:rounded-full md:bg-black/70 md:text-gray-100 md:shadow-lg md:backdrop-blur md:aria-[current=page]:bg-white md:aria-[current=page]:text-black md:aria-pressed:bg-white md:aria-pressed:text-black md:aria-[current=page]:hover:text-black md:aria-pressed:hover:text-black";
const navIconClassName = "h-6 w-6 shrink-0 md:h-full md:w-full";

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
      className={cn(navItemClassName, "md:h-[calc(var(--layout-header-h)*0.8)] md:w-[calc(var(--layout-header-h)*0.8)]")}
      aria-label="About"
      aria-pressed={isOpen}
      data-active={isOpen}
    >
      <Info className={navIconClassName} viewBox="1 1 22 22" aria-hidden />
      <span className="md:hidden">About</span>
    </Link>
  );
}

function ViewLink({ target, isCurrent, label, children }: { target: "/" | typeof REGION_MAP_HREF; isCurrent: boolean; label: string; children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const carriesGenre = pathname === "/" || pathname === REGION_MAP_HREF;
  const href = carriesGenre ? viewSwitchHref(target, searchParams) : target;

  return (
    <Link href={href} prefetch={false} className={navItemClassName} aria-label={label} aria-current={isCurrent ? "page" : undefined} data-active={isCurrent && !searchParams.has("about")}>
      {children}
    </Link>
  );
}

function ViewLinkFallback({ target, isCurrent, label, children }: { target: "/" | typeof REGION_MAP_HREF; isCurrent: boolean; label: string; children: ReactNode }) {
  return (
    <Link href={target} prefetch={false} className={navItemClassName} aria-label={label} aria-current={isCurrent ? "page" : undefined} data-active={isCurrent}>
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

function Navigation({ aboutOpen = false }: { aboutOpen?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isRegionMap = pathname === REGION_MAP_HREF;
  const { nightMode, toggleNightMode } = useNightMode();

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex h-[calc(var(--mobile-nav-h)+env(safe-area-inset-bottom))] flex-row items-start border-t border-white/10 bg-zinc-950 pb-[env(safe-area-inset-bottom)] md:absolute md:inset-x-auto md:bottom-3 md:left-1 md:h-10 md:items-center md:gap-2 md:border-0 md:bg-transparent md:pb-0 md:transition-[left] md:duration-200 motion-reduce:transition-none md:[@media(pointer:coarse)]:h-[calc(var(--layout-touch-target)+0.5rem)]",
        // Sits right of an open left detail panel; mobile navigation stays below the page.
        "group-has-[[data-detail-panel][data-side=left]:not([data-collapsed=true])]:md:left-[calc(var(--layout-detail-panel-w)+0.25rem)]",
      )}
    >
      <SwitchLink target="/" isCurrent={isHome} label={`${APP_NAME} home`}>
        <Image src={logo} alt="" width={48} height={48} className={cn(navIconClassName, "object-contain", isHome && "md:brightness-0")} aria-hidden priority />
        <span className="md:hidden">Tree</span>
      </SwitchLink>
      {isRegionMap ? (
        <button
          type="button"
          className={navItemClassName}
          aria-label="Region map"
          aria-current="page"
          data-active={!aboutOpen}
          aria-pressed={nightMode}
          title={nightMode ? "Disable night mode" : "Enable night mode"}
          onClick={toggleNightMode}
        >
          <RegionGlobeIcon className={navIconClassName} nightMode={nightMode} />
          <span className="md:hidden">Map</span>
        </button>
      ) : (
        <SwitchLink target={REGION_MAP_HREF} isCurrent={false} label="Region map">
          <RegionGlobeIcon className={navIconClassName} nightMode={nightMode} />
          <span className="md:hidden">Map</span>
        </SwitchLink>
      )}
      <Suspense fallback={null}>
        <AboutButton />
      </Suspense>
    </nav>
  );
}

function NavigationWithSearchParams() {
  const searchParams = useSearchParams();
  return <Navigation aboutOpen={searchParams.has("about")} />;
}

export default function NavButtons() {
  return (
    <Suspense fallback={<Navigation />}>
      <NavigationWithSearchParams />
    </Suspense>
  );
}
