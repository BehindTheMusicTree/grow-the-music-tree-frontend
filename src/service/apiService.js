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
      const response = await fetch(`${config.apiBaseUrl}auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({refresh: refreshToken}),
      })

      if (response.status === 200) {
        const responseJson = await response.json()
        let newToken = ApiService.getToken();
        newToken.access = responseJson.access;
        ApiService.setToken(newToken);
      }
      else if (response.status === 401) {
        await ApiService.login();
      }
      else {
        console.error('Error refreshing token:', response);
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
    console.log('Logged in:', responseJson);
    ApiService.setToken(responseJson);
  },

  fetchData: async (endpoint, method, data = null, page = null) => {
    let url = `${config.apiBaseUrl}${endpoint}`
    if (page) {
      url += `?page=${page}`
    }

    const headers = await ApiService.getHeaders();

    if (data instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      method,
      headers: headers,
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : null,
    })

    if (!response.ok) {
      let errorMessage = null
      if (response.status === 400) {
        const responseJson = await response.json();
        errorMessage = JSON.stringify(responseJson);
      }
      throw new Error(`Request failed with status: ${response.status}` 
        + (errorMessage ? ` and message: ${errorMessage}` : ''));
    }

    const responseJson = await response.json();
    return responseJson;
  },

  retrieveLibTrack: async (libTrackUuid) => {
    return await ApiService.fetchData(`tracks/${libTrackUuid}/`, 'GET', null, null);
  },

  loadAudioAndGetLibTrackBlobUrl: async (libTrackRelativeUrl) => {
    const headers = {'Authorization': `Bearer ${ApiService.getToken().access}`}
    return await ApiService.getTrackAudioBlobUrl(`${config.apiBaseUrl}${libTrackRelativeUrl}download/`, headers);
  },

  getTrackAudioBlobUrl: async (trackUrl, headers) => {
    return await axios.get(trackUrl, {
      headers: headers,
      responseType: 'arraybuffer'
    }).then(response => {
      const blob = new Blob([response.data], {type: 'audio/*'});
      return URL.createObjectURL(blob);
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

  postPlay: async (contentObjectUuid) => {
    const data = {'contentObjectUuid': contentObjectUuid}
    return await ApiService.fetchData(`plays/`, 'POST', data, null);
  },

  postLibTracks: async (file, genreUuid) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('genreUuid', genreUuid);
    return await ApiService.fetchData('tracks/', 'POST', formData, null);
  }
};

export default ApiService;
