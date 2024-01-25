// ApiService.js
import axios from 'axios';

const apiUrl = 'https://bodzify.com/api/v1/'

const ApiService = {
  getToken: () => {
    // Implement your logic to retrieve the JWT token (from localStorage, cookies, etc.)
    // For example, assuming you store the token in localStorage:
    return localStorage.getItem('jwtToken');
  },

  setToken: (token) => {
    // Implement your logic to store the JWT token (in localStorage, cookies, etc.)
    // For example, storing the token in localStorage:
    localStorage.setItem('jwtToken', token);
  },

  clearToken: () => {
    // Implement your logic to clear the JWT token (remove from localStorage, cookies, etc.)
    // For example, removing the token from localStorage:
    localStorage.removeItem('jwtToken');
  },

  getHeaders: () => {
    const token = ApiService.getToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  },

  fetchData: async (endpoint, method = 'GET', data = null) => {
    const response = await axios({
      method,
      url: `${apiUrl}${endpoint}`,
      headers: ApiService.getHeaders(),
      data,
    });

    return response.data;
  },

  fetchData2: (data) => {

    const tokenApiUrl = 'https://bodzify.com/api/v1/auth/token/';
    console.log('data', data);
    const requestOptions = {
      method: 'POST',
      headers: ApiService.getHeaders(),
      body: JSON.stringify(data)
    };

    fetch(tokenApiUrl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Data from API:', data);
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  },

  login: async (credentials) => {
    // const response = await ApiService.fetchData('auth/token', 'POST', credentials);
    const response = ApiService.fetchData2(credentials);
    const { token } = response;
    ApiService.setToken(token);
    return token;
  },

  logout: () => {
    ApiService.clearToken();
  },
};

export default ApiService;
