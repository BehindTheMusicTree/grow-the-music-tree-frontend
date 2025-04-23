"use client";

import { ReactNode } from "react";
import { FaHome, FaSearch, FaMusic, FaUser } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuProps {
  className?: string;
}

interface MenuItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
}

function MenuItem({ href, icon, label, isActive }: MenuItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 rounded-lg ${isActive ? "bg-gray-800" : ""}`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
}

export default function Menu({ className }: MenuProps) {
  const pathname = usePathname();

  return (
    <nav className={`w-64 bg-gray-900 h-full ${className}`}>
      <div className="p-4">
        <div className="space-y-2">
          <MenuItem href="/" icon={<FaHome size={20} />} label="Home" isActive={pathname === "/"} />
          <MenuItem href="/search" icon={<FaSearch size={20} />} label="Search" isActive={pathname === "/search"} />
          <MenuItem href="/library" icon={<FaMusic size={20} />} label="Library" isActive={pathname === "/library"} />
          <MenuItem href="/profile" icon={<FaUser size={20} />} label="Profile" isActive={pathname === "/profile"} />
        </div>
      </div>
    </nav>
  );
}
