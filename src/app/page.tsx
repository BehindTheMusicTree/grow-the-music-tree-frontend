"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/reference-genre-tree");
  }, []);
}

/*
redirect is a server-function. It won't work as long as we serve the app statically.
import { redirect } from "next/navigation";

export default function HomePage() {
`  redirect("/reference-genre-tree");
  return null;
}*/
