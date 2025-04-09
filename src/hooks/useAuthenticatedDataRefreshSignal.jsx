import { useCallback, useRef, useEffect } from "react";
import useAuthState from "./useAuthState";

export function useAuthenticatedDataRefreshSignal() {
  const { isAuthenticated } = useAuthState();
  const refreshSignalRef = useRef(0);
  const loadingStatesRef = useRef(new Map());

  const triggerRefresh = useCallback(
    (loadingKey) => {
      if (!isAuthenticated || loadingStatesRef.current.get(loadingKey)) return;
      refreshSignalRef.current += 1;
      loadingStatesRef.current.set(loadingKey, true);
    },
    [isAuthenticated]
  );

  const setLoading = useCallback((loadingKey, value) => {
    loadingStatesRef.current.set(loadingKey, value);
  }, []);

  const getLoading = useCallback((loadingKey) => {
    return loadingStatesRef.current.get(loadingKey) || false;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Trigger refresh for all loading states
      loadingStatesRef.current.forEach((_, key) => {
        if (!loadingStatesRef.current.get(key)) {
          triggerRefresh(key);
        }
      });
    }
  }, [isAuthenticated, triggerRefresh]);

  return {
    triggerRefresh,
    refreshSignal: refreshSignalRef.current,
    setLoading,
    getLoading,
  };
}
