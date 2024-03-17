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
    console.log('refresh token')
    const refreshToken = ApiService.getToken().refresh;
    if (refreshToken) {
      console.log('refresh oui')
      const response = await fetch(`${config.apiBaseUrl}auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({refresh: refreshToken}),
      })

      if (response.status === 200) {
        console.log('refresh ok')
        let newToken = ApiService.getToken();
        newToken.access = response.data.access;
        console.log('new token' + newToken.access)
        ApiService.setToken(newToken);
      }
      else if (response.status === 401) {
        console.error('Refresh token expired, login');
        await ApiService.login();
      }
      else {
        console.error('Error refreshing token:', response);
      }
    }
    else {
      console.log('refresh non')
      await ApiService.login();
    }
  },

  getHeaders: async () => {
    let accessToken = ApiService.getToken().access;
    console.log('access1 ' + ApiService.getToken().access)
    console.log('refresh ' + ApiService.getToken().refresh)
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expDate = new Date(payload.exp * 1000);
        console.log('exp date' + expDate)
        if (expDate < new Date()) {
          await ApiService.refreshToken();
          accessToken = ApiService.getToken().access;
          console.log('access2 ' + ApiService.getToken().access)
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const newexpDate = new Date(payload.exp * 1000);
          console.log('exp date' + newexpDate)
        }
      } catch (error) {
        console.error('Error parsing token:', error);
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
    console.log('login')
    const response = await fetch(`${config.apiBaseUrl}auth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ApiService.credentials),
    })

    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }
    const responseJson = await response.json()
    console.log('login ok with token: ' + responseJson.access)
    ApiService.setToken(responseJson);
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

  retrievePlaylist: async (playlistUuid) => {
    return await ApiService.fetchData(`playlists/${playlistUuid}/`, 'GET', null, null);
  },
};

export default ApiService;
