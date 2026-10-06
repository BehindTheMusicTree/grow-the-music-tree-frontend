"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/curation", label: "Curation" },
  { href: "/admin/curation/history", label: "Historique" },
  { href: "/admin/genre-review", label: "Genre review" },
  { href: "/admin/root-review", label: "Root review" },
  { href: "/admin/imports", label: "Imports" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const current = LINKS.filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .map(({ href }) => href)
    .sort((a, b) => b.length - a.length)[0];
  return (
    <nav aria-label="Admin" className="flex flex-none flex-wrap gap-2 px-4 pt-4">
      <Link href="/admin" aria-current={pathname === "/admin" ? "page" : undefined} className="font-medium underline">
        Admin
      </Link>
      {LINKS.map(({ href, label }) => {
        return (
          <Link
            key={href}
            href={href}
            aria-current={href === current ? "page" : undefined}
            className="px-2 rounded-md border border-gray-300 aria-[current=page]:bg-gray-200 aria-[current=page]:font-semibold"
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
