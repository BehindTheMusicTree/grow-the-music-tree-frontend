import React, { useEffect } from 'react';
import Body from '../body/Body';
import Banner from '../banner/Banner';
import config from '../../config/config';
import ApiService from '../../service/apiService';

function App() {

  const [searchSubmitted, setSearchSubmitted] = React.useState('')

  useEffect(() => {
    const authenticate = async () => {
      const credentials = { username: config.username, password: config.password };
      try {
        await ApiService.login(credentials);
        //onLogin(token);
      } catch (error) {
        console.error('Login error:', error.message);
      }
    };

    // Perform initial authentication when the component mounts
    authenticate();
  }, []); // Empty dependency array ensures it runs only once during the initial render


  return (
    <div>
      <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
      <Body />
    </div>
  );
}

export default App;
