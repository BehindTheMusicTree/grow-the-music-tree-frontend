const apiUrl = 'https://bodzify.com/api/v1/'

const ApiService = {
  getToken: () => {
    // Implement your logic to retrieve the JWT token (from localStorage, cookies, etc.)
    // For example, assuming you store the token in localStorage:
    return localStorage.getItem('jwtToken');
  },

  setToken: (token) => {
    // Implement your logic to store the JWT token (in localStorage, cookies, etc.)
    // For example, assuming you store the token in localStorage:
    localStorage.setItem('jwtToken', token);
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
    return fetch(`${apiUrl}${endpoint}`, {
      method,
      headers: ApiService.getHeaders(),
      body: JSON.stringify(data),
    })
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
    const response = await fetch(`${apiUrl}auth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }

    const { token } = await response.json();
    ApiService.setToken(token);

    return token;
  }
};

export default ApiService;
