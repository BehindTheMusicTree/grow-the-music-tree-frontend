import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Header() {
  const title = "Bodzify";
  return (<h1>{title}</h1>);
}

function Description() {
  const description = "The Ultimate Guide to Music";
  return (<p>{description}</p>);
}

function Banner() {
  return (<div>
      <Header />
      <Description />
  </div>);
}

root.render(
  <React.StrictMode>
    <Banner />
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
