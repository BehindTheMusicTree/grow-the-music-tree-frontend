"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { usePopup } from "@contexts/PopupContext";
import { AUTH_POPUP_TYPE } from "@contexts/PopupContext";
import { useSession } from "@contexts/SessionContext";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
import { useFetchSpotifyUser } from "@hooks/useSpotifyUser";
import { getRouteAuthRequirement } from "@lib/constants/routes";
import AuthPopup from "@components/ui/popup/child/AuthPopup";
import { cn } from "@lib/utils";

interface MenuItem {
  href: string;
  label: string;
  icon: ReactNode;
  authRequired?: false | "any" | "spotify";
}

interface MenuGroupProps {
  items: MenuItem[];
  className?: string;
  collapsed?: boolean;
  layout?: "vertical" | "horizontal";
}

export function MenuGroup({ items, className = "", collapsed = false, layout = "vertical" }: MenuGroupProps) {
  const pathname = usePathname();
  const { showPopup, hidePopup } = usePopup();
  const { session } = useSession();
  const { handleSpotifyOAuth } = useSpotifyAuth();
  const { handleGoogleOAuth } = useGoogleAuth();
  const routeAuthRequirement = getRouteAuthRequirement(pathname);
  const fetchSpotifyUserEnabled = routeAuthRequirement === "spotify" || pathname === "/account";
  const { data: spotifyProfile } = useFetchSpotifyUser({
    skipGlobalError: true,
    enabled: fetchSpotifyUserEnabled,
  });
  const isAuthenticated = Boolean(session?.accessToken);
  const hasSpotifyAuth = Boolean(spotifyProfile?.id);
  const isHorizontal = layout === "horizontal";

  const handleItemClick = (item: MenuItem) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.authRequired === false) {
      hidePopup({ onlyIfType: AUTH_POPUP_TYPE });
      return;
    }
    if (item.authRequired === "spotify" && (!isAuthenticated || !hasSpotifyAuth)) {
      e.preventDefault();
      showPopup(
        <AuthPopup handleSpotifyOAuth={handleSpotifyOAuth} redirectAfterAuthPath={item.href} spotifyOnly />,
        AUTH_POPUP_TYPE,
      );
      return;
    }
    if (item.authRequired === "any" && !isAuthenticated) {
      e.preventDefault();
      showPopup(
        <AuthPopup
          handleSpotifyOAuth={handleSpotifyOAuth}
          handleGoogleOAuth={handleGoogleOAuth}
          redirectAfterAuthPath={item.href}
        />,
        AUTH_POPUP_TYPE,
      );
      return;
    }
    hidePopup({ onlyIfType: AUTH_POPUP_TYPE });
  };

  return (
    <div
      className={cn(
        isHorizontal ? "flex w-max min-w-full flex-row flex-nowrap items-center gap-1" : "flex w-full flex-col",
        className,
      )}
    >
      {items.map((item) => {
        const isCurrentPage = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            onClick={handleItemClick(item)}
            title={isHorizontal || (!isHorizontal && collapsed) ? item.label : undefined}
            aria-current={isCurrentPage ? "page" : undefined}
            className={cn(
              "flex items-center transition-colors duration-200",
              isHorizontal
                ? "shrink-0 gap-2 whitespace-nowrap px-1.5 py-1.5 text-sm lg:gap-2 lg:px-2"
                : cn("mx-1 mt-1 py-2", collapsed ? "justify-center px-2" : "gap-3 px-4"),
              item.authRequired === "spotify"
                ? "text-green-400 hover:text-green-300"
                : item.authRequired === "any"
                  ? "text-gray-200 hover:text-white"
                  : "text-gray-300 hover:text-white",
              isCurrentPage &&
                (item.authRequired === "spotify" ? "font-semibold text-green-200" : "font-semibold text-white"),
            )}
          >
            {item.icon}
            {isHorizontal ? (
              <span className="sr-only md:not-sr-only lg:inline">{item.label}</span>
            ) : !collapsed ? (
              <span className="flex-grow">{item.label}</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
