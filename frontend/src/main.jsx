import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';             // Tailwind global
import 'leaflet/dist/leaflet.css'; // Leaflet map styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
