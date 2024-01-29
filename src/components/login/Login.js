import React, { useState } from 'react';
import ApiService from '../../service/apiService';
import PropTypes from 'prop-types';

const Login = ({ onLogin }) => {

  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const token = await ApiService.login(credentials);
      onLogin(token);
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

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
