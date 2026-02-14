"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Play } from "lucide-react";
import { usePopup } from "@contexts/PopupContext";
import { useSession } from "@contexts/SessionContext";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import SpotifyAuthPopup from "@components/ui/popup/child/SpotifyAuthPopup";

interface MenuItem {
  href: string;
  label: string;
  icon: ReactNode;
  authRequired?: boolean;
}

interface MenuGroupProps {
  items: MenuItem[];
  className?: string;
}

export function MenuGroup({ items, className = "" }: MenuGroupProps) {
  const pathname = usePathname();
  const { showPopup, hidePopup } = usePopup();
  const { session } = useSession();
  const { handleSpotifyOAuth } = useSpotifyAuth();
  const isAuthenticated = Boolean(session?.accessToken);

  const handleItemClick = (item: MenuItem) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.authRequired === false) {
      hidePopup();
      return;
    }
    if (item.authRequired && !isAuthenticated) {
      e.preventDefault();
      showPopup(<SpotifyAuthPopup handleSpotifyOAuth={handleSpotifyOAuth} />);
    }
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {items.map((item) => {
        const isCurrentPage =
          pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            onClick={handleItemClick(item)}
            className={`flex items-center gap-3 mx-1 mt-1 px-4 py-2 rounded-sm transition-colors duration-200 ${
              item.authRequired
                ? "bg-[var(--private-menu-item-bg)] text-white hover:bg-[var(--private-menu-item-bg)] hover:opacity-90"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
          >
            {item.icon}
            <span className="flex-grow">{item.label}</span>
            {isCurrentPage && <Play className="shrink-0 w-4 h-4 fill-current" />}
          </Link>
        );
      })}
    </div>
  );
}
