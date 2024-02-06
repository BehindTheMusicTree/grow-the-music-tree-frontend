import config from '../config/config'; 

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
    console.log('credentials', credentials);
    alert('credentials', credentials);
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
  }
};

export default ApiService;
