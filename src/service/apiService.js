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
    
  retrieveLibraryTrack: async (libraryTrackUuid, onLoad) => {
    const data = await ApiService.fetchData(`tracks/${libraryTrackUuid}/`);
    onLoad(data);
  },

  getLibraryTrackAudio: (libraryTrackRelativeUrl, onLoad) => {
    const headers = {'Authorization': `Bearer ${ApiService.getToken().access}`}
    ApiService.getAudio(`${config.apiBaseUrl}${libraryTrackRelativeUrl}download/`, headers, onLoad);
  },

  getAudio: (trackUrl, headers, onLoad) => {
    axios.get(trackUrl, {
      headers: headers,
      responseType: 'arraybuffer'
    }).then(response => {
      const blob = new Blob([response.data], {type: 'audio/*'});
      const url = URL.createObjectURL(blob);
      onLoad(url);
    }).catch(error => {
      console.error('Error fetching audio:', error);
    });
  }
};

export default ApiService;
