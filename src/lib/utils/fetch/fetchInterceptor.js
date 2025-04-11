const originalFetch = window.fetch;

export const setupFetchInterceptor = (handleError) => {
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
