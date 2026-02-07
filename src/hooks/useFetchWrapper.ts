import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { useSession } from "@contexts/SessionContext";
import { ConnectivityError, AuthRequired } from "@app-types/app-errors/app-error";
import { fetchWrapper as rawFetch } from "@lib/fetch-wrapper";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";

export const useFetchWrapper = () => {
  const { setConnectivityError } = useConnectivityError();
  const { clearSession, session } = useSession();

  const handleError = (error: Error) => {
    if (error instanceof ConnectivityError) {
      if (error instanceof AuthRequired) {
        clearSession();
      }
      setConnectivityError(error);
    } else {
      throw error;
    }
  };

  const handleMissingRequiredSession = () => {
    setConnectivityError(createAppErrorFromErrorCode(ErrorCode.SESSION_REQUIRED));
  };

  const fetch = <T>(
    backendEndpointOrUrl: string,
    isReference: boolean = false,
    fromBackend: boolean = true,
    requiresAuth: boolean = true,
    options: RequestInit = {},
    queryParams?: Record<string, string | number | boolean>,
    expectBinary: boolean = false,
  ) => {
    const path = fromBackend && isReference ? `reference-${backendEndpointOrUrl}` : `my-${backendEndpointOrUrl}`;
    const auth = isReference ? false : requiresAuth;
    const url = fromBackend ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${path}` : backendEndpointOrUrl;
    return rawFetch<T>(
      url,
      auth,
      options,
      session?.accessToken || undefined,
      queryParams,
      handleMissingRequiredSession,
      handleError,
      expectBinary,
    );
  };

  return { fetch };
};
