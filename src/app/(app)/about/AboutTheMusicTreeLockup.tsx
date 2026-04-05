"use client";

import { TheMusicTreeByline } from "@behindthemusictree/assets/components";

export function AboutTheMusicTreeLockup() {
  return (
    <div className="flex justify-center py-1">
      <span className="inline-flex rounded-full border border-zinc-200 bg-white p-2 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50">
        <TheMusicTreeByline imageStyle={{ height: 44, width: "auto" }} />
      </span>
    </div>
  );
}
