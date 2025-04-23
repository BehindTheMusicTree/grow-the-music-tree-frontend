export const fetchWrapper = async <T>(url: string, options: RequestInit = {}, accessToken?: string): Promise<T> => {
  const res = await fetch(url, {
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
