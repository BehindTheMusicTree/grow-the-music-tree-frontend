import React, { useEffect } from 'react';

const App = () => {
  // Replace 'yourBearerToken' with your actual Bearer token
  const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA2MjAyNjYyLCJqdGkiOiJiMWFlNzY0ZTUzZjU0NzgzOTc5YmZiYzdhNzQ4Y2NmYSIsInVzZXJfaWQiOjV9.qbCLXy3gY68F8SDv2lXwz-8MYOZmsbKGkaMKhNmBfeU'

  // Replace 'https://example.com/api/data' with your actual API endpoint
  const apiUrl = 'https://bodzify.com/api/v1/genres/';

  useEffect(() => {
    // Fetch options with headers, including the Bearer token
    const requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json', // Adjust this header based on your API requirements
      },
    };

    // Make the fetch request
    fetch(apiUrl, requestOptions)
      .then(response => {
        // Check if the response status is OK (200)
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        // Parse the JSON data from the response
        return response.json();
      })
      .then(data => {
        // Handle the data received from the API
        console.log('Data from API:', data);
      })
      .catch(error => {
        // Handle errors during the fetch request
        console.error('Fetch error:', error);
      });
  }, []); // The empty dependency array ensures this effect runs once on component mount

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
};

export default App;