import axios from 'axios';
import { API_URL, BEARER_TOKEN } from '../../config/config';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${BEARER_TOKEN}`,
  },
});

const apiService = {
  fetchData: async (endpoint) => {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

export default apiService;
