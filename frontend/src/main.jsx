import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import './index.css';          // one global stylesheet – load it once

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);