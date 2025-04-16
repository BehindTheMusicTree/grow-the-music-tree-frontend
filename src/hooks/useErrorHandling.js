"use client";

import { useError } from "@contexts/ConnectivityErrorContext";

export function useErrorHandling() {
  const { handleError } = useError();

  const onError = (error) => {
    handleError(error);
  };

  return { onError };
}
