"use client";

import { CircleDot, List } from "lucide-react";
import { SegmentedControl } from "@behindthemusictree/ui";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";

type ToggleMode = "pop-core" | "outline";

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useGenreTreeViewMode();

  return (
    <SegmentedControl<ToggleMode>
      aria-label="Tree view"
      value={viewMode === "outline" ? "outline" : "pop-core"}
      onChange={setViewMode}
      options={[
        { value: "pop-core", label: <CircleDot size={18} aria-hidden />, "aria-label": "Show wheel view", title: "Wheel view" },
        { value: "outline", label: <List size={18} aria-hidden />, "aria-label": "Show outline view", title: "Outline view" },
      ]}
    />
  );
}
