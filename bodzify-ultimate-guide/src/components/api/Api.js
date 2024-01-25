import React, { useState } from 'react';
import ApiService from '../../service/apiService';
import Login from '../login/Login';

const Api = () => {
  const [apiData, setApiData] = useState(null);
  const [token, setToken] = useState(ApiService.getToken());

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const fetchData = async () => {
    try {
      const data = await ApiService.fetchData('/auth/token');
      setApiData(data);
    } catch (error) {
      console.error('API request failed:', error.message);
    }
  };

  return (
    <div>
      {token ? (
        <div>
          <button onClick={fetchData}>Fetch Data</button>
          <h2>API Data:</h2>
          {apiData ? (
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
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

export default Api;
