import { QueryClient } from "@tanstack/react-query";
import { ConnectivityError } from "@app-types/app-errors/app-error";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";

const handleQueryError = (error: unknown) => {
  if (error instanceof ConnectivityError) {
    return error;
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return createAppErrorFromErrorCode(ErrorCode.NETWORK_CONNECTION_REFUSED);
  }

  return createAppErrorFromErrorCode(ErrorCode.CLIENT_UNKNOWN);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: false,
      throwOnError: (error) => {
        const handledError = handleQueryError(error);
        throw handledError;
      },
    },
    mutations: {
      throwOnError: (error) => {
        const handledError = handleQueryError(error);
        throw handledError;
      },
    },
  },
});
