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

  fetchData: async (endpoint, method, data = null, page = null) => {
    let url = `${config.apiBaseUrl}${endpoint}`
    if (page) {
      url += `?page=${page}`
    }

    const response = await fetch(url, {
      method,
      headers: ApiService.getHeaders(),
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
    
  retrieveLibraryTrack: async (libraryTrackUuid, onSuccess) => {
    const data = await ApiService.fetchData(`tracks/${libraryTrackUuid}/`, 'GET', null, null);
    onSuccess(data)
  },

  getLibraryTrackAudio: (libraryTrackRelativeUrl, onSuccess) => {
    const headers = {'Authorization': `Bearer ${ApiService.getToken().access}`}
    ApiService.getTrackAudio(`${config.apiBaseUrl}${libraryTrackRelativeUrl}download/`, headers, onSuccess);
  },

  getTrackAudio: (trackUrl, headers, onSuccess) => {
    axios.get(trackUrl, {
      headers: headers,
      responseType: 'arraybuffer'
    }).then(response => {
      const blob = new Blob([response.data], {type: 'audio/*'});
      const url = URL.createObjectURL(blob);
      onSuccess(url);
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

  postGenre: async (genreData, onSuccess) => {
    const data = await ApiService.fetchData('genres/', 'POST', genreData, null);
    onSuccess(data)
  },
};

export default ApiService;
