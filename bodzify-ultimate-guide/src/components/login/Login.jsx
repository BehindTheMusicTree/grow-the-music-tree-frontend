import React, { useState } from 'react';
import ApiService from '../api/ApiService';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: 'ultimate_music_guide', password: '$yy&6p7C7xFY^E' });

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const token = await ApiService.login(credentials);
      console.log('Logged in with token:', token);
    } catch (error) {
      console.error('Login error:', error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <div>
        <label>Username:</label>
        <input type="text" name="username" value={credentials.username} onChange={handleInputChange} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" value={credentials.password} onChange={handleInputChange} />
      </div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
