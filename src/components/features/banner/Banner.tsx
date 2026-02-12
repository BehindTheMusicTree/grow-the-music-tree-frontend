"use client";

import SearchForm from "./SearchForm";
import logo from "@assets/images/logos/tree.png";
import Image from "next/image";

interface BannerProps {
  className?: string;
}

export default function Banner({ className }: BannerProps) {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

  return (
    <div className={`banner py-2 px-3 bg-black text-gray-100 ${className}`}>
      <div className="w-full mx-auto relative flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3">
            <Image src={logo} alt="logo" width={48} style={{ height: "auto" }} />
          </div>
          <h1 className="text-2xl font-bold">GrowTheMusicTree</h1>
        </div>
        <div className="text-xs text-gray-400">
          {appVersion ? `v${appVersion}` : null}
        </div>
        {/* <div className="search w-64 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SearchForm />
        </div> */}
      </div>
    </div>
  );
}
