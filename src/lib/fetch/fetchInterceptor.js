// Store the original fetch only in browser environments
const originalFetch = typeof window !== "undefined" ? window.fetch : null;

export const setupFetchInterceptor = (handleError) => {
  // Skip setup in SSR environments
  if (typeof window === "undefined") return;

  window.fetch = async (...args) => {
    const [url] = args;

    try {
      const response = await originalFetch(...args);
      if (!response.ok) {
        handleError({
          response: { status: response.status },
          config: { url },
        });
      }
      return response;
    } catch (error) {
      handleError({
        response: { status: error.message },
        config: { url },
      });
      throw error;
    }
  };
};
