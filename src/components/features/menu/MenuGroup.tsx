"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface MenuItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface MenuGroupProps {
  items: MenuItem[];
  className?: string;
}

export function MenuGroup({ items, className = "" }: MenuGroupProps) {
  return (
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
