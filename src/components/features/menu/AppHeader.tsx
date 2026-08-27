"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@behindthemusictree/ui";
import { FlaskConical } from "lucide-react";
import logo from "@assets/images/logos/tree.png";
import { APP_NAME } from "@lib/constants/app";
import { getAudiometaUrl } from "@lib/site-urls";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";
import { MenuGroup } from "./MenuGroup";
import { HeaderMenuDropdown } from "./HeaderMenuDropdown";
import { PATHS as ROUTE_PATHS } from "@lib/constants/routes";

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
  {
    href: ROUTE_PATHS.PROTOTYPE_REFERENCE_GENRE_TREE,
    label: "Prototype demo",
    icon: <FlaskConical className="h-5 w-5 shrink-0" aria-hidden />,
    external: false,
  },
];

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className }: AppHeaderProps) {
  const pathname = usePathname();
  const { viewMode, setViewMode, canShowPopCore } = useGenreTreeViewMode();
  const showGenreTreeViewModeToggle =
    pathname === ROUTE_PATHS.REFERENCE_GENRE_TREE || pathname === ROUTE_PATHS.PROTOTYPE_REFERENCE_GENRE_TREE;

  return (
    <div className={`fixed top-3 left-3 z-50 flex items-center gap-2 ${className ?? ""}`}>
      <HeaderMenuDropdown />
      <Link
        href={ROUTE_PATHS.REFERENCE_GENRE_TREE}
        prefetch={false}
        className="flex shrink-0 items-center gap-2 rounded-full bg-black/70 py-1.5 pl-1.5 pr-4 shadow-lg backdrop-blur xl:gap-3"
        aria-label={`${APP_NAME} home`}
      >
        <div className="shrink-0">
          <Image src={logo} alt="" width={40} height={40} className="h-auto w-9" aria-hidden />
        </div>
        <h1 className="hidden truncate text-lg font-bold text-gray-100 xl:block xl:text-xl">{APP_NAME}</h1>
      </Link>
      {showGenreTreeViewModeToggle && (
        <div
          className="flex items-center gap-1 rounded-full bg-black/70 p-1 shadow-lg backdrop-blur"
          role="group"
          aria-label="Tree view mode"
        >
          <Button
            variant={viewMode === "stacked" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("stacked")}
          >
            Stacked
          </Button>
          <Button variant={viewMode === "wheel" ? "default" : "outline"} size="sm" onClick={() => setViewMode("wheel")}>
            Wheel
          </Button>
          <Button
            variant={viewMode === "pop-core" ? "default" : "outline"}
            size="sm"
            disabled={!canShowPopCore}
            title={canShowPopCore ? undefined : "This genre tree has no 'Mainstream Pop' root yet"}
            onClick={() => setViewMode("pop-core")}
          >
            Pop/Core
          </Button>
        </div>
      )}
      {menuGroup.length > 0 && (
        <nav
          aria-label="Main navigation"
          className="min-w-0 max-w-xs overflow-x-auto rounded-full bg-black/70 px-2 py-1.5 shadow-lg backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <MenuGroup items={menuGroup} layout="horizontal" />
        </nav>
      )}
    </div>
  );
}
