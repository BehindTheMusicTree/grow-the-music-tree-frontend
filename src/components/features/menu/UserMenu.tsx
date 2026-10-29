"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import { Avatar } from "@behindthemusictree/ui";
import { signIn, signOut, useSession } from "next-auth/react";
import { useIsAdmin } from "@hooks/useIsAdmin";
import { ADMIN_HREF } from "@lib/constants/routes";

const MENU_LINKS = [
  { href: ADMIN_HREF, label: "Admin" },
  { href: "/admin/curation", label: "Curation" },
  { href: "/admin/genre-review", label: "Genre review" },
  { href: "/admin/root-review", label: "Root review" },
];

const buttonClassName = "flex h-full aspect-square shrink-0 items-center justify-center rounded-full shadow-lg";
const itemClassName = "block w-full px-3 py-2 text-left text-sm hover:bg-white/10";

export function UserMenu() {
  const { data: session, status } = useSession();
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const accountLabel = session?.user?.name ?? session?.user?.email;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!isAdmin) {
    return (
      <button
        type="button"
        className={`${buttonClassName} bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50`}
        aria-label="Sign in"
        disabled={status === "loading"}
        onClick={() => void signIn("google", { redirectTo: ADMIN_HREF })}
      >
        <UserRound className="h-5 w-5" aria-hidden />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full">
      <button
        type="button"
        className={buttonClassName}
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {accountLabel ? <Avatar label={accountLabel} size="lg" /> : <UserRound className="h-5 w-5" aria-hidden />}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-48 overflow-hidden rounded-lg bg-black/80 py-1 text-gray-100 shadow-lg backdrop-blur"
        >
          {session?.user?.email && <p className="px-3 py-2 text-xs text-gray-400">{session.user.email}</p>}
          {MENU_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} role="menuitem" className={itemClassName} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            className={itemClassName}
            onClick={() => void signOut({ redirectTo: "/" })}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
