"use client";

import { PiGraphLight } from "react-icons/pi";
import { FaSpotify, FaCloudUploadAlt, FaUser, FaList } from "react-icons/fa";
import { MenuGroup } from "./MenuGroup";

const menuGroups = {
  genreTree: [
    {
      href: "/genre-tree",
      label: "Genre Tree",
      icon: <PiGraphLight className="text-xl" />,
    },
  ],
  library: [
    {
      href: "/genre-playlists",
      label: "Genre Playlists",
      icon: <FaList className="text-xl" />,
    },
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
  account: [
    {
      href: "/account",
      label: "Account",
      icon: <FaUser className="text-xl" />,
    },
  ],
};

export default function Menu({ className }: { className?: string }) {
  return (
    <nav className={`menu bg-black flex flex-col justify-start items-start p-2 h-full w-fit ${className}`}>
      <MenuGroup items={menuGroups.genreTree} />
      <MenuGroup items={menuGroups.library} />
      <MenuGroup items={menuGroups.account} />
    </nav>
  );
}
