import config from '../config/config'; 
import axios from 'axios';

const ApiService = {
  getToken: () => {
    return JSON.parse(localStorage.getItem('jwtToken'));
  },

  setToken: (jwtToken) => {
    localStorage.setItem('jwtToken', JSON.stringify(jwtToken));
  },

  getHeaders: () => {
    const accessToken = ApiService.getToken().access;
    if (accessToken) {
      return {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  },

  fetchData: async (endpoint, method = 'GET', data = null) => {
    return fetch(`${config.apiBaseUrl}${endpoint}`, {
      method,
      headers: ApiService.getHeaders(),
      body: data ? JSON.stringify(data) : null,})
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  },

  login: async (credentials) => {
    fetch(`${config.apiBaseUrl}auth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
      }
      
      response.json()
      .then((responseJson) => {
        ApiService.setToken(responseJson);
      })
    })
  },

  getAudio: (callback) => {
    axios.get(`${config.apiBaseUrl}tracks/Ly7Ru2ugWX3Xr4vazS5kqX/download/`, {
      headers: {
        'Authorization': `Bearer ${ApiService.getToken().access}`
      },
      responseType: 'arraybuffer'
    }).then(response => {
      const blob = new Blob([response.data], {type: 'audio/*'});
      const url = URL.createObjectURL(blob);
      callback(url);
    });
  }
};

export default ApiService;
