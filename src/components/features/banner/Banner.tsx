"use client";

import logo from "@assets/images/logos/tree.png";
import Image from "next/image";
import { TheMusicTreeByline } from "@behindthemusictree/assets/components";

interface BannerProps {
  className?: string;
}

export default function Banner({ className }: BannerProps) {
  return (
    <div className={`banner relative py-2 px-3 pr-14 sm:pr-16 bg-black text-gray-100 ${className}`}>
      <div className="mx-auto flex min-w-0 max-w-full items-center justify-center gap-3">
        <div className="shrink-0">
          <Image src={logo} alt="logo" width={48} style={{ height: "auto" }} />
        </div>
        <h1 className="truncate text-2xl font-bold">GrowTheMusicTree</h1>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <span className="pointer-events-auto inline-flex rounded-full border border-zinc-200 bg-white shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50">
          <TheMusicTreeByline imageStyle={{ height: 48, width: "auto" }} />
        </span>
      </div>
    </div>
  );
}
