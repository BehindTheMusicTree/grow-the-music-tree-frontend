"use client";

import { useCallback } from "react";

import { useSession } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { createLogout } from "@lib/auth/code-exchange";

export function useLogout() {
  const { clearSession } = useSession();
  const { clearConnectivityError } = useConnectivityError();

  const logout = useCallback(
    createLogout(clearConnectivityError, clearSession),
    [clearConnectivityError, clearSession],
  );

  return { logout };
}
