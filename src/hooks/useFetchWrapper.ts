import { useSession } from "@contexts/SessionContext";
import { fetchWrapper as rawFetch } from "@lib/fetch-wrapper";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { ConnectivityError } from "@app-types/app-errors/app-error";

export const useFetchWrapper = () => {
  const { session } = useSession();
  const { setConnectivityError } = useConnectivityError();

  const handleError = (error: Error) => {
    console.log("useFetchWrapper handleError", error);
    if (error instanceof ConnectivityError) {
      console.log("useFetchWrapper setConnectivityError", error);
      setConnectivityError(error);
    }
  };

  const fetch = <T>(
    backendEndpointOrUrl: string,
    fromBackend: boolean = true,
    options: RequestInit = {},
    queryParams?: Record<string, string | number | boolean>
  ) => {
    const url = fromBackend ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${backendEndpointOrUrl}` : backendEndpointOrUrl;
    return rawFetch<T>(url, options, session?.accessToken || undefined, queryParams, handleError);
  };

  return { fetch };
};
