"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Play } from "lucide-react";
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

export function MenuGroup({
  items,
  className = "",
  collapsed = false,
  layout = "vertical",
}: MenuGroupProps) {
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
        <AuthPopup
          handleSpotifyOAuth={handleSpotifyOAuth}
          redirectAfterAuthPath={item.href}
          spotifyOnly
        />,
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
        const isCurrentPage =
          pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            onClick={handleItemClick(item)}
            title={!isHorizontal && collapsed ? item.label : undefined}
            className={cn(
              "flex items-center transition-colors duration-200",
              isHorizontal
                ? "shrink-0 gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-sm"
                : cn("mx-1 mt-1 rounded-sm py-2", collapsed ? "justify-center px-2" : "gap-3 px-4"),
              item.authRequired === "any"
                ? "bg-[var(--private-menu-item-bg)] text-black hover:opacity-90"
                : item.authRequired === "spotify"
                  ? "bg-[var(--spotify-menu-item-bg)] text-white hover:opacity-90"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
            )}
          >
            {item.icon}
            {(!isHorizontal ? !collapsed : true) && (
              <>
                <span className={cn(!isHorizontal && "flex-grow")}>{item.label}</span>
                {isCurrentPage && <Play className="h-4 w-4 shrink-0 fill-current" />}
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
