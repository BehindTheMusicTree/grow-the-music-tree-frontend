import axios from "axios";

export const setupAxiosInterceptors = (handleError) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      handleError(error);
      return Promise.reject(error);
    }
  );
};
