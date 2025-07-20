import React from 'react';
import ReactDOM from 'react-dom/client';

import 'leaflet/dist/leaflet.css';
import App from './App.jsx';
import './App.css';          // global stylesheet

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);