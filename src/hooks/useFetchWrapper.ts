import { useSession } from "@contexts/SessionContext";
import { fetchWrapper as rawFetch } from "@lib/fetch-wrapper";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { ConnectivityError } from "@app-types/app-errors/app-error";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";

export const useFetchWrapper = () => {
  const { session } = useSession();
  const { setConnectivityError } = useConnectivityError();

  const handleError = (error: Error) => {
    if (error instanceof ConnectivityError) {
      setConnectivityError(error);
    }
  };

  const handleMissingRequiredSession = () => {
    setConnectivityError(createAppErrorFromErrorCode(ErrorCode.SESSION_REQUIRED));
  };

  const fetch = <T>(
    backendEndpointOrUrl: string,
    fromBackend: boolean = true,
    requiresAuth: boolean = true,
    options: RequestInit = {},
    queryParams?: Record<string, string | number | boolean>
  ) => {
    const url = fromBackend
      ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${backendEndpointOrUrl}`
      : backendEndpointOrUrl;
    return rawFetch<T>(
      url,
      requiresAuth,
      options,
      session?.accessToken || undefined,
      queryParams,
      handleMissingRequiredSession,
      handleError
    );
  };

  return { fetch };
};
