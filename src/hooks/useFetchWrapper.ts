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

  const fetch = <T>(
    backendEndpointOrUrl: string,
    fromBackend: boolean = true,
    requiresAuth: boolean = true,
    options: RequestInit = {},
    queryParams?: Record<string, string | number | boolean>
  ) => {
    if (requiresAuth && !session?.accessToken) {
      setConnectivityError(createAppErrorFromErrorCode(ErrorCode.SESSION_REQUIRED));
      return;
    }
    const url = fromBackend ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${backendEndpointOrUrl}` : backendEndpointOrUrl;
    return rawFetch<T>(url, options, session?.accessToken || undefined, queryParams, handleError);
  };

  return { fetch };
};
