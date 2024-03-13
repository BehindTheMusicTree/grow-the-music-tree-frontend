import config from '../config/config'; 
import axios from 'axios';

const ApiService = {
  credentials: { username: config.username, password: config.password },

  getToken: () => {
    return JSON.parse(localStorage.getItem('jwtToken'));
  },

  setToken: (jwtToken) => {
    localStorage.setItem('jwtToken', JSON.stringify(jwtToken));
  },
  
  refreshToken: async () => {
    const refreshToken = ApiService.getToken().refresh;
    if (refreshToken) {
      try {
        const response = await axios.post(`${config.apiBaseUrl}auth/token/refresh/`, {
          refresh: refreshToken,
        });
        if (response.status === 200) {
          let newToken = ApiService.getToken();
          newToken.access = response.data.access;
          ApiService.setToken(newToken);
        }
      } catch (error) {
        // Gérer l'erreur
      }
    }
    else {
      await ApiService.login();
    }
  },

  getHeaders: async () => {
    let accessToken = ApiService.getToken().access;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expDate = new Date(payload.exp * 1000);
        if (expDate < new Date()) {
          await ApiService.refreshToken();
          accessToken = ApiService.getToken().access;
        }
      } catch (error) {
        // handle error
      }
      return {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };
    }
    else {
      await ApiService.login();
      return ApiService.getHeaders();
    }
  },

  login: async () => {
    fetch(`${config.apiBaseUrl}auth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ApiService.credentials),
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

  fetchData: async (endpoint, method, data = null, page = null) => {
    let url = `${config.apiBaseUrl}${endpoint}`
    if (page) {
      url += `?page=${page}`
    }

    const headers = await ApiService.getHeaders();
    const response = await fetch(url, {
      method,
      headers: headers,
      body: data ? JSON.stringify(data) : null,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        return response; 
      })
      .catch((error) => {
        throw error;
      });

      const responseJson = await response.json();
      return responseJson;
  },
    
  retrieveLibraryTrack: async (libraryTrackUuid) => {
    return await ApiService.fetchData(`tracks/${libraryTrackUuid}/`, 'GET', null, null);
  },

  getLibraryTrackAudio: async (libraryTrackRelativeUrl) => {
    const headers = {'Authorization': `Bearer ${ApiService.getToken().access}`}
    return await ApiService.getTrackAudio(`${config.apiBaseUrl}${libraryTrackRelativeUrl}download/`, headers);
  },

  getTrackAudio: async (trackUrl, headers) => {
    return await axios.get(trackUrl, {
      headers: headers,
      responseType: 'arraybuffer'
    }).then(response => {
      const blob = new Blob([response.data], {type: 'audio/*'});
      const url = URL.createObjectURL(blob);
      return url
    }).catch(error => {
      console.error('Error fetching audio:', error);
    });
  },

  getGenres: async () => {
    let results = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await ApiService.fetchData('genres/', 'GET', null, page);
      results = results.concat(data.results);

      if (data.next) {
        page++;
      } else {
        hasMore = false;
      }
    }

    return results
  },

  postGenre: async (genreData) => {
    return await ApiService.fetchData('genres/', 'POST', genreData, null);
  },
};

export default ApiService;
