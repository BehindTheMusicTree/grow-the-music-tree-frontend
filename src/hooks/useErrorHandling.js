"use client";

import { useError } from "@contexts/ErrorContext";

export function useErrorHandling() {
  const { handleError } = useError();

  const onError = (error) => {
    handleError(error);
  };

  return { onError };
}
