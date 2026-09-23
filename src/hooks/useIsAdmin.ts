"use client";

import { useSession } from "next-auth/react";

export function useIsAdmin(): boolean {
  const { data: session, status } = useSession();
  return status === "authenticated" && !session.error;
}
