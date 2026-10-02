"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/curation", label: "Curation" },
  { href: "/admin/genre-review", label: "Genre review" },
  { href: "/admin/root-review", label: "Root review" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-none flex-wrap gap-2 px-4 pt-4">
      <Link href="/admin" aria-current={pathname === "/admin" ? "page" : undefined} className="font-medium underline">
        Admin
      </Link>
      {LINKS.map(({ href, label }) => {
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className="px-2 rounded-md border border-gray-300 aria-[current=page]:bg-gray-200 aria-[current=page]:font-semibold"
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
