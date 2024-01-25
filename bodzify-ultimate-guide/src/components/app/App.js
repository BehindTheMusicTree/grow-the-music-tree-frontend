import React from 'react';
import Login from '../login/Login';

const App = () => {
  return (
    <div>
      <h1>React JWT Example</h1>
      <Login />
    </div>
  );
};

export default App;

// import React, { useEffect } from 'react';

// const App = () => {
//   const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA2MjAyNjYyLCJqdGkiOiJiMWFlNzY0ZTUzZjU0NzgzOTc5YmZiYzdhNzQ4Y2NmYSIsInVzZXJfaWQiOjV9.qbCLXy3gY68F8SDv2lXwz-8MYOZmsbKGkaMKhNmBfeU'

//   const apiUrl = 'https://bodzify.com/api/v1/genres/';

//   useEffect(() => {
//     const requestOptions = {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${bearerToken}`,
//       },
//     };

//     fetch(apiUrl, requestOptions)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`Request failed with status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         console.log('Data from API:', data);
//       })
//       .catch(error => {
//         console.error('Fetch error:', error);
//       });
//   }, []); // The empty dependency array ensures this effect runs once on component mount

//   return (
//     <div>
//       {/* Your component JSX */}
//     </div>
//   );
// };

// export default App;