import { useState, useCallback } from "react";
import useApiConnectivity from "./useApiConnectivity";
import useSpotifyAuthActions from "./useSpotifyAuthActions";

export function useAuthenticatedDataRefreshSignal() {
  const [refreshSignal, setRefreshSignalRaw] = useState(0);
  const isOperationInProgressRef = { current: false };

  const checkTokenAndShowAuthIfNeeded = useSpotifyAuthActions();

  // Setup API connectivity handling
  const { handleApiError } = useApiConnectivity({
    refreshCallback: triggerRefresh,
    fetchingRef: isOperationInProgressRef,
    refreshInProgressRef: isOperationInProgressRef,
  });

  const triggerRefresh = useCallback(() => {
    if (!isOperationInProgressRef.current) {
      isOperationInProgressRef.current = true;
      setRefreshSignalRaw((prev) => prev + 1);
      setTimeout(() => {
        isOperationInProgressRef.current = false;
      }, 100);
    }
  }, []);

  return {
    refreshSignal,
    setRefreshSignal: triggerRefresh,
    isOperationInProgressRef,
    handleApiError,
    checkTokenAndShowAuthIfNeeded,
  };
}
