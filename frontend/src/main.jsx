import React from 'react';
import ReactDOM from 'react-dom/client';

import 'leaflet/dist/leaflet.css';   //  ←  put this line back
import App from './App.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);