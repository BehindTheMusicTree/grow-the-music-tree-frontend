import React, { useState } from 'react';
import ApiService from '../../service/apiService';
import Login from '../login/Login';

const Body = () => {
  const [genres, setGenres] = useState(null);
  const [token, setToken] = useState(ApiService.getToken());

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const fetchGenres = async () => {
    try {
      const data = await ApiService.fetchData('genres/');
      setGenres(data);
    } catch (error) {
      console.error('API request failed:', error.message)
      alert('API request failed. Please check the console for more info.');
    }
  };

  return (
    <div>
      {token ? (
        <div>
          <button onClick={fetchGenres}>Fetch Data</button>
          <h2>API Data:</h2>
          {genres ? (
            <pre>{JSON.stringify(genres, null, 2)}</pre>
          ) : (
            <p>Click &quot;Fetch Data&quot; to load API data.</p>
          )}
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default Body;
