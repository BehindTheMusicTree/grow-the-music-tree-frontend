import { useSession } from "@contexts/SessionContext";
import { fetchWrapper as rawFetch } from "@lib/fetch-wrapper";

export const useFetchWrapper = () => {
  const { session } = useSession();

  const fetch = <T>(
    backendEndpointOrUrl: string,
    fromBackend: boolean = true,
    options: RequestInit = {},
    queryParams?: Record<string, string | number | boolean>
  ) => {
    const url = fromBackend ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${backendEndpointOrUrl}` : backendEndpointOrUrl;
    return rawFetch<T>(url, options, session?.accessToken || undefined, queryParams);
  };

  return { fetch };
};
