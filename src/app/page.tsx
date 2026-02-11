"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GenreTreeView } from "./me-genre-tree/GenreTreeView";

export default function HomePage() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/") {
      router.replace("/reference-genre-tree");
    }
  }, [pathname, router]);

  if (pathname === "/reference-genre-tree") {
    return <GenreTreeView scope="reference" handleGenreCreationAction={() => {}} />;
  }

  return null;
}
