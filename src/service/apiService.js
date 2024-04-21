import config from '../config/config'; 
import axios from 'axios';

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse response: ${error}`);
  }
}

const getResponseErrorMessageWhenNotOk = async (response) => {
  if (response.status >= 400 && response.status < 600) {
    const responseJson = await parseJson(response);
    const errorMessage = JSON.stringify(responseJson);
    throw new Error(`${response.status} ${errorMessage ? ` - ${errorMessage}` : ''}`);
  }
  return '';
}

const getFetchErrorMessage = (error) => {
  if (error instanceof TypeError) {
    return `${error.message} probably because of network error.`;
  } else {
    return error.message;
  }
}

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
    try {
      if (refreshToken) {
        const response = await fetch(`${config.apiBaseUrl}auth/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({refresh: refreshToken}),
        })

        if (response.ok) {
          const responseJson = await response.json()
          let newToken = ApiService.getToken();
          newToken.access = responseJson.access;
          ApiService.setToken(newToken);
        }
        else if (response.status === 401) {
          await ApiService.login();
        }
        else {
          throw new Error(getResponseErrorMessageWhenNotOk(response));
        }
      }
      else {
        await ApiService.login();
      }
    } catch (error) {
      throw Error(`Failed to refresh token. Error occurred during previous operation: ${getFetchErrorMessage(error)}`);
    }
  },

  getHeaders: async () => {
    const token = ApiService.getToken();
    let accessToken = token ? token.access : null;
    try {
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const expDate = new Date(payload.exp * 1000);
          if (expDate < new Date()) {
            await ApiService.refreshToken();
            accessToken = ApiService.getToken().access;
          }
        } catch (error) {
          throw Error(`Error setting access token. Error occurred during previous operation: ${error.message}`);
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
    } catch (error) {
      throw Error(`Failed to get headers. Error occurred during previous operation: ${error.message}`);  
    }
  },

  login: async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}auth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ApiService.credentials),
      })
  
      if (!response.ok) {
        throw new Error(getResponseErrorMessageWhenNotOk(response));
      }
      else {
        const responseJson = parseJson(response);
        ApiService.setToken(responseJson);
      }
    } catch (error) {
      throw Error(`Failed to login. Error occurred during previous operation: ${getFetchErrorMessage(error)}`);
    }
  },

  fetchData: async (endpoint, method, data = null, page = null) => {
    let url = `${config.apiBaseUrl}${endpoint}`
    if (page) {
      url += `?page=${page}`
    }

    try {
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
        throw new Error(getResponseErrorMessageWhenNotOk(response));
      }
      else {
        return parseJson(response);
      }
    }
    catch (error) {
      throw Error(`Failed to fetch data. Error occurred during previous operation: ${getFetchErrorMessage(error)}`);
    }
  },

  retrieveLibTrack: async (libTrackUuid) => {
    return await ApiService.fetchData(`tracks/${libTrackUuid}/`, 'GET', null, null);
  },

  putLibTrack: async (libTrackUuid, libTrackData) => {
    return await ApiService.fetchData(`tracks/${libTrackUuid}/`, 'PUT', libTrackData, null);
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
      throw new Error('Failed to fetch audio. Error occurred during previous operation:', error.message);
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