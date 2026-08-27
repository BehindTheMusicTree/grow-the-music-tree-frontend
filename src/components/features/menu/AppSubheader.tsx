"use client";

import { usePathname } from "next/navigation";
import { Button } from "@behindthemusictree/ui";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";
import { PATHS as ROUTE_PATHS } from "@lib/constants/routes";

export default function AppSubheader() {
  const pathname = usePathname();
  const { viewMode, setViewMode, canShowPopCore } = useGenreTreeViewMode();
  const showGenreTreeViewModeToggle =
    pathname === ROUTE_PATHS.REFERENCE_GENRE_TREE || pathname === ROUTE_PATHS.PROTOTYPE_REFERENCE_GENRE_TREE;

  if (!showGenreTreeViewModeToggle) {
    return null;
  }

  return (
    <div className="fixed top-20 left-3 z-40 flex items-center gap-2">
      <div className="flex items-center gap-1" role="group" aria-label="Tree view mode">
        <Button
          variant={viewMode === "stacked" ? "default" : "outline"}
          size="sm"
          className="shadow-lg"
          onClick={() => setViewMode("stacked")}
        >
          Stacked
        </Button>
        <Button
          variant={viewMode === "wheel" ? "default" : "outline"}
          size="sm"
          className="shadow-lg"
          onClick={() => setViewMode("wheel")}
        >
          Wheel
        </Button>
        <Button
          variant={viewMode === "pop-core" ? "default" : "outline"}
          size="sm"
          className="shadow-lg"
          disabled={!canShowPopCore}
          title={canShowPopCore ? undefined : "This genre tree has no 'Mainstream Pop' root yet"}
          onClick={() => setViewMode("pop-core")}
        >
          Pop/Core
        </Button>
      </div>
    </div>
  );
}
