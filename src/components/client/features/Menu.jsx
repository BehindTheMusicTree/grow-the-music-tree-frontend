"use client";

import { PiGraphLight } from "react-icons/pi";
import { FaSpotify, FaCloudUploadAlt, FaUser } from "react-icons/fa";

import { MenuGroup } from "@/components/client/ui/menu/MenuGroup";

const menuGroups = {
  library: [
    {
      href: "/uploaded-library",
      label: "Uploaded Library",
      icon: <FaCloudUploadAlt className="text-xl" />,
    },
    {
      href: "/spotify-library",
      label: "Spotify Library",
      icon: <FaSpotify className="text-xl" />,
    },
  ],
  discovery: [
    {
      href: "/genre-tree",
      label: "Genre Tree",
      icon: <PiGraphLight className="text-xl" />,
    },
  ],
  account: [
    {
      href: "/account",
      label: "Account",
      icon: <FaUser className="text-xl" />,
    },
  ],
};

export function Menu() {
  return (
    <nav className="bg-black flex flex-col justify-start items-start p-2 h-full">
      <MenuGroup items={menuGroups.library} />
      <MenuGroup items={menuGroups.discovery} />
      <MenuGroup items={menuGroups.account} className="mt-auto" />
    </nav>
  );
}
