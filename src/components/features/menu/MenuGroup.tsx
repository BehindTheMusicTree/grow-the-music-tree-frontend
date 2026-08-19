"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@lib/utils";

interface MenuItem {
  href: string;
  label: string;
  icon: ReactNode;
  /** Opens in a new tab; uses a plain anchor instead of Next.js `Link`. */
  external?: boolean;
}

interface MenuGroupProps {
  items: MenuItem[];
  className?: string;
  collapsed?: boolean;
  layout?: "vertical" | "horizontal";
}

export function MenuGroup({ items, className = "", collapsed = false, layout = "vertical" }: MenuGroupProps) {
  const pathname = usePathname();
  const isHorizontal = layout === "horizontal";

  return (
    <div
      className={cn(
        isHorizontal ? "flex w-max min-w-full flex-row flex-nowrap items-center gap-1" : "flex w-full flex-col",
        className,
      )}
    >
      {items.map((item) => {
        const isCurrentPage =
          !item.external &&
          (pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)));
        const className = cn(
          "flex items-center transition-colors duration-200",
          isHorizontal
            ? "shrink-0 gap-2 whitespace-nowrap px-1.5 py-1.5 text-sm lg:gap-2 lg:px-2"
            : cn("mx-1 mt-1 py-2", collapsed ? "justify-center px-2" : "gap-3 px-4"),
          "text-gray-300 hover:text-white",
          isCurrentPage && "font-semibold text-white",
        );
        const label =
          isHorizontal ? (
            <span className="sr-only md:not-sr-only lg:inline">{item.label}</span>
          ) : !collapsed ? (
            <span className="flex-grow">{item.label}</span>
          ) : null;

        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={isHorizontal || (!isHorizontal && collapsed) ? item.label : undefined}
              className={className}
            >
              {item.icon}
              {label}
            </a>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            title={isHorizontal || (!isHorizontal && collapsed) ? item.label : undefined}
            aria-current={isCurrentPage ? "page" : undefined}
            className={className}
          >
            {item.icon}
            {label}
          </Link>
        );
      })}
    </div>
  );
}
