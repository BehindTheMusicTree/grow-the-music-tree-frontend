const originalFetch = window.fetch;

export const setupConnectivityInterceptor = (handleError) => {
  window.fetch = async (...args) => {
    const [url, options] = args;
    const isExternalService = typeof url === "string" && (url.includes("spotify") || url.includes("oauth"));

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
