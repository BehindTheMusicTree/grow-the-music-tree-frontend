export const fetchWrapper = async <T>(
  url: string,
  options: RequestInit = {},
  accessToken?: string,
  queryParams?: Record<string, string | number | boolean>
): Promise<T> => {
  const urlWithParams = queryParams
    ? `${url}${url.includes("?") ? "&" : "?"}${new URLSearchParams(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)])
      ).toString()}`
    : url;

  const res = await fetch(urlWithParams, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });

  if (!res.ok) throw new Error("Request failed");
  return res.json();
};
