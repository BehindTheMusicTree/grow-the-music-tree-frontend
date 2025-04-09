import { useState, useCallback } from "react";

export function useAuthenticatedDataRefreshSignal() {
  const [refreshSignal, setRefreshSignalRaw] = useState(0);
  const isOperationInProgressRef = { current: false };

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
  };
}
