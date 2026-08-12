"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { PATHS } from "@lib/constants/routes";
import { cn } from "@lib/utils";

export function HeaderMenuDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isCurrentPage = pathname === PATHS.ABOUT || pathname.startsWith(`${PATHS.ABOUT}/`);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open menu"
        className="flex items-center justify-center rounded-md p-1.5 text-gray-300 transition-colors duration-200 hover:text-white"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 min-w-40 rounded-md border border-zinc-800 bg-black py-1 shadow-lg"
        >
          <Link
            href={PATHS.ABOUT}
            prefetch={false}
            role="menuitem"
            aria-current={isCurrentPage ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "block px-3 py-2 text-sm text-gray-300 transition-colors duration-200 hover:text-white",
              isCurrentPage && "font-semibold text-white",
            )}
          >
            About
          </Link>
        </div>
      )}
    </div>
  );
}
