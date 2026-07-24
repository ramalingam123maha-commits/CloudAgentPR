// Entry point for the React application
// Mounts the root <App /> component into the #root div defined in index.html

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Global styles including Tailwind base layers

// Create a React root and render the app wrapped in StrictMode
// StrictMode activates additional runtime warnings during development
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
